<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Copies the Shopee listing data captured in database/data/shopee_catalog_*.json
 * onto our products and variants.
 *
 *   php artisan shopee:import             dry run: prints every change, writes nothing
 *   php artisan shopee:import --commit    writes the changes, then re-checks them
 *
 * Rules (decided 26.11.19):
 *  - Only listings marked "primary" in the file are imported. The single-size
 *    oil listings are duplicates of the combined one, the cling wrap isn't on
 *    the site yet.
 *  - A value Shopee doesn't have is never written, so nothing existing is
 *    blanked: barcode, wholesale_price, compare_at_price, option_label (the
 *    syrup stays "600g"), SKU, tags/highlights/usage/storage, the soap
 *    ingredients and soap detail fields are never touched.
 *  - Shopee stores 0x0x0 for "no parcel size"; that is skipped, not written.
 *  - One listing for the whole product (oil, syrup) -> the Thai title/description go on the
 *    product. Several listings for one product (the four soaps) -> they go on each variant.
 *  - Shopee's single "FDA Registration No." goes to fda_registration_number for
 *    food and to cosmetic_declaration_number for Beauty listings, as typed on
 *    Shopee (no "อย" prefix).
 *  - Idempotent: running it again changes nothing.
 */
class ImportShopeeCatalog extends Command
{
    protected $signature = 'shopee:import
        {file=database/data/shopee_catalog_26.11.19.json : Path to the catalog JSON, relative to the backend folder}
        {--commit : Write the changes (without it this is a dry run)}';

    protected $description = 'Import the captured Shopee listing data onto products and variants (dry run unless --commit).';

    public function handle(): int
    {
        $path = base_path($this->argument('file'));
        if (! is_file($path)) {
            $this->error("File not found: {$path}");

            return self::FAILURE;
        }

        try {
            $plan = $this->buildPlan(json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR));
        } catch (RuntimeException|\JsonException $e) {
            $this->error($e->getMessage());
            $this->line('Nothing was written.');

            return self::FAILURE;
        }

        $this->printPlan($plan);
        $changed = collect($plan)->sum(fn ($t) => count($t['changes']));

        if (! $this->option('commit')) {
            $this->newLine();
            $this->warn("DRY RUN: {$changed} change(s) across ".count(array_filter($plan, fn ($t) => $t['changes'])).' record(s), nothing written. Re-run with --commit to apply.');

            return self::SUCCESS;
        }

        $this->warn('Writing. Take a database backup before running this on production.');
        DB::transaction(function () use ($plan) {
            foreach ($plan as $target) {
                if ($target['changes']) {
                    $target['model']->forceFill(array_map(fn ($c) => $c['new'], $target['changes']))->save();
                }
            }
        });

        // Re-plan from the database: anything still different means a write didn't stick.
        $remaining = collect($this->buildPlan(json_decode(file_get_contents($path), true)))->sum(fn ($t) => count($t['changes']));
        if ($remaining > 0) {
            $this->error("Written, but {$remaining} value(s) still differ from the file. Investigate before relying on this import.");

            return self::FAILURE;
        }
        $this->info("Imported {$changed} change(s). Verified: the database now matches the file, 0 differences.");

