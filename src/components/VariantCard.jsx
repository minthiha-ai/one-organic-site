export default function VariantCard({ image, alt, label, description }) {
  return (
    <div
      style={{
        background: 'var(--color-card-bg)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 'var(--variant-img-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src={image} alt={alt} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
      </div>
      <div style={{ padding: 12 }}>
        <p
          style={{
            fontFamily: 'var(--font-label)',
            fontSize: 10,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--color-label)',
            margin: '0 0 4px',
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: 11, color: 'var(--color-secondary-text)', margin: 0, lineHeight: 1.4 }}>
          {description}
        </p>
      </div>
    </div>
  );
}
