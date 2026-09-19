<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShippingRate;
use Illuminate\Http\JsonResponse;

class ShippingRateController extends Controller
{
    /**
     * Lets the frontend show the real shipping fee on the checkout page
     * before the order is placed, instead of a hardcoded "0.00" the
     * customer never actually pays — same rate CheckoutController itself
     * charges, read from the same table.
     */
    public function current(): JsonResponse
    {
        $rate = ShippingRate::where('is_active', true)->firstOrFail();

        return response()->json(['data' => ['rate' => (float) $rate->rate]]);
    }
}
