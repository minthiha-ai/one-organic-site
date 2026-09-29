import { useEffect, useState } from 'react';
import './Home2.css';
import { api } from '../lib/api.js';
import {
  heroCoconut,
  brandStoryPhoto,
  vcoJarsV2,
  syrupV2,
  soapJustCoconutV2,
  soapCastorV2,
  soapSheaV2,
  soapCharcoalV2,
} from '../assets/images/index.js';
import { usdaSeal, euSeal } from '../assets/brand/index.js';

const soapImageByLabel = {
  'Just Coconut Oil': soapJustCoconutV2,
  'With Castor Oil': soapCastorV2,
  'With Shea Butter': soapSheaV2,
  'With Charcoal Powder': soapCharcoalV2,
};

function ProductPhoto({ src, alt }) {
  return (
    <div className="v2-panel v2-photo-square" style={{ maxWidth: 420, margin: '0 auto' }}>
      <img src={src} alt={alt} className="v2-cover" />
    </div>
  );
}

function SoapGrid({ variants }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-2)', maxWidth: 420, margin: '0 auto' }}>
      {variants.map((v) => (
        <a
          key={v.id}
          href={`/product/coconut-oil-soap?variant=${v.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div className="v2-panel v2-photo-square v2-hover-lift">
            <img src={soapImageByLabel[v.option_label]} alt={`Coconut Oil Soap — ${v.option_label}`} className="v2-cover" />
          </div>
          <p className="v2-meta" style={{ textAlign: 'center', marginTop: 8 }}>{v.option_label}</p>
        </a>
      ))}
    </div>
  );
}

function ProductSection({ eyebrow, heading, intro, media, highlights, usage, shopHref, shopLabel, reverse, tint }) {
  return (
    <section className="v2-section" style={tint ? { background: 'var(--color-tint)' } : undefined}>
      <div className={`v2-row${reverse ? ' v2-reverse' : ''}`}>
        <div>{media}</div>
        <div>
          <p className="v2-script" style={{ marginBottom: 'var(--sp-1)' }}>{eyebrow}</p>
          <h2 className="v2-h2" style={{ marginBottom: 'var(--sp-3)' }}>{heading}</h2>
          <p className="v2-intro" style={{ marginBottom: 'var(--sp-4)', maxWidth: 480 }}>{intro}</p>

          {highlights && (
            <>
              <p className="v2-eyebrow" style={{ marginBottom: 'var(--sp-2)' }}>Highlights</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
                {highlights.map((h) => (
                  <span key={h} className="v2-tag">{h}</span>
                ))}
              </div>
            </>
          )}

          <p className="v2-eyebrow" style={{ marginBottom: 'var(--sp-2)' }}>Ways to use</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
            {usage.map(({ icon, label }) => (
              <span key={label} className="v2-tag">
                <i className={`ti ${icon}`} aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>

          <a href={shopHref} className="v2-btn">{shopLabel} →</a>
        </div>
      </div>
    </section>
  );
}

export default function Home2() {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    api
      .get('/products')
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  const vco = products?.find((p) => p.category.slug === 'coconut-oil');
  const syrup = products?.find((p) => p.category.slug === 'coconut-syrup');
  const soap = products?.find((p) => p.category.slug === 'bath-body');

  return (
    <>
      {/* Hero */}
      <section className="v2-section" style={{ paddingBottom: 'var(--sp-6)' }}>
        <div className="v2-row">
          <div>
            <p className="v2-script" style={{ marginBottom: 'var(--sp-2)' }}>one earth, one life</p>
            <h1 className="v2-h1" style={{ marginBottom: 'var(--sp-4)' }}>Interwoven &amp; Inseparable</h1>
            <p className="v2-intro" style={{ marginBottom: 'var(--sp-5)', maxWidth: 460 }}>
              It is a simple truth that the health of our Earth, and its People, are interwoven and inseparable.
            </p>
            <a href="/shop" className="v2-btn">Shop the collection →</a>
          </div>
          <div
            className="v2-photo-portrait"
            style={{ maxWidth: 420, margin: '0 auto', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: '0 20px 48px rgba(62,62,63,0.16)' }}
          >
            <img
              src={heroCoconut}
              alt="A freshly husked coconut resting on stone, palm trees in the background"
              className="v2-cover"
            />
          </div>
        </div>
      </section>

      {vco && (
        <ProductSection
          eyebrow={vco.script_eyebrow}
          heading="Virgin Coconut Oil"
          intro="Cold-pressed and centrifuge-extracted, with low moisture, high purity, and high lauric acid — fast-absorbing, gluten free, and vegan."
          media={<ProductPhoto src={vcoJarsV2} alt="900ml, 450ml, and 125ml glass jars of Virgin Coconut Oil" />}
          highlights={vco.default_variant.highlights}
          usage={vco.default_variant.usage_items}
          shopHref="/shop?category=coconut-oil"
          shopLabel="Shop Virgin Coconut Oil"
          tint
        />
      )}

      {syrup && (
        <ProductSection
          eyebrow={syrup.script_eyebrow}
          heading="Coconut Syrup"
          intro="Low glycemic index, high in minerals, and mildly sweet — gluten free and vegan."
          media={<ProductPhoto src={syrupV2} alt="Jar of Coconut Flower Syrup" />}
          highlights={syrup.default_variant.highlights}
          usage={syrup.default_variant.usage_items}
          shopHref="/shop?category=coconut-syrup"
          shopLabel="Shop Coconut Syrup"
          reverse
        />
      )}

      {soap && (
        <ProductSection
          eyebrow={soap.script_eyebrow}
          heading="Coconut Oil Soap"
          intro="Handcrafted from 100% organic cold-pressed virgin coconut oil — no SLS, no SLES, no sulphates, no preservatives, no fragrances, in four variants."
          media={<SoapGrid variants={soap.variants} />}
          usage={soap.default_variant.usage_items}
          shopHref="/shop?category=bath-body"
          shopLabel="Shop Coconut Oil Soap"
          tint
        />
      )}

      {/* Cert strip */}
      <section className="v2-section-tight" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 'var(--sp-5)', maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <img src={usdaSeal} alt="USDA Organic certified" style={{ height: 56, width: 'auto' }} />
          <span className="v2-meta">USDA Organic certified</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <img src={euSeal} alt="EU Organic certified" style={{ height: 36, width: 'auto', borderRadius: 3 }} />
          <span className="v2-meta">EU Organic certified</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <i className="ti ti-recycle" style={{ fontSize: 26, color: 'var(--color-accent)' }} aria-hidden="true" />
          <span className="v2-meta">Recycle or reuse</span>
        </span>
      </section>

      {/* Commitment banner — full-bleed brand photography */}
      <section className="v2-photo-wide" style={{ position: 'relative', minHeight: 360 }}>
        <img
          src={brandStoryPhoto}
          alt="Sunlight filtering through a coconut palm frond"
          className="v2-cover"
          style={{ position: 'absolute', inset: 0 }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(62,62,63,0.30) 0%, rgba(62,62,63,0.55) 65%, rgba(62,62,63,0.75) 100%)',
          }}
        />
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-6) var(--gutter)', textAlign: 'center' }}>
          <div style={{ maxWidth: 560 }}>
            <p className="v2-script v2-script-on-dark" style={{ marginBottom: 'var(--sp-2)' }}>our commitment</p>
            <h2 className="v2-h3" style={{ color: 'var(--color-dark-band-text)', marginBottom: 'var(--sp-3)' }}>
              Providing the finest organic coconut products to discerning consumers.
            </h2>
            <p className="v2-body" style={{ color: 'var(--color-dark-band-text-secondary)' }}>
              Let&rsquo;s work together to build a healthy and sustainable tomorrow.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
