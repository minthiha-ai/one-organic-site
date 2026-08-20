export default function IconChip({ icon, children }) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: 'var(--color-text)',
        border: '0.5px solid var(--color-border)',
        borderRadius: 'var(--radius-pill)',
        padding: '6px 12px',
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 14, color: 'var(--color-accent)' }} aria-hidden="true" />
      {children}
    </span>
  );
}
