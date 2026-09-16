<?php

namespace App\Console\Commands;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Services\PaymentStatusUpdater;
use App\Services\XenditClient;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Safety net for a missed Xendit webhook. Xendit retries webhook delivery
 * up to 6 times with backoff, but that still doesn't cover "our server was
 * down for longer than that" — this re-checks anything stuck pending
 * directly against Xendit's API and applies the same idempotent
 * PaymentStatusUpdater logic the webhook uses, so it's a safe no-op if the
 * webhook actually did land first.
 */
#[Signature('payments:reconcile')]
#[Description('Re-check pending payments directly against Xendit in case a webhook was missed')]
class ReconcilePendingPayments extends Command
{
    // Card sessions default to a 30-minute Xendit-side expiry (confirmed
    // from a real session response); check once comfortably past that
    // rather than racing it.
    protected const CARD_STALE_AFTER_MINUTES = 20;

    public function handle(XenditClient $client, PaymentStatusUpdater $updater): int
    {
        $pending = Payment::query()
            ->where('status', PaymentStatus::Pending)
            ->whereNotNull('gateway_reference')
            ->where(function ($query) {
                $query->where(function ($card) {
                    $card->where('method', PaymentMethod::Card)
                        ->where('created_at', '<', now()->subMinutes(self::CARD_STALE_AFTER_MINUTES));
                })->orWhere(function ($promptpay) {
                    $promptpay->where('method', PaymentMethod::PromptPay)
                        ->whereNotNull('expires_at')
                        ->where('expires_at', '<', now());
                });
            })
            ->get();

        $checked = 0;
        $updated = 0;

        foreach ($pending as $payment) {
            $checked++;

            try {
                $changed = match ($payment->method) {
                    PaymentMethod::Card => $this->reconcileCard($payment, $client, $updater),
                    PaymentMethod::PromptPay => $this->reconcilePromptPay($payment, $client, $updater),
                };
            } catch (Throwable $e) {
                Log::warning('payments:reconcile failed to check a payment', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage(),
                ]);

                continue;
            }

            if ($changed) {
                $updated++;
            }
        }

        $this->info("Checked {$checked} stale pending payment(s), updated {$updated}.");

        return self::SUCCESS;
    }

    protected function reconcileCard(Payment $payment, XenditClient $client, PaymentStatusUpdater $updater): bool
    {
        $session = $client->getSession($payment->gateway_reference);

        return match ($session['status'] ?? null) {
            // Confirmed field values from a real captured payment_session
            // webhook payload (Phase 3) — "COMPLETED" / "EXPIRED".
            'COMPLETED' => tap(true, fn () => $updater->markSucceeded($payment, $session)),
            'EXPIRED', 'CANCELED' => tap(true, fn () => $updater->markExpired($payment)),
            default => false,
        };
    }

    protected function reconcilePromptPay(Payment $payment, XenditClient $client, PaymentStatusUpdater $updater): bool
    {
        $qr = $client->getQrCode($payment->gateway_reference);

        // INACTIVE only ever means "paid" here — confirmed live that
        // time-based expiry alone does NOT flip this field (see
        // XenditClient::getQrCode's docblock).
        if (($qr['status'] ?? null) === 'INACTIVE') {
            $updater->markSucceeded($payment, $qr);

            return true;
        }

        if ($payment->expires_at?->isPast()) {
            $updater->markExpired($payment);

            return true;
        }

        return false;
    }
}
