<?php

namespace Database\Factories;

use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Local-verification data only — see OrderFactory's docblock. Snapshot
 * fields are pulled from real seeded ProductVariant rows so Top Products
 * is meaningful to eyeball; product_variant_id is occasionally left null
 * to exercise the documented "variant later deleted" scenario and prove
 * the top-products query doesn't depend on that FK.
 *
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        $variant = ProductVariant::with('product')->inRandomOrder()->first();

        if (! $variant) {
            throw new \RuntimeException(
                'No ProductVariant rows found — run CatalogSeeder before seeding order items.'
            );
        }

        $quantity = fake()->numberBetween(1, 3);

        return [
            'product_variant_id' => fake()->boolean(85) ? $variant->id : null,
            'product_name' => $variant->product->name,
            'variant_label' => $variant->option_label,
            'sku' => $variant->sku,
            'unit_price' => $variant->price,
            'quantity' => $quantity,
            // line_total is recomputed by OrderItem's own saving hook —
            // this is just a starting value.
            'line_total' => $variant->price * $quantity,
        ];
    }
}
