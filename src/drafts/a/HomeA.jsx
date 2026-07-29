import CertStrip from '../../components/CertStrip.jsx';
import SectionHeading from '../../components/SectionHeading.jsx';
import ScriptText from '../../components/ScriptText.jsx';
import Button from '../../components/Button.jsx';
import MinimalCard from './MinimalCard.jsx';
import { products } from '../../data/products.js';
import { heroCoconut, brandStoryPhoto } from '../../assets/images/index.js';

export default function HomeA() {
  return (
    <>
      {/* Hero */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 20,
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto',
          padding: '48px var(--gutter)',
        }}
      >
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <ScriptText size={26} style={{ margin: '0 0 4px' }}>one earth, one life</ScriptText>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--hero-title-size)',
              fontWeight: 600,
              margin: '0 0 14px',
              lineHeight: 1.25,
            }}
          >
            Interwoven &amp; Inseparable
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-secondary-text)', margin: '0 0 20px', maxWidth: 420 }}>
            It is a simple truth that the health of our Earth, and its People, are interwoven and inseparable.
          </p>
          <Button to="/draft-a/shop">Shop the collection</Button>
        </div>
        <div style={{ flex: `1 1 var(--hero-img-width)`, maxWidth: 420, aspectRatio: '4 / 5', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <img
            src={heroCoconut}
            alt="A freshly husked coconut resting on stone, palm trees in the background"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      </div>

      {/* Full product grid */}
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '8px var(--gutter) 40px' }}>
        <SectionHeading>Our products</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '28px 20px' }}>
          {products.map((p) => (
            <MinimalCard
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

      <CertStrip />

      {/* Commitment */}
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '32px auto', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
        <img
          src={brandStoryPhoto}
          alt="Sunlight filtering through a coconut palm frond"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(38,32,20,0.35) 0%, rgba(38,32,20,0.55) 60%, rgba(38,32,20,0.72) 100%)',
          }}
        />
        <div style={{ position: 'relative', padding: '56px var(--gutter)', textAlign: 'center' }}>
          <ScriptText size={20} color="var(--color-accent-light)" style={{ margin: '0 0 6px' }}>
            our commitment
          </ScriptText>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 19,
              fontWeight: 600,
              margin: '0 auto 12px',
              lineHeight: 1.4,
              color: 'var(--color-dark-band-text)',
              maxWidth: 520,
            }}
          >
            Providing the finest organic coconut products to discerning consumers.
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-dark-band-text-secondary)', margin: '0 auto', lineHeight: 1.6, maxWidth: 420 }}>
            Let's work together to build a healthy and sustainable tomorrow.
          </p>
        </div>
      </div>
    </>
  );
}
