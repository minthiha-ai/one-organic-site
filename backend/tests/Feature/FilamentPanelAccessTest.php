<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Regression test for a real production incident (26.09.22): without
 * implementing Filament's FilamentUser contract, Filament's own
 * Authenticate middleware falls back to its built-in safety default —
 * abort(403) unless app.env is exactly 'local'. Unauthenticated /admin
 * and /admin/login worked everywhere (that logic doesn't touch this
 * check), so this only ever showed up as a 403 *after* a successful
 * login, in every non-local environment, which took hours to isolate
 * from infrastructure-level causes before the actual one-line gap was
 * found. Explicitly testing under a non-local app.env, since that's
 * the exact condition the bug only manifested under.
 */
class FilamentPanelAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_access_the_panel_in_a_non_local_environment(): void
    {
        config(['app.env' => 'production']);

        $user = User::factory()->create();

        $this->assertInstanceOf(\Filament\Models\Contracts\FilamentUser::class, $user);
        $this->assertTrue($user->canAccessPanel(\Filament\Facades\Filament::getDefaultPanel()));
    }

    public function test_an_authenticated_user_can_load_the_dashboard_in_a_non_local_environment(): void
    {
        config(['app.env' => 'production']);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/admin')
            ->assertOk();
    }
}
