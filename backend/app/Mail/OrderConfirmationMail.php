<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Two trigger points, one Mailable, per Phase 1.2's "final UX call": a card/
 * PromptPay order isn't real until payment actually succeeds (queued from
 * PaymentStatusUpdater::markSucceeded()), but a Cash on Delivery order has
 * no such moment — it's already the order, so it queues straight from
 * CheckoutController::store(). Matches the same distinction the order
 * confirmation page already makes (OrderConfirmation.jsx's "Order placed"
 * vs "Complete your payment").
 */
class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Order confirmed — {$this->order->order_number}",
        );
    }

    public function content(): Content
    {
        $this->order->loadMissing('items');

        return new Content(
            markdown: 'mail.order-confirmation',
            with: [
                'order' => $this->order,
                'orderUrl' => rtrim((string) config('services.frontend_url'), '/')."/order/{$this->order->order_number}",
                'shippingAddressLines' => array_values(array_filter([
                    $this->order->shipping_recipient_name,
                    $this->order->shipping_line1,
                    $this->order->shipping_line2,
                    trim("{$this->order->shipping_city} {$this->order->shipping_postal_code}"),
                ])),
            ],
        );
    }
}
