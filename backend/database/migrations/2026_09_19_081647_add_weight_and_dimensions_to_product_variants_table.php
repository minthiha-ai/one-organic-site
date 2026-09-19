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
        Schema::table('product_variants', function (Blueprint $table) {
            // Needed for SHIPPOP rate lookups (Phase 1.1) — packed weight
            // including jar/bottle/wrapper, not just net product content.
            // Seeded with estimates pending real measurement from Stephen
            // via the admin panel — see CatalogSeeder's comments.
            $table->unsignedInteger('weight_grams')->nullable()->after('cosmetic_declaration_number');
            $table->unsignedInteger('length_cm')->nullable()->after('weight_grams');
            $table->unsignedInteger('width_cm')->nullable()->after('length_cm');
            $table->unsignedInteger('height_cm')->nullable()->after('width_cm');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn(['weight_grams', 'length_cm', 'width_cm', 'height_cm']);
        });
    }
};
