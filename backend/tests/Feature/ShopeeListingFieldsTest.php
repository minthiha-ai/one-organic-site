<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * The columns added for the Shopee listing import (26.11.19) store Thai text,
 * large Shopee IDs and a JSON attribute block without loss, and — because they
 * are not in the API resources yet — don't leak into the public catalog.
 */
class ShopeeListingFieldsTest extends TestCase
{
    use RefreshDatabase;

    public function test_listing_columns_exist(): void
    {
        $this->assertTrue(Schema::hasColumns('products', [
            'name_th', 'description_th', 'brand', 'country_of_origin', 'shopee_category_id', 'shopee_category_path',
        ]));
        $this->assertTrue(Schema::hasColumns('product_variants', [
            'name_th', 'description_th', 'shelf_life_months', 'shopee_item_id', 'shopee_model_id', 'shopee_attributes',
        ]));
    }

    public function test_thai_text_ids_and_attributes_round_trip_exactly(): void
    {
        $category = Category::create(['name' => 'Food', 'slug' => 'food']);
        $thai = "น้ำมันมะพร้าวสกัดเย็นออร์แกนิค Organic Virgin Coconut Oil 🥥\n\n✔ ไม่มีสารกันเสีย";

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Virgin Coconut Oil',
            'name_th' => 'น้ำมันมะพร้าวสกัดเย็น',
            'slug' => 'virgin-coconut-oil',
            'description_th' => $thai,
            'brand' => 'Oneorganic(วันออร์แกนิค)',
            'country_of_origin' => 'Thailand',
            'shopee_category_id' => 100803,
            'shopee_category_path' => 'Food & Beverages/Cooking Essentials/Oil',
        ])->fresh();

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'OO-VCO-125',
            'option_label' => '125ml',
            'price' => 180,
            'shelf_life_months' => 24,
            'shopee_item_id' => 24240988538,   // larger than a 32-bit int
            'shopee_model_id' => 223765061278,
            'shopee_attributes' => ['oil_type' => 'Coconut Oil', 'ingredient_preference' => ['Organic', 'Sulfate-free']],
        ])->fresh();

        $this->assertSame($thai, $product->description_th);
        $this->assertSame('Oneorganic(วันออร์แกนิค)', $product->brand);
        $this->assertSame(100803, $product->shopee_category_id);
        $this->assertSame(24, $variant->shelf_life_months);
        $this->assertSame(24240988538, $variant->shopee_item_id);
        $this->assertSame(223765061278, $variant->shopee_model_id);
        $this->assertSame(['oil_type' => 'Coconut Oil', 'ingredient_preference' => ['Organic', 'Sulfate-free']], $variant->shopee_attributes);
    }

    public function test_new_columns_are_not_exposed_by_the_public_catalog_yet(): void
    {
        $category = Category::create(['name' => 'Food', 'slug' => 'food']);
        $product = Product::create([
            'category_id' => $category->id, 'name' => 'P', 'slug' => 'p',
            'description_th' => 'ไทย', 'brand' => 'B', 'shopee_category_id' => 1,
        ]);
        ProductVariant::create([
            'product_id' => $product->id, 'sku' => 'P-1', 'option_label' => '1', 'price' => 1,
            'is_default' => true, 'shopee_item_id' => 5, 'shopee_attributes' => ['k' => 'v'],
        ]);

        $json = $this->getJson('/api/products')->assertOk()->getContent();

        foreach (['description_th', 'shopee_item_id', 'shopee_attributes', 'shopee_category_id', 'shopee_model_id'] as $leaked) {
            $this->assertStringNotContainsString($leaked, $json);
        }
    }
}
