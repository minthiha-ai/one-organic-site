<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * shopee:import against the real captured file (database/data/shopee_catalog_26.11.19.json),
 * with a minimal catalog that has the same product slugs and SKUs as the seeder.
 */
class ImportShopeeCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected function seedCatalog(): void
    {
        $food = Category::create(['name' => 'Food', 'slug' => 'food']);
        $body = Category::create(['name' => 'Bath & Body', 'slug' => 'bath-body']);

        $oil = Product::create(['category_id' => $food->id, 'name' => 'Virgin Coconut Oil', 'slug' => 'virgin-coconut-oil']);
        foreach (['125' => 180, '450' => 390, '900' => 650] as $ml => $price) {
            $this->variant($oil, "OO-VCO-{$ml}", "{$ml}ml", $price, [
                'barcode' => "BARCODE-VCO-{$ml}", 'wholesale_price' => $price * 0.7,
                'fda_registration_number' => 'อย 70-2-01450-6-0114', 'weight_grams' => 111, 'length_cm' => 1, 'width_cm' => 1, 'height_cm' => 1,
            ]);
        }

        $syrup = Product::create(['category_id' => $food->id, 'name' => 'Coconut Syrup', 'slug' => 'coconut-syrup']);
        $this->variant($syrup, 'OO-SYR-600', '600g', 290, ['barcode' => 'BARCODE-SYR']);

        $soap = Product::create(['category_id' => $body->id, 'name' => 'Coconut Oil Soap', 'slug' => 'coconut-oil-soap']);
        foreach (['PLAIN', 'CASTOR', 'SHEA', 'CHARCOAL'] as $kind) {
            $this->variant($soap, "OO-SOAP-{$kind}", $kind, 180, [
                'barcode' => "BARCODE-{$kind}", 'ingredients' => "seeded ingredients {$kind}", 'lather' => 'Strong: 5/5',
                'cosmetic_declaration_number' => 'old', 'weight_grams' => 120, 'length_cm' => 10, 'width_cm' => 7, 'height_cm' => 4,
            ]);
        }
    }

    protected function variant(Product $product, string $sku, string $label, float $price, array $extra = []): ProductVariant
    {
        return ProductVariant::create(['product_id' => $product->id, 'sku' => $sku, 'option_label' => $label, 'price' => $price, 'stock_quantity' => 100, ...$extra]);
    }

    public function test_dry_run_prints_changes_and_writes_nothing(): void
    {
        $this->seedCatalog();

        $this->artisan('shopee:import')
            ->expectsOutputToContain('DRY RUN')
            ->assertSuccessful();

        $this->assertSame(100, ProductVariant::where('sku', 'OO-SYR-600')->value('stock_quantity'));
        $this->assertNull(Product::where('slug', 'virgin-coconut-oil')->value('description_th'));
    }

    public function test_commit_copies_shopee_data_and_verifies_itself(): void
    {
        $this->seedCatalog();

        $this->artisan('shopee:import --commit')->expectsOutputToContain('0 differences')->assertSuccessful();

        // Oil: one listing for the whole product -> Thai text on the product.
        $oil = Product::where('slug', 'virgin-coconut-oil')->first();
        $this->assertStringStartsWith('น้ำมันมะพร้าวสกัดเย็น', $oil->name_th);
        $this->assertStringContainsString('77-2-00549-6-0035', $oil->description_th);
        $this->assertSame('Oneorganic(วันออร์แกนิค)', $oil->brand);
        $this->assertSame('Thailand', $oil->country_of_origin);
        $this->assertSame(100803, $oil->shopee_category_id);

        // Two FDA numbers, one per size, as on Shopee.
        $oil125 = ProductVariant::where('sku', 'OO-VCO-125')->first();
        $this->assertSame('77-2-00549-6-0035', $oil125->fda_registration_number);
        $this->assertSame('70-2-01450-6-0114', ProductVariant::where('sku', 'OO-VCO-450')->value('fda_registration_number'));
        $this->assertSame('70-2-01450-6-0114', ProductVariant::where('sku', 'OO-VCO-900')->value('fda_registration_number'));

        // Stock, weight (kg -> g), parcel size (Length, Width, Height) and ids from the combined listing.
        $this->assertSame(89, $oil125->stock_quantity);
        $this->assertSame(500, $oil125->weight_grams);
        $this->assertSame([20, 14, 12], [$oil125->length_cm, $oil125->width_cm, $oil125->height_cm]);
        $this->assertSame(24240988538, $oil125->shopee_item_id);
        $this->assertSame(223765061278, $oil125->shopee_model_id);
        $this->assertSame(24, $oil125->shelf_life_months);
        $this->assertSame('100% virgin coconut oil', $oil125->ingredients);
        $this->assertSame('Coconut Oil', $oil125->shopee_attributes['oil_type']);
        $this->assertSame([87, 88], [ProductVariant::where('sku', 'OO-VCO-450')->value('stock_quantity'), ProductVariant::where('sku', 'OO-VCO-900')->value('stock_quantity')]);

        // Syrup keeps its "600g" label; everything else comes from Shopee.
        $syrup = ProductVariant::where('sku', 'OO-SYR-600')->first();
        $this->assertSame('600g', $syrup->option_label);
        $this->assertSame(4, $syrup->stock_quantity);
        $this->assertSame('70-2-01450-6-0116', $syrup->fda_registration_number);
        $this->assertSame([25, 17, 9], [$syrup->length_cm, $syrup->width_cm, $syrup->height_cm]);
        $this->assertSame('Coconut Flower', $syrup->shopee_attributes['sugar_type']);

        // Soaps: four listings -> Thai text per variant, cosmetic number (not FDA), no parcel size on Shopee.
        $this->assertNull(Product::where('slug', 'coconut-oil-soap')->value('description_th'));
        $plain = ProductVariant::where('sku', 'OO-SOAP-PLAIN')->first();
        $this->assertStringContainsString('COCONUT OIL SOAP BAR _ JUST COCONUT OIL', $plain->description_th);
        $this->assertSame('12-1-6800027486', $plain->cosmetic_declaration_number);
        $this->assertNull($plain->fda_registration_number);
        $this->assertSame(150, (int) $plain->price);
        $this->assertSame(500, $plain->stock_quantity);
        $this->assertSame(100, $plain->weight_grams);
        $this->assertSame([10, 7, 4], [$plain->length_cm, $plain->width_cm, $plain->height_cm], 'Shopee 0x0x0 means unset and must not overwrite');
        $this->assertSame(499, ProductVariant::where('sku', 'OO-SOAP-CASTOR')->value('stock_quantity'));
        $this->assertSame('Oneorganic(วันออร์แกนิค)', Product::where('slug', 'coconut-oil-soap')->value('brand'));
        $this->assertNull(Product::where('slug', 'coconut-oil-soap')->value('country_of_origin'), 'only one soap listing sets a country');
    }

    public function test_it_never_touches_fields_shopee_does_not_have(): void
    {
        $this->seedCatalog();

        $this->artisan('shopee:import --commit')->assertSuccessful();

        $oil = ProductVariant::where('sku', 'OO-VCO-450')->first();
        $this->assertSame('BARCODE-VCO-450', $oil->barcode);
        $this->assertSame('273.00', $oil->wholesale_price);
        $this->assertSame('450ml', $oil->option_label);

        $soap = ProductVariant::where('sku', 'OO-SOAP-SHEA')->first();
        $this->assertSame('seeded ingredients SHEA', $soap->ingredients, 'Shopee leaves soap ingredient empty');
        $this->assertSame('Strong: 5/5', $soap->lather);
        $this->assertSame('BARCODE-SHEA', $soap->barcode);
    }

    public function test_running_it_twice_changes_nothing_the_second_time(): void
    {
        $this->seedCatalog();

        $this->artisan('shopee:import --commit')->assertSuccessful();
        $this->artisan('shopee:import')->expectsOutputToContain('0 change(s)')->assertSuccessful();
    }

    public function test_a_missing_sku_aborts_without_writing_anything(): void
    {
        $this->seedCatalog();
        ProductVariant::where('sku', 'OO-SOAP-CHARCOAL')->delete();

        $this->artisan('shopee:import --commit')
            ->expectsOutputToContain('OO-SOAP-CHARCOAL does not exist')
            ->assertFailed();

        $this->assertSame(100, ProductVariant::where('sku', 'OO-SYR-600')->value('stock_quantity'));
        $this->assertNull(Product::where('slug', 'coconut-syrup')->value('name_th'));
    }
}
