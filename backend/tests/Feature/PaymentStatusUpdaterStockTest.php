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
use App\Services\PaymentStatusUpdater;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PaymentStatusUpdaterStockTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // markSucceeded() now also tries to book a SHIPPOP shipment
        // (Phase 1.1 build step 3) — none of these tests are about that,
        // so keep it fast/deterministic by faking it unreachable. The
        // booking call is wrapped in try/catch in PaymentStatusUpdater, so
        // this failing is expected and harmless here; ShippingBookingServiceTest
        // covers the booking behavior itself.
        Http::fake(['*' => Http::response(['status' => false], 500)]);
    }

    protected function makeOrderWithOneItem(ProductVariant $variant, int $quantity = 2): Order
    {
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

        // Mirrors CheckoutController's own decrement at order-creation time.
        $variant->decrement('stock_quantity', $quantity);

        return $order;
    }

    protected function makePendingPayment(Order $order, PaymentMethod $method = PaymentMethod::PromptPay): Payment
    {
        return Payment::create([
            'order_id' => $order->id,
            'method' => $method,
            'status' => PaymentStatus::Pending,
            'amount' => $order->total,
        ]);
    }

    protected function makeVariant(int $stock = 10): ProductVariant
    {
        $category = Category::create(['name' => 'Test', 'slug' => 'test-'.uniqid()]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'Test Product', 'slug' => 'test-product-'.uniqid()]);

        return ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'TEST-'.uniqid(),
            'option_label' => 'Default',
            'price' => 100,
            'stock_quantity' => $stock,
        ]);
    }

    public function test_expired_payment_restores_stock_to_its_pre_order_value(): void
    {
        $variant = $this->makeVariant(stock: 10);
        $order = $this->makeOrderWithOneItem($variant, quantity: 2);

        $this->assertSame(8, $variant->fresh()->stock_quantity);

        $payment = $this->makePendingPayment($order);

        (new PaymentStatusUpdater)->markExpired($payment);

        $this->assertSame(10, $variant->fresh()->stock_quantity);
        $this->assertSame(PaymentStatus::Expired, $payment->fresh()->status);
    }

    public function test_failed_payment_restores_stock(): void
    {
        $variant = $this->makeVariant(stock: 10);
        $order = $this->makeOrderWithOneItem($variant, quantity: 3);

        $payment = $this->makePendingPayment($order, PaymentMethod::Card);

        (new PaymentStatusUpdater)->markFailed($payment, ['error' => 'declined']);

        $this->assertSame(10, $variant->fresh()->stock_quantity);
    }

    public function test_two_failed_attempts_on_the_same_order_do_not_double_restore_stock(): void
    {
        $variant = $this->makeVariant(stock: 10);
        $order = $this->makeOrderWithOneItem($variant, quantity: 2);

        $updater = new PaymentStatusUpdater;

        $firstAttempt = $this->makePendingPayment($order, PaymentMethod::PromptPay);
        $updater->markExpired($firstAttempt);

        $this->assertSame(10, $variant->fresh()->stock_quantity);

        // Customer retries with a second payment attempt on the same
        // order, which also fails — without the order-level guard, this
        // would restore another +2, leaving stock at 12.
        $secondAttempt = $this->makePendingPayment($order, PaymentMethod::Card);
        $updater->markFailed($secondAttempt, ['error' => 'declined']);

        $this->assertSame(10, $variant->fresh()->stock_quantity);
    }

    public function test_stale_sibling_payment_expiring_after_order_already_paid_does_not_restore_stock(): void
    {
        $variant = $this->makeVariant(stock: 10);
        $order = $this->makeOrderWithOneItem($variant, quantity: 2);

        $updater = new PaymentStatusUpdater;

        // Customer starts a PromptPay QR, then separately succeeds via
        // card before the QR itself expires.
        $promptPayAttempt = $this->makePendingPayment($order, PaymentMethod::PromptPay);
        $cardAttempt = $this->makePendingPayment($order, PaymentMethod::Card);

        $updater->markSucceeded($cardAttempt, ['status' => 'COMPLETED']);

        $this->assertSame(OrderStatus::Paid, $order->fresh()->status);
        $this->assertSame(8, $variant->fresh()->stock_quantity);

        // The now-stale PromptPay QR finally expires and reconciliation
        // picks it up — must be a no-op, not a stock restoration for an
        // order that's actually shipping.
        $updater->markExpired($promptPayAttempt);

        $this->assertSame(8, $variant->fresh()->stock_quantity);
    }

    public function test_succeeding_after_an_earlier_restoration_re_decrements_stock(): void
    {
        $variant = $this->makeVariant(stock: 10);
        $order = $this->makeOrderWithOneItem($variant, quantity: 2);

        $updater = new PaymentStatusUpdater;

        $firstAttempt = $this->makePendingPayment($order, PaymentMethod::PromptPay);
        $updater->markExpired($firstAttempt);

        $this->assertSame(10, $variant->fresh()->stock_quantity);

        // Customer retries and this one succeeds — stock must come back
        // down to reflect the item actually shipping, not stay at 10.
        $secondAttempt = $this->makePendingPayment($order, PaymentMethod::Card);
        $updater->markSucceeded($secondAttempt, ['status' => 'COMPLETED']);

        $this->assertSame(8, $variant->fresh()->stock_quantity);
        $this->assertSame(OrderStatus::Paid, $order->fresh()->status);
        $this->assertNull($order->fresh()->stock_restored_at);
    }
}
