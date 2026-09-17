<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'status',
        'currency',
        'subtotal',
        'shipping_cost',
        'discount_total',
        'total',
        'shipping_recipient_name',
        'shipping_phone',
        'shipping_line1',
        'shipping_line2',
        'shipping_city',
        'shipping_state',
        'shipping_postal_code',
        'shipping_country',
        'payment_method',
        'payment_reference',
        'notes',
        'paid_at',
        'packed_at',
        'shipped_at',
        'delivered_at',
        'cancelled_at',
        'stock_restored_at',
    ];

    protected $casts = [
        'status' => OrderStatus::class,
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'discount_total' => 'decimal:2',
        'total' => 'decimal:2',
        'paid_at' => 'datetime',
        'packed_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'stock_restored_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            $order->order_number ??= static::generateOrderNumber();
        });
    }

    public function getRouteKeyName(): string
    {
        return 'order_number';
    }

    public static function generateOrderNumber(): string
    {
        do {
            $candidate = 'OO-'.now()->format('Y').'-'.strtoupper(Str::random(6));
        } while (static::where('order_number', $candidate)->exists());

        return $candidate;
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function latestPayment(): HasOne
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    public function recalculateTotals(): void
    {
        $subtotal = $this->items->sum('line_total');

        $this->subtotal = $subtotal;
        $this->total = $subtotal + $this->shipping_cost - $this->discount_total;
    }
}
