<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Local-verification data only — for eyeballing the admin sales dashboard
 * against realistic numbers. Never invoked from DatabaseSeeder's default
 * run; see database/seeders/OrderSeeder.php.
 *
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        // Weighted toward completed-ish statuses, a smaller share pending
        // or gone wrong — roughly what a real store's status mix looks
        // like once orders have had time to move through the pipeline.
        $status = fake()->randomElement([
            OrderStatus::Paid, OrderStatus::Paid, OrderStatus::Paid,
            OrderStatus::Delivered, OrderStatus::Delivered, OrderStatus::Delivered,
            OrderStatus::Shipped, OrderStatus::Shipped,
            OrderStatus::Packed,
            OrderStatus::Pending,
            OrderStatus::Cancelled,
            OrderStatus::Refunded,
        ])->value;

        $createdAt = fake()->dateTimeBetween('-90 days', 'now');
        $isGuest = fake()->boolean(30) === false; // ~70% attributed to a customer

        $name = fake()->name();
        $email = fake()->safeEmail();
        $phone = fake()->numerify('08########');

        return [
            'customer_id' => $isGuest ? null : Customer::factory(),
            'guest_name' => $name,
            'guest_email' => $email,
            'guest_phone' => $phone,
            'status' => $status,
            'currency' => 'THB',
            // Totals are placeholders here — recalculated for real once
            // items are attached, via the afterCreating hook in
            // OrderSeeder (Order::recalculateTotals() needs the items
            // relation loaded, which isn't available mid-factory-create).
            'subtotal' => 0,
            'shipping_cost' => 0,
            'discount_total' => 0,
            'total' => 0,
            'shipping_recipient_name' => $name,
            'shipping_phone' => $phone,
            'shipping_line1' => fake()->streetAddress(),
            'shipping_city' => fake()->randomElement(['Bangkok', 'Chiang Mai', 'Phuket', 'Khon Kaen']),
            'shipping_postal_code' => fake()->numerify('#####'),
            'shipping_country' => 'TH',
            'payment_method' => fake()->randomElement(['card', 'cod']),
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ];
    }
}
