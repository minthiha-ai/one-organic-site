// Regenerates the generated rewrites and noindex headers in vercel.json from the current catalog
// snapshot (src/data/homepageProducts.json, written by any `vite` run):
//
//   npm run sync:rewrites
//
// Run it and commit the result when a product or variant is added in the
// admin. Until then the new page still works — it is just served client-only,
// and `npm run build` prints a warning naming what is missing.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { clientOnlyRewrites, isGeneratedRewrite, noindexHeaders, prerenderRewrites } from './prerender-routes.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const config = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
const products = JSON.parse(readFileSync(join(ROOT, 'src/data/homepageProducts.json'), 'utf8'));

// Drop everything this script generated before (prerender and client-only
// rewrites, plus the old `/(.*)` catch-all, which answered 200 for any URL)
// and write it again. There is deliberately no catch-all now: a URL that
// matches nothing gets dist/404.html with a real 404 status.
const kept = config.rewrites.filter((r) => !isGeneratedRewrite(r));
config.rewrites = [...kept, ...prerenderRewrites(products), ...clientOnlyRewrites()];
config.headers = noindexHeaders();
writeFileSync(join(ROOT, 'vercel.json'), `${JSON.stringify(config, null, 2)}\n`);
console.log(`vercel.json: ${config.rewrites.length} rewrites (${prerenderRewrites(products).length} prerender), ${config.headers.length} noindex headers`);
