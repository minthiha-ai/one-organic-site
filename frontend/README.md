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

Output goes to `dist/`. Preview the production build locally with:

```bash
npm run preview
```

## Deployment

This is a client-side-routed React app, so the host needs to fall back to `index.html` for any path (otherwise direct links or refreshes on routes like `/shop` will 404). Both are already included:

- **Vercel**: `vercel.json` (rewrite-all-to-index.html)
- **Netlify**: `public/_redirects` (`/* /index.html 200`)

Deploy with whichever host you prefer — no extra config needed beyond connecting the repo.
