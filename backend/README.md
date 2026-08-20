# One Organic — Backend

Laravel + [Filament](https://filamentphp.com/) admin panel. REST API for the React frontend (`../frontend`) plus the internal admin dashboard for managing products, orders, and customers.

## Stack

- Laravel 12, PHP 8.3
- Filament v3 (admin panel at `/admin`)
- SQLite for local dev (zero-config; production will likely move to MySQL — no code changes needed to switch, just `.env`)
- Sanctum for API auth — bearer tokens, not cookie-based SPA auth (simpler across the frontend/backend split, since they won't share a domain)

## Local development

Served via [Laravel Herd](https://herd.laravel.com/) at **http://one-organic-backend.test** (no `php artisan serve` needed — Herd handles it).

```bash
composer install
php artisan migrate --seed
```

Admin login: **http://one-organic-backend.test/admin/login**

A dev admin user was seeded via:
```bash
php artisan make:filament-user
```
Default local credentials: `admin@one-organic.test` / `password` — **local dev only, do not reuse in production.**

`--seed` runs `CatalogSeeder`, which populates the real 8-SKU catalog (ported from `frontend/src/data/products.js`, including images) so the admin panel and API aren't empty.

## API

Base URL: `http://one-organic-backend.test/api`. JSON in, JSON out. Customer auth is Sanctum bearer tokens (`Authorization: Bearer <token>`), not cookies.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/categories` | — | |
| GET | `/products` | — | `?category=<slug>`, `?search=<term>` |
| GET | `/products/{slug}` | — | |
| POST | `/auth/register` | — | returns `{ customer, token }` |
| POST | `/auth/login` | — | returns `{ customer, token }` |
| POST | `/auth/logout` | customer | revokes the current token |
| GET | `/auth/me` | customer | |
| POST | `/checkout` | optional | guest checkout works with no token; pass a token to attach the order to a customer and optionally use `address_id` instead of a `shipping` object |
| POST | `/orders/lookup` | — | `{ order_number, email }` — guest order lookup, both must match |
| GET | `/orders` | customer | own order history |
| GET | `/orders/{order_number}` | customer | 403s if the order isn't yours |
| GET/POST | `/addresses` | customer | address book |
| PUT/DELETE | `/addresses/{id}` | customer | 403s if the address isn't yours |

**Checkout correctness notes:**
- Prices are always looked up server-side from the current `ProductVariant` price — the client only sends `{ product_variant_id, quantity }` pairs, never prices.
- Variant stock rows are locked (`lockForUpdate`) for the duration of the checkout transaction, so two simultaneous checkouts can't both oversell the last unit.
- Order and order-item records **snapshot** customer/shipping/product/price data at time of purchase rather than just linking to the live rows — a later price change or profile edit never rewrites order history.
- Shipping cost and discounts are hardcoded to 0 for now — no real shipping-rate or coupon logic exists yet.
- Orders are created with `status: pending` — no payment gateway is wired up yet, so nothing is actually charged.

CORS origins are configured via `CORS_ALLOWED_ORIGINS` in `.env` (see `.env.example`) — add the production frontend domain there once it exists.

## Status

Domain model, Filament admin, and the full API are built and verified (catalog browsing, register/login, guest + authenticated checkout, order history, guest order lookup, address book, and the auth/ownership boundaries around all of it).

Not yet built:
- Payment gateway integration (leaning Omise/Opn for the Thai market — deferred pending Stephen's input)
- Real shipping-rate logic
- Production hosting for this backend (building against local Herd for now)

⚠️ Seeded product prices are carried over from the frontend mockup's placeholder values — not confirmed real THB pricing.
