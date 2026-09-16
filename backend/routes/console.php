<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Safety net for a missed Xendit webhook — see the command's own docblock.
// Needs the Bluehost cron entry for `php artisan schedule:run` to actually
// fire in production (`* * * * * php artisan schedule:run >> /dev/null 2>&1`).
Schedule::command('payments:reconcile')->everyFiveMinutes();
