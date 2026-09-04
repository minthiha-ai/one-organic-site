<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Seeder;

/**
 * Local-verification data only, for eyeballing the admin sales dashboard
 * (SalesOverviewWidget, OrdersOverTimeChart, TopProductsWidget) against
 * realistic numbers. Deliberately NOT called from DatabaseSeeder::run() —
 * invoke explicitly:
 *
 *   php artisan db:seed --class=CatalogSeeder   (if not already seeded)
 *   php artisan db:seed --class=OrderSeeder
 *
 * Never run this against a real/production database.
 */
class OrderSeeder extends Seeder
{
    public function run(): void
    {
        Order::factory()
            ->count(150)
            ->create()
            ->each(function (Order $order) {
                $itemCount = fake()->numberBetween(1, 4);

                OrderItem::factory()
                    ->count($itemCount)
                    ->create(['order_id' => $order->id]);

                $order->load('items');
                $order->recalculateTotals();
                $order->save();
            });
    }
}
