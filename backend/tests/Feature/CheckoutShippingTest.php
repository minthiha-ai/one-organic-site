<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ShippingRate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CheckoutShippingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Avoid ShippopClient's postoffice cache leaking a result from one
        // test into another — each test should exercise its own Http::fake.
        Cache::flush();
    }

    /**
     * Deterministic + fast — these tests are mostly about the flat rate
     * (Phase 0.5.5), not SHIPPOP itself (verified separately, live,
     * against the real sandbox). Called explicitly per test rather than
     * in setUp() since Http::fake()'s pattern precedence isn't reliable
     * to layer a second, more specific fake on top of a catch-all.
     */
    protected function fakeShippopUnreachable(): void
    {
        Http::fake([
            '*' => Http::response(['status' => false], 500),
        ]);
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
            'weight_grams' => 500,
            'length_cm' => 10,
            'width_cm' => 10,
            'height_cm' => 10,
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
        $this->fakeShippopUnreachable();
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
        // Deliberately no ShippingRate row at all — and SHIPPOP is faked
        // to fail too, so there's no fallback available either.
        $this->fakeShippopUnreachable();
        $variant = $this->makeVariant();

        $response = $this->postJson('/api/checkout', $this->checkoutPayload($variant));

        $response->assertStatus(404);
    }

    public function test_checkout_ignores_an_inactive_shipping_rate(): void
    {
        $this->fakeShippopUnreachable();
        ShippingRate::create(['name' => 'Old rate', 'rate' => 999, 'is_active' => false]);
        ShippingRate::create(['name' => 'Standard flat rate', 'rate' => 50, 'is_active' => true]);
        $variant = $this->makeVariant();

        $response = $this->postJson('/api/checkout', $this->checkoutPayload($variant));

        $response->assertStatus(201);
        $response->assertJsonPath('data.shipping_cost', 50);
    }

    public function test_checkout_uses_a_live_shippop_quote_when_available(): void
    {
        ShippingRate::create(['name' => 'Standard flat rate', 'rate' => 50, 'is_active' => true]);
        $variant = $this->makeVariant();

        Http::fake([
            '*/postoffice/' => Http::response('data({"status":true,"data":{"postoffice":[{"id":1,"name":"พระโขนง","postcode":"10110","latlong":"0,0"}]}})', 200),
            '*/pricelist/' => Http::response([
                'status' => true,
                'data' => [
                    '0' => [
                        'KRYX' => [
                            'courier_code' => 'KRYX',
                            'price' => '27',
                            'available' => true,
                            'courier_name' => 'Kerry Exclusive',
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->postJson('/api/checkout', $this->checkoutPayload($variant));

        $response->assertStatus(201);
        $response->assertJsonPath('data.shipping_cost', 27);
        $response->assertJsonPath('data.total', 127);
    }

    public function test_checkout_quotes_shopee_xpress_instead_of_kerry_for_an_upcountry_postcode(): void
    {
        ShippingRate::create(['name' => 'Standard flat rate', 'rate' => 50, 'is_active' => true]);
        $variant = $this->makeVariant();

        Http::fake([
            '*/postoffice/' => Http::response('data({"status":true,"data":{"postoffice":[{"id":1,"name":"เมืองเชียงใหม่","postcode":"50200","latlong":"0,0"}]}})', 200),
            '*/pricelist/' => Http::response([
                'status' => true,
                'data' => [
                    '0' => [
                        'SPX' => [
                            'courier_code' => 'SPX',
                            'price' => '17',
                            'available' => true,
                            'courier_name' => 'Shopee Xpress',
                        ],
                    ],
                ],
            ], 200),
        ]);

        $payload = $this->checkoutPayload($variant);
        $payload['shipping']['city'] = 'Chiang Mai';
        $payload['shipping']['postal_code'] = '50200';

        $response = $this->postJson('/api/checkout', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.shipping_cost', 17);
        $response->assertJsonPath('data.total', 117);
    }
}
