# One Organic — Platform

Production website for One Organic (Thailand) Co., Ltd. Monorepo with two independently deployable halves.

```
one-organic-platform/
├── backend/     Laravel + Filament — REST API and admin dashboard
├── frontend/    React (Vite) — storefront, wired to the backend API
└── README.md
```

## Backend (`backend/`)

Laravel API + Filament admin panel (products, categories, orders, customers). Served locally via [Laravel Herd](https://herd.laravel.com/). See `backend/README.md` once scaffolded.

## Frontend (`frontend/`)

React + Vite storefront. Currently mid-migration from static mockup data (`src/data/products.js`) to real API calls — see [frontend/README.md](frontend/README.md).

Deployed on Vercel with **Root Directory** set to `frontend` (project settings, since this repo moved to a monorepo layout — see note below if reconnecting).

## Status

- ✅ Frontend: concept design approved (v1 homepage + shop), v2 premium redesign in comparison
- ✅ Backend: Laravel 12 + Filament v3 scaffolded, admin login working locally at http://one-organic-backend.test/admin
- ✅ Domain model: Category/Product/ProductVariant/Customer/Address/Order/OrderItem, migrated and seeded with the real 8-SKU catalog
- ✅ Filament admin: Products (+ variant images/pricing/stock/highlights), Orders (+ status workflow), Customers (+ addresses)
- 🚧 API for the frontend to consume — not yet built (Sanctum installed, not wired to routes)
- 🚧 Frontend still reads static `src/data/products.js`, not the backend
- 🚧 Payments: not yet chosen (leaning Omise/Opn for Thai market — deferred)
- 🚧 Hosting for backend: not yet chosen (building against local Herd for now)
- ⚠️ Product prices are carried over from the mockup's placeholder values — not confirmed real THB pricing yet

## Vercel note

This repo was restructured from a single-app layout (frontend files at repo root) into this monorepo (frontend files under `frontend/`). The existing Vercel project is linked to this repo — its **Root Directory** setting needs to be `frontend` for deploys to keep working. Set via Vercel dashboard → Project Settings → General → Root Directory.
