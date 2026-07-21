import { Link } from 'react-router-dom';

const navLinkStyle = {
  color: 'var(--color-text)',
  textDecoration: 'none',
};

export default function Header() {
  return (
    <div style={{ position: 'relative', boxShadow: '0 2px 12px rgba(38,32,20,0.06)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto',
          padding: '16px var(--gutter)',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-serif)',
            fontSize: 20,
            textDecoration: 'none',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--color-accent-wash)',
            }}
          >
            <i className="ti ti-leaf" style={{ fontSize: 15, color: 'var(--color-accent)' }} aria-hidden="true" />
          </span>
          <span style={{ color: 'var(--color-text)' }}>one</span>
          <span
            style={{
              fontFamily: 'var(--font-script)',
              color: 'var(--color-accent)',
              fontSize: 24,
            }}
          >
            organic
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 13 }}>
          <Link to="/shop" style={navLinkStyle}>Shop</Link>
          <Link to="/contact" style={navLinkStyle}>Contact</Link>
          <Link to="/cart" style={{ textDecoration: 'none', lineHeight: 0 }}>
            <i
              className="ti ti-shopping-bag"
              style={{ fontSize: 18, color: 'var(--color-text)' }}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
