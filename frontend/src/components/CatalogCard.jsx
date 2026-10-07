import { Link } from 'react-router-dom';

// `imageScale` (0-1) is set for products sold in several sizes of the same
// thing (see Shop.jsx): the photo is drawn at that fraction of the full image
// height and every size stands on one shared baseline, so a bigger jar looks
// bigger. null (the default) keeps the photo centered at the usual size.
export default function CatalogCard({ image, alt, name, price, to, imageScale = null }) {
  const sized = imageScale !== null;
  const imageStyle = sized
    ? {
        // An explicit height (not just a max) also reserves the space before
        // the photo loads. The 0.075 margin keeps the largest option exactly
        // where a centered 85% photo would sit.
        height: `calc(var(--card-img-height) * ${0.85 * imageScale})`,
        marginBottom: 'calc(var(--card-img-height) * 0.075)',
        maxWidth: '85%',
        objectFit: 'contain',
      }
    : { maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' };

  return (
    <Link to={to} className="oo-catalog-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div
        style={{
          height: 'var(--card-img-height)',
          display: 'flex',
          alignItems: sized ? 'flex-end' : 'center',
          justifyContent: 'center',
        }}
      >
        <img src={image} alt={alt} style={imageStyle} />
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
