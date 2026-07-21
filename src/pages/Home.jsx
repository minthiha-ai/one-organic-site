import CertStrip from '../components/CertStrip.jsx';
import ProductCard from '../components/ProductCard.jsx';
import VariantCard from '../components/VariantCard.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import ScriptText from '../components/ScriptText.jsx';
import UsageGroup from '../components/UsageGroup.jsx';
import MissionBand from '../components/MissionBand.jsx';
import TrustBadge from '../components/TrustBadge.jsx';
import Button from '../components/Button.jsx';
import { heroCoconut, brandStoryPhoto, vcoJars, syrupJar, soapPlain, vco900, vco450, vco125, coconutBodyButter } from '../assets/images/index.js';

export default function Home() {
  return (
    <>
      {/* Hero */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20, maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '40px var(--gutter)' }}>
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
          <Button to="/shop">Shop the collection</Button>
        </div>
        <div style={{ flex: `1 1 var(--hero-img-width)`, maxWidth: 420, position: 'relative' }}>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              transform: 'translate(14px, 14px)',
              background: 'var(--color-accent-wash)',
              borderRadius: 'var(--radius-md)',
            }}
          />
          <div style={{ position: 'relative', aspectRatio: '4 / 5', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <img
              src={heroCoconut}
              alt="A freshly husked coconut resting on stone, palm trees in the background"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', left: 12, bottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <TrustBadge icon="ti-leaf">100% Organic</TrustBadge>
              <TrustBadge icon="ti-droplet">Cold-Pressed</TrustBadge>
            </div>
          </div>
        </div>
      </div>

      <CertStrip />

      {/* Brand story */}
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

      {/* Our products */}
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '32px var(--gutter)' }}>
        <SectionHeading>Our products</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <ProductCard
            image={vcoJars}
            alt="Virgin Coconut Oil jars"
            name="Virgin Coconut Oil"
            tagline="Earth's greatest gift to mankind"
            price={14.99}
            tags={['Cold Pressed', 'High Lauric Acid', 'Vegan & GF']}
            to="/product/virgin-coconut-oil"
          />
          <ProductCard
            image={syrupJar}
            alt="Coconut Syrup jar"
            name="Coconut Syrup"
            tagline="One of the most nutritious sugars"
            price={12.99}
            tags={['Low GI: 35', 'High in Minerals', 'Vegan & GF']}
            to="/product/syrup-600"
          />
          <ProductCard
            image={soapPlain}
            alt="Coconut Oil Soap"
            name="Coconut Oil Soap"
            tagline="Love yourself, love earth"
            price={6.99}
            tags={['No SLS', 'No Preservatives', 'Handcrafted']}
            to="/product/soap-plain"
          />
          <ProductCard
            image={coconutBodyButter}
            alt="Whipped coconut body butter, scooped from an open jar"
            name="Coconut Body Butter"
            tagline="Deep moisture for dry skin"
            price={12.99}
            tags={['Whipped', 'No Parabens', 'Vegan']}
            to="/product/body-butter"
          />
        </div>
      </div>

      {/* Virgin Coconut Oil spotlight */}
      <div
        style={{
          maxWidth: 'var(--page-max-width)',
          margin: '32px auto',
          background: 'var(--color-tint)',
          border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '32px var(--gutter)',
        }}
      >
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

      {/* Ways to use */}
      <div
        style={{
          maxWidth: 'var(--page-max-width)',
          margin: '32px auto',
          background: 'var(--color-tint)',
          border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '32px var(--gutter)',
        }}
      >
        <SectionHeading>Ways to use</SectionHeading>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 64px' }}>
          <UsageGroup
            label="Virgin Coconut Oil"
            style={{ flex: '1 1 280px' }}
            items={[
              { icon: 'ti-flame', label: 'Healthy cooking oil' },
              { icon: 'ti-droplet', label: 'Skin & hair moisturizer' },
              { icon: 'ti-massage', label: 'Massage oil' },
              { icon: 'ti-dental', label: 'Oil pulling' },
            ]}
          />
          <UsageGroup
            label="Coconut Syrup"
            style={{ flex: '1 1 280px' }}
            items={[
              { icon: 'ti-cup', label: 'Honey alternative' },
              { icon: 'ti-bread', label: 'Bread spread' },
            ]}
          />
        </div>
      </div>

      {/* Our Story */}
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '32px var(--gutter) 40px' }}>
        <SectionHeading>Our Story</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-secondary-text)', margin: 0 }}>
            It began with a simple observation: the health of the earth and the health of its people are impossible to
            separate. One Organic was founded on that idea — starting with the coconut, one of the most generous
            plants grown along Thailand's coastline, and a commitment to processing it the way nature intended.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-secondary-text)', margin: 0 }}>
            Every jar of virgin coconut oil is cold-pressed, never refined, and never rushed. Every bottle of coconut
            syrup comes from the flower, not the fruit. Every bar of soap is handcrafted from ingredients we'd be
            comfortable naming out loud. Nothing hidden, nothing added that doesn't need to be there.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-secondary-text)', margin: 0 }}>
            We're a small producer, and we intend to stay thoughtful as we grow — sourcing responsibly, packaging with
            reuse in mind, and treating our surrounding community as a partner in that work, not an afterthought.
            Interwoven and inseparable isn't just a tagline for us; it's how we try to make decisions.
          </p>
        </div>
      </div>

      <MissionBand />
    </>
  );
}
