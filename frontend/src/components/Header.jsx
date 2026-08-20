import { Link, useLocation } from 'react-router-dom';
import { logoLight } from '../assets/brand/index.js';
import { useCart } from '../context/CartContext.jsx';

const navLinkStyle = {
  color: 'var(--color-text)',
  textDecoration: 'none',
};

export default function Header({ homeTo = '/', shopTo = '/shop', switchTo, switchLabel }) {
  const location = useLocation();
  const isLanding = location.pathname === homeTo;
  const { count } = useCart();

  return (
    <div style={{ boxShadow: '0 2px 12px rgba(38,32,20,0.06)' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          rowGap: 10,
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto',
          padding: '16px var(--gutter)',
        }}
      >
        <Link to={homeTo} style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}>
          <img src={logoLight} alt="One Organic" style={{ height: 30, width: 'auto', display: 'block' }} />
        </Link>

        {(!isLanding || switchTo) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20, fontSize: 13 }}>
            {!isLanding && (
              <>
                <Link to={shopTo} style={navLinkStyle}>Shop</Link>
                <Link to="/contact" style={navLinkStyle}>Contact</Link>
                <Link to="/cart" style={{ textDecoration: 'none', lineHeight: 0, position: 'relative', display: 'inline-flex' }}>
                  <i
                    className="ti ti-shopping-bag"
                    style={{ fontSize: 18, color: 'var(--color-text)' }}
                    aria-hidden="true"
                  />
                  {count > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -7,
                        right: -9,
                        minWidth: 15,
                        height: 15,
                        borderRadius: 999,
                        background: 'var(--color-accent)',
                        color: '#FFFFFF',
                        fontSize: 9,
                        fontWeight: 600,
                        lineHeight: '15px',
                        textAlign: 'center',
                        padding: '0 3px',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              </>
            )}
            {switchTo && (
              <Link
                to={switchTo}
                style={{
                  fontSize: 11,
                  color: 'var(--color-label)',
                  background: 'var(--color-accent-wash)',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-pill)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {switchLabel} →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
