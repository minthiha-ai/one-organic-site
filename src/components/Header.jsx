import { Link } from 'react-router-dom';

const navLinkStyle = {
  color: 'var(--color-text)',
  textDecoration: 'none',
};

export default function Header() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px var(--gutter)',
        borderBottom: '0.5px solid var(--color-border)',
      }}
    >
      <Link
        to="/"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 20,
          textDecoration: 'none',
        }}
      >
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
        <Link to="/our-story" style={navLinkStyle}>Our Story</Link>
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
  );
}
