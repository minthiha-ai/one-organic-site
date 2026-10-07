<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The storefront's CDN can only keep a copy of the catalog if the API says it
 * may (Laravel's default is "no-cache, private"), and must never keep error
 * responses or anything outside the public catalog.
 */
class PublicCatalogCacheTest extends TestCase
{
    use RefreshDatabase;

    private function cacheControl($response): string
    {
        return (string) $response->headers->get('Cache-Control');
    }

    public function test_catalog_list_endpoints_are_publicly_cacheable_by_a_cdn(): void
    {
        foreach (['/api/products', '/api/categories'] as $path) {
            $cacheControl = $this->cacheControl($this->getJson($path)->assertOk());

            $this->assertStringContainsString('public', $cacheControl, $path);
            $this->assertStringContainsString('s-maxage=300', $cacheControl, $path);
            $this->assertStringContainsString('stale-while-revalidate', $cacheControl, $path);
        }
    }

    public function test_a_single_product_response_is_publicly_cacheable(): void
    {
        $category = Category::create(['name' => 'Test', 'slug' => 'test']);
        $product = Product::create(['category_id' => $category->id, 'name' => 'Test Product', 'slug' => 'test-product']);

        $this->assertStringContainsString(
            's-maxage=300',
            $this->cacheControl($this->getJson("/api/products/{$product->slug}")->assertOk())
        );
    }

    public function test_a_missing_product_404_is_not_cached(): void
    {
        $cacheControl = $this->cacheControl($this->getJson('/api/products/no-such-product')->assertNotFound());

        $this->assertStringNotContainsString('s-maxage', $cacheControl);
        $this->assertStringNotContainsString('public', $cacheControl);
    }

    public function test_non_catalog_endpoints_stay_uncached(): void
    {
        // /shipping-rate is public but not part of the catalog group — it
        // must keep Laravel's default no-cache header.
        $cacheControl = $this->cacheControl($this->getJson('/api/shipping-rate'));

        $this->assertStringNotContainsString('s-maxage', $cacheControl);
    }
}
