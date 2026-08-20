export default function SizeOption({ label, selected }) {
  return (
    <span
      style={{
        fontSize: 12,
        border: selected ? '1.5px solid var(--color-accent)' : '0.5px solid var(--color-border)',
        borderRadius: 'var(--radius-pill)',
        padding: selected ? '5.5px 14px' : '6px 14px',
        color: selected ? 'var(--color-text)' : 'var(--color-secondary-text)',
        fontWeight: selected ? 500 : 400,
        background: selected ? 'var(--color-tint)' : 'transparent',
      }}
    >
      {label}
    </span>
  );
}
