<x-mail::message>
# Thanks for your order, {{ $order->guest_name }}!

Order **{{ $order->order_number }}** is confirmed.

@if ($order->payment_method === 'cod')
Payable in cash when your order is delivered.
@else
Payment received — we'll get this packed and shipped soon.
@endif

<x-mail::table>
| Item | Qty | |
| :--- | :-: | ---: |
@foreach ($order->items as $item)
| {{ $item->product_name }} — {{ $item->variant_label }} | {{ $item->quantity }} | ฿{{ number_format($item->line_total, 2) }} |
@endforeach
| | Subtotal | ฿{{ number_format($order->subtotal, 2) }} |
| | Shipping | ฿{{ number_format($order->shipping_cost, 2) }} |
| | **Total** | **฿{{ number_format($order->total, 2) }}** |
</x-mail::table>

## Delivery address
{!! implode('<br>', array_map('e', $shippingAddressLines)) !!}

<x-mail::button :url="$orderUrl">
Track your order
</x-mail::button>

Questions about your order? Just reply to this email or reach us at min@one-organic.com.

— One Organic
</x-mail::message>
