<?php

namespace Tests\Unit;

use App\Models\Payment;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    public function test_payment_request_id_reads_the_webhook_nested_shape(): void
    {
        $payment = new Payment(['raw_response' => ['data' => ['payment_request_id' => 'pr-webhook-shape']]]);

        $this->assertSame('pr-webhook-shape', $payment->paymentRequestId());
    }

    public function test_payment_request_id_reads_the_flat_get_session_shape(): void
    {
        $payment = new Payment(['raw_response' => ['payment_request_id' => 'pr-flat-shape']]);

        $this->assertSame('pr-flat-shape', $payment->paymentRequestId());
    }

    public function test_payment_request_id_is_null_when_absent(): void
    {
        $payment = new Payment(['raw_response' => ['some_other_field' => 'x']]);

        $this->assertNull($payment->paymentRequestId());
    }

    public function test_payment_request_id_is_null_when_raw_response_is_empty(): void
    {
        $payment = new Payment;

        $this->assertNull($payment->paymentRequestId());
    }
}
