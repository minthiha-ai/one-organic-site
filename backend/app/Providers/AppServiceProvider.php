<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Sane catch-all for anything not covered by a more specific
        // limiter below — see bootstrap/app.php's throttleApi() call.
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(60)->by($request->ip()));

        // Checkout + the payment-creation routes that follow it.
        RateLimiter::for('checkout', fn (Request $request) => Limit::perMinute(10)->by($request->ip()));

        // Login/register — blunts credential-stuffing.
        RateLimiter::for('auth', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));

        // Guest order lookup and the payment-status endpoint share the same
        // order_number + email guest-access model, so they share the same
        // limiter — both are enumerable the same way.
        RateLimiter::for('order-lookup', fn (Request $request) => Limit::perMinute(10)->by($request->ip()));

        // Xendit webhook — permissive enough for their own retry policy (6
        // attempts with backoff) but enough to blunt a flood.
        RateLimiter::for('webhook', fn (Request $request) => Limit::perMinute(60)->by($request->ip()));
    }
}
