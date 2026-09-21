import * as Sentry from '@sentry/react';

// No-ops safely when VITE_SENTRY_DSN is unset (e.g. local dev).
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.2,
  });
}

export { Sentry };
