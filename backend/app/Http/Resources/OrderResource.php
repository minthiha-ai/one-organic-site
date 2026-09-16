<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'order_number' => $this->order_number,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'currency' => $this->currency,
            'subtotal' => (float) $this->subtotal,
            'shipping_cost' => (float) $this->shipping_cost,
            'discount_total' => (float) $this->discount_total,
            'total' => (float) $this->total,
            'guest_name' => $this->guest_name,
            'guest_email' => $this->guest_email,
            'guest_phone' => $this->guest_phone,
            'shipping' => [
                'recipient_name' => $this->shipping_recipient_name,
                'phone' => $this->shipping_phone,
                'line1' => $this->shipping_line1,
                'line2' => $this->shipping_line2,
                'city' => $this->shipping_city,
                'state' => $this->shipping_state,
                'postal_code' => $this->shipping_postal_code,
                'country' => $this->shipping_country,
            ],
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'latest_payment' => $this->whenLoaded('latestPayment', fn () => $this->latestPayment ? new PaymentResource($this->latestPayment) : null),
            'created_at' => $this->created_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'shipped_at' => $this->shipped_at?->toIso8601String(),
            'delivered_at' => $this->delivered_at?->toIso8601String(),
        ];
    }
}
