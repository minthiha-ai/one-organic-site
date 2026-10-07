import Icon from './Icon.jsx';

export default function PaymentOption({ icon, label, value, checked = false, onChange }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        border: checked ? '1.5px solid var(--color-accent)' : '0.5px solid var(--color-border)',
        background: checked ? 'var(--color-tint)' : 'transparent',
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        margin: '0 0 10px',
      }}
    >
      <input
        type="radio"
        name="payment"
        value={value}
        checked={checked}
        onChange={onChange}
        style={{ accentColor: 'var(--color-accent)' }}
      />
      <Icon name={icon} style={{ fontSize: 16, color: 'var(--color-accent)' }} />
      <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{label}</span>
    </label>
  );
}
