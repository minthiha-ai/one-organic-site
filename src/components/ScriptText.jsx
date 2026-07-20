export default function ScriptText({ children, size = 20, color = 'var(--color-accent)', style }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-script)',
        fontSize: size,
        color,
        margin: '0 0 4px',
        ...style,
      }}
    >
      {children}
    </p>
  );
}
