<?php

namespace Tests\Feature;

use App\Services\XenditClient;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class XenditClientRefundTest extends TestCase
{
    public function test_refund_payment_posts_the_shape_xendit_actually_expects(): void
    {
        // Confirmed live against Xendit's own docs (docs.xendit.co/apidocs/
        // refund-payment-request, 26.09.21) rather than assumed.
        Http::fake([
            'https://api.xendit.co/refunds' => Http::response([
                'id' => 'rfd-123',
                'payment_request_id' => 'pr-456',
                'status' => 'SUCCEEDED',
                'amount' => 200,
            ], 200),
        ]);

        $response = (new XenditClient)->refundPayment(
            referenceId: 'refund-42',
            paymentRequestId: 'pr-456',
            amount: 200.0,
        );

        $this->assertSame('SUCCEEDED', $response['status']);

        Http::assertSent(function ($request) {
            return $request->url() === 'https://api.xendit.co/refunds'
                && $request['reference_id'] === 'refund-42'
                && $request['payment_request_id'] === 'pr-456'
                && $request['currency'] === 'THB'
                && $request['amount'] === 200.0
                && $request['reason'] === 'REQUESTED_BY_CUSTOMER';
        });
    }
}
