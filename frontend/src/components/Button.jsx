import { Link } from 'react-router-dom';

const baseStyle = {
  display: 'inline-block',
  background: 'var(--color-label)',
  color: '#FFFFFF',
  padding: '12px 28px',
  borderRadius: 'var(--radius-sm)',
  fontSize: 14,
  fontWeight: 500,
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

export default function Button({ to, onClick, children, style, block = false, disabled = false, type = 'button' }) {
  const merged = {
    ...baseStyle,
    ...(block ? { display: 'block', textAlign: 'center', width: '100%', boxSizing: 'border-box' } : {}),
    ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
    ...style,
  };

  if (to) {
    return (
      <Link to={to} style={merged}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={merged}>
      {children}
    </button>
  );
}
