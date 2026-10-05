import { useEffect } from 'react';
import { SITE_NAME, SITE_URL } from '../lib/site.js';

// index.html's static tags, captured once at module load. Restored whenever
// a <Seo> unmounts, so a route without its own <Seo> never inherits the
// previous page's title/canonical/noindex.
const defaults =
  typeof document === 'undefined'
    ? {}
    : {
        title: document.title,
        description: document.head.querySelector('meta[name="description"]')?.getAttribute('content'),
        ogImage: document.head.querySelector('meta[property="og:image"]')?.getAttribute('content'),
      };

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMeta(attr, key) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// Edits the head tags that index.html already ships (rather than adding
// duplicates the way React 19's hoisted <title>/<meta> would) so there's
// exactly one of each — conflicting duplicate canonicals get ignored by
// Google entirely. Renders nothing.
//
// `path` is the canonical path including any query string, e.g.
// "/product/virgin-coconut-oil?variant=1"; omit it on pages that shouldn't
// declare a canonical (the noindex ones).
export default function Seo({ title, description, path, image, type = 'website', noindex = false, jsonLd }) {
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    const desc = description ?? defaults.description;
    const url = path ? `${SITE_URL}${path}` : null;

    document.title = title;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:image', image ?? defaults.ogImage);

    if (url) {
      setCanonical(url);
      setMeta('property', 'og:url', url);
    }
    if (noindex) setMeta('name', 'robots', 'noindex, nofollow');

    let script = null;
    if (jsonLdString) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seo = 'true';
      script.textContent = jsonLdString;
      document.head.appendChild(script);
    }

    return () => {
      document.title = defaults.title;
      setMeta('name', 'description', defaults.description);
      setMeta('property', 'og:title', defaults.title);
      setMeta('property', 'og:description', defaults.description);
      setMeta('property', 'og:type', 'website');
      setMeta('property', 'og:image', defaults.ogImage);
      document.head.querySelector('link[rel="canonical"]')?.remove();
      removeMeta('property', 'og:url');
      removeMeta('name', 'robots');
      script?.remove();
    };
  }, [title, description, path, image, type, noindex, jsonLdString]);

  return null;
}

// For routes that exist but shouldn't be indexed: login/account/cart/
// checkout/order pages and the preview routes. Wrapping at the route level
// (App.jsx) covers every state those pages render — loading, redirecting,
// loaded — without each page having to remember.
export function NoIndex({ title, children }) {
  return (
    <>
      <Seo title={`${title} | ${SITE_NAME}`} noindex />
      {children}
    </>
  );
}
