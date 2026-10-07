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
// other pages. Anything not listed (a product added since the last build, an
// unknown URL) falls through to the catch-all, which serves the client-only
// app shell — slower to first paint, but correct.
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

export const APP_SHELL_REWRITE = { source: '/(.*)', destination: '/app-shell.html' };

export const isPrerenderRewrite = (rewrite) => rewrite.destination.startsWith('/prerendered/');
