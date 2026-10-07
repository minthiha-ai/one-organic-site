import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { AppRoutes } from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { PrerenderContext, SeoCollectorContext } from './lib/prerender.js';

// Build-time entry for the prerender (scripts/prerender.mjs). Renders one route
// to an HTML string and returns the head data its <Seo> declared. Mirrors
// main.jsx's provider tree so the markup matches what the browser renders when
// it hydrates this HTML.
//
// `url` includes any query string; `prerender` ({ slug, variantId }) tells a
// product page which variant this static file is for.
export function render(url, prerender = null) {
  const seo = { current: null };
  const html = renderToString(
    <StrictMode>
      <SeoCollectorContext.Provider value={seo}>
        <PrerenderContext.Provider value={prerender}>
          <AuthProvider>
            <CartProvider>
              <StaticRouter location={url}>
                <AppRoutes />
              </StaticRouter>
            </CartProvider>
          </AuthProvider>
        </PrerenderContext.Provider>
      </SeoCollectorContext.Provider>
    </StrictMode>
  );
  return { html, seo: seo.current };
}
