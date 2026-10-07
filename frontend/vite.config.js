import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { fetchHomepageProducts } from './scripts/fetch-products.mjs'
import { buildLlmsTxt, buildSitemapXml } from './scripts/generate-seo-files.mjs'

// Runs on every `vite`/`vite build` (dev and prod alike, whatever invokes
// it — npm script, bare CLI, Vercel's build step) so the homepage's static
// product snapshot (src/data/homepageProducts.json, gitignored) is never
// stale and a bad fetch aborts the build instead of shipping an empty or
// outdated catalog silently. See scripts/fetch-products.mjs.
function homepageProductsSnapshotPlugin() {
  let isSsrBuild = false;
  return {
    name: 'homepage-products-snapshot',
    configResolved(config) {
      isSsrBuild = Boolean(config.build.ssr);
    },
    async buildStart() {
      // The SSR build (src/entry-server.jsx, see `npm run build`) runs right
      // after the client build and reads the snapshot that build just wrote;
      // fetching it again would let the two bundles see different catalogs.
      if (isSsrBuild) return;
      try {
        const { url, count, outPath } = await fetchHomepageProducts();
        console.log(`[homepage-products-snapshot] ${count} product(s) from ${url} -> ${outPath}`);
      } catch (err) {
        this.error(`Homepage product snapshot fetch failed - aborting.\n${err.message}`);
      }
    },
  };
}

// Emits sitemap.xml and llms.txt into the build output from the product
// snapshot written by the plugin above (which has already run by the time
// generateBundle fires, and already aborted the build if the fetch failed).
// Build-only: neither file is served by the dev server.
function seoFilesPlugin() {
  let isSsrBuild = false;
  return {
    name: 'seo-files',
    apply: 'build',
    configResolved(config) {
      isSsrBuild = Boolean(config.build.ssr);
    },
    generateBundle() {
      if (isSsrBuild) return;
      const snapshotPath = fileURLToPath(new URL('./src/data/homepageProducts.json', import.meta.url));
      const products = JSON.parse(readFileSync(snapshotPath, 'utf8'));
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemapXml(products) });
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: buildLlmsTxt(products) });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), homepageProductsSnapshotPlugin(), seoFilesPlugin()],
  server: {
    // Xendit's card Components require an HTTPS origin, so local testing
    // goes through an https tunnel (ngrok etc.) rather than localhost —
    // Vite's dev-server host check would otherwise reject that tunnel's
    // hostname. Dev-server only; doesn't affect production builds.
    allowedHosts: true,
  },
})
