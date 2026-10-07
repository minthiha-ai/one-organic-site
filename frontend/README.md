# One Organic — Frontend

React frontend for One Organic (Thailand) Co., Ltd., an organic coconut products brand. Wired up to the real backend in `../backend` (Laravel + Filament) — see the [root README](../README.md) for the full-platform picture.

**Live and working against the real API:** Shop, product detail (with a functional size/variant switcher), cart (persisted to `localStorage`, real quantities/totals), and checkout (real guest orders, posted to `POST /api/checkout`) all read and write real backend data — nothing here is mock data or a non-functional form anymore.

**Known gap:** the `/` and `/v2` homepage marketing sections (product highlight spreads, hero copy) still read from the static `src/data/products.js` file rather than the API. Their layout is tightly coupled to that data shape (grouped shelf images, curated copy) — converting them is a deliberate follow-up, not a mechanical swap, so it's being done separately rather than rushed alongside the purchase-flow work. Shop/ProductDetail/Cart/Checkout — the actual money-moving path — are fully live.

This project was converted from a set of static, single-file HTML mockups (with inline styles and base64-embedded images) into a proper Vite + React project, so it can be pushed to a repo and deployed to a shareable URL. The conversion was a **reorganization, not a redesign** — every page should look identical to the original HTML mockups.

## Talking to the backend

`src/lib/api.js` is a small fetch wrapper — base URL from `VITE_API_URL` (see `.env.example`), attaches a bearer token from `localStorage` when present, throws `ApiError` (with `.status` and `.errors`) on non-2xx responses.

`src/context/CartContext.jsx` holds cart state (`localStorage`-persisted) keyed by `product_variant_id`. It only ever sends `{ product_variant_id, quantity }` to the backend at checkout — prices are never trusted client-side; the backend re-prices everything server-side.

`src/context/AuthContext.jsx` holds customer auth state the same way (`localStorage`-persisted, mirrors `CartContext`'s shape) — a bearer token via `lib/api.js`, plus the customer record. `src/components/RequireAuth.jsx` guards `/account*` routes (redirects to `/login`); its paired `GuestOnly` export keeps logged-in customers off `/login`/`/register`. Checkout still works fully as a guest — logged-in customers additionally get their info prefilled and can pick a saved address instead of retyping it.

## Pages

| Route | Page |
|---|---|
| `/` | Home |
| `/shop` | Shop (product listing) |
| `/product/virgin-coconut-oil` | Product detail (Virgin Coconut Oil) |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/contact` | Contact |
| `/login` | Login |
| `/register` | Register |
| `/account` | Order history (requires login) |
| `/account/orders/:orderNumber` | Order detail (requires login) |
| `/account/addresses` | Saved addresses (requires login) |

## Stack

- [Vite](https://vite.dev/) + React (plain React, no TypeScript, no SSR/Next.js — this is a client-reviewable static site)
- [React Router](https://reactrouter.com/) for client-side routing
- Plain CSS with a centralized set of CSS custom properties for the color palette and fonts (`src/theme.css`) — component styles use inline style objects referencing those variables, so every color/spacing value lives in one place instead of being repeated
- [Tabler Icons](https://tabler.io/icons) webfont, loaded via CDN link in `index.html` (same as the original mockups)
- Fonts: Playfair Display (serif), Caveat (script), Inter (sans) — loaded from Google Fonts

## Project structure

```
src/
  assets/images/   real image files (decoded from the original mockups' base64 data)
  components/      shared UI pieces (Header, Footer, ProductCard, PillTag, CertBadge, etc.)
  pages/           one file per route
  theme.css        centralized color palette, fonts, spacing tokens (CSS custom properties)
  index.css        minimal global reset
  App.jsx          route definitions
  main.jsx         app entry point
```

## Running locally

Needs the backend running too (see `../backend/README.md` — Herd, `http://one-organic-backend.test`).

```bash
cp .env.example .env   # first time only
npm install
npm run dev
```

This requires **Node ^20.19 or >=22.12** (a Vite/rolldown dependency needs this range — on an older Node the native binary for the bundler won't install correctly). If you're on an older Node version, use `nvm use 22.12` (or newer) first.

## Building for production

```bash
npm run build
```

Output goes to `dist/`. The build is three steps (see the `build` script):

1. `vite build` — the client bundle. It also fetches the live catalog from the API into `src/data/homepageProducts.json` (the snapshot the homepage, `/shop` and the product pages render from before the API answers).
2. `vite build --ssr src/entry-server.jsx --outDir dist-ssr` — the same app as a server bundle.
3. `node scripts/prerender.mjs` — renders each indexable page to static HTML (homepage, `/shop`, `/contact`, the three legal pages, every product and every variant) with its own title, description, canonical and JSON-LD, so crawlers and link-preview bots that don't run JavaScript see real content. The browser then hydrates that HTML and runs as a normal single-page app.

Preview the production build locally with `npm run preview`. Note that it serves `index.html` (the prerendered homepage) for every route, unlike Vercel — to test the real routing, deploy a branch and use the preview URL.

## Deployment

Hosted on Vercel, which builds with `npm run build` (set explicitly in `vercel.json`). `vercel.json` also holds:

- **Rewrites to the prerendered files.** The homepage is `dist/index.html`; every other prerendered page lives under `dist/prerendered/` and is reached through an explicit rewrite (product URLs also match on `?variant=N`). Anything without a rewrite — private pages like `/cart`, a typo'd URL, a product added since the last sync — is served `dist/app-shell.html`, the empty client-only shell, which renders in the browser exactly as before.
- **`/catalog-api/*` and `/catalog-storage/*`**, proxied to the API host and cached at Vercel's edge (see `api/warm.js` and `.github/workflows/warm-cache.yml` for the warm-up that runs after each deploy).

**When a product or variant is added or removed in the admin**, run

```bash
npm run sync:rewrites
```

and commit `vercel.json`. Until you do, the new page still works but is client-rendered, and `npm run build` prints a warning naming what is out of sync. A page whose rewrite is stale never 404s — the build writes the client-only shell to it.

Prices and stock in the prerendered HTML are as of the last deploy; the browser replaces them with live values from the API right after load. A change made in the admin therefore reaches crawlers on the next deploy.

The Netlify `public/_redirects` file predates this setup and does **not** work with it (it sends every path to `index.html`, the prerendered homepage). Don't deploy to Netlify without replacing it.
