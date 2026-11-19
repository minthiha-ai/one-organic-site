<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

/**
 * Seeds the real product catalog, ported from the frontend mockup's
 * frontend/src/data/products.js so the admin panel starts populated with
 * the actual One Organic lineup rather than placeholder data.
 *
 * Pricing, wholesale price, barcode, and registration numbers are the
 * official figures from the 26.08.31 price list (resolved 26.09.17) —
 * see Phase 0.1 of the implementation plan. Wholesale uses the list's
 * flat 30% GP rate (wholesale = 70% of SRP), which superseded the older
 * 25% trade-discount rate used in earlier documents.
 *
 * VCO and syrup carry an อย (fda_registration_number) — a food-product
 * registration (the oil's differs by size, see below). Soap carries
 * a เลขที่จดแจ้ง (cosmetic_declaration_number) instead — a different,
 * per-SKU registration scheme. Deliberately kept in separate columns,
 * not conflated.
 *
 * weight_grams/length_cm/width_cm/height_cm: updated 26.11.19 to the values
 * entered on Shopee (the combined oil listing for the oil sizes). Shopee has
 * no parcel size for soap (it stores 0x0x0 for unset), so the soap's
 * 10x7x4 cm stays an estimate; its weight is Shopee's 100 g.
 *
 * Registration numbers are as typed on Shopee, without the "อย" prefix. The
 * oil has ONE number for all three sizes, 77-2-00549-6-0035 (Stephen, 26.11.19:
 * first two numbers by size, then this single one). The price list's older
 * 70-2-01450-6-0114 is no longer used for the oil.
 *
 * Shopee listing text, stock, Shopee ids and attributes are NOT seeded: they
 * come from `php artisan shopee:import` (database/data/shopee_catalog_*.json).
 */
class CatalogSeeder extends Seeder
{
    protected string $frontendImages;

    public function run(): void
    {
        $this->frontendImages = base_path('../frontend/src/assets/images');

        // 26.09.29: merged the old "Coconut Oil" and "Coconut Syrup"
        // categories into one "Food" category. Renaming the coconut-oil row
        // in place (same PK) keeps the Virgin Coconut Oil product's existing
        // category_id valid for free; the coconut-syrup row's product(s) get
        // reassigned to $food before that row is deleted (category_id is
        // restrictOnDelete, so delete-before-reassign would fail) — an
        // orphaned empty category would otherwise still show up as an empty
        // tab via GET /api/categories. The if/else makes this safe on a
        // fresh database that never had a coconut-oil row to rename.
        $food = Category::where('slug', 'coconut-oil')->first();
        if ($food) {
            $food->update(['name' => 'Food', 'slug' => 'food', 'sort_order' => 1]);
        } else {
            $food = Category::updateOrCreate(
                ['slug' => 'food'],
                ['name' => 'Food', 'sort_order' => 1]
            );
        }

        $staleSyrupCategory = Category::where('slug', 'coconut-syrup')->first();
        if ($staleSyrupCategory && $staleSyrupCategory->id !== $food->id) {
            Product::where('category_id', $staleSyrupCategory->id)->update(['category_id' => $food->id]);
            $staleSyrupCategory->delete();
        }

        $bathAndBody = Category::updateOrCreate(
            ['slug' => 'bath-body'],
            ['name' => 'Bath & Body', 'sort_order' => 3]
        );

        $this->seedVirginCoconutOil($food);
        $this->seedCoconutSyrup($food);
        $this->seedCoconutOilSoap($bathAndBody);
    }

