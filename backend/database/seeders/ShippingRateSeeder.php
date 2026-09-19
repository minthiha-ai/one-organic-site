<?php

namespace Database\Seeders;

use App\Models\ShippingRate;
use Illuminate\Database\Seeder;

/**
 * Interim flat shipping rate (Phase 0.5.5) — replaces the previously
 * hardcoded ฿0. Confirmed rate with Stephen: ฿50 flat, domestic, until
 * Phase 1.1's real SHIPPOP/KEX rate lookup is live.
 */
class ShippingRateSeeder extends Seeder
{
    public function run(): void
    {
        ShippingRate::updateOrCreate(
            ['name' => 'Standard flat rate'],
            ['rate' => 50.00, 'is_active' => true]
        );
    }
}
