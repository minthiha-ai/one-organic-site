export default function CatalogCardSkeleton() {
  return (
    <div>
      <div className="oo-skeleton" style={{ height: 'var(--card-img-height)' }} />
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 8,
          borderTop: '0.5px solid var(--color-border)',
          marginTop: 10,
          paddingTop: 10,
        }}
      >
        <div className="oo-skeleton" style={{ width: '60%', height: 11 }} />
        <div className="oo-skeleton" style={{ width: 36, height: 12, flexShrink: 0 }} />
      </div>
    </div>
  );
}
