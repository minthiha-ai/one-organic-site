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
            $table->unsignedBigInteger('shippop_purchase_id')->nullable();
            $table->string('shippop_tracking_code')->nullable();
            $table->string('courier_tracking_code')->nullable();
            // Raw order_status string from SHIPPOP (wait/booking/shipping/
            // complete/problem/return/...) — kept separate from our own
            // `status` enum since SHIPPOP's vocabulary is wider and this is
            // for admin visibility, not something the app branches on.
            $table->string('shipment_status')->nullable();
            $table->string('label_url')->nullable();
            $table->timestamp('shipment_confirmed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'shippop_purchase_id',
                'shippop_tracking_code',
                'courier_tracking_code',
                'shipment_status',
                'label_url',
                'shipment_confirmed_at',
            ]);
        });
    }
};
