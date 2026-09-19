<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ShippingRate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutShippingTest extends TestCase
{
    use RefreshDatabase;

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
            'shipping' => [
                'recipient_name' => 'Test Customer',
                'phone' => '0800000000',
                'line1' => '123 Test Street',
                'city' => 'Bangkok',
                'postal_code' => '10110',
            ],
        ];
    }

    public function test_checkout_includes_the_active_shipping_rate_in_the_total(): void
    {
        ShippingRate::create(['name' => 'Standard flat rate', 'rate' => 50, 'is_active' => true]);
        $variant = $this->makeVariant();

        $response = $this->postJson('/api/checkout', $this->checkoutPayload($variant));

        $response->assertStatus(201);
        $response->assertJsonPath('data.subtotal', 100);
        $response->assertJsonPath('data.shipping_cost', 50);
        $response->assertJsonPath('data.total', 150);
    }

    public function test_checkout_fails_loudly_rather_than_charging_zero_shipping_when_no_rate_is_active(): void
    {
        // Deliberately no ShippingRate row at all.
        $variant = $this->makeVariant();

        $response = $this->postJson('/api/checkout', $this->checkoutPayload($variant));

        $response->assertStatus(404);
    }

    public function test_checkout_ignores_an_inactive_shipping_rate(): void
    {
        ShippingRate::create(['name' => 'Old rate', 'rate' => 999, 'is_active' => false]);
        ShippingRate::create(['name' => 'Standard flat rate', 'rate' => 50, 'is_active' => true]);
        $variant = $this->makeVariant();

        $response = $this->postJson('/api/checkout', $this->checkoutPayload($variant));

        $response->assertStatus(201);
        $response->assertJsonPath('data.shipping_cost', 50);
    }
}
