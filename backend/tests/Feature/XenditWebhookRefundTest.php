<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class XenditWebhookRefundTest extends TestCase
{
    use RefreshDatabase;

    protected string $webhookToken = 'test-xendit-token';

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.xendit.webhook_verification_token' => $this->webhookToken]);
    }

    protected function makeRefundablePayment(): Payment
    {
        $order = Order::create([
            'guest_name' => 'Test Customer',
            'guest_email' => 'test@example.com',
            'status' => OrderStatus::Paid,
            'paid_at' => now(),
            'subtotal' => 200,
            'total' => 200,
            'shipping_recipient_name' => 'Test Customer',
            'shipping_phone' => '0800000000',
            'shipping_line1' => '123 Test Street',
            'shipping_city' => 'Bangkok',
            'shipping_postal_code' => '10110',
        ]);

        return Payment::create([
            'order_id' => $order->id,
            'method' => PaymentMethod::Card,
            'status' => PaymentStatus::Succeeded,
            'amount' => 200,
            'raw_response' => ['data' => ['payment_request_id' => 'pr-abc']],
        ]);
    }

    public function test_refund_succeeded_webhook_marks_the_order_refunded(): void
    {
        $payment = $this->makeRefundablePayment();

        $response = $this->postJson('/api/webhooks/xendit', [
            'event' => 'refund.succeeded',
            'data' => [
                'id' => 'rfd-999',
                'payment_id' => 'py-abc',
                'reference_id' => "refund-{$payment->id}",
                'amount' => 200,
                'status' => 'SUCCEEDED',
            ],
        ], ['x-callback-token' => $this->webhookToken]);

        $response->assertOk();
        $this->assertSame(OrderStatus::Refunded, $payment->order->fresh()->status);
        $this->assertSame(PaymentStatus::Refunded, $payment->fresh()->status);
        $this->assertEquals(200.0, $payment->fresh()->refunded_amount);
    }

    public function test_refund_succeeded_webhook_does_not_restore_stock(): void
    {
        // No stored record of the admin's restore-stock choice survives to
        // an async webhook completion — deliberately defaults to false
        // rather than guessing. See PaymentStatusUpdater::markRefunded.
        $payment = $this->makeRefundablePayment();

        $this->postJson('/api/webhooks/xendit', [
            'event' => 'refund.succeeded',
            'data' => [
                'id' => 'rfd-999',
                'reference_id' => "refund-{$payment->id}",
                'amount' => 200,
            ],
        ], ['x-callback-token' => $this->webhookToken]);

        $this->assertNull($payment->order->fresh()->stock_restored_at);
    }

    public function test_refund_failed_webhook_does_not_change_order_status(): void
    {
        $payment = $this->makeRefundablePayment();

        $response = $this->postJson('/api/webhooks/xendit', [
            'event' => 'refund.failed',
            'data' => [
                'id' => 'rfd-999',
                'reference_id' => "refund-{$payment->id}",
                'failure_code' => 'INSUFFICIENT_BALANCE',
            ],
        ], ['x-callback-token' => $this->webhookToken]);

        $response->assertOk();
        $this->assertSame(OrderStatus::Paid, $payment->order->fresh()->status);
        $this->assertSame(PaymentStatus::Succeeded, $payment->fresh()->status);
    }
}
