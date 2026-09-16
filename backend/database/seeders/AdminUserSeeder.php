<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Guarantees a working local admin login exists for the Filament panel.
 * Deliberately refuses to run in production — this account's password is
 * a well-known default, fine for local dev, never for a real deployment.
 * Live admin accounts get created directly in Filament by an actual admin.
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('AdminUserSeeder skipped — refuses to run in production (its password is a well-known default).');

            return;
        }

        User::query()->updateOrCreate(
            ['email' => 'admin@one-organic.com'],
            ['name' => 'Admin', 'password' => 'password']
        );
    }
}
