<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Comma-separated list in .env — defaults cover the Vite dev server.
    // Add the production frontend origin (Vercel domain / custom domain)
    // once it's known.
    'allowed_origins' => array_filter(explode(',', env(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:5183,http://localhost:5173,http://127.0.0.1:5183'
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    // Browsers may reuse a preflight answer this long (Chrome caps it at 2h).
    // At 0 every cross-origin call with a non-simple header (e.g. the
    // Authorization header on logged-in requests) paid for a second round
    // trip to this server first.
    'max_age' => 7200,

    'supports_credentials' => false,

];
