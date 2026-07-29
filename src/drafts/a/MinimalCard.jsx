import { Link } from 'react-router-dom';

export default function MinimalCard({ image, alt, name, price, to }) {
  return (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div
        style={{
          background: 'var(--color-tint)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'var(--card-img-height)',
        }}
      >
        <img src={image} alt={alt} style={{ maxWidth: '78%', maxHeight: '78%', objectFit: 'contain' }} />
      </div>
      <div style={{ padding: '10px 2px 0' }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 3px' }}>{name}</p>
        <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', margin: 0 }}>${price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
