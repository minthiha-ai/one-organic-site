import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Analytics from './Analytics.jsx';

export default function Layout({ bgOverride, homeTo, shopTo, switchTo, switchLabel, themeOverride, className }) {
  return (
    <div
      className={className}
      style={{
        fontFamily: 'var(--font-sans)',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        ...(bgOverride ? { '--color-bg': bgOverride, '--color-card-bg': bgOverride } : {}),
        ...(themeOverride || {}),
      }}
    >
      <Header homeTo={homeTo} shopTo={shopTo} switchTo={switchTo} switchLabel={switchLabel} />
      <main style={{ flex: 1 }}>
        {/* Lazy pages (see App.jsx) suspend here, so the header and footer stay put. */}
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
      <Footer homeTo={homeTo} shopTo={shopTo} />
      <Analytics />
    </div>
  );
}
