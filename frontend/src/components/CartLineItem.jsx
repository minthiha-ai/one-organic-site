export default function CartLineItem({ image, alt, name, variant, qty, price }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 0',
        borderBottom: '0.5px solid var(--color-border)',
      }}
    >
      <div
        style={{
          flex: '0 0 64px',
          height: 64,
          background: 'var(--color-tint)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img src={image} alt={alt} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 2px' }}>{name}</p>
        <p style={{ fontSize: 11, color: 'var(--color-secondary-text)', margin: 0 }}>{variant}</p>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-pill)',
          padding: '5px 10px',
        }}
      >
        <i className="ti ti-minus" style={{ fontSize: 12, color: 'var(--color-secondary-text)' }} aria-hidden="true" />
        <span style={{ fontSize: 12, minWidth: 10, textAlign: 'center' }}>{qty}</span>
        <i className="ti ti-plus" style={{ fontSize: 12, color: 'var(--color-secondary-text)' }} aria-hidden="true" />
      </div>
      <p style={{ fontSize: 13, fontWeight: 500, width: 52, textAlign: 'right', margin: 0 }}>${price}</p>
      <i className="ti ti-trash" style={{ fontSize: 14, color: 'var(--color-muted)' }} aria-hidden="true" />
    </div>
  );
}
