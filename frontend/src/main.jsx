import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './assets/fonts.css'
import './theme.css'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { initSentry, Sentry } from './lib/sentry.js'
import HydrationDone from './components/HydrationDone.jsx'
import { beginHydration } from './lib/prerender.js'

initSentry()

const root = document.getElementById('root')

const tree = (
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Something went wrong. Please refresh the page.</p>}>
      <AuthProvider>
        <CartProvider>
          <App />
          <HydrationDone />
        </CartProvider>
      </AuthProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>
)

// Pages the build prerendered arrive with content in #root (see
// scripts/prerender.mjs); everything else is served an empty shell and
// renders from scratch.
if (root.hasChildNodes()) {
  beginHydration(root)
  hydrateRoot(root, tree)
} else {
  createRoot(root).render(tree)
}
