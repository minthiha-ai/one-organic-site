// Which pages get prerendered, where each file goes, and the Vercel rewrites
// that serve them. Shared by scripts/prerender.mjs (writes the files and
// checks vercel.json) and scripts/sync-vercel-rewrites.mjs (updates it), so
// the two can't disagree. Plain ESM; the only app import is src/lib/site.js.
import { STATIC_PATHS } from '../src/lib/site.js';

// What goes in #root's data attributes and the render context for a product
// file; also the file name stem under dist/prerendered/.
export function defaultVariantId(product) {
  return (product.default_variant ?? product.variants[0])?.id ?? null;
}

// Every file to produce. `url` is what gets rendered; `file` is relative to
// dist/. The homepage is dist/index.html itself; everything else lives under
// dist/prerendered/ and is reached through the rewrites below, because a real
// file at e.g. dist/product/x/index.html would win over the ?variant= rewrites.
export function prerenderPages(products) {
  const pages = STATIC_PATHS.map((path) => ({
    url: path,
    file: path === '/' ? 'index.html' : `prerendered${path}.html`,
  }));

  for (const product of products) {
    const fallbackId = defaultVariantId(product);
    if (fallbackId === null) continue;
    pages.push({
      url: `/product/${product.slug}`,
      file: `prerendered/product/${product.slug}.html`,
      prerender: { slug: product.slug, variantId: fallbackId },
    });
    for (const variant of product.variants) {
      pages.push({
        url: `/product/${product.slug}?variant=${variant.id}`,
        file: `prerendered/product/${product.slug}/${variant.id}.html`,
        prerender: { slug: product.slug, variantId: variant.id },
      });
    }
  }
  return pages;
}

// The rewrites that route requests to the prerendered files, in match order:
// variant-specific product files first, then each product's default, then the
// other pages. A product added since the last sync is still served, by the
// client-only /product/:slug entry below — slower to first paint, but correct.
export function prerenderRewrites(products) {
  const rewrites = [];
  for (const product of products) {
    if (defaultVariantId(product) === null) continue;
    for (const variant of product.variants) {
      rewrites.push({
        source: `/product/${product.slug}`,
        has: [{ type: 'query', key: 'variant', value: `^${variant.id}$` }],
        destination: `/prerendered/product/${product.slug}/${variant.id}.html`,
      });
    }
    rewrites.push({ source: `/product/${product.slug}`, destination: `/prerendered/product/${product.slug}.html` });
  }
  for (const path of STATIC_PATHS) {
    if (path !== '/') rewrites.push({ source: path, destination: `/prerendered${path}.html` });
  }
  return rewrites;
}

// Routes that exist in the app but get no prerendered file: private pages,
// order pages, design previews, and /product/:slug for a product added since
// the last sync. They are served the empty client-only shell. Anything NOT
// listed here, in STATIC_PATHS or under a prerender rewrite is an unknown URL
// and falls through to dist/404.html with a real 404 status.
//
// Every absolute path in src/App.jsx must be covered by one of these lists;
// scripts/prerender.mjs fails the build if one isn't (see uncoveredRoutes).
export const CLIENT_ONLY_PATHS = [
  '/cart',
  '/checkout',
  '/order/:orderNumber',
  '/login',
  '/register',
  '/account',
  '/account/orders/:orderNumber',
  '/account/addresses',
  '/product/:slug',
  '/v2',
  '/preview-white',
  '/preview-white/shop',
  '/preview-cream',
  '/preview-cream/shop',
];

// Pages that must never be indexed. Sent as a real response header so a
// crawler that doesn't run JavaScript sees it too (the <meta> tag the app
// adds at runtime is only a second layer). A rewrite's `has` can't carry
// headers, so these are matched on the request path.
export const NOINDEX_PATHS = CLIENT_ONLY_PATHS.filter((path) => !path.startsWith('/product/'));

export const clientOnlyRewrites = () => CLIENT_ONLY_PATHS.map((source) => ({ source, destination: '/app-shell.html' }));

export const noindexHeaders = () =>
  NOINDEX_PATHS.map((source) => ({
    source,
    headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
  }));

export const isPrerenderRewrite = (rewrite) => rewrite.destination.startsWith('/prerendered/');

// Everything sync-vercel-rewrites owns: prerender rewrites, client-only
// rewrites, and the retired `/(.*)` catch-all from before unknown URLs 404'd.
export const isGeneratedRewrite = (rewrite) =>
  isPrerenderRewrite(rewrite) || rewrite.destination === '/app-shell.html' || rewrite.source === '/(.*)';

// Absolute route paths declared in App.jsx that no rewrite, static page or
// client-only entry covers — those would 404 in production.
export function uncoveredRoutes(appSource, products) {
  const covered = new Set([
    ...STATIC_PATHS,
    ...CLIENT_ONLY_PATHS,
    ...prerenderRewrites(products).map((r) => r.source),
  ]);
  const declared = [...appSource.matchAll(/\bpath="(\/[^"]*)"/g)].map((m) => m[1]);
  return declared.filter((path) => !covered.has(path));
}
