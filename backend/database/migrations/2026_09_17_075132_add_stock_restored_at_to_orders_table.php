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
        Schema::table('orders', function (Blueprint $table) {
            // Guards PaymentStatusUpdater::restoreStock() against restoring
            // stock twice — an order can have multiple payment attempts
            // (retry after a failed/expired one), so the payment-level
            // isTerminal() check alone isn't enough to prevent double
            // restoration across sibling attempts on the same order.
            $table->timestamp('stock_restored_at')->nullable()->after('cancelled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('stock_restored_at');
        });
    }
};
