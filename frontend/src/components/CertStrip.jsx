import CertBadge from './CertBadge.jsx';
import { usdaSeal, euSeal } from '../assets/brand/index.js';

export default function CertStrip({ showRecycle = true }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 28,
        maxWidth: 'var(--page-max-width)',
        margin: '24px auto',
        padding: '14px var(--gutter)',
        background: 'var(--color-accent-wash)',
        border: '0.5px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        fontSize: 12,
        color: 'var(--color-secondary-text)',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <img src={usdaSeal} alt="USDA Organic certified" width={160} height={160} style={{ height: 34, width: 'auto' }} />
        USDA Organic certified
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <img src={euSeal} alt="EU Organic certified" width={204} height={136} style={{ height: 22, width: 'auto', borderRadius: 3 }} />
        EU Organic certified
      </span>
      {showRecycle && <CertBadge icon="ti-recycle">Recycle or reuse</CertBadge>}
    </div>
  );
}
