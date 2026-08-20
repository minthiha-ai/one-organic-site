<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('sku')->unique();
            // e.g. "450ml", "900ml", "With Castor Oil"
            $table->string('option_label');
            $table->decimal('price', 10, 2);
            $table->decimal('compare_at_price', 10, 2)->nullable();
            $table->unsignedInteger('stock_quantity')->default(0);
            $table->boolean('is_default')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            // Small badge tags, e.g. ["Most Popular", "Cold Pressed", "Vegan & GF"]
            $table->json('tags')->nullable();
            // ["Low Moisture & High Purity", "Fast Absorption Into Skin", ...]
            $table->json('highlights')->nullable();
            // [{"icon": "ti-flame", "label": "Healthy Cooking Oil"}, ...]
            $table->json('usage_items')->nullable();
            // ["Store in a cool, dry place.", ...]
            $table->json('storage_instructions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
