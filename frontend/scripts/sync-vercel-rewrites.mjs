// Regenerates the prerender rewrites in vercel.json from the current catalog
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
import { APP_SHELL_REWRITE, isPrerenderRewrite, prerenderRewrites } from './prerender-routes.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const config = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
const products = JSON.parse(readFileSync(join(ROOT, 'src/data/homepageProducts.json'), 'utf8'));

// Drop the old generated entries and any catch-all (including the pre-prerender
// one that pointed at /index.html — now the prerendered homepage, which must
// not be served for other routes); the new catch-all is appended last.
const kept = config.rewrites.filter((r) => !isPrerenderRewrite(r) && r.source !== APP_SHELL_REWRITE.source);
config.rewrites = [...kept, ...prerenderRewrites(products), APP_SHELL_REWRITE];
writeFileSync(join(ROOT, 'vercel.json'), `${JSON.stringify(config, null, 2)}\n`);
console.log(`vercel.json: ${config.rewrites.length} rewrites (${prerenderRewrites(products).length} prerender)`);