    protected function seedVirginCoconutOil(Category $category): void
    {
        // All three sizes are variations on one single Shopee listing, so
        // the same URL goes on the product and on every variant.
        $shopeeUrl = 'https://shopee.co.th/organic-virgin-coconut-oil-by-one-organic-125-450-900-i.710448046.24240988538';

        $product = Product::updateOrCreate(
            ['slug' => 'virgin-coconut-oil'],
            [
                'category_id' => $category->id,
                'name' => 'Virgin Coconut Oil',
                'script_eyebrow' => "one of earth's greatest gifts to mankind",
                'tagline' => "Earth's greatest gift to mankind",
                'shopee_url' => $shopeeUrl,
                'sort_order' => 1,
            ]
        );

        $highlights = [
            'Low Moisture & High Purity',
            'Fast Absorption Into Skin',
            'High MC',
            'High Lauric Acid',
            'Cold Pressed',
            'Centrifuge Extraction',
            'Gluten Free',
            'Vegan',
        ];

        $usage = [
            ['icon' => 'ti-flame', 'label' => 'Healthy Cooking Oil'],
            ['icon' => 'ti-droplet', 'label' => 'Skin & Hair Moisturizer'],
            ['icon' => 'ti-leaf', 'label' => 'Keto Diet Essential'],
            ['icon' => 'ti-massage', 'label' => 'Massage Oil'],
            ['icon' => 'ti-sparkles', 'label' => 'Make Up Remover'],
            ['icon' => 'ti-dental', 'label' => 'Oil Pulling For Oral Health'],
        ];

        $storage = ['Store in a cool, dry place.', 'Store away from sunlight.'];

        $this->makeVariant($product, [
            'sku' => 'OO-VCO-450',
            'option_label' => '450ml',
            'price' => 390.00,
            'shopee_url' => $shopeeUrl,
            'wholesale_price' => 273.00,
            'barcode' => '0730945251648',
            'fda_registration_number' => '77-2-00549-6-0035',
            'weight_grams' => 800, // Shopee, 26.11.19
            'length_cm' => 25,
            'width_cm' => 17,
            'height_cm' => 19,
            'sort_order' => 1,
            'is_default' => true,
            'tags' => ['Most Popular', 'Cold Pressed', 'Vegan & GF'],
            'highlights' => $highlights,
            'usage_items' => $usage,
            'storage_instructions' => $storage,
        ], 'virgin-coconut-oil-450ml-glass-jar.png');

        $this->makeVariant($product, [
            'sku' => 'OO-VCO-900',
            'option_label' => '900ml',
            'price' => 650.00,
            'shopee_url' => $shopeeUrl,
            'wholesale_price' => 455.00,
            'barcode' => '0730945251662',
            'fda_registration_number' => '77-2-00549-6-0035',
            'weight_grams' => 1500, // Shopee, 26.11.19
            'length_cm' => 25,
            'width_cm' => 17,
            'height_cm' => 19,
            'sort_order' => 2,
            'tags' => ['Family Size', 'Cold Pressed', 'Vegan & GF'],
            'highlights' => $highlights,
            'usage_items' => $usage,
            'storage_instructions' => $storage,
        ], 'virgin-coconut-oil-900ml-glass-jar.png');

        $this->makeVariant($product, [
            'sku' => 'OO-VCO-125',
            'option_label' => '125ml',
            'price' => 180.00,
            'shopee_url' => $shopeeUrl,
            'wholesale_price' => 126.00,
            'barcode' => '0730945251655',
            'fda_registration_number' => '77-2-00549-6-0035',
            'weight_grams' => 500, // Shopee, 26.11.19
            'length_cm' => 20,
            'width_cm' => 14,
            'height_cm' => 12,
            'sort_order' => 3,
            'tags' => ['Travel Size', 'Cold Pressed', 'Vegan & GF'],
            'highlights' => $highlights,
            'usage_items' => $usage,
            'storage_instructions' => $storage,
        ], 'virgin-coconut-oil-125ml-glass-jar.png');
    }

