import CertStrip from '../components/CertStrip.jsx';
import ProductCard from '../components/ProductCard.jsx';
import VariantCard from '../components/VariantCard.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import ScriptText from '../components/ScriptText.jsx';
import UsageGroup from '../components/UsageGroup.jsx';
import MissionBand from '../components/MissionBand.jsx';
import Button from '../components/Button.jsx';
import { heroCoconut, brandStoryPhoto, vcoJars, syrupJar, soapPlain, vco900, vco450, vco125 } from '../assets/images/index.js';

export default function Home() {
  return (
    <>
      {/* Hero */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '40px var(--gutter)' }}>
        <div style={{ flex: 1 }}>
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
          <Button to="/shop">Shop the collection</Button>
        </div>
        <div style={{ flex: `0 0 var(--hero-img-width)` }}>
          <img src={heroCoconut} alt="Coconut and palm leaf" style={{ width: '100%', display: 'block', borderRadius: 4 }} />
        </div>
      </div>

      <CertStrip />

      {/* Brand story */}
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '0.5px solid var(--color-border)' }}>
        <img
          src={brandStoryPhoto}
          alt="Coconut palm plantation"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(62,62,63,0.45)' }} />
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

      {/* Our products */}
      <div style={{ padding: '32px var(--gutter)' }}>
        <div style={{ maxWidth: 'var(--grid-max-width)', margin: '0 auto' }}>
          <SectionHeading>Our products</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 16 }}>
            <ProductCard
              image={vcoJars}
              alt="Virgin Coconut Oil jars"
              name="Virgin Coconut Oil"
              tagline="Earth's greatest gift to mankind"
              tags={['Cold Pressed', 'High Lauric Acid', 'Vegan & GF']}
              to="/product/virgin-coconut-oil"
            />
            <ProductCard
              image={syrupJar}
              alt="Coconut Syrup jar"
              name="Coconut Syrup"
              tagline="One of the most nutritious sugars"
              tags={['Low GI: 35', 'High in Minerals', 'Vegan & GF']}
              to="/shop"
            />
            <ProductCard
              image={soapPlain}
              alt="Coconut Oil Soap"
              name="Coconut Oil Soap"
              tagline="Love yourself, love earth"
              tags={['No SLS', 'No Preservatives', 'Handcrafted']}
              to="/shop"
            />
          </div>
        </div>
      </div>

      {/* Virgin Coconut Oil spotlight */}
      <div
        style={{
          padding: '32px var(--gutter)',
          background: 'var(--color-tint)',
          borderTop: '0.5px solid var(--color-border)',
          borderBottom: '0.5px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: 'var(--grid-max-width)', margin: '0 auto' }}>
          <ScriptText size={20} style={{ margin: '0 0 4px', textAlign: 'center' }}>
            earth's greatest gift to mankind
          </ScriptText>
          <SectionHeading style={{ textAlign: 'center' }}>Virgin Coconut Oil</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
            <VariantCard image={vco900} alt="Virgin Coconut Oil, 900ml glass jar" label="900ml" description="Glass jar" />
            <VariantCard image={vco450} alt="Virgin Coconut Oil, 450ml glass jar" label="450ml" description="Glass jar" />
            <VariantCard image={vco125} alt="Virgin Coconut Oil, 125ml glass jar" label="125ml" description="Glass jar" />
          </div>
        </div>
      </div>

      {/* Ways to use */}
      <div style={{ padding: '32px var(--gutter)', background: 'var(--color-tint)', borderTop: '0.5px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--content-max-width)' }}>
          <SectionHeading>Ways to use</SectionHeading>
          <UsageGroup
            label="Virgin Coconut Oil"
            style={{ margin: '0 0 20px' }}
            items={[
              { icon: 'ti-flame', label: 'Healthy cooking oil' },
              { icon: 'ti-droplet', label: 'Skin & hair moisturizer' },
              { icon: 'ti-massage', label: 'Massage oil' },
              { icon: 'ti-dental', label: 'Oil pulling' },
            ]}
          />
          <UsageGroup
            label="Coconut Syrup"
            items={[
              { icon: 'ti-cup', label: 'Honey alternative' },
              { icon: 'ti-bread', label: 'Bread spread' },
            ]}
          />
        </div>
      </div>

      <MissionBand />
    </>
  );
}
