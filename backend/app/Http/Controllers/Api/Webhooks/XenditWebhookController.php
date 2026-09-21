<?php

namespace App\Http\Controllers\Api\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentStatusUpdater;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class XenditWebhookController extends Controller
{
    /**
     * Xendit's payload shape genuinely varies across event/product types
     * (some nest a second "data" layer, confirmed from their own docs
     * examples) — this stays defensive and log-first rather than assume one
     * fixed shape, and gets tightened once a real payload has been captured
     * against this endpoint.
     */
    public function handle(Request $request)
    {
        if (! $this->verifyToken($request)) {
            Log::warning('Xendit webhook rejected: missing or invalid x-callback-token');

            return response()->json(['message' => 'Invalid token'], 401);
        }

        $payload = $request->all();

        // Always logged, even once parsing below is trusted — the practical
        // audit trail for "why didn't this order flip to paid."
        Log::info('Xendit webhook received', ['event' => $payload['event'] ?? null, 'payload' => $payload]);

        $referenceId = $this->extractReferenceId($payload);
        $paymentId = $this->extractPaymentId($referenceId);
        $payment = $paymentId ? Payment::find($paymentId) : null;

        if (! $payment) {
            Log::warning('Xendit webhook: no matching Payment row', [
                'reference_id' => $referenceId,
                'extracted_payment_id' => $paymentId,
            ]);

            // Ack anyway — Xendit would otherwise burn its 6 retries on
            // something a redeploy won't fix; the reconciliation job (Phase
            // 4) is the real safety net for a payment stuck unmatched.
            return response()->json(['message' => 'ok'], 200);
        }

        $event = (string) ($payload['event'] ?? '');
        $updater = new PaymentStatusUpdater;

        if ($event === 'refund.succeeded') {
            // Async completion of a refund the Filament action already
            // requested (EditOrder::refundViaXendit) — a synchronous
            // "SUCCEEDED" response there already calls markRefunded()
            // directly, so this is mainly for refunds that settled
            // asynchronously. No record of the admin's restore-stock
            // choice survives to here, so this deliberately defaults to
            // NOT restoring stock — safer than guessing, and stock can
            // always be adjusted manually afterward. markRefunded()'s own
            // idempotency guard makes this a no-op if the synchronous path
            // already completed it.
            $data = $payload['data'] ?? $payload;
            $updater->markRefunded($payment->order, $payment, (float) ($data['amount'] ?? $payment->amount), false, $data);
        } elseif ($event === 'refund.failed') {
            Log::warning('Xendit refund failed', ['payment_id' => $payment->id, 'payload' => $payload]);
        } elseif (str_ends_with($event, '.completed') || str_ends_with($event, '.payment') || str_ends_with($event, '.succeeded')) {
            $updater->markSucceeded($payment, $payload);
        } elseif (str_ends_with($event, '.failed')) {
            $updater->markFailed($payment, $payload);
        } elseif (str_ends_with($event, '.expired')) {
            $updater->markExpired($payment);
        } else {
            Log::info('Xendit webhook: unrecognized event type, logged only', ['event' => $event, 'payment_id' => $payment->id]);
        }

        return response()->json(['message' => 'ok'], 200);
    }

    protected function verifyToken(Request $request): bool
    {
        $expected = (string) config('services.xendit.webhook_verification_token');
        $given = (string) $request->header('x-callback-token');

        return $expected !== '' && $given !== '' && hash_equals($expected, $given);
    }

    /**
     * Checks a few candidate paths since Xendit's envelope isn't consistent
     * across products (some nest a second "data" layer).
     */
    protected function extractReferenceId(array $payload): ?string
    {
        return $payload['data']['reference_id']
            ?? $payload['data']['data']['reference_id']
            ?? $payload['reference_id']
            ?? null;
    }

    /**
     * Our own reference_id is always "{order_number}-{payment_id}" (set in
     * XenditClient::createCardSession/createPromptPayQr) — deliberately
     * self-describing so matching a webhook back to a Payment row doesn't
     * depend on knowing which of Xendit's own id fields a given product
     * happens to echo back.
     */
    protected function extractPaymentId(?string $referenceId): ?int
    {
        if (! $referenceId) {
            return null;
        }

        $tail = substr((string) strrchr($referenceId, '-'), 1);

        return ctype_digit($tail) ? (int) $tail : null;
    }
}
