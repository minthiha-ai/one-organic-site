// Build step 3 of `npm run build`: turns the client build (dist/) and the SSR
// bundle (dist-ssr/, from src/entry-server.jsx) into static HTML for every
// indexable page, so crawlers and link-preview bots that don't run JavaScript
// get the real content, title, description, canonical and structured data.
//
// Layout it produces in dist/:
//   index.html                        the homepage, prerendered
//   app-shell.html                    the untouched client-only shell — what
//                                     private pages and not-yet-synced
//                                     products are served
//   404.html                          the "page not found" page; Vercel serves
//                                     it, with a 404 status, for any URL that
//                                     matches no rewrite
//   prerendered/<page>.html           /shop, /contact, the legal pages
//   prerendered/product/<slug>.html   a product page on its default variant
//   prerendered/product/<slug>/<id>.html   ...and on each variant
// vercel.json's rewrites map URLs to these files (see prerender-routes.mjs).
//
// The browser hydrates these pages (src/main.jsx), then takes over as a normal
// single-page app.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SITE_URL } from '../src/lib/site.js';
import { NOINDEX_PATHS, isPrerenderRewrite, prerenderPages, prerenderRewrites, uncoveredRoutes } from './prerender-routes.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST = join(ROOT, 'dist');

const escapeAttr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeText = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function warn(message) {
  console.warn(`[prerender] WARNING: ${message}`);
}

