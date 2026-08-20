import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function Layout({ bgOverride, homeTo, shopTo, switchTo, switchLabel, themeOverride, className }) {
  return (
    <div
      className={className}
      style={{
        fontFamily: 'var(--font-sans)',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        ...(bgOverride ? { '--color-bg': bgOverride, '--color-card-bg': bgOverride } : {}),
        ...(themeOverride || {}),
      }}
    >
      <Header homeTo={homeTo} shopTo={shopTo} switchTo={switchTo} switchLabel={switchLabel} />
      <Outlet />
      <Footer homeTo={homeTo} shopTo={shopTo} />
    </div>
  );
}
