export default function Footer() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        fontSize: 12,
        color: 'var(--color-muted)',
      }}
    >
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--color-text)' }}>
        one
        <span style={{ fontFamily: 'var(--font-script)', color: 'var(--color-accent)', fontSize: 16 }}>
          organic
        </span>
      </div>
      <span>one-organic.com</span>
    </div>
  );
}
