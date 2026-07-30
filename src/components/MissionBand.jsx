export default function MissionBand() {
  return (
    <div
      style={{
        maxWidth: 'var(--page-max-width)',
        margin: '32px auto',
        background: 'var(--color-dark-band)',
        color: 'var(--color-dark-band-text)',
        padding: '28px var(--gutter)',
        textAlign: 'center',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <i className="ti ti-recycle" style={{ fontSize: 22, color: 'var(--color-accent)' }} aria-hidden="true" />
      <p
        style={{
          fontFamily: 'var(--font-statement)',
          fontSize: 20,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          margin: '10px auto 8px',
          maxWidth: 480,
        }}
      >
        Care for Environment. Care for Community.
      </p>
      <p
        style={{
          fontFamily: 'var(--font-italic)',
          fontStyle: 'italic',
          fontSize: 12,
          color: 'var(--color-dark-band-text-secondary)',
          maxWidth: 420,
          margin: '0 auto',
          lineHeight: 1.6,
        }}
      >
        Together, we can make a meaningful impact on our environment and our communities by simply making
        thoughtful decisions on what we consume.
      </p>
    </div>
  );
}
