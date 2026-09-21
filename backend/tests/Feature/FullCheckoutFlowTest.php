<?php

namespace Tests\Feature;

use App\Enums\PaymentStatus;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ShippingRate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Phase 1.4's "full checkout flow (guest order creation through to
 * payment)" — covers the card path specifically. PromptPay's creation call
 * (XenditClient::createPromptPayQr) goes through the xendit-php SDK's own
 * Guzzle client (Xendit\ApiRequestor::_httpClient(), confirmed by reading
 * the vendor source), not Laravel's Http facade, so Http::fake() cannot
 * intercept it — there's no reliable, fast way to test that specific call
 * without either a live sandbox request or reimplementing the SDK's
 * HttpClient interface. Not attempted here rather than faked into looking
 * covered when it isn't; card and PromptPay share every line of code
 * except that one Xendit call, so this still exercises the real flow.
 */
class FullCheckoutFlowTest extends TestCase
{
    use RefreshDatabase;

    /**
     * SHIPPOP is irrelevant to these tests but checkout always calls it —
     * fake it unreachable so it falls back to the flat rate fast. Merged
     * into one Http::fake() call with whatever Xendit fake a test also
     * needs, since layering a second Http::fake() on top of a catch-all
     * isn't reliable to override it (see CheckoutShippingTest).
     */
    protected function fakeShippopUnreachable(array $extra = []): void
    {
        Http::fake($extra + ['*' => Http::response(['status' => false], 500)]);
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

    protected function checkoutPayload(ProductVariant $variant): array
    {
        return [
            'items' => [['product_variant_id' => $variant->id, 'quantity' => 1]],
            'guest_name' => 'Test Customer',
            'guest_email' => 'test@example.com',
            'payment_method' => 'card',
            'shipping' => [
                'recipient_name' => 'Test Customer',
                'phone' => '0800000000',
                'line1' => '123 Test Street',
                'city' => 'Bangkok',
                'postal_code' => '10110',
            ],
        ];
    }

    protected function placeOrder(): string
    {
        ShippingRate::create(['name' => 'Standard flat rate', 'rate' => 50, 'is_active' => true]);
        $variant = $this->makeVariant();

        $response = $this->postJson('/api/checkout', $this->checkoutPayload($variant));
        $response->assertStatus(201);

        return $response->json('data.order_number');
    }

    public function test_guest_checkout_through_to_a_card_session_records_a_pending_payment(): void
    {
        $this->fakeShippopUnreachable([
            'https://api.xendit.co/sessions' => Http::response([
                'payment_session_id' => 'ps-test-123',
                'expires_at' => now()->addMinutes(30)->toIso8601String(),
            ], 200),
        ]);

        $orderNumber = $this->placeOrder();

        $response = $this->postJson("/api/orders/{$orderNumber}/payments/card", [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(201);

        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $payment = $order->payments()->first();

        $this->assertNotNull($payment);
        $this->assertSame(PaymentStatus::Pending, $payment->status);
        $this->assertSame('ps-test-123', $payment->gateway_reference);
        $this->assertEquals(150.0, (float) $payment->amount); // 100 subtotal + 50 flat shipping
    }

    public function test_a_wrong_email_cannot_start_a_payment_on_someone_elses_order(): void
    {
        $this->fakeShippopUnreachable();
        $orderNumber = $this->placeOrder();

        $response = $this->postJson("/api/orders/{$orderNumber}/payments/card", [
            'email' => 'not-the-customer@example.com',
        ]);

        $response->assertStatus(422);
        $this->assertSame(0, Order::where('order_number', $orderNumber)->firstOrFail()->payments()->count());
    }

    public function test_a_failed_card_session_creation_marks_the_payment_failed_and_restores_stock(): void
    {
        $this->fakeShippopUnreachable([
            'https://api.xendit.co/sessions' => Http::response(['error_code' => 'SERVER_ERROR'], 500),
        ]);

        $orderNumber = $this->placeOrder();
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $variantId = $order->items()->first()->product_variant_id;
        $stockAfterCheckout = ProductVariant::find($variantId)->stock_quantity;

        $response = $this->postJson("/api/orders/{$orderNumber}/payments/card", [
            'email' => 'test@example.com',
        ]);

        // Never a raw 500 to the client — a validation-style message instead.
        $response->assertStatus(422);

        $payment = $order->payments()->first();
        $this->assertSame(PaymentStatus::Failed, $payment->status);
        $this->assertSame($stockAfterCheckout + 1, ProductVariant::find($variantId)->stock_quantity);
    }

    public function test_payment_status_endpoint_reflects_a_still_pending_order(): void
    {
        $this->fakeShippopUnreachable();
        $orderNumber = $this->placeOrder();

        $response = $this->postJson("/api/orders/{$orderNumber}/payment-status", [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'pending');
    }
}
