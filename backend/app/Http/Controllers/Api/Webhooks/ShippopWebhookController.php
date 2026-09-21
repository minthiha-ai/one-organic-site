<?php

namespace App\Http\Controllers\Api\Webhooks;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Receives SHIPPOP's shipment-status callbacks (Phase 1.1 build step 4).
 *
 * SHIPPOP has no self-service webhook registration — their docs say
 * registering a URL at all requires contacting their dev team directly
 * (26.09.19). Originally authenticated only by an unguessable token in the
 * URL path, since a custom header wasn't available without that same
 * manual contact. Their dev team has since (26.09.21) confirmed they send
 * an X-Webhook-Secret header on every call, checked here in addition to
 * the URL token, not instead of it — the already-registered URL keeps
 * working unchanged, this just adds a second thing that has to match.
 *
 * Payload isn't guaranteed to be JSON (SHIPPOP's default is form-encoded
 * unless their dev team is asked otherwise) — $request->input() reads
 * either transparently, so this doesn't assume one or the other.
 */
class ShippopWebhookController extends Controller
{
    public function handle(Request $request, string $token)
    {
        if (! $this->verifyToken($token)) {
            Log::warning('SHIPPOP webhook rejected: invalid URL token');

            return response()->json(['message' => 'Not found'], 404);
        }

        if (! $this->verifySecretHeader($request)) {
            Log::warning('SHIPPOP webhook rejected: invalid or missing X-Webhook-Secret header');

            return response()->json(['message' => 'Not found'], 404);
        }

        $trackingCode = (string) $request->input('tracking_code');
        $orderStatus = (string) $request->input('order_status');
        $courierTrackingCode = $request->input('courier_tracking_code');

        Log::info('SHIPPOP webhook received', [
            'tracking_code' => $trackingCode,
            'order_status' => $orderStatus,
        ]);

        $order = Order::where('shippop_tracking_code', $trackingCode)->first();

        if (! $order) {
            Log::warning('SHIPPOP webhook: no matching order', ['tracking_code' => $trackingCode]);

            // Ack anyway — SHIPPOP has no retry mechanism documented, but
            // there's no reason to make this look like a server error for
            // something a redeploy can't fix.
            return response()->json(['message' => 'ok'], 200);
        }

        $update = ['shipment_status' => $orderStatus];

        if ($courierTrackingCode) {
            $update['courier_tracking_code'] = $courierTrackingCode;
        }

        match ($orderStatus) {
            'shipping' => $update += ['status' => OrderStatus::Shipped, 'shipped_at' => $order->shipped_at ?? now()],
            'complete' => $update += ['status' => OrderStatus::Delivered, 'delivered_at' => $order->delivered_at ?? now()],
            default => null, // wait/booking/problem/return/etc. — recorded in shipment_status, no status transition assumed
        };

        $order->update($update);

        return response()->json(['message' => 'ok'], 200);
    }

    protected function verifyToken(string $given): bool
    {
        $expected = (string) config('services.shippop.webhook_token');

        return $expected !== '' && hash_equals($expected, $given);
    }

    protected function verifySecretHeader(Request $request): bool
    {
        $expected = (string) config('services.shippop.webhook_secret');
        $given = (string) $request->header('X-Webhook-Secret');

        return $expected !== '' && hash_equals($expected, $given);
    }
}
