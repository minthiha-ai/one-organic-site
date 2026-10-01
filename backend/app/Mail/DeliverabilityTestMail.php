<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * One-off Mailable for Phase 0.5.4's actual gate: does a real send from
 * the production SMTP mailbox (hello@one-organic.com, as of 26.10.02 —
 * originally min@one-organic.com) via authenticated SMTP land in the
 * inbox, or spam, at Gmail/Outlook? Dispatched only via
 * `php artisan mail:test`. Not used by any real feature — order
 * confirmation (Phase 1.2) gets its own Mailable once this infrastructure
 * is confirmed working.
 */
class DeliverabilityTestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $sentAt)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'One Organic — mail deliverability test',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.deliverability-test',
            with: ['sentAt' => $this->sentAt],
        );
    }
}
