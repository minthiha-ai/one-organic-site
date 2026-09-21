<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending = 'pending';
    case Succeeded = 'succeeded';
    case Failed = 'failed';
    case Expired = 'expired';
    case Refunded = 'refunded';

    public function isTerminal(): bool
    {
        return $this !== self::Pending;
    }
}
