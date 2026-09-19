<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'xendit' => [
        'secret_key' => env('XENDIT_SECRET_KEY'),
        'webhook_verification_token' => env('XENDIT_WEBHOOK_VERIFICATION_TOKEN'),
        // Flips the whole integration to live mode via env only — no code change.
        'is_production' => env('XENDIT_IS_PRODUCTION', false),
        // Card Sessions require an allowlisted HTTPS origin for the Components
        // embed. Defaults to FRONTEND_URL; override for local dev with an
        // https tunnel (ngrok etc.) since Components rejects http origins.
        'components_origin' => env('XENDIT_COMPONENTS_ORIGIN', env('FRONTEND_URL')),
    ],

    // Courier rate lookup / booking (Phase 1.1). Sandbox base URL is
    // https://mkpservice.shippop.dev, production https://mkpservice.shippop.com
    // — same api_key auth scheme for both, just a different host + key.
    'shippop' => [
        'base_url' => env('SHIPPOP_BASE_URL'),
        'api_key' => env('SHIPPOP_API_KEY'),
        'market_id' => env('SHIPPOP_MARKET_ID'),
        // SHIPPOP has no self-service webhook signing secret — registering
        // a webhook URL at all requires contacting their dev team directly
        // (confirmed from their docs, 26.09.19). This token is our own
        // interim safeguard: it's the unguessable path segment in the
        // webhook URL itself, checked in ShippopWebhookController. Ask
        // SHIPPOP for a real signing secret when registering the URL, and
        // upgrade this if/when they provide one.
        'webhook_token' => env('SHIPPOP_WEBHOOK_TOKEN'),
    ],

];
