// Google Analytics 4, loaded only after the visitor accepts analytics cookies.
//
// - Does nothing at all when VITE_GA_MEASUREMENT_ID is unset (local dev, or
//   until the property exists) — no script, no requests, no banner.
// - The GA script is not requested until consent is "granted". Declining, or
//   never answering, means no request to Google.
// - Everything here is safe to import during the build's prerender (no
//   window/document access at import time).

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
const STORAGE_KEY = 'oo_analytics_consent'; // 'granted' | 'denied'

let scriptLoaded = false;
const listeners = new Set();

export const OPEN_COOKIE_SETTINGS = 'oo:open-cookie-settings';
export const analyticsEnabled = Boolean(GA_ID);

export function getConsent() {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null; // storage blocked: treat as "not answered", never as granted
  }
}

export function onConsentChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function loadGa() {
  if (scriptLoaded || !GA_ID || typeof document === 'undefined') return;
  scriptLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments); // GA requires `arguments`, not a spread array
  };
  window.gtag('js', new Date());
  // Page views are sent by hand on every route change (single-page app).
  // No ad features: no ad personalisation, no Google signals.
  window.gtag('config', GA_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
}

export function setConsent(granted) {
  try {
    window.localStorage.setItem(STORAGE_KEY, granted ? 'granted' : 'denied');
  } catch {
    // Storage blocked: the choice applies for this page load only.
  }
  if (granted) {
    loadGa();
  } else if (scriptLoaded && window.gtag) {
    // Revoked after loading: stop collection and clear GA's cookies.
    window.gtag('consent', 'update', { analytics_storage: 'denied' });
    window[`ga-disable-${GA_ID}`] = true;
    clearGaCookies();
  }
  listeners.forEach((fn) => fn(granted));
}

function clearGaCookies() {
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim();
    if (name === '_ga' || name.startsWith('_ga_')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${location.hostname.replace(/^www\./, '')}`;
    }
  });
}

// Call once on startup: resumes tracking for visitors who already accepted.
export function initAnalytics() {
  if (!GA_ID) return;
  if (getConsent() === 'granted') loadGa();
}

function ready() {
  return Boolean(GA_ID) && getConsent() === 'granted' && scriptLoaded && window.gtag;
}

export function trackPageView(path, title) {
  if (!ready()) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    // Full URL including utm_ parameters: GA reads campaign source from here.
    page_location: window.location.href,
    page_title: title ?? document.title,
  });
}

export function trackEvent(name, params = {}) {
  if (!ready()) return;
  window.gtag('event', name, params);
}
