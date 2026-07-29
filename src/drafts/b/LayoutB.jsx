import { Outlet } from 'react-router-dom';
import HeaderB from './HeaderB.jsx';
import FooterB from './FooterB.jsx';

export default function LayoutB() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <HeaderB />
      <Outlet />
      <FooterB />
    </div>
  );
}
