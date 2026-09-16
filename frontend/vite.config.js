import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Xendit's card Components require an HTTPS origin, so local testing
    // goes through an https tunnel (ngrok etc.) rather than localhost —
    // Vite's dev-server host check would otherwise reject that tunnel's
    // hostname. Dev-server only; doesn't affect production builds.
    allowedHosts: true,
  },
})
