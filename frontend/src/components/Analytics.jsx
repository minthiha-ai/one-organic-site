import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  analyticsEnabled,
  getConsent,
  initAnalytics,
  onConsentChange,
  OPEN_COOKIE_SETTINGS,
  setConsent,
  trackPageView,
} from '../lib/analytics.js';

// Pages that are private per visitor: never reported, even with consent.
const PRIVATE_PREFIXES = ['/account', '/order/', '/checkout', '/cart', '/login', '/register'];

function isPrivate(path) {
  return PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(p.endsWith('/') ? p : `${p}/`));
}

// Mounted once in Layout. Sends a page view on every route change (once the
// visitor has accepted) and shows the consent banner until they choose.
// Renders nothing on the server, so the prerendered HTML is unaffected.
export default function Analytics() {
  const location = useLocation();
  const [choice, setChoice] = useState('pending'); // 'pending' until mounted
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!analyticsEnabled) return undefined;
    initAnalytics();
    setChoice(getConsent());
    const offConsent = onConsentChange((granted) => {
      setChoice(granted ? 'granted' : 'denied');
      setOpen(false);
      if (granted && !isPrivate(window.location.pathname)) {
        trackPageView(window.location.pathname + window.location.search);
      }
    });
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS, reopen);
    return () => {
      offConsent();
      window.removeEventListener(OPEN_COOKIE_SETTINGS, reopen);
    };
  }, []);

  useEffect(() => {
    if (!analyticsEnabled || isPrivate(location.pathname)) return;
    // The script tag may not have executed yet on the very first page; the
    // queued gtag() calls are flushed by GA once it loads.
    // Keyed on the path only: pages like the product page rewrite ?variant=
    // after load, which must not count as a second view. The full URL (with
    // any utm_ tags) is still sent, so campaign attribution works.
    trackPageView(location.pathname + window.location.search);
  }, [location.pathname]);

  if (!analyticsEnabled) return null;
  const visible = open || choice === null;
  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie settings"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 1000,
        maxWidth: 560,
        margin: '0 auto',
        background: 'var(--color-card-bg, #fff)',
        color: 'var(--color-text)',
        border: '0.5px solid rgba(0,0,0,0.2)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        padding: 16,
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <p style={{ margin: '0 0 12px' }}>
        We use Google Analytics cookies to count visits and see which pages and products people look
        at. They are off unless you accept. See our{' '}
        <Link to="/privacy-policy" style={{ color: 'inherit' }}>Privacy Policy</Link>.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setConsent(false)} style={buttonStyle}>
          Decline
        </button>
        <button type="button" onClick={() => setConsent(true)} style={buttonStyle}>
          Accept
        </button>
      </div>
    </div>
  );
}

// Equal visual weight for both choices on purpose.
const buttonStyle = {
  background: 'transparent',
  color: 'var(--color-label)',
  border: '1px solid var(--color-label)',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 20px',
  fontSize: 13,
  fontWeight: 500,
  fontFamily: 'inherit',
  cursor: 'pointer',
};
