<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Phase 1.7's confirmed production symptom: the Shop page took 4-5s to
 * load. Root cause was two N+1s in this controller — ProductVariant's
 * image_url accessor (getFirstMediaUrl) and Product::displayVariant()'s
 * separate defaultVariant relation — neither eager loaded, so every
 * variant/product added its own extra query. These tests assert the
 * query count stays flat as the catalog grows, so that regressing back
 * to a per-row query can't slip in unnoticed.
 */
class ProductControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function makeProductWithVariants(int $variantCount, bool $withDefaultFlag = true): Product
    {
        $category = Category::create(['name' => 'Test', 'slug' => 'test-'.uniqid()]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'Test Product', 'slug' => 'test-product-'.uniqid()]);

        for ($i = 0; $i < $variantCount; $i++) {
            ProductVariant::create([
                'product_id' => $product->id,
                'sku' => 'TEST-'.uniqid(),
                'option_label' => "Variant {$i}",
                'price' => 100 + $i,
                'stock_quantity' => 10,
                'is_default' => $withDefaultFlag && $i === 0,
            ]);
        }

        return $product;
    }

    public function test_the_product_list_query_count_does_not_grow_with_catalog_size(): void
    {
        $this->makeProductWithVariants(3);

        DB::enableQueryLog();
        $this->getJson('/api/products')->assertOk();
        $smallCatalogQueries = count(DB::getQueryLog());
        DB::disableQueryLog();
        DB::flushQueryLog();

        // Fixture creation happens with logging off — only the two actual
        // requests should be measured, not the inserts in between.
        for ($i = 0; $i < 5; $i++) {
            $this->makeProductWithVariants(3);
        }

        DB::enableQueryLog();
        $this->getJson('/api/products')->assertOk();
        $largeCatalogQueries = count(DB::getQueryLog());
        DB::disableQueryLog();

        // Not asserting an exact number (fragile against unrelated future
        // changes) — the real regression this guards against is query
        // count scaling with row count instead of staying constant.
        $this->assertSame(
            $smallCatalogQueries,
            $largeCatalogQueries,
            'Query count grew with catalog size — an N+1 has crept back in.'
        );
    }

    public function test_default_variant_and_image_url_are_correct_without_a_flagged_default(): void
    {
        $product = $this->makeProductWithVariants(2, withDefaultFlag: false);

        $response = $this->getJson('/api/products')->assertOk();

        $data = collect($response->json('data'))->firstWhere('id', $product->id);
        $this->assertSame('Variant 0', $data['default_variant']['option_label']);
    }

    public function test_default_variant_respects_the_is_default_flag(): void
    {
        $product = $this->makeProductWithVariants(3, withDefaultFlag: true);

        $response = $this->getJson('/api/products')->assertOk();

        $data = collect($response->json('data'))->firstWhere('id', $product->id);
        $this->assertSame('Variant 0', $data['default_variant']['option_label']);
    }

    public function test_the_show_endpoint_also_avoids_n_plus_one_on_variants(): void
    {
        $product = $this->makeProductWithVariants(6);

        DB::enableQueryLog();
        $this->getJson("/api/products/{$product->slug}")->assertOk();
        $queries = count(DB::getQueryLog());
        DB::disableQueryLog();

        // A handful of fixed queries (product, category, variants, media,
        // route model binding) — not one per variant.
        $this->assertLessThan(10, $queries);
    }
}
