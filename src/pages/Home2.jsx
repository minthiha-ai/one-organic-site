import './Home2.css';
import { products } from '../data/products.js';
import { heroCoconut, brandStoryPhoto } from '../assets/images/index.js';
import { usdaSeal, euSeal } from '../assets/brand/index.js';

const vcoItems = products.filter((p) => p.sizeGroup === 'vco');
const syrupItem = products.find((p) => p.sizeGroup === 'syrup');
const soapItems = products.filter((p) => p.sizeGroup === 'soap');

const sizeOf = (label) => parseFloat(label) || 0;
const vcoShelf = [...vcoItems].sort((a, b) => sizeOf(b.optionLabel) - sizeOf(a.optionLabel));

const soapHighlights = ['No SLS', 'No SLES', 'No Sulphates', 'No Preservatives', 'No Fragrances', 'Handcrafted'];
const soapUsage = [
  { icon: 'ti-droplet', label: 'Face & Body Wash' },
  { icon: 'ti-sparkles', label: 'Gentle Exfoliation' },
];

function ProductGroup({ items, heights, maxItemWidth = 180, gap = 'var(--sp-3)' }) {
  return (
    <div className="v2-panel v2-photo-square" style={{ gap, padding: 'var(--sp-4)' }}>
      {items.map((p, i) => (
        <img
          key={p.slug}
          src={p.image}
          alt={p.alt}
          className="v2-contain"
          style={{ height: heights[i] ?? heights[heights.length - 1], width: 'auto', maxWidth: maxItemWidth }}
        />
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

          <p className="v2-eyebrow" style={{ marginBottom: 'var(--sp-2)' }}>Highlights</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
            {highlights.map((h) => (
              <span key={h} className="v2-tag">{h}</span>
            ))}
          </div>

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
          <div className="v2-photo-portrait" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: '0 20px 48px rgba(62,62,63,0.16)' }}>
            <img
              src={heroCoconut}
              alt="A freshly husked coconut resting on stone, palm trees in the background"
              className="v2-cover"
            />
          </div>
        </div>
      </section>

      <ProductSection
        eyebrow="one of earth's greatest gifts to mankind"
        heading="Virgin Coconut Oil"
        intro="Cold-pressed and centrifuge-extracted, with low moisture, high purity, and high lauric acid — fast-absorbing, gluten free, and vegan."
        media={<ProductGroup items={vcoShelf} heights={[260, 220, 170]} />}
        highlights={vcoItems[0].highlights}
        usage={vcoItems[0].usageItems}
        shopHref="/shop?category=Coconut+Oil"
        shopLabel="Shop Virgin Coconut Oil"
        tint
      />

      <ProductSection
        eyebrow="one of the most nutritious sugars"
        heading="Coconut Syrup"
        intro="Low glycemic index, high in minerals, and mildly sweet — gluten free and vegan."
        media={<ProductGroup items={[syrupItem]} heights={[280]} maxItemWidth={220} />}
        highlights={syrupItem.highlights}
        usage={syrupItem.usageItems}
        shopHref="/shop?category=Coconut+Syrup"
        shopLabel="Shop Coconut Syrup"
        reverse
      />

      <ProductSection
        eyebrow="love yourself, love earth"
        heading="Coconut Oil Soap"
        intro="Handcrafted from 100% organic cold-pressed virgin coconut oil — no SLS, no SLES, no sulphates, no preservatives, no fragrances."
        media={<ProductGroup items={soapItems} heights={[130, 130, 130, 130]} maxItemWidth={96} gap="var(--sp-2)" />}
        highlights={soapHighlights}
        usage={soapUsage}
        shopHref="/shop?category=Bath+%26+Body"
        shopLabel="Shop Coconut Oil Soap"
        tint
      />

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

      {/* Commitment banner — full-bleed, prepped for real lifestyle photography */}
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

      {/* Mission band */}
      <section className="v2-section" style={{ background: 'var(--color-dark-band)', color: 'var(--color-dark-band-text)', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <i className="ti ti-recycle" style={{ fontSize: 30, color: 'var(--color-accent-light)' }} aria-hidden="true" />
          <h2 className="v2-h3" style={{ margin: 'var(--sp-3) 0' }}>Care for Environment. Care for Community.</h2>
          <p className="v2-body" style={{ color: 'var(--color-dark-band-text-secondary)', margin: '0 auto', maxWidth: 460 }}>
            Together, we can make a meaningful impact on our environment and our communities by simply making
            thoughtful decisions on what we consume.
          </p>
        </div>
      </section>
    </>
  );
}
