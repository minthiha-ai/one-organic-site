import { useParams, Link, Navigate } from 'react-router-dom';
import CertStrip from '../components/CertStrip.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import EyebrowLabel from '../components/EyebrowLabel.jsx';
import ScriptText from '../components/ScriptText.jsx';
import PillTag from '../components/PillTag.jsx';
import IconChip from '../components/IconChip.jsx';
import SizeOption from '../components/SizeOption.jsx';
import Button from '../components/Button.jsx';
import { getProductBySlug, getSiblings } from '../data/products.js';

export default function ProductDetail() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);

  if (!product) {
    return <Navigate to="/shop" replace />;
  }

  const siblings = getSiblings(product);

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 20, padding: '32px var(--gutter)', maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
        <div style={{ flex: '1 1 var(--hero-img-width)', maxWidth: 380 }}>
          <img
            src={product.image}
            alt={product.alt}
            style={{ width: '100%', display: 'block', borderRadius: 4 }}
          />
        </div>
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>
          <ScriptText size={18} style={{ margin: '0 0 4px' }}>{product.scriptEyebrow}</ScriptText>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 23, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.25 }}>
            {product.name}
          </h1>
          <p style={{ fontSize: 19, fontWeight: 500, color: 'var(--color-text)', margin: '0 0 18px' }}>
            ${product.price.toFixed(2)}
          </p>

          {siblings.length > 1 && (
            <>
              <EyebrowLabel style={{ margin: '0 0 8px' }}>Options</EyebrowLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '0 0 22px' }}>
                {siblings.map((sibling) => (
                  <Link key={sibling.slug} to={`/product/${sibling.slug}`} style={{ textDecoration: 'none' }}>
                    <SizeOption label={sibling.optionLabel} selected={sibling.slug === product.slug} />
                  </Link>
                ))}
              </div>
            </>
          )}

          <Button to="/cart">Add to cart</Button>
        </div>
      </div>

      <CertStrip showRecycle={false} />

      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '32px var(--gutter) 0' }}>
        <SectionHeading style={{ margin: '0 0 16px' }}>Highlights</SectionHeading>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {product.highlights.map((h) => (
            <PillTag key={h}>{h}</PillTag>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '28px var(--gutter) 0' }}>
        <SectionHeading style={{ margin: '0 0 16px' }}>Ways to use</SectionHeading>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {product.usageItems.map(({ icon, label }) => (
            <IconChip key={label} icon={icon}>
              {label}
            </IconChip>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '28px var(--gutter) 32px' }}>
        <SectionHeading style={{ margin: '0 0 12px' }}>Storage</SectionHeading>
        <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', lineHeight: 1.7, margin: 0 }}>
          {product.storage.map((line, i) => (
            <span key={line}>
              {line}
              {i < product.storage.length - 1 && <br />}
            </span>
          ))}
        </p>
      </div>
    </>
  );
}
