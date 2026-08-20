<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderLookupRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()->orders()
            ->with('items')
            ->latest()
            ->get();

        return OrderResource::collection($orders);
    }

    public function show(Request $request, Order $order)
    {
        if ($order->customer_id !== $request->user()->id) {
            abort(403);
        }

        return new OrderResource($order->load('items'));
    }

    /**
     * Guest order lookup — no auth, but requires both the order number and
     * the email it was placed under, so an order number alone (guessable/
     * sequential-looking) can't be used to pull up someone else's order.
     */
    public function lookup(OrderLookupRequest $request)
    {
        $order = Order::query()
            ->where('order_number', $request->string('order_number'))
            ->where('guest_email', $request->string('email'))
            ->with('items')
            ->first();

        if (! $order) {
            return response()->json(['message' => 'No order found with that number and email.'], 404);
        }

        return new OrderResource($order);
    }
}
