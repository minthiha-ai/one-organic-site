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
            $table->decimal('wholesale_price', 10, 2)->nullable()->after('compare_at_price');
            $table->string('barcode')->nullable()->unique()->after('wholesale_price');
            // อย number — food products (VCO, syrup). Shared across an entire
            // product line's sizes, not unique per SKU, so no unique constraint.
            $table->string('fda_registration_number')->nullable()->after('barcode');
            // เลขที่จดแจ้ง — cosmetic products (soap). A different registration
            // scheme from the อย number above; kept in its own column
            // deliberately, not conflated with fda_registration_number.
            $table->string('cosmetic_declaration_number')->nullable()->after('fda_registration_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn(['wholesale_price', 'barcode', 'fda_registration_number', 'cosmetic_declaration_number']);
        });
    }
};
