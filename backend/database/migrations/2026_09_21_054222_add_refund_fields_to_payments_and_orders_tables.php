<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->decimal('refunded_amount', 10, 2)->nullable();
            $table->timestamp('refunded_at')->nullable();
            // Xendit's refund id ("rfd-...") — kept separate from
            // gateway_reference (the original payment_session/qr id) so both
            // stay available for reference.
            $table->string('refund_reference')->nullable();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('refunded_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['refunded_amount', 'refunded_at', 'refund_reference']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('refunded_at');
        });
    }
};
