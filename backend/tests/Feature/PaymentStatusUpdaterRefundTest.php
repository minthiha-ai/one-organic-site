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

class PaymentStatusUpdaterRefundTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // markSucceeded() (used to get orders into a Paid state for these
        // tests) also tries a SHIPPOP booking — not what these tests are
        // about, so keep it fast/deterministic. See PaymentStatusUpdaterStockTest.
        Http::fake(['*' => Http::response(['status' => false], 500)]);
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

    protected function makePaidOrder(ProductVariant $variant, PaymentMethod $method = PaymentMethod::Card, int $quantity = 2): array
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

        $variant->decrement('stock_quantity', $quantity);

        $payment = Payment::create([
            'order_id' => $order->id,
            'method' => $method,
            'status' => PaymentStatus::Pending,
            'amount' => $order->total,
        ]);

        (new PaymentStatusUpdater)->markSucceeded($payment, ['status' => 'COMPLETED']);

        return [$order->fresh(), $payment->fresh()];
    }

    protected function makeCodOrder(ProductVariant $variant, int $quantity = 2): Order
    {
        $order = Order::create([
            'guest_name' => 'Test Customer',
            'guest_email' => 'test@example.com',
            'status' => OrderStatus::Pending,
            'payment_method' => 'cod',
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

        return $order;
    }

    public function test_refunding_a_card_payment_updates_both_the_payment_and_the_order(): void
    {
        $variant = $this->makeVariant();
        [$order, $payment] = $this->makePaidOrder($variant);

        (new PaymentStatusUpdater)->markRefunded($order, $payment, 200.0, false, ['id' => 'rfd-123']);

        $this->assertSame(OrderStatus::Refunded, $order->fresh()->status);
        $this->assertNotNull($order->fresh()->refunded_at);
        $this->assertSame(PaymentStatus::Refunded, $payment->fresh()->status);
        $this->assertEquals(200.0, $payment->fresh()->refunded_amount);
        $this->assertSame('rfd-123', $payment->fresh()->refund_reference);
    }

    public function test_refunding_a_cod_order_with_no_payment_row_still_works(): void
    {
        $variant = $this->makeVariant();
        $order = $this->makeCodOrder($variant);

        (new PaymentStatusUpdater)->markRefunded($order, null, 200.0, false);

        $this->assertSame(OrderStatus::Refunded, $order->fresh()->status);
        $this->assertNotNull($order->fresh()->refunded_at);
    }

    public function test_restore_stock_true_returns_the_item_to_inventory(): void
    {
        $variant = $this->makeVariant(stock: 10);
        [$order, $payment] = $this->makePaidOrder($variant, quantity: 2);

        $this->assertSame(8, $variant->fresh()->stock_quantity);

        (new PaymentStatusUpdater)->markRefunded($order, $payment, 200.0, true);

        $this->assertSame(10, $variant->fresh()->stock_quantity);
    }

    public function test_restore_stock_false_leaves_inventory_unchanged(): void
    {
        $variant = $this->makeVariant(stock: 10);
        [$order, $payment] = $this->makePaidOrder($variant, quantity: 2);

        $this->assertSame(8, $variant->fresh()->stock_quantity);

        (new PaymentStatusUpdater)->markRefunded($order, $payment, 200.0, false);

        $this->assertSame(8, $variant->fresh()->stock_quantity);
    }

    public function test_refunding_an_already_refunded_order_does_not_double_restore_stock(): void
    {
        $variant = $this->makeVariant(stock: 10);
        [$order, $payment] = $this->makePaidOrder($variant, quantity: 2);
        $updater = new PaymentStatusUpdater;

        $updater->markRefunded($order, $payment, 200.0, true);
        $this->assertSame(10, $variant->fresh()->stock_quantity);

        // A retried webhook or a second click — must be a no-op.
        $updater->markRefunded($order->fresh(), $payment->fresh(), 200.0, true);

        $this->assertSame(10, $variant->fresh()->stock_quantity);
    }
}
