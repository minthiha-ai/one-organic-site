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
            // Soap-only technical details, e.g. "Strong: 5/5" — null for non-soap variants.
            $table->string('lather')->nullable()->after('storage_instructions');
            $table->string('skin_type')->nullable()->after('lather');
            $table->string('moisturizing_strength')->nullable()->after('skin_type');
            $table->text('ingredients')->nullable()->after('moisturizing_strength');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn(['lather', 'skin_type', 'moisturizing_strength', 'ingredients']);
        });
    }
};
