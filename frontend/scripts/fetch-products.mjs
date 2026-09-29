// Build-time snapshot of the homepage's product catalog. Runs from a Vite
// plugin (see vite.config.js) on every `vite`/`vite build`, so Home2.jsx can
// import static data instead of fetching /api/products at runtime — the
// snapshot is always at most one dev-server-start or one deploy old, never
// hand-edited, and never goes stale in a way a Filament edit can't fix by
// itself on the next build.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT_PATH = join(ROOT, 'src/data/homepageProducts.json');

// The three sections Home2.jsx renders unconditionally — if any is missing
// from the response, the homepage would silently lose a whole section
// exactly like the incident that motivated this change, so that counts as
// a build failure too, not just an unreachable API or a malformed response.
const REQUIRED_CATEGORY_SLUGS = ['coconut-oil', 'coconut-syrup', 'bath-body'];

function loadDotEnvIfPresent(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

export async function fetchHomepageProducts() {
  // Mirrors frontend/src/lib/api.js: VITE_API_URL, falling back to
  // production. A real env var (e.g. Vercel's build environment) always
  // wins over the local .env file, which is only for `npm run dev` against
  // Herd and won't exist in CI.
  loadDotEnvIfPresent(join(ROOT, '.env'));
  const apiUrl = process.env.VITE_API_URL ?? 'https://api.one-organic.com/api';
  const url = `${apiUrl}/products`;

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error(
      `Could not reach ${url} (${err.message}). The homepage needs a live product catalog at build time now — fix the API URL/connectivity and retry.`
    );
  }

  if (!response.ok) {
    throw new Error(`${url} responded with HTTP ${response.status} ${response.statusText}.`);
  }

  let json;
  try {
    json = await response.json();
  } catch (err) {
    throw new Error(`Response from ${url} was not valid JSON (${err.message}).`);
  }

  const products = json?.data;
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error(
      `Response from ${url} did not contain a non-empty "data" array. Got: ${JSON.stringify(json).slice(0, 300)}`
    );
  }

  const foundSlugs = products.map((p) => p?.category?.slug);
  const missing = REQUIRED_CATEGORY_SLUGS.filter((slug) => !foundSlugs.includes(slug));
  if (missing.length > 0) {
    throw new Error(
      `Fetched ${products.length} product(s) from ${url} but missing homepage categories: ${missing.join(', ')}. Found: ${foundSlugs.join(', ') || '(none)'}.`
    );
  }

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify(products, null, 2)}\n`);

  return { url, count: products.length, outPath: OUT_PATH };
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  try {
    const { url, count, outPath } = await fetchHomepageProducts();
    console.log(`[fetch-products] Wrote ${count} product(s) from ${url} -> ${outPath}`);
  } catch (err) {
    console.error(`\n[fetch-products] BUILD FAILED: ${err.message}\n`);
    process.exit(1);
  }
}
