import { Link } from 'react-router-dom';
import { logoDark } from '../../assets/brand/index.js';

const linkStyle = {
  color: 'var(--color-dark-band-text-secondary)',
  textDecoration: 'none',
};

export default function FooterB() {
  return (
    <div style={{ background: 'var(--color-dark-band)', color: 'var(--color-dark-band-text)' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto',
          padding: '24px var(--gutter)',
        }}
      >
        <img src={logoDark} alt="One Organic" style={{ height: 20, width: 'auto', display: 'block' }} />
        <div style={{ display: 'flex', gap: 20, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          <Link to="/draft-b" style={linkStyle}>Home</Link>
          <Link to="/draft-b/shop" style={linkStyle}>Shop</Link>
          <Link to="/contact" style={linkStyle}>Contact</Link>
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-dark-band-text-secondary)' }}>
          © 2026 One Organic (Thailand) Co., Ltd.
        </span>
      </div>
    </div>
  );
}
