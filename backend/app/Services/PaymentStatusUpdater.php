<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Payment;

/**
 * The one place a Payment's status is allowed to change and an Order gets
 * flipped to Paid. Shared by the synchronous charge-card response, the
 * Xendit webhook, and the reconciliation job — all three can observe the
 * same payment succeeding, and this makes that idempotent regardless of
 * which one gets there first.
 */
class PaymentStatusUpdater
{
    public function markSucceeded(Payment $payment, array $rawResponse): void
    {
        if ($payment->status === PaymentStatus::Succeeded) {
            return; // already applied — e.g. a retried webhook
        }

        $payment->update([
            'status' => PaymentStatus::Succeeded,
            'raw_response' => $rawResponse,
        ]);

        $order = $payment->order;

        if ($order->status === OrderStatus::Paid) {
            return;
        }

        $order->update([
            'status' => OrderStatus::Paid,
            'payment_method' => $payment->method->value,
            'payment_reference' => $payment->gateway_reference,
            'paid_at' => now(),
        ]);
    }

    public function markFailed(Payment $payment, array $rawResponse): void
    {
        if ($payment->status->isTerminal()) {
            return;
        }

        $payment->update([
            'status' => PaymentStatus::Failed,
            'raw_response' => $rawResponse,
        ]);
    }

    public function markExpired(Payment $payment): void
    {
        if ($payment->status->isTerminal()) {
            return;
        }

        $payment->update(['status' => PaymentStatus::Expired]);
    }
}
