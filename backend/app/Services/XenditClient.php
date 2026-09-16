<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Xendit\QRCode;
use Xendit\Xendit;

/**
 * Thin wrapper around Xendit so charge-creation logic lives in one place
 * rather than scattered across controllers.
 *
 * THB amounts are whole baht, not minor units (satang) — confirmed against
 * the sandbox API directly: creating a QR code with amount=0 returns a
 * validation error with {"minimum": 1, "maximum": 700000}, matching Xendit's
 * documented ฿1.00–฿700,000.00 PromptPay limits exactly. Unlike Omise.
 *
 * Card payments use the newer Sessions/Components API via raw HTTP calls,
 * not the xendit-php SDK's classic Cards class — confirmed live that this
 * account's keys reject the classic /v2/credit_card_tokens + Cards::create
 * flow (INVALID_API_KEY, reproduced calling it directly, bypassing all our
 * code), while /sessions works fine. The SDK (v2.19.0, current as of
 * 26.09.16) doesn't wrap Sessions yet, hence the direct HTTP calls here.
 */
class XenditClient
{
    public function __construct()
    {
        Xendit::setApiKey((string) config('services.xendit.secret_key'));
    }

    /**
     * Create a card Payment Session for the Components embed to attach to.
     * Card data never reaches our server — the frontend mounts Xendit's
     * Components SDK against this session, which collects card details
     * directly into Xendit's own hosted fields.
     *
     * @return array Xendit's raw sessions response, including
     *               components_sdk_key for the frontend to use.
     */
    public function createCardSession(string $referenceId, float $amount, string $email, string $name): array
    {
        $origin = config('services.xendit.components_origin');

        $response = $this->http()->post('https://api.xendit.co/sessions', [
            'reference_id' => $referenceId,
            'session_type' => 'PAY',
            'mode' => 'COMPONENTS',
            'amount' => $amount,
            'currency' => 'THB',
            'country' => 'TH',
            'customer' => [
                'reference_id' => $referenceId,
                'type' => 'INDIVIDUAL',
                'email' => $email,
                'individual_detail' => ['given_names' => $name],
            ],
            'components_configuration' => [
                'origins' => [$origin],
            ],
        ]);

        return $response->throw()->json();
    }

    /**
     * Fetch a session's current status directly — used by the reconciliation
     * job when a webhook may have been missed.
     */
    public function getSession(string $sessionId): array
    {
        return $this->http()->get("https://api.xendit.co/sessions/{$sessionId}")->throw()->json();
    }

    protected function http()
    {
        // The vendor SDK's own Guzzle client hardcodes a 60s timeout for the
        // classic calls (confirmed live — a connect failure took the full
        // 60s to surface) — too long to leave a customer waiting on a
        // "pay" click. Our own raw calls (Sessions) get a shorter one.
        return Http::withBasicAuth((string) config('services.xendit.secret_key'), '')->timeout(15);
    }

    /**
     * Create a dynamic PromptPay QR code for one order. The returned
     * qr_string is a raw payload, not an image — render it into a
     * scannable code on the frontend.
     *
     * @return array Xendit's raw qr_codes response.
     */
    public function createPromptPayQr(string $referenceId, float $amount, ?int $expiresInSeconds = null): array
    {
        $params = [
            'reference_id' => $referenceId,
            'type' => 'DYNAMIC',
            'currency' => 'THB',
            'amount' => $amount,
            'channel_code' => 'TH_PROMPTPAY',
            // The SDK defaults to the older api version (2020-07-01, which
            // wants external_id+callback_url) unless told otherwise —
            // confirmed by hitting the InvalidArgumentException directly.
            'api_version' => '2022-07-31',
        ];

        if ($expiresInSeconds !== null) {
            $params['expires_at'] = now()->addSeconds($expiresInSeconds)->toIso8601String();
        }

        return QRCode::create($params);
    }

    /**
     * Fetch a QR code's current status directly — used by the reconciliation
     * job when a webhook may have been missed.
     *
     * Confirmed live: a QR's own `status` only flips ACTIVE → INACTIVE once
     * it's actually paid (single-use, consumed) — NOT on time-based expiry.
     * Tested both ways: simulating a payment flips it to INACTIVE; letting
     * one pass its own expires_at with no payment leaves it ACTIVE. So
     * status === 'INACTIVE' here is a reliable "this was paid" signal —
     * expiry has to be judged separately, against our own stored
     * Payment.expires_at.
     */
    public function getQrCode(string $qrId): array
    {
        return QRCode::get($qrId, '2022-07-31');
    }
}
