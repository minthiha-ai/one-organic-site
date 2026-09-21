import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { initSentry, Sentry } from './lib/sentry.js'

initSentry()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Something went wrong. Please refresh the page.</p>}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
