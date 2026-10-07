import Icon from './Icon.jsx';

export default function TrustBadge({ icon, children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        fontWeight: 500,
        color: 'var(--color-text)',
        background: 'var(--color-bg)',
        padding: '6px 10px',
        borderRadius: 'var(--radius-pill)',
        boxShadow: '0 3px 10px rgba(38,32,20,0.18)',
      }}
    >
      <Icon name={icon} style={{ fontSize: 13, color: 'var(--color-accent)' }} />
      {children}
    </span>
  );
}
