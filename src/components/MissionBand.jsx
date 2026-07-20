export default function MissionBand() {
  return (
    <div
      style={{
        background: 'var(--color-dark-band)',
        color: 'var(--color-dark-band-text)',
        padding: '28px var(--gutter)',
        textAlign: 'center',
      }}
    >
      <i className="ti ti-recycle" style={{ fontSize: 22, color: 'var(--color-accent)' }} aria-hidden="true" />
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, margin: '10px auto 8px', maxWidth: 480 }}>
        Care for environment. Care for community.
      </p>
      <p
        style={{
          fontSize: 12,
          color: 'var(--color-dark-band-text-secondary)',
          maxWidth: 420,
          margin: '0 auto',
          lineHeight: 1.6,
        }}
      >
        Together, we can make a meaningful impact on our environment and our communities by making thoughtful
        decisions on what we consume.
      </p>
    </div>
  );
}
