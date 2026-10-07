import Icon from './Icon.jsx';

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
      <Icon name={icon} style={{ fontSize: 14, color: 'var(--color-accent)' }} />
      {children}
    </span>
  );
}
