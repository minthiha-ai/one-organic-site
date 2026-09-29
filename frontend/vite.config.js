import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fetchHomepageProducts } from './scripts/fetch-products.mjs'

// Runs on every `vite`/`vite build` (dev and prod alike, whatever invokes
// it — npm script, bare CLI, Vercel's build step) so the homepage's static
// product snapshot (src/data/homepageProducts.json, gitignored) is never
// stale and a bad fetch aborts the build instead of shipping an empty or
// outdated catalog silently. See scripts/fetch-products.mjs.
function homepageProductsSnapshotPlugin() {
  return {
    name: 'homepage-products-snapshot',
    async buildStart() {
      try {
        const { url, count, outPath } = await fetchHomepageProducts();
        console.log(`[homepage-products-snapshot] ${count} product(s) from ${url} -> ${outPath}`);
      } catch (err) {
        this.error(`Homepage product snapshot fetch failed - aborting.\n${err.message}`);
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), homepageProductsSnapshotPlugin()],
  server: {
    // Xendit's card Components require an HTTPS origin, so local testing
    // goes through an https tunnel (ngrok etc.) rather than localhost —
    // Vite's dev-server host check would otherwise reject that tunnel's
    // hostname. Dev-server only; doesn't affect production builds.
    allowedHosts: true,
  },
})
