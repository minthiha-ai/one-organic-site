<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;

/**
 * Website analytics inside the admin: the Google Analytics 4 report, built in
 * Looker Studio and embedded here (GA4 itself can't be framed). Nothing is
 * stored in our database. Shows setup steps until ANALYTICS_EMBED_URL is set.
 */
class Analytics extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';

    protected static ?string $navigationLabel = 'Analytics';

    protected static ?int $navigationSort = 10;

    protected static ?string $title = 'Website Analytics';

    protected static string $view = 'filament.pages.analytics';

    /**
     * The Looker Studio embed URL, or null when unset or not a Looker Studio
     * https URL (we only ever frame Google's own report host).
     */
    public function getEmbedUrl(): ?string
    {
        $url = config('services.analytics.looker_embed_url');

        if (! is_string($url) || $url === '') {
            return null;
        }

        $parts = parse_url($url);

        if (($parts['scheme'] ?? null) !== 'https' || ($parts['host'] ?? null) !== 'lookerstudio.google.com') {
            return null;
        }

        return $url;
    }

    /** Link to the GA4 property itself, if configured. */
    public function getGoogleAnalyticsUrl(): ?string
    {
        $url = config('services.analytics.ga_url');

        if (! is_string($url) || ! str_starts_with($url, 'https://analytics.google.com/')) {
            return null;
        }

        return $url;
    }
}
