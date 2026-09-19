import EyebrowLabel from './EyebrowLabel.jsx';

export default function LegalPage({ eyebrow, title, lastUpdated, children }) {
  return (
    <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
      <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        <div style={{ padding: '32px var(--gutter) 8px' }}>
          <EyebrowLabel>{eyebrow}</EyebrowLabel>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>{title}</h1>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: 0 }}>Last updated {lastUpdated}</p>
        </div>

        <div className="legal-content" style={{ padding: '16px var(--gutter) 48px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
