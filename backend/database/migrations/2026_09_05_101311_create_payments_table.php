<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();

            $table->string('method'); // 'card' | 'promptpay'
            $table->string('gateway')->default('xendit');

            // Xendit's id for whatever it created (credit_card_charges id, qr_codes id, ...).
            // Nullable because a Payment row is created before we know it yet.
            $table->string('gateway_reference')->nullable();

            $table->string('status')->default('pending'); // pending | succeeded | failed | expired
            $table->decimal('amount', 10, 2);

            // Xendit's raw response, kept for audit/debugging when a number looks wrong.
            $table->json('raw_response')->nullable();

            $table->timestamp('expires_at')->nullable();

            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->unique('gateway_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
