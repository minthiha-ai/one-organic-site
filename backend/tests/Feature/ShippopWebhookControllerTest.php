<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ShippopWebhookControllerTest extends ShippopWebhookTestCase
{
    use RefreshDatabase;

    public function test_shipping_status_marks_the_order_shipped(): void
    {
        $order = $this->makeOrderWithTrackingCode('SP123');

        $response = $this->postJson($this->webhookUrl(), [
            'tracking_code' => 'SP123',
            'order_status' => 'shipping',
            'courier_tracking_code' => 'KEX999',
        ], $this->webhookHeaders());

        $response->assertOk();
        $order->refresh();
        $this->assertSame(OrderStatus::Shipped, $order->status);
        $this->assertNotNull($order->shipped_at);
        $this->assertSame('shipping', $order->shipment_status);
        $this->assertSame('KEX999', $order->courier_tracking_code);
    }

    public function test_complete_status_marks_the_order_delivered(): void
    {
        $order = $this->makeOrderWithTrackingCode('SP123');

        $response = $this->postJson($this->webhookUrl(), [
            'tracking_code' => 'SP123',
            'order_status' => 'complete',
        ], $this->webhookHeaders());

        $response->assertOk();
        $order->refresh();
        $this->assertSame(OrderStatus::Delivered, $order->status);
        $this->assertNotNull($order->delivered_at);
    }

    public function test_an_intermediate_status_updates_shipment_status_without_changing_order_status(): void
    {
        $order = $this->makeOrderWithTrackingCode('SP123');

        $response = $this->postJson($this->webhookUrl(), [
            'tracking_code' => 'SP123',
            'order_status' => 'problem',
        ], $this->webhookHeaders());

        $response->assertOk();
        $order->refresh();
        $this->assertSame('problem', $order->shipment_status);
        $this->assertSame(OrderStatus::Packed, $order->status);
    }

    public function test_wrong_token_is_rejected(): void
    {
        $this->makeOrderWithTrackingCode('SP123');

        $response = $this->postJson('/api/webhooks/shippop/wrong-token', [
            'tracking_code' => 'SP123',
            'order_status' => 'shipping',
        ], $this->webhookHeaders());

        $response->assertNotFound();
    }

    public function test_missing_secret_header_is_rejected(): void
    {
        $order = $this->makeOrderWithTrackingCode('SP123');

        $response = $this->postJson($this->webhookUrl(), [
            'tracking_code' => 'SP123',
            'order_status' => 'shipping',
        ]);

        $response->assertNotFound();
        $this->assertSame(OrderStatus::Packed, $order->fresh()->status);
    }

    public function test_wrong_secret_header_is_rejected(): void
    {
        $order = $this->makeOrderWithTrackingCode('SP123');

        $response = $this->postJson($this->webhookUrl(), [
            'tracking_code' => 'SP123',
            'order_status' => 'shipping',
        ], ['X-Webhook-Secret' => 'not-the-real-secret']);

        $response->assertNotFound();
        $this->assertSame(OrderStatus::Packed, $order->fresh()->status);
    }

    public function test_unknown_tracking_code_is_acknowledged_without_error(): void
    {
        $response = $this->postJson($this->webhookUrl(), [
            'tracking_code' => 'SP-DOES-NOT-EXIST',
            'order_status' => 'shipping',
        ], $this->webhookHeaders());

        $response->assertOk();
    }
}
