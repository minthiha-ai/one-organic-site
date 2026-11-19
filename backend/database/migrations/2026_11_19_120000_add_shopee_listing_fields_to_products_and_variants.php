<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Columns for the Shopee listing data (26.11.19 export): the Thai titles and
 * descriptions, brand, country of origin, shelf life, Shopee IDs and the
 * listing's remaining Specification attributes.
 *
 * Purely additive and nullable, so nothing that exists today changes and the
 * migration can run on production ahead of the data import.
 *
 * Where a Shopee listing's text lives depends on how listings map to our
 * products (decided by the importer, see database/data/):
 *  - one listing = one product (virgin coconut oil's three sizes are variations
 *    of ONE listing; the syrup is one listing) -> products.name_th / description_th
 *  - one product = several listings (the four soaps are four separate
 *    listings) -> product_variants.name_th / description_th
 * Same for the listing-level IDs: every variant records the Shopee listing
 * (shopee_item_id) and variation (shopee_model_id) it was copied from.
 *
 * Existing columns reused as-is, not duplicated here: fda_registration_number
 * and cosmetic_declaration_number (Shopee's single "FDA Registration No."
 * field maps to one or the other by product type), ingredients, weight_grams
 * (Shopee is in kg, the importer converts), length_cm/width_cm/height_cm,
 * stock_quantity, barcode (Shopee's GTIN).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('name_th')->nullable()->after('name');
            $table->text('description_th')->nullable()->after('description');
            $table->string('brand')->nullable()->after('description_th');
            $table->string('country_of_origin')->nullable()->after('brand');
            $table->unsignedInteger('shopee_category_id')->nullable()->after('shopee_url');
            $table->string('shopee_category_path')->nullable()->after('shopee_category_id');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->string('name_th')->nullable()->after('option_label');
            $table->text('description_th')->nullable()->after('name_th');
            $table->unsignedSmallInteger('shelf_life_months')->nullable()->after('ingredients');
            $table->unsignedBigInteger('shopee_item_id')->nullable()->index()->after('shopee_url');
            $table->unsignedBigInteger('shopee_model_id')->nullable()->after('shopee_item_id');
            // The rest of the listing's Specification block, kept as Shopee
            // has it (oil type, sugar type, packaging type, storage
            // condition, ingredient preference ...). Not shown on the site.
            $table->json('shopee_attributes')->nullable()->after('shopee_model_id');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['name_th', 'description_th', 'brand', 'country_of_origin', 'shopee_category_id', 'shopee_category_path']);
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropIndex(['shopee_item_id']);
            $table->dropColumn(['name_th', 'description_th', 'shelf_life_months', 'shopee_item_id', 'shopee_model_id', 'shopee_attributes']);
        });
    }
};
