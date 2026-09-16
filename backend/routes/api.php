<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\Webhooks\XenditWebhookController;
use Illuminate\Support\Facades\Route;

// Public catalog
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product:slug}', [ProductController::class, 'show']);

// Auth
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
});

// Checkout — deliberately not behind auth:sanctum, since guest checkout
// must work with no token at all. The controller resolves the customer
// itself via $request->user('sanctum'), which returns null (not a 401)
// when no valid bearer token is present.
Route::post('/checkout', [CheckoutController::class, 'store']);

// Guest order lookup (order number + email, no account needed)
Route::post('/orders/lookup', [OrderController::class, 'lookup']);

// Payment actions on one order — same order_number + email guest-access
// model as the lookup above, since this is guest checkout's actual payment
// step (see PaymentController::verifyOwnership for why).
Route::post('/orders/{order:order_number}/payments/card', [PaymentController::class, 'createCardSession']);
Route::post('/orders/{order:order_number}/payments/promptpay', [PaymentController::class, 'createPromptPay']);
Route::post('/orders/{order:order_number}/payment-status', [PaymentController::class, 'status']);

// Public contact form
Route::post('/contact', [ContactController::class, 'store']);

// Xendit webhook — authenticated by its own x-callback-token header, not
// Sanctum. See XenditWebhookController::verifyToken.
Route::post('/webhooks/xendit', [XenditWebhookController::class, 'handle']);

// Customer-only
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order:order_number}', [OrderController::class, 'show']);

    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{address}', [AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
});
