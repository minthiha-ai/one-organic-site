import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  analyticsEnabled,
  getConsent,
  initAnalytics,
  isPrivatePath,
  onConsentChange,
  OPEN_COOKIE_SETTINGS,
  setConsent,
  trackPageView,
} from '../lib/analytics.js';

// Mounted once in Layout. Sends a page view for every in-site route change
// (once the visitor has accepted) and shows the consent banner until they
// choose. The first view of a page load is sent by GA4 itself when it loads
// (see loadGa in lib/analytics.js), so it is deliberately not sent here.
// Renders nothing on the server, so the prerendered HTML is unaffected.
export default function Analytics() {
  const location = useLocation();
  const [choice, setChoice] = useState('pending'); // 'pending' until mounted
  const [open, setOpen] = useState(false);
  const lastPath = useRef(null);

  useEffect(() => {
    if (!analyticsEnabled) return undefined;
    initAnalytics();
    setChoice(getConsent());
    const offConsent = onConsentChange((granted) => {
      setChoice(granted ? 'granted' : 'denied');
      setOpen(false);
    });
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS, reopen);
    return () => {
      offConsent();
      window.removeEventListener(OPEN_COOKIE_SETTINGS, reopen);
    };
  }, []);

  useEffect(() => {
    if (!analyticsEnabled) return;
    // First run = the page load itself: GA4 reports that one. Later runs are
    // in-site navigations, which GA4 cannot see (enhanced measurement's
    // history-change option is off), so we report them.
    // Keyed on the path only: pages like the product page rewrite ?variant=
    // after load, which must not count as a second view. The full URL (with
    // any utm_ tags) is still sent, so campaign attribution works.
    if (lastPath.current === null || lastPath.current === location.pathname) {
      lastPath.current = location.pathname;
      return;
    }
    lastPath.current = location.pathname;
    if (isPrivatePath(location.pathname)) return;
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
