<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ShippingRateController;
use App\Http\Controllers\Api\Webhooks\XenditWebhookController;
use Illuminate\Support\Facades\Route;

// Public catalog
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product:slug}', [ProductController::class, 'show']);

// Lets the checkout page show the real shipping fee before placing the
// order — same rate CheckoutController itself charges.
Route::get('/shipping-rate', [ShippingRateController::class, 'current']);

// Auth
Route::middleware('throttle:auth')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
});

// Checkout — deliberately not behind auth:sanctum, since guest checkout
// must work with no token at all. The controller resolves the customer
// itself via $request->user('sanctum'), which returns null (not a 401)
// when no valid bearer token is present.
Route::middleware('throttle:checkout')->group(function () {
    Route::post('/checkout', [CheckoutController::class, 'store']);

    // Payment actions on one order — same order_number + email guest-access
    // model as the lookup below, since this is guest checkout's actual
    // payment step (see PaymentController::verifyOwnership for why).
    Route::post('/orders/{order:order_number}/payments/card', [PaymentController::class, 'createCardSession']);
    Route::post('/orders/{order:order_number}/payments/promptpay', [PaymentController::class, 'createPromptPay']);
});

// Guest order lookup and payment-status both key off order_number + email
// with no account needed — same enumeration risk, same limiter.
Route::middleware('throttle:order-lookup')->group(function () {
    Route::post('/orders/lookup', [OrderController::class, 'lookup']);
    Route::post('/orders/{order:order_number}/payment-status', [PaymentController::class, 'status']);
});

// Public contact form
Route::post('/contact', [ContactController::class, 'store']);

// Xendit webhook — authenticated by its own x-callback-token header, not
// Sanctum. See XenditWebhookController::verifyToken.
Route::middleware('throttle:webhook')->post('/webhooks/xendit', [XenditWebhookController::class, 'handle']);

// Customer-only
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order:order_number}', [OrderController::class, 'show']);

    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{address}', [AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
});
