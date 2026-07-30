export default function SectionHeading({ children, style }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 19,
        fontWeight: 600,
        margin: '0 0 20px',
        ...style,
      }}
    >
      {children}
    </h2>
  );
}
