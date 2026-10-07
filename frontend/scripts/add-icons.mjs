// Adds Tabler icons to src/assets/icons.json, the set <Icon> renders inline:
//
//   npm run icons -- flame leaf droplet
//
// Fetches each outline icon from the same @tabler/icons version the site's
// fallback icon font is pinned to (keep the two in sync — see Icon.jsx) and
// stores only the shapes; <Icon> supplies the svg wrapper. Names are the
// Tabler names without the "ti-" prefix (https://tabler.io/icons). Existing
// entries are kept; re-adding a name refreshes it.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TABLER_VERSION = '3.49.0';
const FILE = join(dirname(dirname(fileURLToPath(import.meta.url))), 'src/assets/icons.json');

const names = process.argv.slice(2).map((n) => n.replace(/^ti-/, ''));
if (names.length === 0) {
  console.error('Usage: npm run icons -- <icon-name> [<icon-name> ...]');
  process.exit(1);
}

let icons = {};
try {
  icons = JSON.parse(readFileSync(FILE, 'utf8'));
} catch {
  // first run
}

let failed = false;
for (const name of names) {
  const url = `https://cdn.jsdelivr.net/npm/@tabler/icons@${TABLER_VERSION}/icons/outline/${name}.svg`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`  ${name}: not found at ${url} (HTTP ${res.status})`);
    failed = true;
    continue;
  }
  const svg = await res.text();
  const inner = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    // Every Tabler icon starts with an invisible 24x24 bounding-box path.
    .replace(/<path stroke="none" d="M0 0h24v24H0z" fill="none"\s*\/>/, '')
    .trim();
  if (!inner) {
    console.error(`  ${name}: empty icon`);
    failed = true;
    continue;
  }
  icons[name] = inner;
  console.log(`  ${name}: ${inner.length} bytes`);
}

const sorted = Object.fromEntries(Object.entries(icons).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(FILE, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`${Object.keys(sorted).length} icons in src/assets/icons.json`);
if (failed) process.exit(1);
