import { Outlet } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';

export default function LayoutA() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Header homeTo="/draft-a" shopTo="/draft-a/shop" switchTo="/draft-b" switchLabel="Draft B" />
      <Outlet />
      <Footer homeTo="/draft-a" shopTo="/draft-a/shop" />
    </div>
  );
}
