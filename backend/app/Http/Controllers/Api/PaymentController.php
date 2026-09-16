<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateCardSessionRequest;
use App\Http\Requests\CreatePromptPayRequest;
use App\Http\Requests\PaymentStatusRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Services\PaymentStatusUpdater;
use App\Services\XenditClient;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class PaymentController extends Controller
{
    /**
     * Every endpoint here takes {order_number, email} rather than the
     * account/Sanctum auth used elsewhere — matches the existing
     * /orders/lookup precedent (order number alone is "guessable" per that
     * endpoint's own comment) so guest checkouts, which are most of our
     * traffic, can pay without an account. Deliberately requested in the
     * body, never a query string, so email never lands in a URL/access log.
     */
    protected function verifyOwnership(Order $order, string $email): void
    {
        if (strcasecmp($order->guest_email, $email) !== 0) {
            throw ValidationException::withMessages([
                'email' => 'No order found with that number and email.',
            ]);
        }
    }

    /**
     * Creates a card Payment Session for the frontend's Components SDK to
     * attach to. Unlike PromptPay (and unlike the classic card flow this
     * replaced), nothing here settles synchronously — completion is entirely
     * event-driven, via the frontend's "session-complete" listener plus the
     * webhook/reconciliation path, same as PromptPay's polling already works.
     */
    public function createCardSession(CreateCardSessionRequest $request, Order $order)
    {
        $this->verifyOwnership($order, $request->string('email'));

        $payment = $order->payments()->create([
            'method' => PaymentMethod::Card,
            'status' => PaymentStatus::Pending,
            'amount' => $order->total,
        ]);

        try {
            $session = (new XenditClient)->createCardSession(
                referenceId: $order->order_number.'-'.$payment->id,
                amount: (float) $order->total,
                email: $order->guest_email,
                name: $order->guest_name,
            );
        } catch (Throwable $e) {
            // Deliberately broad: a genuine network failure (confirmed live
            // — Xendit unreachable throws GuzzleHttp\Exception\ConnectTimeoutException,
            // which is NOT a RequestException) must never leave this Payment
            // stuck pending with no explanation, or surface as a raw 500.
            Log::error('Xendit card session creation failed', [
                'payment_id' => $payment->id,
                'exception' => get_class($e),
                'message' => $e->getMessage(),
            ]);

            (new PaymentStatusUpdater)->markFailed($payment, ['error' => $e->getMessage(), 'exception' => get_class($e)]);

            throw ValidationException::withMessages([
                'card' => 'Could not start the card payment right now. Please try again.',
            ]);
        }

        $payment->update([
            'gateway_reference' => $session['payment_session_id'] ?? null,
            'raw_response' => $session,
            'expires_at' => isset($session['expires_at']) ? Carbon::parse($session['expires_at']) : null,
        ]);

        return new PaymentResource($payment);
    }

    public function createPromptPay(CreatePromptPayRequest $request, Order $order)
    {
        $this->verifyOwnership($order, $request->string('email'));

        $payment = $order->payments()->create([
            'method' => PaymentMethod::PromptPay,
            'status' => PaymentStatus::Pending,
            'amount' => $order->total,
        ]);

        // 20 minutes — short enough that a stale QR isn't left dangling for
        // hours, long enough for someone to actually open their banking app.
        $expiresInSeconds = 20 * 60;

        try {
            $qr = (new XenditClient)->createPromptPayQr(
                referenceId: $order->order_number.'-'.$payment->id,
                amount: (float) $order->total,
                expiresInSeconds: $expiresInSeconds,
            );
        } catch (Throwable $e) {
            // Same reasoning as createCardSession — the Xendit SDK's own
            // catch(RequestException) doesn't cover connection-level
            // failures either (confirmed: ConnectTimeoutException isn't a
            // RequestException), so a plain ApiException catch here would
            // let a network failure through uncaught.
            Log::error('Xendit PromptPay QR creation failed', [
                'payment_id' => $payment->id,
                'exception' => get_class($e),
                'message' => $e->getMessage(),
            ]);

            (new PaymentStatusUpdater)->markFailed($payment, ['error' => $e->getMessage(), 'exception' => get_class($e)]);

            throw ValidationException::withMessages([
                'promptpay' => 'Could not generate a QR code right now. Please try again.',
            ]);
        }

        $payment->update([
            'gateway_reference' => $qr['id'] ?? null,
            'raw_response' => $qr,
            'expires_at' => now()->addSeconds($expiresInSeconds),
        ]);

        return new PaymentResource($payment);
    }

    public function status(PaymentStatusRequest $request, Order $order)
    {
        $this->verifyOwnership($order, $request->string('email'));

        return new OrderResource($order->load(['items', 'latestPayment']));
    }
}
