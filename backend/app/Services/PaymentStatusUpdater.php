<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Mail\OrderConfirmationMail;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

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

        $wasStockRestored = $order->stock_restored_at !== null;

        if ($wasStockRestored) {
            // An earlier attempt on this same order (e.g. an expired
            // PromptPay QR) already gave its stock back, and now a later
            // retry is the one actually succeeding — re-take it, or this
            // order would ship while its stock is permanently
            // over-counted relative to what's actually leaving inventory.
            $this->adjustStock($order, fn ($variant, $qty) => $variant->decrement('stock_quantity', $qty));
        }

        $order->update([
            'status' => OrderStatus::Paid,
            'payment_method' => $payment->method->value,
            'payment_reference' => $payment->gateway_reference,
            'paid_at' => now(),
            'stock_restored_at' => null,
        ]);

        // Booking is non-binding and not chargeable (force_confirm=0) — safe
        // to do automatically. A failure here must never look like the
        // payment itself failed; it's retryable from Filament, so this
        // stays a warning, not a thrown exception.
        try {
            (new ShippingBookingService)->prepare($order);
        } catch (Throwable $e) {
            Log::warning('SHIPPOP shipment booking failed after payment success', [
                'order' => $order->order_number,
                'error' => $e->getMessage(),
            ]);
        }

        // Card/PromptPay orders aren't "confirmed" from the customer's
        // perspective until payment actually succeeds — this is that
        // moment. Cash on Delivery orders queue their confirmation
        // separately, straight from checkout, since they never reach this
        // method (see CheckoutController::store).
        Mail::to($order->guest_email)->queue(new OrderConfirmationMail($order));
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

        $this->restoreStock($payment);
    }

    public function markExpired(Payment $payment): void
    {
        if ($payment->status->isTerminal()) {
            return;
        }

        $payment->update(['status' => PaymentStatus::Expired]);

        $this->restoreStock($payment);
    }

    /**
     * Undoes CheckoutController's decrement for this payment's order — a
     * failed/expired payment means the reservation never became a real
     * sale. An order can have several payment attempts (a retry after an
     * earlier one failed), so this is guarded at the order level, not just
     * the payment level: without stock_restored_at, two failed attempts on
     * the same order would each restore stock, over-crediting it, and a
     * stale sibling attempt (e.g. an unclaimed PromptPay QR) expiring
     * after the order already succeeded via a different attempt would
     * incorrectly restore stock for an order that's actually shipping.
     *
     * Locked + transactional since the webhook and reconciliation job can
     * both reach this for different sibling payments at nearly the same
     * time.
     *
     * Deliberately not shared with a future refund flow without an
     * explicit decision there (Phase 1.3) — whether a refund restores
     * stock is a business call, not a technical default.
     */
    private function restoreStock(Payment $payment): void
    {
        DB::transaction(function () use ($payment) {
            $order = Order::query()->lockForUpdate()->find($payment->order_id);

            if (! $order || $order->status === OrderStatus::Paid || $order->stock_restored_at !== null) {
                return;
            }

            $this->adjustStock($order, fn ($variant, $qty) => $variant->increment('stock_quantity', $qty));

            $order->update(['stock_restored_at' => now()]);
        });
    }

    private function adjustStock(Order $order, callable $apply): void
    {
        $order->items()->with('productVariant')->get()->each(
            fn ($item) => $item->productVariant && $apply($item->productVariant, $item->quantity)
        );
    }
}
