import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import CertStrip from '../components/CertStrip.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import EyebrowLabel from '../components/EyebrowLabel.jsx';
import ScriptText from '../components/ScriptText.jsx';
import PillTag from '../components/PillTag.jsx';
import IconChip from '../components/IconChip.jsx';
import SizeOption from '../components/SizeOption.jsx';
import Button from '../components/Button.jsx';
import { api, ApiError } from '../lib/api.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    api
      .get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data);
        const requested = Number(searchParams.get('variant'));
        const initial =
          res.data.variants.find((v) => v.id === requested) ??
          res.data.default_variant ??
          res.data.variants[0];
        setSelectedVariantId(initial?.id ?? null);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
    // Only refetch when the product itself changes — switching variant just
    // updates local state and the URL, it doesn't need a new fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (notFound) {
    return <Navigate to="/shop" replace />;
  }

  if (loading || !product) {
    return (
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '64px var(--gutter)', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--color-secondary-text)' }}>Loading…</p>
      </div>
    );
  }

  const variant = product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];

  function selectVariant(id) {
    setSelectedVariantId(id);
    setSearchParams({ variant: id }, { replace: true });
  }

  function handleAddToCart() {
    addItem(product, variant, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 20, padding: '32px var(--gutter)', maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
        <div style={{ flex: '1 1 var(--hero-img-width)', maxWidth: 420 }}>
          <div
            style={{
              aspectRatio: '4 / 5',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: 'var(--color-tint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {variant.image_url && (
              <img
                src={variant.image_url}
                alt={`${product.name} — ${variant.option_label}`}
                style={{ maxWidth: '75%', maxHeight: '75%', objectFit: 'contain' }}
              />
            )}
          </div>
        </div>
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>
          <ScriptText size={18} style={{ margin: '0 0 4px' }}>{product.script_eyebrow}</ScriptText>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 23, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.25 }}>
            {product.name}
          </h1>
          <p style={{ fontSize: 19, fontWeight: 500, color: 'var(--color-text)', margin: '0 0 18px' }}>
            ฿{variant.price.toFixed(2)}
          </p>

          {product.variants.length > 1 && (
            <>
              <EyebrowLabel style={{ margin: '0 0 8px' }}>Options</EyebrowLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '0 0 22px' }}>
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => selectVariant(v.id)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <SizeOption label={v.option_label} selected={v.id === variant.id} />
                  </button>
                ))}
              </div>
            </>
          )}

          {!variant.in_stock && (
            <p style={{ fontSize: 12, color: 'var(--color-accent)', margin: '0 0 12px' }}>Out of stock</p>
          )}

          <Button onClick={handleAddToCart} disabled={!variant.in_stock}>
            {justAdded ? 'Added ✓' : 'Add to cart'}
          </Button>
        </div>
      </div>

      <CertStrip showRecycle={false} />

      <div
        style={{
          maxWidth: 'var(--page-max-width)',
          margin: '32px auto',
          background: 'var(--color-bg)',
          border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '32px var(--gutter)',
        }}
      >
        <SectionHeading style={{ margin: '0 0 16px' }}>Highlights</SectionHeading>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
          {variant.highlights.map((h) => (
            <PillTag key={h}>{h}</PillTag>
          ))}
        </div>

        <SectionHeading style={{ margin: '0 0 16px' }}>Ways to use</SectionHeading>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
          {variant.usage_items.map(({ icon, label }) => (
            <IconChip key={label} icon={icon}>
              {label}
            </IconChip>
          ))}
        </div>

        <SectionHeading style={{ margin: variant.lather ? '0 0 28px' : '0 0 12px' }}>Storage</SectionHeading>
        <p style={{ fontFamily: 'var(--font-technical)', fontSize: 12, color: 'var(--color-secondary-text)', lineHeight: 1.7, margin: variant.lather ? '-16px 0 0' : 0 }}>
          {variant.storage_instructions.map((line, i) => (
            <span key={line}>
              {line}
              {i < variant.storage_instructions.length - 1 && <br />}
            </span>
          ))}
        </p>

        {variant.lather && (
          <>
            <SectionHeading style={{ margin: '28px 0 16px' }}>Soap Details</SectionHeading>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', color: 'var(--color-label)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', width: '40%', verticalAlign: 'top' }}>
                    Lather
                  </td>
                  <td style={{ padding: '8px 0', color: 'var(--color-text)' }}>{variant.lather}</td>
                </tr>
                <tr style={{ borderTop: '0.5px solid var(--color-border)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--color-label)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', verticalAlign: 'top' }}>
                    Skin Type
                  </td>
                  <td style={{ padding: '8px 0', color: 'var(--color-text)' }}>{variant.skin_type}</td>
                </tr>
                <tr style={{ borderTop: '0.5px solid var(--color-border)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--color-label)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', verticalAlign: 'top' }}>
                    Moisturizing Strength
                  </td>
                  <td style={{ padding: '8px 0', color: 'var(--color-text)' }}>{variant.moisturizing_strength}</td>
                </tr>
                <tr style={{ borderTop: '0.5px solid var(--color-border)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--color-label)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', verticalAlign: 'top' }}>
                    Ingredients
                  </td>
                  <td style={{ padding: '8px 0', color: 'var(--color-text)' }}>{variant.ingredients}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
}
