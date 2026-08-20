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
 * Prices carried over from products.js are illustrative mockup values
 * (originally in a $ placeholder, stored here as-is under THB) — NOT
 * confirmed real retail pricing. Flag for Stephen to confirm before launch.
 */
class CatalogSeeder extends Seeder
{
    protected string $frontendImages;

    public function run(): void
    {
        $this->frontendImages = base_path('../frontend/src/assets/images');

        $coconutOil = Category::create([
            'name' => 'Coconut Oil',
            'slug' => 'coconut-oil',
            'sort_order' => 1,
        ]);

        $coconutSyrup = Category::create([
            'name' => 'Coconut Syrup',
            'slug' => 'coconut-syrup',
            'sort_order' => 2,
        ]);

        $bathAndBody = Category::create([
            'name' => 'Bath & Body',
            'slug' => 'bath-body',
            'sort_order' => 3,
        ]);

        $this->seedVirginCoconutOil($coconutOil);
        $this->seedCoconutSyrup($coconutSyrup);
        $this->seedCoconutOilSoap($bathAndBody);
    }

    protected function seedVirginCoconutOil(Category $category): void
    {
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Virgin Coconut Oil',
            'slug' => 'virgin-coconut-oil',
            'script_eyebrow' => "one of earth's greatest gifts to mankind",
            'tagline' => "Earth's greatest gift to mankind",
            'sort_order' => 1,
        ]);

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
            'price' => 14.99,
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
            'price' => 24.99,
            'sort_order' => 2,
            'tags' => ['Family Size', 'Cold Pressed', 'Vegan & GF'],
            'highlights' => $highlights,
            'usage_items' => $usage,
            'storage_instructions' => $storage,
        ], 'virgin-coconut-oil-900ml-glass-jar.png');

        $this->makeVariant($product, [
            'sku' => 'OO-VCO-125',
            'option_label' => '125ml',
            'price' => 6.99,
            'sort_order' => 3,
            'tags' => ['Travel Size', 'Cold Pressed', 'Vegan & GF'],
            'highlights' => $highlights,
            'usage_items' => $usage,
            'storage_instructions' => $storage,
        ], 'virgin-coconut-oil-125ml-glass-jar.png');
    }

    protected function seedCoconutSyrup(Category $category): void
    {
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Coconut Syrup',
            'slug' => 'coconut-syrup',
            'script_eyebrow' => 'one of the most nutritious sugars',
            'tagline' => 'One of the most nutritious sugars',
            'sort_order' => 2,
        ]);

        $this->makeVariant($product, [
            'sku' => 'OO-SYR-600',
            'option_label' => '600g',
            'price' => 12.99,
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
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Coconut Oil Soap',
            'slug' => 'coconut-oil-soap',
            'script_eyebrow' => 'love yourself, love earth',
            'tagline' => 'Handcrafted bar soap, four ways',
            'sort_order' => 3,
        ]);

        $base = ['No SLS', 'No SLES', 'No Sulphates', 'No Preservatives', 'No Fragrances', 'Handcrafted'];
        $usage = [
            ['icon' => 'ti-droplet', 'label' => 'Face & Body Wash'],
            ['icon' => 'ti-sparkles', 'label' => 'Gentle Exfoliation'],
        ];
        $storage = ['Store in cool, dry place.', 'Cut bar in half and keep dry between uses to prolong its life.'];

        $this->makeVariant($product, [
            'sku' => 'OO-SOAP-PLAIN',
            'option_label' => 'Just Coconut Oil',
            'price' => 6.99,
            'sort_order' => 1,
            'is_default' => true,
            'tags' => ['Antibacterial', 'Oily/Normal Skin', 'Heavy Duty Cleansing'],
            'highlights' => [...['Heavy Duty Daily Cleansing', 'Antibacterial'], ...$base],
            'usage_items' => $usage,
            'storage_instructions' => $storage,
        ], 'coconut-oil-soap.png');

        $this->makeVariant($product, [
            'sku' => 'OO-SOAP-CASTOR',
            'option_label' => 'With Castor Oil',
            'price' => 7.99,
            'sort_order' => 2,
            'tags' => ['Hydrating', 'Detoxifies', 'Normal/Dry Skin'],
            'highlights' => [...['Hydrates & Soothes Skin', 'Detoxifies'], ...$base],
            'usage_items' => $usage,
            'storage_instructions' => $storage,
        ], 'coconut-oil-soap-with-castor-oil.png');

        $this->makeVariant($product, [
            'sku' => 'OO-SOAP-SHEA',
            'option_label' => 'With Shea Butter',
            'price' => 7.99,
            'sort_order' => 3,
            'tags' => ['Hydrating', 'Anti-Inflammatory', 'Dry Skin'],
            'highlights' => [...['Hydrates & Soothes Skin', 'Anti-Inflammatory'], ...$base],
            'usage_items' => $usage,
            'storage_instructions' => $storage,
        ], 'coconut-oil-soap-with-shea-butter.jpg');

        $this->makeVariant($product, [
            'sku' => 'OO-SOAP-CHARCOAL',
            'option_label' => 'With Charcoal Powder',
            'price' => 7.99,
            'sort_order' => 4,
            'tags' => ['Detoxifying', 'Draws Out Impurities', 'Oily/Normal Skin'],
            'highlights' => [...['Deeply Detoxifying', 'Draws Out Impurities'], ...$base],
            'usage_items' => $usage,
            'storage_instructions' => $storage,
        ], 'coconut-oil-soap-with-charcoal.jpg');
    }

    protected function makeVariant(Product $product, array $attributes, string $imageFilename): ProductVariant
    {
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'stock_quantity' => 100,
            'is_active' => true,
            ...$attributes,
        ]);

        $imagePath = $this->frontendImages.'/'.$imageFilename;

        if (is_file($imagePath)) {
            $variant->addMedia($imagePath)
                ->preservingOriginal()
                ->toMediaCollection('image');
        }

        return $variant;
    }
}
