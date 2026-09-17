<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RateLimitingTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_is_rate_limited_after_ten_requests_per_minute(): void
    {
        // Payload is deliberately empty — throttle middleware runs before
        // FormRequest validation, so an invalid request still counts
        // against the limit. Each of the first 10 fails validation (422),
        // not the rate limit.
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/checkout', [])->assertStatus(422);
        }

        $response = $this->postJson('/api/checkout', []);

        $response->assertStatus(429);
        $response->assertHeader('Retry-After');
        $response->assertJson(fn ($json) => $json->has('message')->etc());
    }

    public function test_login_is_rate_limited_after_five_requests_per_minute(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', [])->assertStatus(422);
        }

        $response = $this->postJson('/api/auth/login', []);

        $response->assertStatus(429);
        $response->assertHeader('Retry-After');
    }

    public function test_order_lookup_and_payment_status_share_the_same_limiter(): void
    {
        // Six requests split across both endpoints should trip the shared
        // 10/min order-lookup limiter's remaining budget together, not
        // reset independently per-endpoint. Neither request needs to
        // succeed on business logic — throttling happens before that,
        // so we only assert neither of these first 10 is itself a 429.
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/orders/lookup', [])->assertStatus(422);
        }

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/orders/NOPE/payment-status', [])->assertStatus(404);
        }

        $response = $this->postJson('/api/orders/lookup', []);

        $response->assertStatus(429);
    }

    public function test_product_listing_is_not_rate_limited_by_the_strict_limiters(): void
    {
        // Well under the 60/min default 'api' limiter — just confirms the
        // catch-all doesn't accidentally throttle normal browsing traffic.
        for ($i = 0; $i < 15; $i++) {
            $this->getJson('/api/products')->assertStatus(200);
        }
    }
}
