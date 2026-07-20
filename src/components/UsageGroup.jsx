import IconChip from './IconChip.jsx';

export default function UsageGroup({ label, items, style }) {
  return (
    <div style={style}>
      {label && (
        <p
          style={{
            fontSize: 10,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--color-label)',
            margin: '0 0 8px',
          }}
        >
          {label}
        </p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {items.map(({ icon, label: chipLabel }) => (
          <IconChip key={chipLabel} icon={icon}>
            {chipLabel}
          </IconChip>
        ))}
      </div>
    </div>
  );
}
