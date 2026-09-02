import { Link } from 'react-router-dom';
import { logoDark } from '../assets/brand/index.js';
import { footerCareForEnvironment } from '../assets/images/index.js';

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
  return (
    <div>
      <img
        src={footerCareForEnvironment}
        alt="Illustration of a tree, birds, a recycling symbol, and a family celebrating outdoors, captioned Care for Environment, Care for Community"
        style={{ width: '100%', maxWidth: 'var(--page-max-width)', height: 'auto', display: 'block', margin: '0 auto' }}
      />

      <div style={{ background: 'var(--color-dark-band)', color: 'var(--color-dark-band-text)' }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '40px var(--gutter) 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
          <div style={{ flex: '2 1 220px' }}>
            <img src={logoDark} alt="One Organic" style={{ height: 26, width: 'auto', display: 'block', margin: '0 0 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--color-dark-band-text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: 280 }}>
              Organic coconut oil, syrup, and soap — cold-pressed and handcrafted in small batches.
            </p>
          </div>

          <div style={{ flex: '1 1 140px' }}>
            <p className="v2-footer-label" style={{ ...headingStyle, color: 'var(--color-accent-light)' }}>Shop</p>
            <Link to={homeTo} style={{ ...linkStyle, color: 'var(--color-dark-band-text-secondary)' }}>Home</Link>
            <Link to={shopTo} style={{ ...linkStyle, color: 'var(--color-dark-band-text-secondary)' }}>All Products</Link>
            <Link to="/cart" style={{ ...linkStyle, color: 'var(--color-dark-band-text-secondary)' }}>Cart</Link>
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
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                placeholder="Email address"
                style={{
                  flex: 1,
                  minWidth: 0,
                  boxSizing: 'border-box',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  color: 'var(--color-dark-band-text)',
                  padding: '9px 12px',
                  border: '0.5px solid rgba(247,241,231,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(247,241,231,0.06)',
                }}
              />
              <button
                type="button"
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
          </div>
        </div>
      </div>

      <div style={{ borderTop: '0.5px solid rgba(247,241,231,0.15)' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
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
