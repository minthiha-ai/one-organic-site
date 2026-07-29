import { Link } from 'react-router-dom';
import { logoLight } from '../assets/brand/index.js';

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
        <Link to="/" style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}>
          <img src={logoLight} alt="One Organic" style={{ height: 30, width: 'auto', display: 'block' }} />
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
