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

- ✅ Backend: Laravel 12 + Filament v3, full domain model, Filament admin, and a 15-endpoint REST API — all curl-verified (see `backend/README.md`)
- ✅ Frontend purchase flow is live end-to-end against the real API: Shop → Product detail (real variant switcher) → Cart (persisted, real quantities/totals) → Checkout (real guest orders, verified in-browser and cross-checked against the backend after each step)
- 🚧 Homepage marketing sections (`/`, `/v2`) still read static mockup data — deliberate follow-up, not yet started (see `frontend/README.md`)
- 🚧 No login/register UI yet — backend supports customer accounts, checkout is guest-only for now
- 🚧 Payments: not yet chosen (leaning Omise/Opn for Thai market — deferred); orders are created as `pending`, nothing is actually charged
- 🚧 Hosting for backend: not yet chosen (building against local Herd for now)
- ⚠️ Product prices are carried over from the mockup's placeholder values — not confirmed real THB pricing yet

## Vercel note

This repo was restructured from a single-app layout (frontend files at repo root) into this monorepo (frontend files under `frontend/`). The existing Vercel project is linked to this repo — its **Root Directory** setting needs to be `frontend` for deploys to keep working. Set via Vercel dashboard → Project Settings → General → Root Directory.
