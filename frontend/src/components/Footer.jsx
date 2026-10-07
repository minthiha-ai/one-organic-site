import { Link, useLocation } from 'react-router-dom';
import { logoDark } from '../assets/brand/index.js';
import { footerCareForEnvironment } from '../assets/images/index.js';
import Icon from './Icon.jsx';

const linkStyle = {
  display: 'block',
  fontSize: 13,
  color: 'var(--color-secondary-text)',
  textDecoration: 'none',
  margin: '0 0 8px',
};

const headingStyle = {
  fontFamily: 'var(--font-label)',
  fontSize: 13,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--color-label)',
  margin: '0 0 12px',
};

export default function Footer({ homeTo = '/', shopTo = '/shop' }) {
  const { pathname } = useLocation();
  const isHomepage = pathname === '/';

  return (
    <div>
      {isHomepage && (
        <img
          src={footerCareForEnvironment}
          alt="Illustration of a tree, birds, a recycling symbol, and a family celebrating outdoors, captioned Care for Environment, Care for Community"
          style={{ width: '100%', height: 'auto', display: 'block', margin: '0 auto', marginBottom: -2 }}
        />
      )}

      {/* Overlaps the image above by 2px (its marginBottom: -2) — the
          browser's downscale of the image introduces a 1px lighter-gray
          resampling artifact right at its bottom edge; this dark band
          paints over it since it comes after in normal flow. */}
      <div style={{ background: 'var(--color-dark-band)', color: 'var(--color-dark-band-text)' }}>
        {/* One grid spans the content row, the divider, and the copyright
            row so the "Company" column and "one-organic.com" below it
            resolve to the same column width — and therefore the same left
            edge — instead of each being sized independently to its own
            (different-length) text, which is what made them look
            misaligned before. */}
        <div
          className="oo-footer-grid"
          style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '40px var(--gutter) 16px' }}
        >
          <div style={{ maxWidth: 320 }}>
            <img src={logoDark} alt="One Organic" style={{ height: 26, width: 'auto', display: 'block', margin: '0 0 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--color-dark-band-text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: 280 }}>
              Organic coconut oil, syrup, and soap. Cold-pressed and handcrafted in small batches.
            </p>
          </div>

          <div>
            {/* Hardcoded, not var(--color-accent-light): that shared token
                differs between the homepage's v2 scope and the site-wide
                default, and this footer should look the same everywhere —
                #d4b99e is the homepage's value. */}
            <p style={{ ...headingStyle, color: '#d4b99e' }}>Company</p>
            <Link to="/contact" style={{ ...linkStyle, color: 'var(--color-dark-band-text-secondary)' }}>Contact</Link>
            <p style={{ fontSize: 13, color: 'var(--color-dark-band-text-secondary)', margin: '0 0 12px' }}>
              hello@one-organic.com
            </p>
            <Link to={shopTo} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-accent)', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              Go to Shop
              <Icon name="arrow-right" style={{ fontSize: 14 }} />
            </Link>
          </div>

          <div style={{ gridColumn: '1 / -1', borderTop: '0.5px solid rgba(247,241,231,0.15)' }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 20, rowGap: 8, fontSize: 12, color: 'var(--color-dark-band-text-secondary)' }}>
            <span>© 2026 One Organic (Thailand) Co., Ltd.</span>
            {/* The only links to these pages on the live site — checkout, the
                one other place that linked them, is unreachable now that
                purchases happen on Shopee. */}
            <Link to="/privacy-policy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/terms-of-service" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link>
            <Link to="/refund-policy" style={{ color: 'inherit', textDecoration: 'none' }}>Refund Policy</Link>
          </div>
          <span style={{ fontSize: 12, color: 'var(--color-dark-band-text-secondary)' }}>one-organic.com</span>
        </div>
      </div>
    </div>
  );
}
