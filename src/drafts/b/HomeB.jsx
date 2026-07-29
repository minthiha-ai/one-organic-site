import { products } from '../../data/products.js';
import CatalogCard from './CatalogCard.jsx';
import { usdaSeal, euSeal } from '../../assets/brand/index.js';

export default function HomeB() {
  return (
    <>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '56px var(--gutter) 32px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-label)', margin: '0 0 14px' }}>
          Organic Coconut Oil · Syrup · Soap
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 600,
            fontSize: 'var(--hero-title-size)',
            margin: '0 auto 16px',
            maxWidth: 640,
            lineHeight: 1.25,
          }}
        >
          Interwoven &amp; Inseparable
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-secondary-text)', maxWidth: 440, margin: '0 auto' }}>
          Cold-pressed and handcrafted in small batches on Thailand's coastline.
        </p>
      </div>

      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 var(--gutter) 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px 24px' }}>
          {products.map((p) => (
            <CatalogCard
              key={p.slug}
              image={p.image}
              alt={p.alt}
              name={p.sizeGroup === 'soap' ? p.optionLabel : `${p.name} — ${p.optionLabel}`}
              price={p.price}
              to={`/product/${p.slug}`}
            />
          ))}
        </div>
      </div>

      <div style={{ borderTop: '0.5px solid var(--color-border)' }}>
        <div
          style={{
            maxWidth: 'var(--page-max-width)',
            margin: '0 auto',
            padding: '28px var(--gutter)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--color-secondary-text)',
            }}
          >
            <img src={usdaSeal} alt="" style={{ height: 22, width: 'auto' }} /> USDA Organic
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--color-secondary-text)',
            }}
          >
            <img src={euSeal} alt="" style={{ height: 16, width: 'auto', borderRadius: 2 }} /> EU Organic
          </span>
        </div>
      </div>
    </>
  );
}
