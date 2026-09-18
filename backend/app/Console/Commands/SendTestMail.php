<?php

namespace App\Console\Commands;

use App\Mail\DeliverabilityTestMail;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

/**
 * Phase 0.5.4's actual verification step — not a formality. Queues (not
 * sends) a real email to whatever address is given, so this also proves
 * the queue worker cron is actually running, not just that SMTP works.
 * Run once with a Gmail address and once with an Outlook/Hotmail address;
 * whether both land in the inbox (not spam) is the gate that decides
 * whether Bluehost SMTP is good enough or a paid provider is needed.
 */
#[Signature('mail:test {email}')]
#[Description('Queue a deliverability test email to the given address')]
class SendTestMail extends Command
{
    public function handle(): int
    {
        $email = $this->argument('email');

        Mail::to($email)->queue(new DeliverabilityTestMail(sentAt: now()->toDateTimeString()));

        $this->info("Queued a test email to {$email}. Confirm the queue worker cron picks it up (check the inbox in a minute or two) and check the inbox AND spam folder.");

        return self::SUCCESS;
    }
}
