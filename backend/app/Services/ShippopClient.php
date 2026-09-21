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

    /**
     * Decision made 26.09.21 against SHIPPOP's real VIP rate quotation (not
     * sandbox pricing): Kerry Express only prices competitively within
     * "BKK/GBKK" — Bangkok, Nonthaburi, Pathum Thani, Samut Prakan, per
     * Kerry's own quoted rate card. Those four provinces' postcodes all
     * start 10/11/12. Shopee Xpress prices flat nationwide and undercuts
     * Kerry everywhere outside that area (e.g. ~1kg: ฿17 flat vs. Kerry's
     * ฿25 upcountry), so it's the better default once outside BKK/GBKK.
     * Single source of truth for courier choice — both the checkout-time
     * quote and the actual post-payment booking call this, so a customer
     * is never quoted one courier's price and booked on another's.
     */
    public function courierCodeForPostcode(string $postcode): string
    {
        $isBangkokMetro = preg_match('/^(10|11|12)/', $postcode) === 1;

        return $isBangkokMetro ? 'KRYX' : 'SPX';
    }

    /**
     * POST {base_url}/booking/ — creates a pending shipment. With
     * force_confirm=0 (the default, and what this always sends) the
     * shipment is NOT yet sent to the courier and nothing is charged —
     * that only happens on a separate confirm() call. This is deliberate:
     * booking is safe to do automatically, confirm is not (see
     * ShippingBookingService).
     *
     * $order is a single BOOKING DATA OBJECT: from/to/parcel (same shape
     * as getRates()), courier_code, and optionally cod_amount, remark,
     * meta, etc. Confirmed from SHIPPOP's docs example payload.
     *
     * @return array{purchase_id:int, total_price:float, item: array} item
     *               is the first (only) entry of the response's per-line
     *               BOOKING RESPONSE OBJECT — this only ever books one
     *               parcel per order, so the array wrapping is collapsed
     *               here rather than leaking SHIPPOP's numeric-index shape.
     */
    public function book(array $order): array
    {
        $payload = [
            'api_key' => (string) config('services.shippop.api_key'),
            'email' => (string) config('mail.from.address'),
            'data' => [$order],
            'force_confirm' => 0,
        ];

        $response = $this->http()->post($this->baseUrl().'/booking/', $payload);

        $response->throw();

        $body = $response->json();

        if (! ($body['status'] ?? false)) {
            throw new RuntimeException('SHIPPOP booking failed: '.json_encode($body));
        }

        $item = $body['data'][0] ?? null;

        if (! $item || ! ($item['status'] ?? false)) {
            throw new RuntimeException('SHIPPOP booking rejected: '.json_encode($item));
        }

        return [
            'purchase_id' => $body['purchase_id'],
            'total_price' => (float) ($body['total_price'] ?? 0),
            'item' => $item,
        ];
    }

    /**
     * POST {base_url}/confirm/ — sends a previously-booked purchase to the
     * courier. Irreversible per SHIPPOP's docs ("cannot edit all the
     * information or cancel the purchase" afterward) — only ever called
     * from an explicit admin action, never automatically.
     *
     * @return array<int, array{status:bool, courier_code:string, tracking_code:string, courier_tracking_code:string}>
     */
    public function confirm(int $purchaseId): array
    {
        $response = $this->http()->asForm()->post($this->baseUrl().'/confirm/', [
            'api_key' => (string) config('services.shippop.api_key'),
            'purchase_id' => $purchaseId,
        ]);

        $response->throw();

        $body = $response->json();

        if (! ($body['status'] ?? false)) {
            throw new RuntimeException('SHIPPOP confirm failed: '.json_encode($body));
        }

        return $body['result'] ?? [];
    }

    /**
     * POST {base_url}/cancel/ — only works on a booking that hasn't been
     * confirmed yet (SHIPPOP's docs: confirm() makes a purchase
     * uncancellable). Used to back out of a "Prepare shipment" click that
     * shouldn't have happened, before it ever reaches the courier.
     */
    public function cancel(string $courierTrackingCode): void
    {
        $response = $this->http()->post($this->baseUrl().'/cancel/', [
            'api_key' => (string) config('services.shippop.api_key'),
            'courier_tracking_code' => $courierTrackingCode,
        ]);

        $response->throw();

        $body = $response->json();

        if (! ($body['status'] ?? false)) {
            throw new RuntimeException('SHIPPOP cancel failed: '.json_encode($body));
        }
    }

    /**
     * POST {base_url}/label/ (type=pdf) — SHIPPOP does NOT host a label
     * URL; every `type` (json/html/pdf) returns the label data/bytes
     * directly in the response for the caller to render or store
     * themselves. Confirmed live against the sandbox (26.09.19): type=pdf
     * returns {status, pdf: "<base64>"} — not a URL, and not raw bytes
     * either. type=json (tried first) returns structured label-template
     * data instead of anything resembling a link. Returns the decoded PDF
     * bytes; the caller is responsible for storing them somewhere with a
     * real URL (see ShippingBookingService::confirm).
     */
    public function label(int $purchaseId): string
    {
        $response = $this->http()->post($this->baseUrl().'/label/', [
            'api_key' => (string) config('services.shippop.api_key'),
            'purchase_id' => $purchaseId,
            'type' => 'pdf',
            'size' => 'A4',
        ]);

        $response->throw();

        $body = $response->json();

        if (! ($body['status'] ?? false) || empty($body['pdf'])) {
            throw new RuntimeException('SHIPPOP label fetch failed: '.json_encode($body));
        }

        $pdf = base64_decode($body['pdf'], true);

        if ($pdf === false) {
            throw new RuntimeException('SHIPPOP label response had unparseable base64 PDF data');
        }

        return $pdf;
    }
}
