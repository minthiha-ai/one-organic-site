import CertBadge from './CertBadge.jsx';

export default function CertStrip({ showRecycle = true }) {
  return (
    <div
      style={{
        background: 'var(--color-accent-wash)',
        borderTop: '0.5px solid var(--color-border)',
        borderBottom: '0.5px solid var(--color-border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto',
          padding: '10px var(--gutter)',
          fontSize: 12,
          color: 'var(--color-secondary-text)',
        }}
      >
        <CertBadge icon="ti-certificate">USDA Organic certified</CertBadge>
        <CertBadge icon="ti-certificate">EU Organic certified</CertBadge>
        {showRecycle && <CertBadge icon="ti-recycle">Recycle or reuse</CertBadge>}
      </div>
    </div>
  );
}
