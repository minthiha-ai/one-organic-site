<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Address;
use App\Models\Order;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function store(CheckoutRequest $request)
    {
        $customer = $request->user('sanctum');

        $shipping = $this->resolveShippingAddress($request, $customer);

        $order = DB::transaction(function () use ($request, $customer, $shipping) {
            // Lock the variant rows for the duration of the transaction so two
            // concurrent checkouts can't both oversell the last unit in stock.
            $variantIds = collect($request->input('items'))->pluck('product_variant_id');
            $variants = ProductVariant::query()
                ->whereIn('id', $variantIds)
                ->with('product')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            $lineItems = [];

            foreach ($request->input('items') as $line) {
                $variant = $variants->get($line['product_variant_id']);
                $quantity = (int) $line['quantity'];

                if (! $variant || ! $variant->is_active) {
                    throw ValidationException::withMessages([
                        'items' => "One of the items in your cart is no longer available.",
                    ]);
                }

                if ($variant->stock_quantity < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => "Only {$variant->stock_quantity} left of {$variant->product->name} ({$variant->option_label}).",
                    ]);
                }

                $lineTotal = $variant->price * $quantity;
                $subtotal += $lineTotal;

                $lineItems[] = [
                    'variant' => $variant,
                    'quantity' => $quantity,
                    'line_total' => $lineTotal,
                ];
            }

            // Shipping cost / discounts aren't wired to real logic yet — flat
            // zero until a shipping-rate and coupon system are built.
            $shippingCost = 0;
            $discountTotal = 0;

            $order = Order::create([
                'customer_id' => $customer?->id,
                'guest_name' => $customer?->name ?? $request->string('guest_name'),
                'guest_email' => $customer?->email ?? $request->string('guest_email'),
                'guest_phone' => $customer?->phone ?? $request->input('guest_phone'),
                'status' => 'pending',
                'currency' => 'THB',
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'discount_total' => $discountTotal,
                'total' => $subtotal + $shippingCost - $discountTotal,
                'shipping_recipient_name' => $shipping['recipient_name'],
                'shipping_phone' => $shipping['phone'],
                'shipping_line1' => $shipping['line1'],
                'shipping_line2' => $shipping['line2'] ?? null,
                'shipping_city' => $shipping['city'],
                'shipping_state' => $shipping['state'] ?? null,
                'shipping_postal_code' => $shipping['postal_code'],
                'shipping_country' => $shipping['country'] ?? 'TH',
                'payment_method' => $request->input('payment_method'),
                'notes' => $request->input('notes'),
            ]);

            foreach ($lineItems as $line) {
                $variant = $line['variant'];

                $order->items()->create([
                    'product_variant_id' => $variant->id,
                    'product_name' => $variant->product->name,
                    'variant_label' => $variant->option_label,
                    'sku' => $variant->sku,
                    'unit_price' => $variant->price,
                    'quantity' => $line['quantity'],
                    'line_total' => $line['line_total'],
                ]);

                $variant->decrement('stock_quantity', $line['quantity']);
            }

            return $order;
        });

        return new OrderResource($order->load('items'));
    }

    protected function resolveShippingAddress(CheckoutRequest $request, $customer): array
    {
        if ($request->filled('address_id')) {
            $address = Address::findOrFail($request->integer('address_id'));

            if (! $customer || $address->customer_id !== $customer->id) {
                throw ValidationException::withMessages([
                    'address_id' => 'That address does not belong to you.',
                ]);
            }

            return [
                'recipient_name' => $address->recipient_name,
                'phone' => $address->phone,
                'line1' => $address->line1,
                'line2' => $address->line2,
                'city' => $address->city,
                'state' => $address->state,
                'postal_code' => $address->postal_code,
                'country' => $address->country,
            ];
        }

        return $request->input('shipping');
    }
}
