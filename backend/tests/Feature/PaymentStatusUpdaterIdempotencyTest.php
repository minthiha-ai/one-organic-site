<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Mail\OrderConfirmationMail;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\PaymentStatusUpdater;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Phase 1.4's explicit idempotency requirement: calling markSucceeded/
 * markFailed/markExpired twice on the same payment must not double-apply.
 * PaymentStatusUpdaterStockTest already covers several related scenarios
 * (two DIFFERENT payment attempts on one order, a stale sibling, etc.) —
 * these instead call the SAME method on the SAME payment a second time,
 * which is the literal case the plan calls out.
 */
class PaymentStatusUpdaterIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::fake(['*' => Http::response(['status' => false], 500)]);
        Mail::fake();
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

    public function test_calling_mark_succeeded_twice_only_decrements_stock_once(): void
    {
        $payment = $this->makePendingPayment(stock: 10, quantity: 2);
        $variant = $payment->order->items()->first()->productVariant;
        $updater = new PaymentStatusUpdater;

        $updater->markSucceeded($payment, ['status' => 'COMPLETED']);
        $this->assertSame(8, $variant->fresh()->stock_quantity);

        $updater->markSucceeded($payment->fresh(), ['status' => 'COMPLETED']);

        $this->assertSame(8, $variant->fresh()->stock_quantity);
        $this->assertSame(OrderStatus::Paid, $payment->order->fresh()->status);
    }

    public function test_calling_mark_succeeded_twice_only_queues_one_confirmation_email(): void
    {
        $payment = $this->makePendingPayment();
        $updater = new PaymentStatusUpdater;

        $updater->markSucceeded($payment, ['status' => 'COMPLETED']);
        $updater->markSucceeded($payment->fresh(), ['status' => 'COMPLETED']);

        Mail::assertQueuedCount(1);
        Mail::assertQueued(OrderConfirmationMail::class, 1);
    }

    public function test_calling_mark_failed_twice_only_restores_stock_once(): void
    {
        $payment = $this->makePendingPayment(stock: 10, quantity: 2);
        $variant = $payment->order->items()->first()->productVariant;
        $updater = new PaymentStatusUpdater;

        $updater->markFailed($payment, ['error' => 'declined']);
        $this->assertSame(10, $variant->fresh()->stock_quantity);

        $updater->markFailed($payment->fresh(), ['error' => 'declined']);

        $this->assertSame(10, $variant->fresh()->stock_quantity);
        $this->assertSame(PaymentStatus::Failed, $payment->fresh()->status);
    }

    public function test_calling_mark_expired_twice_only_restores_stock_once(): void
    {
        $payment = $this->makePendingPayment(stock: 10, quantity: 2, method: PaymentMethod::PromptPay);
        $variant = $payment->order->items()->first()->productVariant;
        $updater = new PaymentStatusUpdater;

        $updater->markExpired($payment);
        $this->assertSame(10, $variant->fresh()->stock_quantity);

        $updater->markExpired($payment->fresh());

        $this->assertSame(10, $variant->fresh()->stock_quantity);
        $this->assertSame(PaymentStatus::Expired, $payment->fresh()->status);
    }

    public function test_mark_failed_after_mark_succeeded_does_not_undo_the_success(): void
    {
        // isTerminal() treats Succeeded as terminal — markFailed on an
        // already-succeeded payment (e.g. a late/out-of-order webhook)
        // must be a no-op, not overwrite a real sale as failed.
        $payment = $this->makePendingPayment(stock: 10, quantity: 2);
        $variant = $payment->order->items()->first()->productVariant;
        $updater = new PaymentStatusUpdater;

        $updater->markSucceeded($payment, ['status' => 'COMPLETED']);
        $updater->markFailed($payment->fresh(), ['error' => 'late webhook']);

        $this->assertSame(PaymentStatus::Succeeded, $payment->fresh()->status);
        $this->assertSame(OrderStatus::Paid, $payment->order->fresh()->status);
        $this->assertSame(8, $variant->fresh()->stock_quantity);
    }
}
