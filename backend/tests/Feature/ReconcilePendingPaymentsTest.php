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
use App\Services\XenditClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

/**
 * Both XenditClient::getSession() (card) and getQrCode() (PromptPay) are
 * raw HTTP in the card case but go through the xendit-php SDK's own
 * Guzzle client in the PromptPay case (confirmed reading the vendor
 * source — see FullCheckoutFlowTest's docblock) — Http::fake() can't
 * intercept the latter. Mocking XenditClient itself via the container
 * sidesteps that entirely and works uniformly for both, so that's used
 * throughout this file rather than mixing two different strategies.
 */
class ReconcilePendingPaymentsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // markSucceeded() also tries a SHIPPOP booking and queues mail.
        Http::fake(['*' => Http::response(['status' => false], 500)]);
    }

    protected function makePayment(array $overrides): Payment
    {
        $category = Category::create(['name' => 'Test', 'slug' => 'test-'.uniqid()]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'Test Product', 'slug' => 'test-product-'.uniqid()]);
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'TEST-'.uniqid(),
            'option_label' => 'Default',
            'price' => 100,
            'stock_quantity' => 10,
        ]);

        $order = Order::create([
            'guest_name' => 'Test Customer',
            'guest_email' => 'test@example.com',
            'status' => OrderStatus::Pending,
            'subtotal' => 200,
            'total' => 200,
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
            'quantity' => 2,
        ]);

        $variant->decrement('stock_quantity', 2);

        // created_at isn't in Payment::$fillable (nothing legitimately mass-
        // assigns it outside tests), so a "stale payment" fixture needs
        // forceFill() to actually backdate it — Payment::create() would
        // silently ignore it and Eloquent would stamp "now" instead.
        $createdAt = $overrides['created_at'] ?? null;
        unset($overrides['created_at']);

        $payment = Payment::create(array_merge([
            'order_id' => $order->id,
            'method' => PaymentMethod::Card,
            'status' => PaymentStatus::Pending,
            'amount' => 200,
            'gateway_reference' => 'ref-'.uniqid(),
        ], $overrides));

        if ($createdAt) {
            $payment->forceFill(['created_at' => $createdAt])->save();
        }

        return $payment;
    }

    public function test_a_stale_completed_card_session_is_marked_succeeded(): void
    {
        $payment = $this->makePayment(['created_at' => now()->subMinutes(25)]);

        $this->mock(XenditClient::class, function ($mock) use ($payment) {
            $mock->shouldReceive('getSession')->once()->with($payment->gateway_reference)
                ->andReturn(['status' => 'COMPLETED']);
        });

        $this->artisan('payments:reconcile')->assertExitCode(0);

        $this->assertSame(PaymentStatus::Succeeded, $payment->fresh()->status);
        $this->assertSame(OrderStatus::Paid, $payment->order->fresh()->status);
    }

    public function test_a_stale_expired_card_session_is_marked_expired_and_restores_stock(): void
    {
        $payment = $this->makePayment(['created_at' => now()->subMinutes(25)]);
        $variant = $payment->order->items()->first()->productVariant;

        $this->mock(XenditClient::class, function ($mock) use ($payment) {
            $mock->shouldReceive('getSession')->once()->with($payment->gateway_reference)
                ->andReturn(['status' => 'EXPIRED']);
        });

        $this->artisan('payments:reconcile');

        $this->assertSame(PaymentStatus::Expired, $payment->fresh()->status);
        $this->assertSame(10, $variant->fresh()->stock_quantity);
    }

    public function test_a_stale_card_session_still_pending_at_xendit_is_left_alone(): void
    {
        $payment = $this->makePayment(['created_at' => now()->subMinutes(25)]);

        $this->mock(XenditClient::class, function ($mock) use ($payment) {
            $mock->shouldReceive('getSession')->once()->with($payment->gateway_reference)
                ->andReturn(['status' => 'PENDING']);
        });

        $this->artisan('payments:reconcile');

        $this->assertSame(PaymentStatus::Pending, $payment->fresh()->status);
    }

    public function test_a_card_session_younger_than_20_minutes_is_not_checked_at_all(): void
    {
        $payment = $this->makePayment(['created_at' => now()->subMinutes(5)]);

        $this->mock(XenditClient::class, function ($mock) {
            $mock->shouldNotReceive('getSession');
        });

        $this->artisan('payments:reconcile');

        $this->assertSame(PaymentStatus::Pending, $payment->fresh()->status);
    }

    public function test_an_inactive_qr_code_past_its_expiry_is_marked_succeeded_not_expired(): void
    {
        // INACTIVE means paid (confirmed live per XenditClient::getQrCode's
        // own docblock) — must win even though expires_at has also passed,
        // or a customer who paid right at the wire gets wrongly refused.
        $payment = $this->makePayment([
            'method' => PaymentMethod::PromptPay,
            'expires_at' => now()->subMinute(),
        ]);

        $this->mock(XenditClient::class, function ($mock) use ($payment) {
            $mock->shouldReceive('getQrCode')->once()->with($payment->gateway_reference)
                ->andReturn(['status' => 'INACTIVE']);
        });

        $this->artisan('payments:reconcile');

        $this->assertSame(PaymentStatus::Succeeded, $payment->fresh()->status);
    }

    public function test_an_active_qr_code_past_its_expiry_is_marked_expired(): void
    {
        $payment = $this->makePayment([
            'method' => PaymentMethod::PromptPay,
            'expires_at' => now()->subMinute(),
        ]);
        $variant = $payment->order->items()->first()->productVariant;

        $this->mock(XenditClient::class, function ($mock) use ($payment) {
            $mock->shouldReceive('getQrCode')->once()->with($payment->gateway_reference)
                ->andReturn(['status' => 'ACTIVE']);
        });

        $this->artisan('payments:reconcile');

        $this->assertSame(PaymentStatus::Expired, $payment->fresh()->status);
        $this->assertSame(10, $variant->fresh()->stock_quantity);
    }

    public function test_a_qr_code_not_yet_expired_is_not_checked_at_all(): void
    {
        $payment = $this->makePayment([
            'method' => PaymentMethod::PromptPay,
            'expires_at' => now()->addMinutes(10),
        ]);

        $this->mock(XenditClient::class, function ($mock) {
            $mock->shouldNotReceive('getQrCode');
        });

        $this->artisan('payments:reconcile');

        $this->assertSame(PaymentStatus::Pending, $payment->fresh()->status);
    }

    public function test_a_payment_with_no_gateway_reference_is_never_checked(): void
    {
        $payment = $this->makePayment([
            'gateway_reference' => null,
            'created_at' => now()->subMinutes(25),
        ]);

        $this->mock(XenditClient::class, function ($mock) {
            $mock->shouldNotReceive('getSession');
            $mock->shouldNotReceive('getQrCode');
        });

        $this->artisan('payments:reconcile');

        $this->assertSame(PaymentStatus::Pending, $payment->fresh()->status);
    }

    public function test_one_payment_throwing_does_not_stop_the_rest_from_being_checked(): void
    {
        $broken = $this->makePayment(['created_at' => now()->subMinutes(25)]);
        $fine = $this->makePayment(['created_at' => now()->subMinutes(25)]);

        $this->mock(XenditClient::class, function ($mock) use ($broken, $fine) {
            $mock->shouldReceive('getSession')->once()->with($broken->gateway_reference)
                ->andThrow(new RuntimeException('Xendit unreachable'));
            $mock->shouldReceive('getSession')->once()->with($fine->gateway_reference)
                ->andReturn(['status' => 'COMPLETED']);
        });

        $this->artisan('payments:reconcile')->assertExitCode(0);

        $this->assertSame(PaymentStatus::Pending, $broken->fresh()->status);
        $this->assertSame(PaymentStatus::Succeeded, $fine->fresh()->status);
    }
}
