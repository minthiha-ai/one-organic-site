const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  color: 'var(--color-text)',
  padding: '10px 12px',
  border: '0.5px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-bg)',
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  color: 'var(--color-secondary-text)',
  margin: '0 0 4px',
};

export function FormField({ label, type = 'text', placeholder, style }) {
  return (
    <div style={style ?? { margin: '0 0 12px' }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

export function TextAreaField({ label, placeholder, rows = 4 }) {
  return (
    <div style={{ margin: '0 0 12px' }}>
      <label style={labelStyle}>{label}</label>
      <textarea rows={rows} placeholder={placeholder} style={{ ...inputStyle, resize: 'vertical' }} />
    </div>
  );
}
