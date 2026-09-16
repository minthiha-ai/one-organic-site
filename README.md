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

_Last confirmed against the actual codebase/deployment: 26.09.04 — see `../Projects/01-One Organic/Status.md` for the full client-facing breakdown._

- ✅ Backend: Laravel 12 + Filament v3, full domain model, Filament admin, and a 17-endpoint REST API — deployed and live in production at `api.one-organic.com` (Bluehost, SSL active)
- ✅ Frontend purchase flow is live end-to-end against the real production API: Shop → Product detail (real variant switcher, incl. soap technical details) → Cart (persisted, real quantities/totals) → Checkout (real guest orders, verified in-browser and cross-checked against the backend after each step)
- ✅ Customer accounts: login/register, order history, order detail, saved addresses — all real, wired to the backend. Checkout now offers a saved address for logged-in customers; guest checkout unchanged.
- ✅ Admin sales dashboard: revenue/order stats, orders-over-time chart, top products — live on `/admin`, verified against seeded test data
- ✅ Contact form sends real email — recipient is `min@one-organic.com` for now (temporary, was `hello@`)
- ✅ Frontend deployed to Vercel, pointed at the production backend (not local Herd)
- ✅ Backend deploys are automated: pushing to `master` with changes under `backend/` triggers `.github/workflows/deploy-backend.yml`, which SSHes into Bluehost and runs the pull/composer/migrate/cache-clear sequence — no manual SSH needed for routine backend updates
- ✅ Production MySQL password rotated (was briefly exposed during initial setup)
- 🚧 Homepage marketing sections (`/`, `/v2`) still read static mockup data — two competing directions, no final pick made yet
- 🚧 Payments: not yet chosen (leaning Omise/Opn for Thai market — deferred); orders are created as `pending`, nothing is actually charged
- ⚠️ Product prices are carried over from the mockup's placeholder values — not confirmed real THB pricing yet
- ⚠️ `one-organic.com` root domain still points at the live Wix site — DNS cutover paused pending Stephen's confirmation it's safe to retire

## Vercel note

This repo was restructured from a single-app layout (frontend files at repo root) into this monorepo (frontend files under `frontend/`). The existing Vercel project is linked to this repo — its **Root Directory** setting needs to be `frontend` for deploys to keep working. Set via Vercel dashboard → Project Settings → General → Root Directory.

## Backend CI/CD

`.github/workflows/deploy-backend.yml` auto-deploys the backend to Bluehost on every push to `master` that touches `backend/` (or the workflow file itself). It can also be triggered manually from the Actions tab (`workflow_dispatch`).

Two separate, narrowly-scoped SSH keys make this work, deliberately kept apart from any personal key:

- **`BLUEHOST_DEPLOY_KEY`** (GitHub Actions secret) — lets the workflow SSH *into* Bluehost as `iyzcoomy@box2414.bluehost.com`. Uses the runner's native OpenSSH client via `webfactory/ssh-agent`, not `appleboy/ssh-action` — that action's bundled Go SSH client doesn't share a key-exchange algorithm with Bluehost's sshd.
- **`~/.ssh/github_deploy_key`** (lives only on the Bluehost server, configured in the server's `~/.ssh/config` for `Host github.com`) — a read-only GitHub deploy key that lets the server itself `git pull` from this private repo over SSH non-interactively (the repo's `origin` remote on the server is SSH, not HTTPS, for this reason).

If either key is ever compromised, only that one narrow capability needs revoking — not a personal credential.

The deploy script itself, in order: `git pull origin master` → `composer install --no-dev --optimize-autoloader` (called via its absolute path, `/opt/cpanel/composer/bin/composer` — non-interactive SSH sessions on Bluehost's jailshell don't source the profile script that puts `composer` on `PATH`) → `php artisan migrate --force` → `php artisan filament:clear-cached-components` → `php artisan optimize:clear`.
