<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'method',
        'gateway',
        'gateway_reference',
        'status',
        'amount',
        'raw_response',
        'expires_at',
        'refunded_amount',
        'refunded_at',
        'refund_reference',
    ];

    protected $casts = [
        'method' => PaymentMethod::class,
        'status' => PaymentStatus::class,
        'amount' => 'decimal:2',
        'raw_response' => 'array',
        'expires_at' => 'datetime',
        'refunded_amount' => 'decimal:2',
        'refunded_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Xendit's payment_request_id ("pr-...") for this payment, needed to
     * call XenditClient::refundPayment(). Confirmed live (26.09.21) that a
     * completed card session's webhook nests it at data.payment_request_id
     * — but a direct getSession() response (used by the reconciliation
     * job) returns the same fields unwrapped, without the "data" envelope,
     * so both shapes are checked. Null for PromptPay (no such field exists
     * — Xendit doesn't support refunding it) or if this payment never
     * actually succeeded.
     */
    public function paymentRequestId(): ?string
    {
        $raw = $this->raw_response ?? [];

        return $raw['data']['payment_request_id'] ?? $raw['payment_request_id'] ?? null;
    }
}
