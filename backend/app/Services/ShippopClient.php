<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Wraps SHIPPOP's rate-lookup API (Phase 1.1), confirmed directly against
 * their docs (developers.shippop.com) rather than assumed:
 *
 * POST {base_url}/pricelist/ — api_key goes in the JSON body, not a header.
 * `data` is an object keyed by numeric string index ("0", "1", ...), not a
 * plain array, so more than one parcel/route can be priced in one call.
 * Standard couriers (KEX, Flash, etc.) and on-demand ones (Lalamove,
 * Skootar) share this exact same endpoint and schema — only courier_code
 * differs.
 *
 * $from/$to are SHIPPOP "Address" objects: name, address, district, state,
 * province, postcode, tel (email optional). $parcel is a "Parcel" object:
 * name, weight (grams), width/length/height (cm) — confirmed from their
 * own example payload, not the summary table alone (which didn't give
 * units).
 */
class ShippopClient
{
    protected function http()
    {
        return Http::timeout(15);
    }

    protected function baseUrl(): string
    {
        return rtrim((string) config('services.shippop.base_url'), '/');
    }

    /**
     * @return array<string, array> courier_code => rate data (price,
     *                               estimate_time, available, courier_name, ...)
     */
    public function getRates(array $from, array $to, array $parcel, ?string $courierCode = null): array
    {
        $payload = [
            'api_key' => (string) config('services.shippop.api_key'),
            'data' => [
                '0' => array_filter([
                    'from' => $from,
                    'to' => $to,
                    'parcel' => $parcel,
                    'courier_code' => $courierCode,
                    'showall' => 1,
                ], fn ($value) => $value !== null),
            ],
        ];

        $response = $this->http()->post($this->baseUrl().'/pricelist/', $payload);

        $response->throw();

        $body = $response->json();

        if (! ($body['status'] ?? false)) {
            throw new RuntimeException('SHIPPOP price check failed: '.json_encode($body));
        }

        return $body['data']['0'] ?? [];
    }
}
