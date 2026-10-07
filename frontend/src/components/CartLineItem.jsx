import Icon from './Icon.jsx';

export default function CartLineItem({ image, alt, name, variant, qty, price, onIncrement, onDecrement, onRemove }) {
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
        {image && <img src={image} alt={alt} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />}
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
        <button
          type="button"
          onClick={onDecrement}
          aria-label="Decrease quantity"
          style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', display: 'flex' }}
        >
          <Icon name="minus" style={{ fontSize: 12, color: 'var(--color-secondary-text)' }} />
        </button>
        <span style={{ fontSize: 12, minWidth: 10, textAlign: 'center' }}>{qty}</span>
        <button
          type="button"
          onClick={onIncrement}
          aria-label="Increase quantity"
          style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', display: 'flex' }}
        >
          <Icon name="plus" style={{ fontSize: 12, color: 'var(--color-secondary-text)' }} />
        </button>
      </div>
      <p style={{ fontSize: 13, fontWeight: 500, width: 60, textAlign: 'right', margin: 0 }}>฿{price}</p>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove item"
        style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }}
      >
        <Icon name="trash" style={{ fontSize: 14, color: 'var(--color-muted)' }} />
      </button>
    </div>
  );
}
