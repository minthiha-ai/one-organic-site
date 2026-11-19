<?php

namespace Tests\Feature;

use App\Filament\Resources\ProductResource\Pages\EditProduct;
use App\Filament\Resources\ProductResource\RelationManagers\VariantsRelationManager;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

/** The Shopee fields in the admin panel, and what the public API does and doesn't expose. */
class ShopeeAdminAndApiTest extends TestCase
{
    use RefreshDatabase;

    protected function product(): array
    {
        $category = Category::create(['name' => 'Food', 'slug' => 'food']);
        $product = Product::create([
            'category_id' => $category->id, 'name' => 'Virgin Coconut Oil', 'slug' => 'virgin-coconut-oil',
            'name_th' => 'น้ำมันมะพร้าวสกัดเย็น', 'description_th' => "ไทย\nบรรทัดสอง", 'brand' => 'Oneorganic(วันออร์แกนิค)',
            'country_of_origin' => 'Thailand', 'shopee_category_id' => 100803, 'shopee_category_path' => 'Food & Beverages/Cooking Essentials/Oil',
        ]);
        $variant = ProductVariant::create([
            'product_id' => $product->id, 'sku' => 'OO-VCO-125', 'option_label' => '125ml', 'price' => 180, 'is_default' => true,
            'fda_registration_number' => '77-2-00549-6-0035', 'shelf_life_months' => 24, 'shopee_item_id' => 24240988538,
            'shopee_model_id' => 223765061278, 'description_th' => 'รายละเอียด', 'barcode' => 'SECRET-BARCODE', 'wholesale_price' => 126,
            'weight_grams' => 500, 'shopee_attributes' => ['oil_type' => 'Coconut Oil', 'ingredient_preference' => ['Organic', 'Sulfate-free']],
        ]);

        return [$product, $variant];
    }

    public function test_product_form_shows_and_saves_the_shopee_fields(): void
    {
        [$product] = $this->product();
        $this->actingAs(User::factory()->create());

        Livewire::test(EditProduct::class, ['record' => $product->getRouteKey()])
            ->assertFormSet([
                'name_th' => 'น้ำมันมะพร้าวสกัดเย็น', 'description_th' => "ไทย\nบรรทัดสอง", 'brand' => 'Oneorganic(วันออร์แกนิค)',
                'country_of_origin' => 'Thailand', 'shopee_category_id' => 100803,
            ])
            ->fillForm(['brand' => 'One Organic', 'description_th' => 'แก้ไข'])
            ->call('save')
            ->assertHasNoFormErrors();

        $product->refresh();
        $this->assertSame('One Organic', $product->brand);
        $this->assertSame('แก้ไข', $product->description_th);
    }

    public function test_variant_form_shows_the_shopee_attributes_as_json_and_saves_them(): void
    {
        [$product, $variant] = $this->product();
        $this->actingAs(User::factory()->create());

        $component = Livewire::test(VariantsRelationManager::class, ['ownerRecord' => $product, 'pageClass' => EditProduct::class])
            ->mountTableAction('edit', $variant)
            ->assertTableActionDataSet(['shelf_life_months' => 24, 'shopee_item_id' => 24240988538, 'fda_registration_number' => '77-2-00549-6-0035']);

        $shown = json_decode($component->instance()->mountedTableActionsData[0]['shopee_attributes'], true);
        $this->assertSame(['oil_type' => 'Coconut Oil', 'ingredient_preference' => ['Organic', 'Sulfate-free']], $shown);

        $component
            ->setTableActionData(['shopee_attributes' => '{"oil_type":"Coconut Oil","sugar_type":null}', 'shelf_life_months' => 36])
            ->callMountedTableAction()
            ->assertHasNoTableActionErrors();

        $variant->refresh();
        $this->assertSame(['oil_type' => 'Coconut Oil', 'sugar_type' => null], $variant->shopee_attributes);
        $this->assertSame(36, $variant->shelf_life_months);
    }

    public function test_variant_form_rejects_invalid_json(): void
    {
        [$product, $variant] = $this->product();
        $this->actingAs(User::factory()->create());

        Livewire::test(VariantsRelationManager::class, ['ownerRecord' => $product, 'pageClass' => EditProduct::class])
            ->mountTableAction('edit', $variant)
            ->setTableActionData(['shopee_attributes' => '{not json'])
            ->callMountedTableAction()
            ->assertHasTableActionErrors(['shopee_attributes']);

        $this->assertSame('Coconut Oil', $variant->fresh()->shopee_attributes['oil_type']);
    }

    public function test_the_api_exposes_the_safe_fields_and_keeps_the_rest_internal(): void
    {
        $this->product();

        $response = $this->getJson('/api/products')->assertOk();
        $json = $response->getContent();

        $product = $response->json('data.0');
        $this->assertSame('Oneorganic(วันออร์แกนิค)', $product['brand']);
        $this->assertSame('Thailand', $product['country_of_origin']);
        $this->assertSame('น้ำมันมะพร้าวสกัดเย็น', $product['name_th']);
        $variant = $product['variants'][0];
        $this->assertSame('77-2-00549-6-0035', $variant['fda_registration_number']);
        $this->assertSame(24, $variant['shelf_life_months']);
        $this->assertArrayHasKey('cosmetic_declaration_number', $variant);

        // Held back: the Thai description (not reviewed), Shopee ids/attributes, wholesale, barcode, parcel data.
        foreach (['description_th', 'shopee_item_id', 'shopee_model_id', 'shopee_attributes', 'shopee_category', 'wholesale_price', 'barcode', 'SECRET-BARCODE', 'weight_grams'] as $internal) {
            $this->assertStringNotContainsString($internal, $json);
        }
    }
}
