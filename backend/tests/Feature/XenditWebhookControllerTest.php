<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class XenditWebhookControllerTest extends TestCase
{
    use RefreshDatabase;

    protected string $webhookToken = 'test-xendit-token';

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.xendit.webhook_verification_token' => $this->webhookToken]);

        // markSucceeded() also tries a SHIPPOP booking and queues a
        // confirmation mail — not what these tests are about. See
        // PaymentStatusUpdaterStockTest for the same reasoning.
        Http::fake(['*' => Http::response(['status' => false], 500)]);
    }

    protected function makePendingPayment(int $stock = 10, int $quantity = 2, PaymentMethod $method = PaymentMethod::Card): Payment
    {
        $category = Category::create(['name' => 'Test', 'slug' => 'test-'.uniqid()]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'Test Product', 'slug' => 'test-product-'.uniqid()]);
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'TEST-'.uniqid(),
            'option_label' => 'Default',
            'price' => 100,
            'stock_quantity' => $stock,
        ]);

        $order = Order::create([
            'guest_name' => 'Test Customer',
            'guest_email' => 'test@example.com',
            'status' => OrderStatus::Pending,
            'subtotal' => $variant->price * $quantity,
            'total' => $variant->price * $quantity,
            'shipping_recipient_name' => 'Test Customer',
            'shipping_phone' => '0800000000',
            'shipping_line1' => '123 Test Street',
            'shipping_city' => 'Bangkok',
            'shipping_postal_code' => '10110',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_variant_id' => $variant->id,
            'product_name' => $variant->product->name,
            'variant_label' => $variant->option_label,
            'sku' => $variant->sku,
            'unit_price' => $variant->price,
            'quantity' => $quantity,
        ]);

        $variant->decrement('stock_quantity', $quantity);

        return Payment::create([
            'order_id' => $order->id,
            'method' => $method,
            'status' => PaymentStatus::Pending,
            'amount' => $order->total,
        ]);
    }

    protected function webhookPayload(Payment $payment, string $event): array
    {
        return [
            'event' => $event,
            'data' => [
                'reference_id' => "{$payment->order->order_number}-{$payment->id}",
                'status' => 'COMPLETED',
            ],
        ];
    }

    public function test_a_request_with_no_token_is_rejected(): void
    {
        $payment = $this->makePendingPayment();

        $response = $this->postJson('/api/webhooks/xendit', $this->webhookPayload($payment, 'payment_session.completed'));

        $response->assertStatus(401);
        $this->assertSame(PaymentStatus::Pending, $payment->fresh()->status);
    }

    public function test_a_request_with_the_wrong_token_is_rejected(): void
    {
        $payment = $this->makePendingPayment();

        $response = $this->postJson('/api/webhooks/xendit', $this->webhookPayload($payment, 'payment_session.completed'), [
            'x-callback-token' => 'not-the-real-token',
        ]);

        $response->assertStatus(401);
        $this->assertSame(PaymentStatus::Pending, $payment->fresh()->status);
    }

    public function test_a_succeeded_event_marks_the_payment_and_order_paid(): void
    {
        $payment = $this->makePendingPayment(stock: 10, quantity: 2);

        $response = $this->postJson('/api/webhooks/xendit', $this->webhookPayload($payment, 'payment_session.completed'), [
            'x-callback-token' => $this->webhookToken,
        ]);

        $response->assertStatus(200);
        $this->assertSame(PaymentStatus::Succeeded, $payment->fresh()->status);
        $this->assertSame(OrderStatus::Paid, $payment->order->fresh()->status);
    }

    public function test_a_failed_event_marks_the_payment_failed_and_restores_stock(): void
    {
        $payment = $this->makePendingPayment(stock: 10, quantity: 2);
        $variantId = $payment->order->items()->first()->product_variant_id;

        $response = $this->postJson('/api/webhooks/xendit', $this->webhookPayload($payment, 'payment.failed'), [
            'x-callback-token' => $this->webhookToken,
        ]);

        $response->assertStatus(200);
        $this->assertSame(PaymentStatus::Failed, $payment->fresh()->status);
        $this->assertSame(10, ProductVariant::find($variantId)->stock_quantity);
    }

    public function test_an_expired_event_marks_the_payment_expired_and_restores_stock(): void
    {
        $payment = $this->makePendingPayment(stock: 10, quantity: 2, method: PaymentMethod::PromptPay);
        $variantId = $payment->order->items()->first()->product_variant_id;

        $response = $this->postJson('/api/webhooks/xendit', $this->webhookPayload($payment, 'payment.expired'), [
            'x-callback-token' => $this->webhookToken,
        ]);

        $response->assertStatus(200);
        $this->assertSame(PaymentStatus::Expired, $payment->fresh()->status);
        $this->assertSame(10, ProductVariant::find($variantId)->stock_quantity);
    }

    public function test_a_webhook_for_an_unmatched_payment_is_acknowledged_rather_than_erroring(): void
    {
        $response = $this->postJson('/api/webhooks/xendit', [
            'event' => 'payment_session.completed',
            'data' => ['reference_id' => 'OO-2026-DOESNOTEXIST-99999'],
        ], ['x-callback-token' => $this->webhookToken]);

        // Deliberately 200, not 404/422 — an unmatched payment shouldn't
        // burn Xendit's 6 retries on something a redeploy can't fix.
        $response->assertStatus(200);
    }

    public function test_a_retried_succeeded_webhook_does_not_double_apply(): void
    {
        $payment = $this->makePendingPayment(stock: 10, quantity: 2);

        $this->postJson('/api/webhooks/xendit', $this->webhookPayload($payment, 'payment_session.completed'), [
            'x-callback-token' => $this->webhookToken,
        ]);
        $this->assertSame(8, $payment->order->items()->first()->productVariant->stock_quantity);

        // Xendit retries webhook delivery — a second, identical delivery
        // of the same event must be a no-op, not a second stock decrement.
        $this->postJson('/api/webhooks/xendit', $this->webhookPayload($payment, 'payment_session.completed'), [
            'x-callback-token' => $this->webhookToken,
        ]);

        $this->assertSame(8, $payment->order->items()->first()->productVariant->fresh()->stock_quantity);
    }
}
