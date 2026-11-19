<x-filament-panels::page>
    @php($embedUrl = $this->getEmbedUrl())
    @php($gaUrl = $this->getGoogleAnalyticsUrl())

    @if ($embedUrl)
        <iframe
            src="{{ $embedUrl }}"
            title="Website analytics report"
            style="width: 100%; height: 80vh; border: 0; border-radius: 0.5rem;"
            allowfullscreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups"
        ></iframe>
        <p class="text-sm text-gray-500 dark:text-gray-400">
            Visitors only appear here after they accept the cookie banner on the site, so counts are lower than real traffic.
            @if ($gaUrl)
                <a href="{{ $gaUrl }}" target="_blank" rel="noopener noreferrer" class="underline">Open Google Analytics</a>
            @endif
        </p>
    @else
        <x-filament::section>
            <x-slot name="heading">Analytics report not connected yet</x-slot>

            <ol class="list-decimal space-y-2 pl-5 text-sm">
                <li>Create the Google Analytics 4 property and set <code>VITE_GA_MEASUREMENT_ID</code> on the website (Vercel).</li>
                <li>In Looker Studio, build a report from that GA4 property (visits, top pages, sources, <code>shopee_click</code>, <code>view_item</code>).</li>
                <li>Share the report with the Google accounts that should see it. Do not set it to "anyone with the link".</li>
                <li>In Looker Studio choose File → Embed report, enable embedding, and copy the embed URL into <code>ANALYTICS_EMBED_URL</code> in the backend <code>.env</code>.</li>
            </ol>
        </x-filament::section>
    @endif
</x-filament-panels::page>
