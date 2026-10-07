import { Link } from 'react-router-dom';
import PillTag from './PillTag.jsx';
import Icon from './Icon.jsx';

export default function ProductCard({ image, alt, name, tagline, price, tags, to, flex }) {
  return (
    <Link
      to={to}
      className="oo-product-card"
      style={{
        flex: flex ?? '1 1 180px',
        width: '100%',
        boxSizing: 'border-box',
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'block',
        background: 'var(--color-tint)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'var(--card-img-height)',
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
            fontFamily: 'var(--font-heading)',
            fontStyle: 'italic',
            fontSize: 11,
            color: 'var(--color-accent)',
            margin: '0 0 8px',
          }}
        >
          {tagline}
        </p>
        {price != null && (
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 8px' }}>
            ฿{price.toFixed(2)}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '0 0 10px' }}>
          {tags.map((tag) => (
            <PillTag key={tag}>{tag}</PillTag>
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--color-label)' }}>
          Shop <Icon name="arrow-right" style={{ fontSize: 12, verticalAlign: -1 }} />
        </span>
      </div>
    </Link>
  );
}