        return self::SUCCESS;
    }

    /**
     * @return array<int, array{label: string, model: \Illuminate\Database\Eloquent\Model, changes: array<string, array{old: mixed, new: mixed}>}>
     */
    protected function buildPlan(array $data): array
    {
        $primary = collect($data['listings'])->where('role', 'primary');
        $plan = [];

        foreach ($primary->groupBy('product_slug') as $slug => $listings) {
            $product = Product::where('slug', $slug)->first()
                ?? throw new RuntimeException("Product \"{$slug}\" does not exist in the database.");

            $wholeProduct = $listings->count() === 1;
            $desired = [];

            if ($wholeProduct) {
                $desired['name_th'] = $listings[0]['title'];
                $desired['description_th'] = $listings[0]['description'];
            }
            foreach (['brand' => 'brand', 'country_of_origin' => 'country_of_origin'] as $column => $attr) {
                $values = $listings->map(fn ($l) => $l['attributes'][$attr] ?? null);
                if ($values->every(fn ($v) => $v !== null && $v !== '') && $values->unique()->count() === 1) {
                    $desired[$column] = $values->first();
                }
            }
            if ($listings->pluck('category_id')->unique()->count() === 1) {
                $desired['shopee_category_id'] = (int) $listings[0]['category_id'];
                $desired['shopee_category_path'] = $listings[0]['category_path'];
            }
            $plan[] = $this->target("product {$slug}", $product, $desired);

            foreach ($listings as $listing) {
                foreach ($listing['variations'] as $variation) {
                    $sku = $variation['maps_to_sku'] ?? null;
                    if ($sku === null) {
                        throw new RuntimeException("Listing {$listing['shopee_item_id']} variation \"{$variation['name']}\" has no maps_to_sku.");
                    }
                    $variant = ProductVariant::where('sku', $sku)->where('product_id', $product->id)->first()
                        ?? throw new RuntimeException("Variant {$sku} does not exist under product \"{$slug}\".");
                    $plan[] = $this->target("variant {$sku}", $variant, $this->variantValues($listing, $variation, $wholeProduct));
                }
            }
        }

        return $plan;
    }

    protected function variantValues(array $listing, array $variation, bool $wholeProduct): array
    {
        $attrs = $listing['attributes'];
        $desired = [
            'price' => $variation['price'],
            'stock_quantity' => $variation['stock'],
            'shopee_item_id' => (int) $listing['shopee_item_id'],
            'shopee_model_id' => (int) $variation['model_id'],
            'shopee_attributes' => $attrs,
        ];

        if (! $wholeProduct) {
            $desired['name_th'] = $listing['title'];
            $desired['description_th'] = $listing['description'];
        }
        if (($variation['weight_kg'] ?? 0) > 0) {
            $desired['weight_grams'] = (int) round($variation['weight_kg'] * 1000);
        }
        if (($variation['length_cm'] ?? 0) > 0 && ($variation['width_cm'] ?? 0) > 0 && ($variation['height_cm'] ?? 0) > 0) {
            $desired['length_cm'] = (int) $variation['length_cm'];
            $desired['width_cm'] = (int) $variation['width_cm'];
            $desired['height_cm'] = (int) $variation['height_cm'];
        }
        if (! empty($attrs['ingredient'])) {
            $desired['ingredients'] = $attrs['ingredient'];
        }
        if (preg_match('/^\s*(\d+)\s*months?\s*$/i', $attrs['shelf_life'] ?? '', $m)) {
            $desired['shelf_life_months'] = (int) $m[1];
        }

        $registration = $variation['fda_registration_no'] ?? $attrs['fda_registration_no'] ?? null;
        if ($registration !== null && $registration !== '') {
            $column = str_starts_with($listing['category_path'], 'Beauty') ? 'cosmetic_declaration_number' : 'fda_registration_number';
            $desired[$column] = $registration;
        }

        return $desired;
    }

    /** Diffs the desired values against the model, keeping only real changes. */
    protected function target(string $label, $model, array $desired): array
    {
        $changes = [];
        foreach ($desired as $column => $new) {
            $old = $model->getAttribute($column);
            if (! $this->same($old, $new)) {
                $changes[$column] = ['old' => $old, 'new' => $new];
            }
        }

        return ['label' => $label, 'model' => $model, 'changes' => $changes];
    }

    protected function same($old, $new): bool
    {
        if (is_array($new) || is_array($old)) {
            return $old === $new || json_encode($old) === json_encode($new);
        }
        if (is_numeric($old) && is_numeric($new)) {
            return (float) $old === (float) $new;
        }

        return $old === $new;
    }

    protected function printPlan(array $plan): void
    {
        foreach ($plan as $target) {
            if (! $target['changes']) {
                $this->line("<fg=gray>{$target['label']}: already up to date</>");

                continue;
            }
            $this->line("<options=bold>{$target['label']}</>");
            foreach ($target['changes'] as $column => $c) {
                $this->line(sprintf('  %-22s %s  ->  %s', $column, $this->show($c['old']), $this->show($c['new'])));
            }
        }
    }

    protected function show($value): string
    {
        if ($value === null) {
            return '(empty)';
        }
        if (is_array($value)) {
            $value = json_encode($value, JSON_UNESCAPED_UNICODE);
        }
        $value = str_replace("\n", '⏎', (string) $value);

        return mb_strlen($value) > 60 ? mb_substr($value, 0, 57).'... ['.mb_strlen($value).' chars]' : $value;
    }
}
