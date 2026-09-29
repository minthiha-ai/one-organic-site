import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logoDark } from '../assets/brand/index.js';
import { footerCareForEnvironment } from '../assets/images/index.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const linkStyle = {
  display: 'block',
  fontSize: 13,
  color: 'var(--color-secondary-text)',
  textDecoration: 'none',
  margin: '0 0 8px',
};

const headingStyle = {
  fontFamily: 'var(--font-label)',
  fontSize: 10,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--color-label)',
  margin: '0 0 12px',
};

export default function Footer({ homeTo = '/', shopTo = '/shop' }) {
  const { pathname } = useLocation();
  const isHomepage = pathname === '/';

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle'); // idle | error | success

  function handleNewsletterSubmit(e) {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(newsletterEmail.trim())) {
      setNewsletterStatus('error');
      return;
    }
    // No newsletter backend/third-party list (e.g. Mailchimp) exists yet —
    // this only validates client-side and shows a placeholder success state.
    setNewsletterStatus('success');
  }

  return (
    <div>
      {isHomepage && (
        <img
          src={footerCareForEnvironment}
          alt="Illustration of a tree, birds, a recycling symbol, and a family celebrating outdoors, captioned Care for Environment, Care for Community"
          style={{ width: '100%', maxWidth: 'var(--page-max-width)', height: 'auto', display: 'block', margin: '0 auto' }}
        />
      )}

      <div style={{ background: 'var(--color-dark-band)', color: 'var(--color-dark-band-text)' }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '40px var(--gutter) 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
          <div style={{ flex: '2 1 220px' }}>
            <img src={logoDark} alt="One Organic" style={{ height: 26, width: 'auto', display: 'block', margin: '0 0 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--color-dark-band-text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: 280 }}>
              Organic coconut oil, syrup, and soap — cold-pressed and handcrafted in small batches.
            </p>
          </div>

          <div style={{ flex: '1 1 160px' }}>
            <p className="v2-footer-label" style={{ ...headingStyle, color: 'var(--color-accent-light)' }}>Company</p>
            <Link to="/contact" style={{ ...linkStyle, color: 'var(--color-dark-band-text-secondary)' }}>Contact</Link>
            <p style={{ fontSize: 13, color: 'var(--color-dark-band-text-secondary)', margin: 0 }}>
              hello@one-organic.com
            </p>
          </div>

          <div style={{ flex: '1 1 220px' }}>
            <p className="v2-footer-label" style={{ ...headingStyle, color: 'var(--color-accent-light)' }}>Stay in touch</p>
            <p style={{ fontSize: 13, color: 'var(--color-dark-band-text-secondary)', lineHeight: 1.6, margin: '0 0 12px' }}>
              Get news on new harvests and small-batch runs.
            </p>
            {newsletterStatus === 'success' ? (
              <p style={{ fontSize: 13, color: 'var(--color-accent-light)', margin: 0 }}>
                Thanks — you&rsquo;re on the list.
              </p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} noValidate>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (newsletterStatus === 'error') setNewsletterStatus('idle');
                    }}
                    placeholder="Email address"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      boxSizing: 'border-box',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 12,
                      color: 'var(--color-dark-band-text)',
                      padding: '9px 12px',
                      border: newsletterStatus === 'error' ? '0.5px solid #d98c6b' : '0.5px solid rgba(247,241,231,0.3)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(247,241,231,0.06)',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      fontFamily: 'inherit',
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--color-dark-band)',
                      background: 'var(--color-accent-light)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      padding: '9px 14px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Subscribe
                  </button>
                </div>
                {newsletterStatus === 'error' && (
                  <p style={{ fontSize: 12, color: '#d98c6b', margin: '6px 0 0' }}>
                    Enter a valid email address.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '0.5px solid rgba(247,241,231,0.15)' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: 'var(--page-max-width)',
            margin: '0 auto',
            padding: '16px var(--gutter)',
            fontSize: 12,
            color: 'var(--color-dark-band-text-secondary)',
          }}
        >
          <span>© 2026 One Organic (Thailand) Co., Ltd.</span>
          <span>one-organic.com</span>
        </div>
      </div>
      </div>
    </div>
  );
}
