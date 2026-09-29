<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('shopee_url')->nullable()->after('description');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            // Variant-level takes priority over the product-level link when
            // set — some Shopee listings are one product with size as a
            // variation, others list each size as its own separate listing.
            $table->string('shopee_url')->nullable()->after('compare_at_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('shopee_url');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn('shopee_url');
        });
    }
};