    protected function seedCoconutSyrup(Category $category): void
    {
        // One variant, so the same single-listing URL goes on the product
        // and the variant.
        $shopeeUrl = 'https://shopee.co.th/coconut-syrup-by-one-organic-600-i.710448046.26776444274';

        $product = Product::updateOrCreate(
            ['slug' => 'coconut-syrup'],
            [
                'category_id' => $category->id,
                'name' => 'Coconut Syrup',
                'script_eyebrow' => 'one of the most nutritious sugars',
                'tagline' => 'One of the most nutritious sugars',
                'shopee_url' => $shopeeUrl,
                'sort_order' => 2,
            ]
        );

        $this->makeVariant($product, [
            'sku' => 'OO-SYR-600',
            'option_label' => '600g',
            'price' => 290.00,
            'shopee_url' => $shopeeUrl,
            'wholesale_price' => 203.00,
            'barcode' => '0730945251679',
            'fda_registration_number' => '70-2-01450-6-0116',
            'weight_grams' => 800, // Shopee, 26.11.19
            'length_cm' => 25,
            'width_cm' => 17,
            'height_cm' => 9,
            'sort_order' => 1,
            'is_default' => true,
            'tags' => ['Low GI: 35', 'High in Minerals', 'Vegan & GF'],
            'highlights' => ['Low Glycemic Index: 35', 'Gluten Free', 'Vegan', 'High in Minerals', 'Mild Sweet Taste'],
            'usage_items' => [
                ['icon' => 'ti-cup', 'label' => 'Sweetener for Beverages'],
                ['icon' => 'ti-bread', 'label' => 'Baking'],
                ['icon' => 'ti-leaf', 'label' => 'Honey Alternative'],
            ],
            'storage_instructions' => ['Refrigerate after opening.'],
        ], 'coconut-syrup-jar.png');
    }

