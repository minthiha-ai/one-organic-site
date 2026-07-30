export default function EyebrowLabel({ children, style }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-label)',
        fontSize: 10,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--color-label)',
        margin: '0 0 12px',
        ...style,
      }}
    >
      {children}
    </p>
  );
}
