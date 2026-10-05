<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * The live soap photos are 6240px, ~1.9 MB each, and used to be served
 * as-is to every shop visitor. These tests pin the fix: uploads get a
 * small `thumb` and `detail` copy, the API serves those, and a variant
 * whose copies haven't been generated yet (every image uploaded before
 * this shipped) keeps serving its original instead of a broken URL.
 */
class ProductImageConversionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    private function makeVariant(): ProductVariant
    {
        $category = Category::create(['name' => 'Test', 'slug' => 'test-'.uniqid()]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'Test Product', 'slug' => 'test-product-'.uniqid()]);

        return ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'TEST-'.uniqid(),
            'option_label' => 'Big',
            'price' => 100,
            'stock_quantity' => 10,
            'is_default' => true,
        ]);
    }

    /** A large, transparent-background PNG — the same shape as a jar photo. */
    private function bigPng(int $width = 1400, int $height = 1000): string
    {
        $img = imagecreatetruecolor($width, $height);
        imagesavealpha($img, true);
        imagealphablending($img, false);
        imagefill($img, 0, 0, imagecolorallocatealpha($img, 0, 0, 0, 127));
        imagealphablending($img, true);
        imagefilledellipse($img, intdiv($width, 2), intdiv($height, 2), intdiv($width, 2), intdiv($height, 2), imagecolorallocate($img, 200, 120, 20));

        $path = sys_get_temp_dir().'/big-'.uniqid().'.png';
        imagepng($img, $path);
        unset($img); // GD holds ~4 bytes/pixel; don't let it pile up across tests

        return $path;
    }

    public function test_an_upload_gets_shrunken_thumb_and_detail_copies_and_the_api_serves_them(): void
    {
        $variant = $this->makeVariant();
        $variant->addMedia($this->bigPng())->toMediaCollection('image');
        $media = $variant->fresh()->getFirstMedia('image');

        $this->assertTrue($media->hasGeneratedConversion('thumb'));
        $this->assertTrue($media->hasGeneratedConversion('detail'));

        [$thumbWidth] = getimagesize($media->getPath('thumb'));
        [$detailWidth] = getimagesize($media->getPath('detail'));
        $this->assertLessThanOrEqual(640, $thumbWidth);
        $this->assertLessThanOrEqual(1000, $detailWidth);
        $this->assertLessThan(filesize($media->getPath()), filesize($media->getPath('detail')));

        $variant = $variant->fresh();
        $this->assertSame($media->getUrl('thumb'), $variant->thumb_url);
        $this->assertSame($media->getUrl('detail'), $variant->image_url);
        $this->assertNotSame($media->getUrl(), $variant->image_url, 'The full-size original must not be what the storefront receives.');

        $product = Product::find($variant->product_id);
        $this->getJson("/api/products/{$product->slug}")
            ->assertOk()
            ->assertJsonPath('data.variants.0.thumb_url', $media->getUrl('thumb'))
            ->assertJsonPath('data.variants.0.image_url', $media->getUrl('detail'));
    }

    public function test_a_small_source_is_never_upscaled(): void
    {
        $variant = $this->makeVariant();
        $variant->addMedia($this->bigPng(300, 200))->toMediaCollection('image');
        $media = $variant->fresh()->getFirstMedia('image');

        [$thumbWidth] = getimagesize($media->getPath('thumb'));
        [$detailWidth] = getimagesize($media->getPath('detail'));
        $this->assertSame(300, $thumbWidth);
        $this->assertSame(300, $detailWidth);
    }

    public function test_media_without_generated_copies_falls_back_to_the_original(): void
    {
        $variant = $this->makeVariant();
        $variant->addMedia($this->bigPng())->toMediaCollection('image');
        $media = $variant->fresh()->getFirstMedia('image');

        // What every image uploaded before conversions existed looks like.
        $media->generated_conversions = [];
        $media->save();

        $variant = $variant->fresh();
        $this->assertSame($media->getUrl(), $variant->image_url);
        $this->assertSame($media->getUrl(), $variant->thumb_url);
    }

    public function test_a_variant_with_no_image_has_null_urls(): void
    {
        $variant = $this->makeVariant();

        $this->assertNull($variant->image_url);
        $this->assertNull($variant->thumb_url);
    }
}
