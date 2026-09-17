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

_Last confirmed against the actual codebase/deployment: 26.09.16 — see `../Projects/01-One Organic/Status.md` for the full client-facing breakdown._

- ✅ Backend: Laravel 12 + Filament v3, full domain model, Filament admin, and a 17-endpoint REST API — deployed and live in production at `api.one-organic.com` (Bluehost, SSL active)
- ✅ Frontend purchase flow is live end-to-end against the real production API: Shop → Product detail (real variant switcher, incl. soap technical details) → Cart (persisted, real quantities/totals) → Checkout (real guest orders, verified in-browser and cross-checked against the backend after each step)
- ✅ Customer accounts: login/register, order history, order detail, saved addresses — all real, wired to the backend. Checkout now offers a saved address for logged-in customers; guest checkout unchanged.
- ✅ Admin sales dashboard: revenue/order stats, orders-over-time chart, top products — live on `/admin`, verified against seeded test data
- ✅ Contact form sends real email — recipient is `min@one-organic.com` for now (temporary, was `hello@`)
- ✅ Frontend deployed to Vercel, pointed at the production backend (not local Herd)
- ✅ Backend deploys are automated: pushing to `master` with changes under `backend/` triggers `.github/workflows/deploy-backend.yml`, which SSHes into Bluehost and runs the pull/composer/migrate/cache-clear sequence — no manual SSH needed for routine backend updates
- ✅ Production MySQL password rotated (was briefly exposed during initial setup)
- ✅ Payments: card + PromptPay QR via Xendit, built and verified end-to-end against Xendit's sandbox (real webhook payloads captured from Xendit's own dashboard, real reconciliation test with a payment the webhook never saw) — see **Payments (Xendit)** below. Not yet live: needs live API keys swapped in once Xendit's KYC review clears (status not confirmed here — check with Stephen)
- 🚧 Homepage marketing sections (`/`, `/v2`) still read static mockup data — two competing directions, no final pick made yet
- ⚠️ Product prices are carried over from the mockup's placeholder values — not confirmed real THB pricing yet
- ⚠️ `one-organic.com` root domain still points at the live Wix site — DNS cutover paused pending Stephen's confirmation it's safe to retire

## Vercel note

This repo was restructured from a single-app layout (frontend files at repo root) into this monorepo (frontend files under `frontend/`). The existing Vercel project is linked to this repo — its **Root Directory** setting needs to be `frontend` for deploys to keep working. Set via Vercel dashboard → Project Settings → General → Root Directory.

## Backend CI/CD

**Current status (2026-09-17): deploys are pull-based via cron, not push-triggered.** Bluehost is blocking inbound SSH from GitHub Actions' runner IPs at the network edge — connections reset during the SSH key exchange itself, before authentication is even attempted. Confirmed it isn't cPanel's own IP Blocker (empty) and CSF isn't exposed on this shared-hosting plan, so it's happening upstream of anything visible in cPanel. Open with Bluehost support; unresolved as of this writing.

**Routine deploys:** `backend/bin/deploy.sh`, run every few minutes by a Bluehost cron job (`cPanel → Cron Jobs`). It `git pull`s from GitHub itself — outbound only, using the server's own existing `~/.ssh/github_deploy_key` — and only runs composer/migrate/cache-clear if that pull actually moved `HEAD`. A lockfile (`~/deploy.lock`) prevents overlapping runs. Deploy history lives in whatever log file the cron entry redirects to (e.g. `~/deploy.log`) — there's no more per-push GitHub Actions run to check, so nothing pings you if a deploy fails; check the log directly.

**Manual/fallback deploy:** `.github/workflows/deploy-backend.yml` still exists but is `workflow_dispatch`-only now (no more auto-trigger on push, since it can't reach the server). Trigger it by hand from the Actions tab — useful once the firewall issue clears, or to force an inbound-SSH deploy attempt without waiting for cron.

Two separate, narrowly-scoped SSH keys, deliberately kept apart from any personal key:

- **`BLUEHOST_DEPLOY_KEY`** (GitHub Actions secret) — lets the manual workflow SSH *into* Bluehost as `iyzcoomy@box2414.bluehost.com`. Uses the runner's native OpenSSH client via `webfactory/ssh-agent`, not `appleboy/ssh-action` — that action's bundled Go SSH client doesn't share a key-exchange algorithm with Bluehost's sshd. This is the direction currently blocked.
- **`~/.ssh/github_deploy_key`** (lives only on the Bluehost server, configured in the server's `~/.ssh/config` for `Host github.com`) — a read-only GitHub deploy key that lets the server itself `git pull` from this private repo over SSH non-interactively (the repo's `origin` remote on the server is SSH, not HTTPS, for this reason). This is the direction both deploy paths actually rely on now, and it isn't affected by the inbound block.

If either key is ever compromised, only that one narrow capability needs revoking — not a personal credential.

The deploy steps themselves, in order (same in both paths): `git pull origin master` → `composer install --no-dev --optimize-autoloader` (called via its absolute path, `/opt/cpanel/composer/bin/composer` — non-interactive SSH/cron sessions on Bluehost's jailshell don't source the profile script that puts `composer` on `PATH`) → `php artisan migrate --force` → `php artisan filament:clear-cached-components` → `php artisan optimize:clear`.

## Payments (Xendit)

Card and PromptPay QR, both built against Xendit's Sessions/Components API (`app/Services/XenditClient.php`) rather than their classic API — this account's keys reject the classic tokenization flow outright, confirmed by calling it directly and bypassing all app code. Cards use `xendit-components-web` (npm) to mount Xendit's own hosted card fields client-side; PromptPay renders a QR client-side from the raw `qr_string` Xendit returns (via the `qrcode` npm package).

A `payments` table tracks each attempt (`app/Models/Payment.php`) separately from `orders`, since either method can be retried after expiry. Three things confirm a payment, in order of preference: the customer's browser event (`session-complete`), Xendit's webhook (`POST /api/webhooks/xendit`, verified via `x-callback-token`), and a scheduled reconciliation command (`payments:reconcile`, needs a Bluehost cron entry for `php artisan schedule:run` to actually fire) that re-checks anything still `pending` past its own expiry directly against Xendit, in case the webhook never arrived. All three funnel through the same idempotent `app/Services/PaymentStatusUpdater.php`, so whichever one lands first wins and the others are safe no-ops.

**Local testing needs an HTTPS tunnel** — Xendit's card Components reject `http://localhost` outright. Run `ngrok http 5173` (frontend) and `ngrok http 8001` (backend, since an HTTPS page can't call a plain-HTTP API), then set `FRONTEND_URL` and `VITE_API_URL`/`CORS_ALLOWED_ORIGINS` to the tunnel URLs. `vite.config.js` already has `server.allowedHosts: true` for this.
