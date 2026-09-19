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
use App\Models\ShippingRate;
use App\Services\PaymentStatusUpdater;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OrderConfirmationMailTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
        Mail::fake();
    }

    protected function fakeShippopUnreachable(): void
    {
        Http::fake(['*' => Http::response(['status' => false], 500)]);
    }

    protected function makeVariant(): ProductVariant
    {
        $category = Category::create(['name' => 'Test', 'slug' => 'test-'.uniqid()]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'Test Product', 'slug' => 'test-product-'.uniqid()]);

        return ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'TEST-'.uniqid(),
            'option_label' => 'Default',
            'price' => 100,
            'stock_quantity' => 10,
        ]);
    }

    protected function checkoutPayload(ProductVariant $variant, string $paymentMethod): array
    {
        return [
            'items' => [['product_variant_id' => $variant->id, 'quantity' => 1]],
            'guest_name' => 'Test Customer',
            'guest_email' => 'test@example.com',
            'payment_method' => $paymentMethod,
            'shipping' => [
                'recipient_name' => 'Test Customer',
                'phone' => '0800000000',
                'line1' => '123 Test Street',
                'city' => 'Bangkok',
                'postal_code' => '10110',
            ],
        ];
    }

    public function test_cod_checkout_queues_the_confirmation_immediately(): void
    {
        $this->fakeShippopUnreachable();
        ShippingRate::create(['name' => 'Standard flat rate', 'rate' => 50, 'is_active' => true]);
        $variant = $this->makeVariant();

        $response = $this->postJson('/api/checkout', $this->checkoutPayload($variant, 'cod'));

        $response->assertStatus(201);
        Mail::assertQueued(OrderConfirmationMail::class, function ($mail) use ($response) {
            return $mail->order->order_number === $response->json('data.order_number')
                && $mail->hasTo('test@example.com');
        });
    }

    public function test_card_checkout_does_not_queue_a_confirmation_before_payment_succeeds(): void
    {
        $this->fakeShippopUnreachable();
        ShippingRate::create(['name' => 'Standard flat rate', 'rate' => 50, 'is_active' => true]);
        $variant = $this->makeVariant();

        $response = $this->postJson('/api/checkout', $this->checkoutPayload($variant, 'card'));

        $response->assertStatus(201);
        Mail::assertNotQueued(OrderConfirmationMail::class);
    }

    public function test_payment_success_queues_the_confirmation(): void
    {
        $order = Order::create([
            'guest_name' => 'Test Customer',
            'guest_email' => 'test@example.com',
            'status' => OrderStatus::Pending,
            'subtotal' => 100,
            'total' => 100,
            'shipping_recipient_name' => 'Test Customer',
            'shipping_phone' => '0800000000',
            'shipping_line1' => '123 Test Street',
            'shipping_city' => 'Bangkok',
            'shipping_postal_code' => '10110',
        ]);
        OrderItem::create([
            'order_id' => $order->id,
            'product_name' => 'Test Product',
            'variant_label' => 'Default',
            'sku' => 'TEST-SKU',
            'unit_price' => 100,
            'quantity' => 1,
        ]);
        $payment = Payment::create([
            'order_id' => $order->id,
            'method' => PaymentMethod::Card,
            'status' => PaymentStatus::Pending,
            'amount' => 100,
        ]);

        (new PaymentStatusUpdater)->markSucceeded($payment, ['status' => 'COMPLETED']);

        Mail::assertQueued(OrderConfirmationMail::class, fn ($mail) => $mail->order->id === $order->id);
    }

    public function test_a_payment_already_succeeded_does_not_queue_a_second_confirmation(): void
    {
        $order = Order::create([
            'guest_name' => 'Test Customer',
            'guest_email' => 'test@example.com',
            'status' => OrderStatus::Paid,
            'paid_at' => now(),
            'subtotal' => 100,
            'total' => 100,
            'shipping_recipient_name' => 'Test Customer',
            'shipping_phone' => '0800000000',
            'shipping_line1' => '123 Test Street',
            'shipping_city' => 'Bangkok',
            'shipping_postal_code' => '10110',
        ]);
        $payment = Payment::create([
            'order_id' => $order->id,
            'method' => PaymentMethod::Card,
            'status' => PaymentStatus::Pending,
            'amount' => 100,
        ]);

        (new PaymentStatusUpdater)->markSucceeded($payment, ['status' => 'COMPLETED']);

        Mail::assertNotQueued(OrderConfirmationMail::class);
    }
}
