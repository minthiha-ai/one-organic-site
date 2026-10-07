import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logoLight } from '../assets/brand/index.js';
import { useAuth } from '../context/AuthContext.jsx';

const navLinkStyle = {
  color: 'var(--color-text)',
  textDecoration: 'none',
};

export default function Header({ homeTo = '/', shopTo = '/shop', switchTo, switchLabel }) {
  const location = useLocation();
  const isLanding = location.pathname === homeTo;
  const { isAuthenticated: storedLogin } = useAuth();
  // The prerendered HTML is always the logged-out header; reading the stored
  // session on the very first render would not match it. Switch right after.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isAuthenticated = mounted && storedLogin;

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
                {isAuthenticated ? (
                  <Link to="/account" style={{ textDecoration: 'none', lineHeight: 0, display: 'inline-flex' }}>
                    <i className="ti ti-user-circle" style={{ fontSize: 18, color: 'var(--color-text)' }} aria-hidden="true" />
                  </Link>
                ) : (
                  <Link to="/login" style={navLinkStyle}>Login</Link>
                )}
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
