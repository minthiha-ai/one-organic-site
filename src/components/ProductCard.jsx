import { Link } from 'react-router-dom';
import PillTag from './PillTag.jsx';

export default function ProductCard({ image, alt, name, tagline, tags, to, flex }) {
  return (
    <Link
      to={to}
      style={{
        flex: flex ?? '1 1 180px',
        maxWidth: 220,
        textDecoration: 'none',
        color: 'inherit',
        border: '0.5px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'block',
        background: 'var(--color-card-bg)',
      }}
    >
      <div
        style={{
          background: 'var(--color-tint)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 120,
        }}
      >
        <img
          src={image}
          alt={alt}
          style={{ maxWidth: '88%', maxHeight: '88%', objectFit: 'contain' }}
        />
      </div>
      <div style={{ padding: '10px 12px 14px' }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 4px' }}>{name}</p>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 11,
            color: 'var(--color-accent)',
            margin: '0 0 8px',
          }}
        >
          {tagline}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '0 0 10px' }}>
          {tags.map((tag) => (
            <PillTag key={tag}>{tag}</PillTag>
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--color-label)' }}>
          Shop <i className="ti ti-arrow-right" style={{ fontSize: 12, verticalAlign: -1 }} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
