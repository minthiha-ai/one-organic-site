import { Link } from 'react-router-dom';

export default function CatalogCard({ image, alt, name, price, to }) {
  return (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{ height: 'var(--card-img-height)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={image} alt={alt} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
      </div>
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
        <span style={{ fontFamily: 'var(--font-label)', fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--color-text)' }}>
          {name}
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-accent)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          ฿{price.toFixed(2)}
        </span>
      </div>
    </Link>
  );
}
