export default function PillTag({ children }) {
  return (
    <span
      style={{
        fontSize: 9.5,
        color: 'var(--color-secondary-text)',
        background: 'var(--color-tint)',
        border: '0.5px solid var(--color-border)',
        borderRadius: 'var(--radius-pill)',
        padding: '2px 8px',
      }}
    >
      {children}
    </span>
  );
}
