export default function SummaryLine({ label, price, size = 12, weight = 400, color = 'var(--color-secondary-text)', style }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: size,
        fontWeight: weight,
        color,
        margin: '0 0 8px',
        ...style,
      }}
    >
      <span>{label}</span>
      <span>${price}</span>
    </div>
  );
}
