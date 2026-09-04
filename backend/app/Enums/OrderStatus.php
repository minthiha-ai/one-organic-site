<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Packed = 'packed';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Paid => 'Paid',
            self::Packed => 'Packed',
            self::Shipped => 'Shipped',
            self::Delivered => 'Delivered',
            self::Cancelled => 'Cancelled',
            self::Refunded => 'Refunded',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Pending => 'gray',
            self::Paid => 'info',
            self::Packed => 'warning',
            self::Shipped => 'primary',
            self::Delivered => 'success',
            self::Cancelled => 'danger',
            self::Refunded => 'danger',
        };
    }

    /**
     * Whether an order in this status counts toward "sales" figures on the
     * admin dashboard. Deliberately a "sales," not "collected cash," view:
     * everything except Cancelled/Refunded counts, including Pending —
     * a stricter cash-basis definition (Paid-and-later only) would be a
     * reasonable alternative if that's ever wanted instead.
     */
    public function countsTowardRevenue(): bool
    {
        return ! in_array($this, [self::Cancelled, self::Refunded], true);
    }

    /** @return array<string> */
    public static function revenueCountingValues(): array
    {
        return collect(self::cases())
            ->filter(fn (self $status) => $status->countsTowardRevenue())
            ->map(fn (self $status) => $status->value)
            ->all();
    }
}
