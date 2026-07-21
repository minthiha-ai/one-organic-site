import CertBadge from './CertBadge.jsx';

export default function CertStrip({ showRecycle = true }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 24,
        maxWidth: 'var(--page-max-width)',
        margin: '24px auto',
        padding: '12px var(--gutter)',
        background: 'var(--color-accent-wash)',
        border: '0.5px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        fontSize: 12,
        color: 'var(--color-secondary-text)',
      }}
    >
      <CertBadge icon="ti-certificate">USDA Organic certified</CertBadge>
      <CertBadge icon="ti-certificate">EU Organic certified</CertBadge>
      {showRecycle && <CertBadge icon="ti-recycle">Recycle or reuse</CertBadge>}
    </div>
  );
}
