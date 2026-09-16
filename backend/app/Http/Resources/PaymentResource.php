<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'method' => $this->method->value,
            'status' => $this->status->value,
            'amount' => (float) $this->amount,
            // Only meaningful for promptpay — the raw QR payload to render,
            // not a hosted image (confirmed from Xendit's sandbox response).
            'qr_string' => $this->raw_response['qr_string'] ?? null,
            // Only meaningful for card — lets the frontend mount Xendit's
            // Components SDK against this specific session.
            'components_sdk_key' => $this->raw_response['components_sdk_key'] ?? null,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