function writeOut(file, contents) {
  const target = join(DIST, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

// Replaces one of index.html's existing <meta> tags. Throws if the tag is
// gone, so editing index.html can't silently stop the head from updating.
function replaceMeta(html, attr, key, content) {
  const pattern = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`);
  if (!pattern.test(html)) throw new Error(`index.html has no <meta ${attr}="${key}"> to replace`);
  return html.replace(pattern, `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`);
}

function applyHead(template, seo) {
  let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeText(seo.title)}</title>`);
  html = replaceMeta(html, 'name', 'description', seo.description);
  html = replaceMeta(html, 'property', 'og:title', seo.title);
  html = replaceMeta(html, 'property', 'og:description', seo.description);
  html = replaceMeta(html, 'property', 'og:type', seo.type);
  html = replaceMeta(html, 'property', 'og:image', seo.image);

  // Tags index.html deliberately doesn't ship (a static one would apply to
  // every URL), added per page — the same set <Seo> manages at runtime.
  const extra = [];
  if (seo.path) {
    const url = `${SITE_URL}${seo.path}`;
    extra.push(`<link rel="canonical" href="${escapeAttr(url)}" />`);
    extra.push(`<meta property="og:url" content="${escapeAttr(url)}" />`);
  }
  if (seo.noindex) extra.push('<meta name="robots" content="noindex, nofollow" />');
  if (seo.jsonLd) {
    // "<" escaped so a value can never close the script tag early.
    const json = JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c');
    extra.push(`<script type="application/ld+json" data-seo="true">${json}</script>`);
  }
  return html.replace('</head>', `    ${extra.join('\n    ')}\n  </head>`);
}

function applyBody(html, appHtml, prerender) {
  const empty = '<div id="root"></div>';
  if (!html.includes(empty)) throw new Error('index.html has no empty <div id="root"></div> to fill');
  // data-slug / data-variant tell the browser which variant this static file
  // shows, so its first render matches it (see src/lib/prerender.js).
  const attrs = prerender ? ` data-slug="${escapeAttr(prerender.slug)}" data-variant="${prerender.variantId}"` : '';
  return html.replace(empty, `<div id="root"${attrs}>${appHtml}</div>`);
}

const template = readFileSync(join(DIST, 'index.html'), 'utf8');
if (!template.includes('<div id="root"></div>')) {
  throw new Error('dist/index.html is not the empty client shell — was the client build skipped, or the prerender run twice?');
}

const { render } = await import(pathToFileURL(join(ROOT, 'dist-ssr/entry-server.js')).href);
const products = JSON.parse(readFileSync(join(ROOT, 'src/data/homepageProducts.json'), 'utf8'));

// Pristine shell first: index.html is about to be overwritten, and this copy
// is what vercel.json's catch-all serves for every unprerendered URL.
writeOut('app-shell.html', template);

// Real 404s: every URL no rewrite matches is answered with this file and a
// 404 status (there is no catch-all rewrite). Rendered at a URL that only the
// router's `*` route matches, so the browser hydrates it at whatever bad URL
// was requested and renders the same thing.
{
  const { html: appHtml, seo } = render('/page-not-found', null);
  if (!seo?.noindex) throw new Error('the 404 page must render a noindex <Seo>');
  writeOut('404.html', applyBody(applyHead(template, seo), appHtml, null));
}

const written = new Set();
const failures = [];

for (const page of prerenderPages(products)) {
  try {
    const { html: appHtml, seo } = render(page.url, page.prerender ?? null);
    if (!seo) throw new Error('page rendered no <Seo>, so there are no head tags to write');
    if (appHtml.length < 200) throw new Error(`rendered only ${appHtml.length} characters`);
    writeOut(page.file, applyBody(applyHead(template, seo), appHtml, page.prerender));
  } catch (err) {
    // A rewrite may point at this file, and a missing file would be a 404 for
    // a real URL — so fall back to the client-only shell. The page still works.
    failures.push({ url: page.url, message: err.message });
    writeOut(page.file, template);
    warn(`${page.url} could not be prerendered (${err.message}); serving the client-only shell for it.`);
  }
  written.add(page.file);
}

// Without a catch-all, a route added to App.jsx but not to vercel.json would
// be a 404 in production. Fail the build instead of shipping that.
const config = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
const appSource = readFileSync(join(ROOT, 'src/App.jsx'), 'utf8');
const uncovered = uncoveredRoutes(appSource, products);
if (uncovered.length > 0) {
  throw new Error(
    `src/App.jsx declares route(s) that no rewrite covers, so they would 404 in production: ${uncovered.join(', ')}. ` +
      'Add them to CLIENT_ONLY_PATHS (or STATIC_PATHS) in scripts/prerender-routes.mjs and run `npm run sync:rewrites`.'
  );
}
if (config.rewrites.some((r) => r.source === '/(.*)')) {
  throw new Error('vercel.json still has a catch-all `/(.*)` rewrite, which would answer 200 for unknown URLs. Run `npm run sync:rewrites`.');
}
const headerSources = new Set((config.headers ?? []).filter((h) => h.headers.some((x) => x.key === 'X-Robots-Tag')).map((h) => h.source));
const missingNoindex = NOINDEX_PATHS.filter((path) => !headerSources.has(path));
if (missingNoindex.length > 0) {
  throw new Error(`vercel.json has no X-Robots-Tag noindex header for: ${missingNoindex.join(', ')}. Run \`npm run sync:rewrites\`.`);
}

// Rewrites in vercel.json for pages this build no longer produces (a product
// or variant deleted since vercel.json was last synced) get the shell too.
const configured = config.rewrites.filter(isPrerenderRewrite);
for (const rewrite of configured) {
  const file = rewrite.destination.replace(/^\//, '');
  if (!written.has(file) && !existsSync(join(DIST, file))) {
    writeOut(file, template);
    warn(`vercel.json routes to ${rewrite.destination}, which this build doesn't produce; serving the client-only shell there. Run \`npm run sync:rewrites\`.`);
  }
}

// ...and pages this build produces that vercel.json doesn't route to yet.
const routed = new Set(configured.map((r) => r.destination));
const unrouted = prerenderRewrites(products).filter((r) => !routed.has(r.destination));
if (unrouted.length > 0) {
  warn(
    `${unrouted.length} prerendered page(s) have no rewrite in vercel.json and won't be served: ` +
      `${unrouted.map((r) => r.destination).join(', ')}. Run \`npm run sync:rewrites\` and commit vercel.json.`
  );
}

console.log(
  `[prerender] ${written.size - failures.length} of ${written.size} pages prerendered` +
    (failures.length ? `, ${failures.length} fell back to the client-only shell` : '') +
    `; app-shell.html written.`
);
