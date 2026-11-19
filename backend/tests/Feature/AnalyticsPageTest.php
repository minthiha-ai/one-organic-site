<?php

namespace Tests\Feature;

use App\Filament\Pages\Analytics;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_no_embed_url_when_unset(): void
    {
        config(['services.analytics.looker_embed_url' => null]);

        $this->assertNull((new Analytics)->getEmbedUrl());
    }

    public function test_accepts_a_looker_studio_https_url(): void
    {
        $url = 'https://lookerstudio.google.com/embed/reporting/abc/page/1';
        config(['services.analytics.looker_embed_url' => $url]);

        $this->assertSame($url, (new Analytics)->getEmbedUrl());
    }

    public function test_rejects_any_other_host_or_scheme(): void
    {
        foreach ([
            'http://lookerstudio.google.com/embed/reporting/abc',
            'https://evil.example.com/embed',
            'https://lookerstudio.google.com.evil.example/embed',
            'javascript:alert(1)',
        ] as $bad) {
            config(['services.analytics.looker_embed_url' => $bad]);
            $this->assertNull((new Analytics)->getEmbedUrl(), $bad);
        }
    }

    public function test_ga_link_only_for_google_analytics_urls(): void
    {
        config(['services.analytics.ga_url' => 'https://analytics.google.com/analytics/web/#/p123']);
        $this->assertNotNull((new Analytics)->getGoogleAnalyticsUrl());

        config(['services.analytics.ga_url' => 'https://evil.example.com/']);
        $this->assertNull((new Analytics)->getGoogleAnalyticsUrl());
    }

    public function test_admin_page_shows_setup_steps_until_embed_url_is_set(): void
    {
        config(['services.analytics.looker_embed_url' => null]);
        $this->actingAs(User::factory()->create());

        $this->get('/admin/analytics')->assertOk()->assertSee('not connected yet');
    }

    public function test_admin_page_embeds_the_report_when_configured(): void
    {
        config(['services.analytics.looker_embed_url' => 'https://lookerstudio.google.com/embed/reporting/abc/page/1']);
        $this->actingAs(User::factory()->create());

        $this->get('/admin/analytics')->assertOk()
            ->assertSee('lookerstudio.google.com/embed/reporting/abc/page/1', false);
    }

    public function test_admin_page_requires_login(): void
    {
        $this->get('/admin/analytics')->assertRedirect();
    }
}
