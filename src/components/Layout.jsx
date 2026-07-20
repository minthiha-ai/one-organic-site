import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function Layout() {
  return (
    <div
      style={{
        fontFamily: 'var(--font-sans)',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        maxWidth: 'var(--page-max-width)',
        margin: '0 auto',
        border: '0.5px solid var(--color-border)',
      }}
    >
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
