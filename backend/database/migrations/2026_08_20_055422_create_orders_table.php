<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();

            // Null customer_id = guest checkout. guest_name/guest_email always
            // filled (from the customer if logged in, or the checkout form if not)
            // so admin order lists never need to join to know who to contact.
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_name');
            $table->string('guest_email');
            $table->string('guest_phone')->nullable();

            $table->string('status')->default('pending');

            $table->string('currency', 3)->default('THB');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('shipping_cost', 10, 2)->default(0);
            $table->decimal('discount_total', 10, 2)->default(0);
            $table->decimal('total', 10, 2);

            // Shipping address snapshot — deliberately not a foreign key to
            // addresses. An order must keep showing the address it actually
            // shipped to even if the customer later edits or deletes that
            // saved address.
            $table->string('shipping_recipient_name');
            $table->string('shipping_phone');
            $table->string('shipping_line1');
            $table->string('shipping_line2')->nullable();
            $table->string('shipping_city');
            $table->string('shipping_state')->nullable();
            $table->string('shipping_postal_code');
            $table->string('shipping_country', 2)->default('TH');

            // Populated once a payment gateway is wired up (Omise/Opn charge ID, etc).
            $table->string('payment_method')->nullable();
            $table->string('payment_reference')->nullable();

            $table->text('notes')->nullable();

            $table->timestamp('paid_at')->nullable();
            $table->timestamp('packed_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
