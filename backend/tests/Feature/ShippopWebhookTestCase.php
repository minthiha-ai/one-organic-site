<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Order;
use Tests\TestCase;

abstract class ShippopWebhookTestCase extends TestCase
{
    protected string $webhookToken = 'test-webhook-token';

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.shippop.webhook_token' => $this->webhookToken]);
    }

    protected function webhookUrl(): string
    {
        return '/api/webhooks/shippop/'.$this->webhookToken;
    }

    protected function makeOrderWithTrackingCode(string $trackingCode): Order
    {
        return Order::create([
            'guest_name' => 'Test Customer',
            'guest_email' => 'test@example.com',
            'status' => OrderStatus::Packed,
            'subtotal' => 100,
            'shipping_cost' => 27,
            'total' => 127,
            'shipping_recipient_name' => 'Test Customer',
            'shipping_phone' => '0800000000',
            'shipping_line1' => '123 Test Street',
            'shipping_city' => 'Bangkok',
            'shipping_postal_code' => '10110',
            'shippop_purchase_id' => 555,
            'shippop_tracking_code' => $trackingCode,
            'shipment_status' => 'booking',
            'shipment_confirmed_at' => now(),
        ]);
    }
}
