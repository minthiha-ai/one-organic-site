import { Link } from 'react-router-dom';
import { logoLight } from '../../assets/brand/index.js';

const navStyle = {
  color: 'var(--color-text)',
  textDecoration: 'none',
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

export default function HeaderB() {
  return (
    <div style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          rowGap: 10,
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto',
          padding: '20px var(--gutter)',
        }}
      >
        <Link to="/draft-b" style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}>
          <img src={logoLight} alt="One Organic" style={{ height: 24, width: 'auto', display: 'block' }} />
        </Link>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
          <Link to="/draft-b/shop" style={navStyle}>Shop</Link>
          <Link to="/contact" style={navStyle}>Contact</Link>
          <Link to="/cart" style={{ textDecoration: 'none', lineHeight: 0 }}>
            <i className="ti ti-shopping-bag" style={{ fontSize: 16, color: 'var(--color-text)' }} aria-hidden="true" />
          </Link>
          <Link
            to="/draft-a"
            style={{ ...navStyle, background: 'var(--color-tint)', padding: '5px 10px', borderRadius: 2 }}
          >
            Draft A →
          </Link>
        </div>
      </div>
    </div>
  );
}
