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
 * registration shared across a whole product line's sizes. Soap carries
 * a เลขที่จดแจ้ง (cosmetic_declaration_number) instead — a different,
 * per-SKU registration scheme. Deliberately kept in separate columns,
 * not conflated.
 */
class CatalogSeeder extends Seeder
{
    protected string $frontendImages;

    public function run(): void
    {
        $this->frontendImages = base_path('../frontend/src/assets/images');

        $coconutOil = Category::updateOrCreate(
            ['slug' => 'coconut-oil'],
            ['name' => 'Coconut Oil', 'sort_order' => 1]
        );

        $coconutSyrup = Category::updateOrCreate(
            ['slug' => 'coconut-syrup'],
            ['name' => 'Coconut Syrup', 'sort_order' => 2]
        );

        $bathAndBody = Category::updateOrCreate(
            ['slug' => 'bath-body'],
            ['name' => 'Bath & Body', 'sort_order' => 3]
        );

        $this->seedVirginCoconutOil($coconutOil);
        $this->seedCoconutSyrup($coconutSyrup);
        $this->seedCoconutOilSoap($bathAndBody);
    }

    protected function seedVirginCoconutOil(Category $category): void
    {
        $product = Product::updateOrCreate(
            ['slug' => 'virgin-coconut-oil'],
            [
                'category_id' => $category->id,
                'name' => 'Virgin Coconut Oil',
                'script_eyebrow' => "one of earth's greatest gifts to mankind",
                'tagline' => "Earth's greatest gift to mankind",
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

        $vcoFdaNumber = 'อย 70-2-01450-6-0114';

        $this->makeVariant($product, [
            'sku' => 'OO-VCO-450',
            'option_label' => '450ml',
            'price' => 390.00,
            'wholesale_price' => 273.00,
            'barcode' => '0730945251648',
            'fda_registration_number' => $vcoFdaNumber,
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
            'wholesale_price' => 455.00,
            'barcode' => '0730945251662',
            'fda_registration_number' => $vcoFdaNumber,
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
            'wholesale_price' => 126.00,
            'barcode' => '0730945251655',
            'fda_registration_number' => $vcoFdaNumber,
            'sort_order' => 3,
            'tags' => ['Travel Size', 'Cold Pressed', 'Vegan & GF'],
            'highlights' => $highlights,
            'usage_items' => $usage,
            'storage_instructions' => $storage,
        ], 'virgin-coconut-oil-125ml-glass-jar.png');
    }

    protected function seedCoconutSyrup(Category $category): void
    {
        $product = Product::updateOrCreate(
            ['slug' => 'coconut-syrup'],
            [
                'category_id' => $category->id,
                'name' => 'Coconut Syrup',
                'script_eyebrow' => 'one of the most nutritious sugars',
                'tagline' => 'One of the most nutritious sugars',
                'sort_order' => 2,
            ]
        );

        $this->makeVariant($product, [
            'sku' => 'OO-SYR-600',
            'option_label' => '600g',
            'price' => 290.00,
            'wholesale_price' => 203.00,
            'barcode' => '0730945251679',
            'fda_registration_number' => 'อย 70-2-01450-6-0116',
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
            'wholesale_price' => 105.00,
            'barcode' => '0730945252133',
            'cosmetic_declaration_number' => '12-1-6800027486',
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
            'wholesale_price' => 126.00,
            'barcode' => '0730945252140',
            'cosmetic_declaration_number' => '12-1-6800027484',
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
            'wholesale_price' => 126.00,
            'barcode' => '0730945252157',
            'cosmetic_declaration_number' => '12-1-6900015948',
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
            'wholesale_price' => 126.00,
            'barcode' => '0730945252164',
            'cosmetic_declaration_number' => '12-1-6900015961',
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
        $variant = ProductVariant::updateOrCreate(
            ['sku' => $attributes['sku']],
            [
                'product_id' => $product->id,
                'stock_quantity' => 100,
                'is_active' => true,
                ...$attributes,
            ]
        );

        $imagePath = $this->frontendImages.'/'.$imageFilename;

        if (is_file($imagePath) && ! $variant->getFirstMedia('image')) {
            $variant->addMedia($imagePath)
                ->preservingOriginal()
                ->toMediaCollection('image');
        }

        return $variant;
    }
}
