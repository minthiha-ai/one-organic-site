# One Organic — Concept Mockup

This is a **concept design mockup** for One Organic (Thailand) Co., Ltd., an organic coconut products brand. It was built for client review of the visual direction (colors, typography, layout, page templates) — it is **not** the production site.

The real build (Laravel + a real backend, product catalog, cart, checkout, admin dashboard) is a separate, future project. Everything here is visual only:

- No backend, no database, no real product/cart/order data
- Cart, checkout, and contact forms are non-functional — nothing submits or persists
- "Add to cart", quantity steppers, and payment options are static UI, not wired to real state
- Prices are illustrative placeholders (the source brochure has no pricing)

This project was converted from a set of static, single-file HTML mockups (with inline styles and base64-embedded images) into a proper Vite + React project, so it can be pushed to a repo and deployed to a shareable URL. The conversion was a **reorganization, not a redesign** — every page should look identical to the original HTML mockups.

## Pages

| Route | Page |
|---|---|
| `/` | Home |
| `/shop` | Shop (product listing) |
| `/product/virgin-coconut-oil` | Product detail (Virgin Coconut Oil) |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/contact` | Contact |

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

```bash
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
