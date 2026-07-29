import CertStrip from '../components/CertStrip.jsx';
import VariantCard from '../components/VariantCard.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import ScriptText from '../components/ScriptText.jsx';
import Button from '../components/Button.jsx';
import { products } from '../data/products.js';
import { heroCoconut, brandStoryPhoto } from '../assets/images/index.js';

const vcoItems = products.filter((p) => p.sizeGroup === 'vco');
const syrupItems = products.filter((p) => p.sizeGroup === 'syrup');
const soapItems = products.filter((p) => p.sizeGroup === 'soap');

function ProductLine({ eyebrow, heading, intro, items, describe, shopHref }) {
  return (
    <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '40px var(--gutter)' }}>
      <ScriptText size={20} style={{ margin: '0 0 4px' }}>{eyebrow}</ScriptText>
      <SectionHeading style={{ margin: '0 0 10px' }}>{heading}</SectionHeading>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-secondary-text)', margin: '0 0 24px', maxWidth: 560 }}>
        {intro}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        {items.map((p) => (
          <VariantCard key={p.slug} image={p.image} alt={p.alt} label={p.optionLabel} description={describe(p)} />
        ))}
      </div>
      <Button to={shopHref} style={{ background: 'transparent', color: 'var(--color-label)', border: '0.5px solid var(--color-border)', padding: '10px 20px' }}>
        Shop {heading} →
      </Button>
    </div>
  );
}

export default function Home() {
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
            One Organic is committed to providing the finest organic coconut products to discerning consumers —
            cold-pressed and handcrafted in small batches on Thailand's coastline.
          </p>
          <Button to="/shop">Shop the collection</Button>
        </div>
        <div style={{ flex: `1 1 var(--hero-img-width)`, maxWidth: 420, aspectRatio: '4 / 5', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <img
            src={heroCoconut}
            alt="A freshly husked coconut resting on stone, palm trees in the background"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      </div>

      <ProductLine
        eyebrow="one of earth's greatest gifts to mankind"
        heading="Virgin Coconut Oil"
        intro="Cold-pressed and centrifuge-extracted from organic coconuts — low moisture, high purity, and high in lauric acid. The way nature intended."
        items={vcoItems}
        describe={() => 'Glass jar'}
        shopHref="/shop?category=Coconut+Oil"
      />

      <div style={{ borderTop: '0.5px solid var(--color-border)' }}>
        <ProductLine
          eyebrow="one of the most nutritious sugars"
          heading="Coconut Syrup"
          intro="Unrefined syrup tapped straight from the coconut flower — a low-glycemic, mineral-rich alternative to refined sugar."
          items={syrupItems}
          describe={() => 'Glass jar'}
          shopHref="/shop?category=Coconut+Syrup"
        />
      </div>

      <div style={{ borderTop: '0.5px solid var(--color-border)' }}>
        <ProductLine
          eyebrow="love yourself, love earth"
          heading="Coconut Oil Soap"
          intro="Handcrafted in small batches from 100% organic cold-pressed virgin coconut oil — no SLS, no preservatives, no synthetic fragrance."
          items={soapItems}
          describe={(p) => p.tags[0]}
          shopHref="/shop?category=Bath+%26+Body"
        />
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
