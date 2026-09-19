<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

/**
 * Turns a paid (or COD, once an admin says it's ready) order into a real
 * SHIPPOP/KEX shipment — Phase 1.1 build steps 3/4.
 *
 * Deliberately split into two irreversibility tiers, per an explicit
 * decision on 26.09.19:
 * - prepare() only *books* (force_confirm=0) — non-binding, not sent to the
 *   courier, not charged. Safe to call automatically.
 * - confirm() actually sends the booking to the courier — irreversible per
 *   SHIPPOP's own docs. Only ever called from an explicit Filament action,
 *   never automatically, regardless of payment method.
 */
class ShippingBookingService
{
    public function prepare(Order $order): void
    {
        if ($order->shippop_purchase_id !== null) {
            return; // already booked — e.g. a retried webhook or double-click
        }

        $client = new ShippopClient;
        $areaName = $client->resolveAreaNameForPostcode((string) $order->shipping_postal_code);

        if (! $areaName) {
            throw new RuntimeException("No SHIPPOP coverage for postcode \"{$order->shipping_postal_code}\" (order {$order->order_number})");
        }

        [$weightGrams, $dimensions] = $this->parcelFor($order);

        $booking = $client->book(array_merge([
            'from' => config('shipping.origin'),
            'to' => [
                'name' => $order->shipping_recipient_name,
                'address' => $order->shipping_line1,
                'district' => $areaName,
                'state' => $areaName,
                'province' => $order->shipping_city,
                'postcode' => (string) $order->shipping_postal_code,
                'tel' => $order->shipping_phone,
            ],
            'parcel' => array_merge(['name' => $order->order_number], ['weight' => $weightGrams], $dimensions),
            'courier_code' => 'KRYX',
        ], $order->payment_method === 'cod' ? ['cod_amount' => (int) round((float) $order->total)] : []));

        $order->update([
            'shippop_purchase_id' => $booking['purchase_id'],
            'shippop_tracking_code' => $booking['item']['tracking_code'] ?? null,
            'courier_tracking_code' => $booking['item']['courier_tracking_code'] ?? null,
            'shipment_status' => 'wait',
        ]);
    }

    public function confirm(Order $order): void
    {
        if (! $order->shippop_purchase_id) {
            throw new RuntimeException("Order {$order->order_number} has no SHIPPOP booking to confirm yet.");
        }

        $client = new ShippopClient;
        $results = $client->confirm((int) $order->shippop_purchase_id);
        $result = $results[0] ?? null;

        if (! $result || ! ($result['status'] ?? false)) {
            throw new RuntimeException('SHIPPOP confirm did not succeed: '.json_encode($result));
        }

        $order->update([
            'courier_tracking_code' => $result['courier_tracking_code'] ?? $order->courier_tracking_code,
            'shipment_status' => 'booking',
            'shipment_confirmed_at' => now(),
            'status' => OrderStatus::Packed,
            'packed_at' => $order->packed_at ?? now(),
        ]);

        try {
            $pdf = $client->label((int) $order->shippop_purchase_id);
            $path = "labels/{$order->order_number}.pdf";
            Storage::disk('public')->put($path, $pdf);

            $order->update(['label_url' => Storage::disk('public')->url($path)]);
        } catch (Throwable $e) {
            // The shipment is already confirmed at this point — a label
            // fetch failure shouldn't look like the whole action failed.
            // It can be retried from Filament without re-confirming.
            Log::warning('SHIPPOP label fetch failed after a successful confirm', [
                'order' => $order->order_number,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function cancel(Order $order): void
    {
        if (! $order->courier_tracking_code) {
            throw new RuntimeException("Order {$order->order_number} has no SHIPPOP booking to cancel.");
        }

        (new ShippopClient)->cancel($order->courier_tracking_code);

        $order->update([
            'shippop_purchase_id' => null,
            'shippop_tracking_code' => null,
            'courier_tracking_code' => null,
            'shipment_status' => null,
            'label_url' => null,
        ]);
    }

    /**
     * @return array{0: int, 1: array{width: int, length: int, height: int}}
     */
    protected function parcelFor(Order $order): array
    {
        $items = $order->items()->with('productVariant')->get();

        $totalWeightGrams = 0;
        $largestDimensions = ['length' => 10, 'width' => 10, 'height' => 10];
        $largestVolume = 1000;

        foreach ($items as $item) {
            $variant = $item->productVariant;

            if (! $variant) {
                continue;
            }

            $totalWeightGrams += (int) ($variant->weight_grams ?? 0) * $item->quantity;

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
