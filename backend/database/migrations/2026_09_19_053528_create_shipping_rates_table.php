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
        Schema::create('shipping_rates', function (Blueprint $table) {
            $table->id();
            // Interim flat rate (Phase 0.5.5) — kept as a table, not a
            // config value, so it's editable from Filament without a
            // redeploy, and stays in place as a fallback once Phase 1.1's
            // real SHIPPOP/KEX rate lookup is built. Only one row is
            // active at a time for now; is_active leaves room to add
            // zone/weight-specific rows later without a schema rewrite.
            $table->string('name');
            $table->decimal('rate', 10, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_rates');
    }
};
