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

_Last confirmed against the actual codebase/deployment: Sep 4, 2026 — see `../Projects/01-One Organic/Status.md` for the full client-facing breakdown._

- ✅ Backend: Laravel 12 + Filament v3, full domain model, Filament admin, and a 17-endpoint REST API — deployed and live in production at `api.one-organic.com` (Bluehost, SSL active)
- ✅ Frontend purchase flow is live end-to-end against the real production API: Shop → Product detail (real variant switcher, incl. soap technical details) → Cart (persisted, real quantities/totals) → Checkout (real guest orders, verified in-browser and cross-checked against the backend after each step)
- ✅ Customer accounts: login/register, order history, order detail, saved addresses — all real, wired to the backend. Checkout now offers a saved address for logged-in customers; guest checkout unchanged.
- ✅ Admin sales dashboard: revenue/order stats, orders-over-time chart, top products — live on `/admin`, verified against seeded test data
- ✅ Contact form sends real email — recipient is `min@one-organic.com` for now (temporary, was `hello@`)
- ✅ Frontend deployed to Vercel, pointed at the production backend (not local Herd)
- 🚧 Homepage marketing sections (`/`, `/v2`) still read static mockup data — two competing directions, no final pick made yet
- 🚧 Payments: not yet chosen (leaning Omise/Opn for Thai market — deferred); orders are created as `pending`, nothing is actually charged
- ⚠️ Product prices are carried over from the mockup's placeholder values — not confirmed real THB pricing yet
- ⚠️ `one-organic.com` root domain still points at the live Wix site — DNS cutover paused pending Stephen's confirmation it's safe to retire
- ⚠️ The production MySQL password was pasted in full into a chat session during the original Bluehost setup — still needs rotating

## Vercel note

This repo was restructured from a single-app layout (frontend files at repo root) into this monorepo (frontend files under `frontend/`). The existing Vercel project is linked to this repo — its **Root Directory** setting needs to be `frontend` for deploys to keep working. Set via Vercel dashboard → Project Settings → General → Root Directory.
