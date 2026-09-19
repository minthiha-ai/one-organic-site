<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
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

    /**
     * SHIPPOP's own postcode reference data (POST {base_url}/postoffice/) —
     * confirmed live: {status, data: {postoffice: [{id, name, postcode,
     * latlong}]}}. `name` is a post-office/area name at roughly the Thai
     * เขต/อำเภอ level (e.g. "พระโขนง" for postcode 10110) — used as the
     * "state" field, and re-used for "district" too since the checkout
     * form doesn't collect a real ตำบล/แขวง (see Phase 0.6). Confirmed
     * empirically this still produces a valid, real KEX quote even though
     * it's not the exact sub-district. Cached a day since this reference
     * data changes rarely, and it's SHIPPOP's own account-scoped list
     * (only ~47 entries in sandbox, Bangkok-focused) rather than a
     * third-party dataset.
     *
     * @return array<int, array{id:int,name:string,postcode:string,latlong:string}>
     */
    public function getPostOffices(): array
    {
        return Cache::remember('shippop.postoffices', now()->addDay(), function () {
            $response = $this->http()->asForm()->post($this->baseUrl().'/postoffice/', [
                'api_key' => (string) config('services.shippop.api_key'),
                'callback' => 'data',
            ]);

            $response->throw();

            // Response is JSONP-wrapped ("data({...})"), not plain JSON —
            // confirmed live, unlike every other SHIPPOP endpoint.
            $body = json_decode(
                preg_replace('/^\w+\((.*)\)$/s', '$1', $response->body()),
                true
            );

            if (! ($body['status'] ?? false)) {
                throw new RuntimeException('SHIPPOP post office lookup failed: '.$response->body());
            }

            return $body['data']['postoffice'] ?? [];
        });
    }

    /**
     * Best-effort district/state name for a postcode, from SHIPPOP's own
     * reference data — null if not found (e.g. a postcode outside this
     * account's coverage), so the caller can fall back to the flat rate
     * rather than send SHIPPOP a request it's guaranteed to reject.
     */
    public function resolveAreaNameForPostcode(string $postcode): ?string
    {
        foreach ($this->getPostOffices() as $entry) {
            if (($entry['postcode'] ?? null) === $postcode) {
                return $entry['name'];
            }
        }

        return null;
    }
}
