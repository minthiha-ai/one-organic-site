# One Organic — Backend

Laravel + [Filament](https://filamentphp.com/) admin panel. REST API for the React frontend (`../frontend`) plus the internal admin dashboard for managing products, orders, and customers.

## Stack

- Laravel 12, PHP 8.3
- Filament v3 (admin panel at `/admin`)
- SQLite for local dev (zero-config; production will likely move to MySQL — no code changes needed to switch, just `.env`)
- Sanctum for API auth (SPA token auth, once wired up)

## Local development

Served via [Laravel Herd](https://herd.laravel.com/) at **http://one-organic-backend.test** (no `php artisan serve` needed — Herd handles it).

```bash
composer install
php artisan migrate
```

Admin login: **http://one-organic-backend.test/admin/login**

A dev admin user was seeded via:
```bash
php artisan make:filament-user
```
Default local credentials: `admin@one-organic.test` / `password` — **local dev only, do not reuse in production.**

## Status

Just scaffolded — no domain models yet. Next: Products, Categories, Product Variants, Orders, Customers, and their Filament resources.
