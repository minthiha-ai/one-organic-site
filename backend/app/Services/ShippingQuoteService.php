<?php

namespace App\Services;

use App\Models\ProductVariant;
use App\Models\ShippingRate;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

/**
 * Single source of truth for "what does shipping cost for this order" —
 * used by CheckoutController so the number an order is actually charged
 * always comes from the same place.
 *
 * Tries a real SHIPPOP/KEX quote first (Phase 1.1); falls back to the
 * flat interim rate (Phase 0.5.5) on ANY failure — unresolvable postcode,
 * KEX unavailable for that route, SHIPPOP unreachable, etc. Checkout must
 * never fail just because a live courier API had a bad moment; the flat
 * rate exists specifically to be that fallback, per the plan.
 *
 * Interim approximations, both deliberate and both worth revisiting:
 * - The checkout form only collects city + postal code, not real Thai
 *   ตำบล/แขวง + อำเภอ/เขต (see Phase 0.6). SHIPPOP's own postcode
 *   reference data (ShippopClient::resolveAreaNameForPostcode) fills the
 *   required "district"/"state" fields with a same best-effort area name
 *   for both — confirmed empirically to still produce a real quote, but
 *   it's an approximation, not the real sub-district.
 * - For a multi-item order, this prices using the single largest item's
 *   box dimensions (not a real combined-parcel calculation) with the
 *   summed total weight. Weight is exact; the box size is a proxy.
 */
class ShippingQuoteService
{
    public function quote(array $items, array $destination): float
    {
        try {
            return $this->liveQuote($items, $destination);
        } catch (Throwable $e) {
            Log::warning('SHIPPOP live rate lookup failed, falling back to flat rate', [
                'error' => $e->getMessage(),
                'destination_postcode' => $destination['postal_code'] ?? null,
            ]);

            return $this->flatRate();
        }
    }

    protected function liveQuote(array $items, array $destination): float
    {
        $postcode = (string) ($destination['postal_code'] ?? '');
        $shippop = new ShippopClient;
        $areaName = $shippop->resolveAreaNameForPostcode($postcode);

        if (! $areaName) {
            throw new RuntimeException("No SHIPPOP coverage for postcode \"{$postcode}\"");
        }

        [$weightGrams, $dimensions] = $this->parcelFor($items);

        $from = config('shipping.origin');

        $to = [
            'name' => $destination['recipient_name'] ?? 'Customer',
            'address' => $destination['line1'] ?? '-',
            'district' => $areaName,
            'state' => $areaName,
            'province' => $destination['city'] ?? $areaName,
            'postcode' => $postcode,
            'tel' => $destination['phone'] ?? '0000000000',
        ];

        $parcel = array_merge(['name' => 'Order'], ['weight' => $weightGrams], $dimensions);

        $rates = $shippop->getRates($from, $to, $parcel, 'KRYX');
        $kex = $rates['KRYX'] ?? null;

        if (! $kex || ! ($kex['available'] ?? false)) {
            throw new RuntimeException('KEX unavailable for this route: '.json_encode($kex));
        }

        return (float) $kex['price'];
    }

    protected function flatRate(): float
    {
        return (float) ShippingRate::where('is_active', true)->firstOrFail()->rate;
    }

    /**
     * @return array{0: int, 1: array{width: int, length: int, height: int}}
     */
    protected function parcelFor(array $items): array
    {
        $variants = ProductVariant::query()
            ->whereIn('id', collect($items)->pluck('product_variant_id'))
            ->get()
            ->keyBy('id');

        $totalWeightGrams = 0;
        $largestDimensions = ['length' => 10, 'width' => 10, 'height' => 10];
        $largestVolume = 1000;

        foreach ($items as $line) {
            $variant = $variants->get($line['product_variant_id']);

            if (! $variant) {
                continue;
            }

            $quantity = (int) $line['quantity'];
            $totalWeightGrams += (int) ($variant->weight_grams ?? 0) * $quantity;

            $length = (int) ($variant->length_cm ?? 0);
            $width = (int) ($variant->width_cm ?? 0);
            $height = (int) ($variant->height_cm ?? 0);
            $volume = $length * $width * $height;

            if ($volume > $largestVolume) {
                $largestVolume = $volume;
                $largestDimensions = ['length' => $length, 'width' => $width, 'height' => $height];
            }
        }

        return [$totalWeightGrams, $largestDimensions];
    }
}
