import { createContext } from 'react';

// Glue between the build-time prerender (scripts/prerender.mjs) and the client.
//
// A prerendered page is the server's render of a specific route, and React can
// only hydrate it cleanly if the browser's very first render produces the same
// markup. Anything that depends on the URL's query string (which a static file
// can't see) would break that, so the prerender records what it rendered on the
// #root element (data-slug / data-variant) and the first client render reuses it.
// Components then sync to the real URL in an effect, right after hydration.

// Server side: the prerender script provides what it is rendering.
export const PrerenderContext = createContext(null);

// Server side: Seo components write the page's head data here so the
// prerender script can bake it into the HTML (effects never run on the server).
export const SeoCollectorContext = createContext(null);

let hydrating = false;
let hint = null;

export function beginHydration(rootEl) {
  hint = { slug: rootEl.dataset.slug || null, variantId: Number(rootEl.dataset.variant) || null };
  hydrating = true;
}

export function endHydration() {
  hydrating = false;
}

// The variant the prerendered HTML for `slug` shows — only while hydrating, so
// a later in-app navigation to the same product doesn't reuse a stale hint.
export function hydrationVariantFor(slug) {
  return hydrating && hint?.slug === slug ? hint.variantId : null;
}
