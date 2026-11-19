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

// Called once the root pass has hydrated (src/components/HydrationDone.jsx).
// That is NOT the end of hydration for a page whose content sits inside a
// <Suspense> boundary (Layout wraps the routed page in one): React hydrates
// dehydrated Suspense content in a later pass, after this has already run. So
// when the prerender left a variant hint, keep it until the page that needs it
// has consumed it (consumeHydrationHint below); clearing it here would make
// that page's first render fall back to the default variant and mismatch the
// server HTML (React error #418).
export function endHydration() {
  if (!hint?.slug) hydrating = false;
}

// Called by ProductDetail from an effect, i.e. after its first render has
// committed against the server HTML. From then on the hint is stale: a later
// in-app visit to the same product must use the URL, not the prerendered
// variant.
export function consumeHydrationHint() {
  hydrating = false;
  hint = null;
}

// The variant the prerendered HTML for `slug` shows — only while hydrating, so
// a later in-app navigation to the same product doesn't reuse a stale hint.
export function hydrationVariantFor(slug) {
  return hydrating && hint?.slug === slug ? hint.variantId : null;
}
