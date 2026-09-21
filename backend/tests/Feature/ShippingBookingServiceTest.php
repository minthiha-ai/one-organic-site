<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\ShippingBookingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;

class ShippingBookingServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
        Storage::fake('public');
    }

    protected function fakePostOffice(string $postcode = '10110', string $name = 'พระโขนง'): void
    {
        Http::fake([
            '*/postoffice/' => Http::response('data({"status":true,"data":{"postoffice":[{"id":1,"name":"'.$name.'","postcode":"'.$postcode.'","latlong":"0,0"}]}})', 200),
        ]);
    }

    protected function makeOrder(string $paymentMethod = 'card', string $postcode = '10110'): Order
    {
        $category = Category::create(['name' => 'Test', 'slug' => 'test-'.uniqid()]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'Test Product', 'slug' => 'test-product-'.uniqid()]);
        $variant = ProductVariant::create([
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

        $order = Order::create([
            'guest_name' => 'Test Customer',
            'guest_email' => 'test@example.com',
            'status' => OrderStatus::Paid,
            'payment_method' => $paymentMethod,
            'subtotal' => 100,
            'shipping_cost' => 27,
            'total' => 127,
            'shipping_recipient_name' => 'Test Customer',
            'shipping_phone' => '0800000000',
            'shipping_line1' => '123 Test Street',
            'shipping_city' => 'Bangkok',
            'shipping_postal_code' => $postcode,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_variant_id' => $variant->id,
            'product_name' => $variant->product->name,
            'variant_label' => $variant->option_label,
            'sku' => $variant->sku,
            'unit_price' => $variant->price,
            'quantity' => 1,
        ]);

        return $order;
    }

    public function test_prepare_books_a_pending_shipment_without_confirming_or_charging(): void
    {
        $this->fakePostOffice();
        Http::fake([
            '*/booking/' => Http::response([
                'status' => true,
                'purchase_id' => 555,
                'total_price' => 27,
                'data' => [
                    ['status' => true, 'tracking_code' => 'SP123', 'courier_tracking_code' => null],
                ],
            ], 200),
        ]);

        $order = $this->makeOrder();

        (new ShippingBookingService)->prepare($order);

        $order->refresh();
        $this->assertSame(555, $order->shippop_purchase_id);
        $this->assertSame('SP123', $order->shippop_tracking_code);
        $this->assertSame('wait', $order->shipment_status);
        $this->assertNull($order->shipment_confirmed_at);
        // Confirming is a separate, explicit step — prepare() alone must
        // never flip the order's own status.
        $this->assertSame(OrderStatus::Paid, $order->status);
    }

    public function test_prepare_books_shopee_xpress_instead_of_kerry_for_an_upcountry_order(): void
    {
        $this->fakePostOffice('50200', 'เมืองเชียงใหม่');
        Http::fake([
            '*/booking/' => Http::response([
                'status' => true,
                'purchase_id' => 556,
                'total_price' => 17,
                'data' => [['status' => true, 'tracking_code' => 'SP124', 'courier_tracking_code' => null]],
            ], 200),
        ]);

        $order = $this->makeOrder(postcode: '50200');

        (new ShippingBookingService)->prepare($order);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/booking/')
                && $request->data()['data'][0]['courier_code'] === 'SPX';
        });
    }

    public function test_prepare_is_idempotent_once_already_booked(): void
    {
        $this->fakePostOffice();
        Http::fake([
            '*/booking/' => Http::response([
                'status' => true,
                'purchase_id' => 555,
                'total_price' => 27,
                'data' => [['status' => true, 'tracking_code' => 'SP123', 'courier_tracking_code' => null]],
            ], 200),
        ]);

        $order = $this->makeOrder();
        $service = new ShippingBookingService;

        $service->prepare($order);
        $service->prepare($order->fresh());

        Http::assertSentCount(2); // 1 postoffice lookup + 1 booking — no second booking call
    }

    public function test_prepare_throws_for_an_uncovered_postcode_rather_than_silently_falling_back(): void
    {
        Http::fake([
            '*/postoffice/' => Http::response('data({"status":true,"data":{"postoffice":[]}})', 200),
        ]);

        $order = $this->makeOrder();

        $this->expectException(RuntimeException::class);

        (new ShippingBookingService)->prepare($order);
    }

    public function test_confirm_sends_to_the_courier_and_marks_the_order_packed(): void
    {
        $this->fakePostOffice();
        Http::fake([
            '*/booking/' => Http::response([
                'status' => true,
                'purchase_id' => 555,
                'total_price' => 27,
                'data' => [['status' => true, 'tracking_code' => 'SP123', 'courier_tracking_code' => null]],
            ], 200),
            '*/confirm/' => Http::response([
                'status' => true,
                'result' => [
                    ['status' => true, 'courier_code' => 'KRYX', 'tracking_code' => 'SP123', 'courier_tracking_code' => 'KEX999'],
                ],
            ], 200),
            '*/label/' => Http::response(['status' => true, 'pdf' => base64_encode('%PDF-1.4 fake label bytes')], 200),
        ]);

        $order = $this->makeOrder();
        $service = new ShippingBookingService;
        $service->prepare($order);
        $service->confirm($order->fresh());

        $order->refresh();
        $this->assertSame('KEX999', $order->courier_tracking_code);
        $this->assertSame('booking', $order->shipment_status);
        $this->assertNotNull($order->shipment_confirmed_at);
        $this->assertSame(OrderStatus::Packed, $order->status);
        $this->assertNotNull($order->label_url);
        Storage::disk('public')->assertExists("labels/{$order->order_number}.pdf");
    }

    public function test_confirm_without_a_prior_booking_throws(): void
    {
        $order = $this->makeOrder();

        $this->expectException(RuntimeException::class);

        (new ShippingBookingService)->confirm($order);
    }

    public function test_cancel_clears_the_booking_so_it_can_be_retried(): void
    {
        $this->fakePostOffice();
        Http::fake([
            '*/booking/' => Http::response([
                'status' => true,
                'purchase_id' => 555,
                'total_price' => 27,
                'data' => [['status' => true, 'tracking_code' => 'SP123', 'courier_tracking_code' => 'KEX999']],
            ], 200),
            '*/cancel/' => Http::response(['status' => true], 200),
        ]);

        $order = $this->makeOrder();
        $service = new ShippingBookingService;
        $service->prepare($order);
        $service->cancel($order->fresh());

        $order->refresh();
        $this->assertNull($order->shippop_purchase_id);
        $this->assertNull($order->shippop_tracking_code);
        $this->assertNull($order->courier_tracking_code);
        $this->assertNull($order->shipment_status);
    }
}