    protected function seedCoconutOilSoap(Category $category): void
    {
        $product = Product::updateOrCreate(
            ['slug' => 'coconut-oil-soap'],
            [
                'category_id' => $category->id,
                'name' => 'Coconut Oil Soap',
                'script_eyebrow' => 'love yourself, love earth',
                'tagline' => 'Handcrafted bar soap, four ways',
                'sort_order' => 3,
            ]
        );

        $base = ['No SLS', 'No SLES', 'No Sulphates', 'No Preservatives', 'No Fragrances', 'Handcrafted'];
        $usage = [
            ['icon' => 'ti-droplet', 'label' => 'Face & Body Wash'],
            ['icon' => 'ti-sparkles', 'label' => 'Gentle Exfoliation'],
        ];
        $storage = ['Store in cool, dry place.', 'Cut bar in half and keep dry between uses to prolong its life.'];

        $this->makeVariant($product, [
            'sku' => 'OO-SOAP-PLAIN',
            'option_label' => 'Just Coconut Oil',
            'price' => 150.00,
            'shopee_url' => 'https://shopee.co.th/coconut-oil-soap-bar-just-coconut-oil-100-i.710448046.54251412870',
            'wholesale_price' => 105.00,
            'barcode' => '0730945252133',
            'cosmetic_declaration_number' => '12-1-6800027486',
            'weight_grams' => 100, // Shopee, 26.11.19
            'length_cm' => 10,
            'width_cm' => 7,
            'height_cm' => 4,
            'sort_order' => 1,
            'is_default' => true,
            'tags' => ['Antibacterial', 'Oily/Normal Skin', 'Heavy Duty Cleansing'],
            'highlights' => [...['Heavy Duty Daily Cleansing', 'Antibacterial'], ...$base],
            'usage_items' => $usage,
            'storage_instructions' => $storage,
            'lather' => 'Strong: 5/5',
            'skin_type' => 'Oily / Normal',
            'moisturizing_strength' => 'Light: 2/5',
            'ingredients' => 'Organic Virgin Coconut Oil, Water, Sodium Hydroxide',
        ], 'coconut-oil-soap.png');

        $this->makeVariant($product, [
            'sku' => 'OO-SOAP-CASTOR',
            'option_label' => 'With Castor Oil',
            'price' => 180.00,
            'shopee_url' => 'https://shopee.co.th/coconut-oil-soap-bar-with-castor-oil-i.710448046.51551417932',
            'wholesale_price' => 126.00,
            'barcode' => '0730945252140',
            'cosmetic_declaration_number' => '12-1-6800027484',
            'weight_grams' => 100, // Shopee, 26.11.19
            'length_cm' => 10,
            'width_cm' => 7,
            'height_cm' => 4,
            'sort_order' => 2,
            'tags' => ['Hydrating', 'Detoxifies', 'Normal/Dry Skin'],
            'highlights' => [...['Hydrates & Soothes Skin', 'Detoxifies'], ...$base],
            'usage_items' => $usage,
            'storage_instructions' => $storage,
            'lather' => 'High: 4/5',
            'skin_type' => 'Normal / Dry',
            'moisturizing_strength' => 'High: 4/5',
            'ingredients' => 'Organic Virgin Coconut Oil, Castor Oil, Water, Sodium Hydroxide',
        ], 'coconut-oil-soap-with-castor-oil.png');

        $this->makeVariant($product, [
            'sku' => 'OO-SOAP-SHEA',
            'option_label' => 'With Shea Butter',
            'price' => 180.00,
            'shopee_url' => 'https://shopee.co.th/coconut-oil-soap-bar-with-shea-butter-100-i.710448046.48668481257',
            'wholesale_price' => 126.00,
            'barcode' => '0730945252157',
            'cosmetic_declaration_number' => '12-1-6900015948',
            'weight_grams' => 100, // Shopee, 26.11.19
            'length_cm' => 10,
            'width_cm' => 7,
            'height_cm' => 4,
            'sort_order' => 3,
            'tags' => ['Hydrating', 'Anti-Inflammatory', 'Dry Skin'],
            'highlights' => [...['Hydrates & Soothes Skin', 'Anti-Inflammatory'], ...$base],
            'usage_items' => $usage,
            'storage_instructions' => $storage,
            'lather' => 'High: 4/5',
            'skin_type' => 'Dry to Normal',
            'moisturizing_strength' => 'High: 4/5',
            'ingredients' => 'Organic Virgin Coconut Oil, Shea Butter Fruit, Water, Sodium Hydroxide',
        ], 'coconut-oil-soap-with-shea-butter.jpg');

        $this->makeVariant($product, [
            'sku' => 'OO-SOAP-CHARCOAL',
            'option_label' => 'With Charcoal Powder',
            'price' => 180.00,
            'shopee_url' => 'https://shopee.co.th/coconut-oil-soap-bar-with-charcoal-powder-100-i.710448046.53668447065',
            'wholesale_price' => 126.00,
            'barcode' => '0730945252164',
            'cosmetic_declaration_number' => '12-1-6900015961',
            'weight_grams' => 100, // Shopee, 26.11.19
            'length_cm' => 10,
            'width_cm' => 7,
            'height_cm' => 4,
            'sort_order' => 4,
            'tags' => ['Detoxifying', 'Draws Out Impurities', 'Oily/Normal Skin'],
            'highlights' => [...['Deeply Detoxifying', 'Draws Out Impurities'], ...$base],
            'usage_items' => $usage,
            'storage_instructions' => $storage,
            'lather' => 'Moderate: 3/5',
            'skin_type' => 'Oily / Normal',
            'moisturizing_strength' => 'Moderate: 3/5',
            'ingredients' => 'Organic Virgin Coconut Oil, Bamboo Powder Charcoal Powder, Water, Sodium Hydroxide',
        ], 'coconut-oil-soap-with-charcoal.jpg');
    }

    protected function makeVariant(Product $product, array $attributes, string $imageFilename): ProductVariant
    {
        // stock_quantity is deliberately only set on first create, never on
        // an update — once real orders/inventory adjustments exist, a
        // reseed (e.g. to fix a price or add a highlight) must not stomp
        // the real stock count back to this seeder's placeholder value.
        $variant = ProductVariant::where('sku', $attributes['sku'])->first();

        if ($variant) {
            $variant->fill(['product_id' => $product->id, 'is_active' => true, ...$attributes]);
            $variant->save();
        } else {
            $variant = ProductVariant::create([
                'product_id' => $product->id,
                'stock_quantity' => 100,
                'is_active' => true,
                ...$attributes,
            ]);
        }

        $imagePath = $this->frontendImages.'/'.$imageFilename;

        if (is_file($imagePath) && ! $variant->getFirstMedia('image')) {
            $variant->addMedia($imagePath)
                ->preservingOriginal()
                ->toMediaCollection('image');
        }

        return $variant;
    }
}
