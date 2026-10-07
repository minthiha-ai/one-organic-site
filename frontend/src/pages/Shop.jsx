import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, assetUrl } from '../lib/api.js';
import CatalogCard from '../components/CatalogCard.jsx';
import CatalogCardSkeleton from '../components/CatalogCardSkeleton.jsx';
import { snapshotCategories, snapshotProducts } from '../lib/catalogSnapshot.js';
import Seo from '../components/Seo.jsx';

// Bands match the real THB pricing (฿150–650 across the catalog) resolved
// in Phase 0.1 of the implementation plan — the old ฿10/20 bands were built
// around mockup placeholder prices and no longer matched anything real.
const priceBuckets = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'under200', label: 'Under ฿200', test: (p) => p.price < 200 },
  { key: '200to500', label: '฿200–฿500', test: (p) => p.price >= 200 && p.price <= 500 },
  { key: 'over500', label: 'Over ฿500', test: (p) => p.price > 500 },
];

function TextTab({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-label)',
        fontSize: 11,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        background: 'none',
        border: 'none',
        borderBottom: active ? '1.5px solid var(--color-text)' : '1.5px solid transparent',
        color: active ? 'var(--color-text)' : 'var(--color-secondary-text)',
        padding: '0 0 6px',
        cursor: 'pointer',
        fontWeight: active ? 600 : 400,
      }}
    >
      {label}
    </button>
  );
}

// "450ml" -> 450. null for anything else ("600g", "With Castor Oil").
function volumeMl(label) {
  const match = /^\s*(\d+(?:\.\d+)?)\s*ml\s*$/i.exec(label ?? '');
  return match ? Number(match[1]) : null;
}

// Each product photo is a cutout that fills its own frame, so fitting every
// photo into the same box makes a 125 ml and a 900 ml jar look alike (the
// squat 125 ml even ends up the widest). For a product whose options are all
// sized in ml, give each option a relative scale — jars of similar shape grow
// with the cube root of their volume, so 125 / 450 / 900 ml come out at about
// 52 / 79 / 100%. That agrees with the homepage's group photo of the three
// jars (48 / 75 / 100%) and the shipping box heights (50 / 80 / 100%).
// Anything else — a single size, grams, named options — returns null and is
// drawn exactly as before.
function imageScales(product) {
  if (product.variants.length < 2) return null;
  const volumes = product.variants.map((variant) => volumeMl(variant.option_label));
  if (volumes.some((volume) => volume === null)) return null;
  const largest = Math.max(...volumes);
  return volumes.map((volume) => Math.cbrt(volume / largest));
}

// Flatten product -> variants into one catalog row per sellable SKU,
// matching the shop grid's existing per-size-card density.
function toRows(products) {
  return products.flatMap((product) => {
    const scales = imageScales(product);
    return product.variants.map((variant, index) => ({
      key: `${product.slug}-${variant.id}`,
      name:
        product.category.slug === 'bath-body'
          ? variant.option_label
          : `${product.name} — ${variant.option_label}`,
      // Cards render at ~250px, so they get the small copy; falls back
      // to the full image for an API that predates thumb_url.
      image: assetUrl(variant.thumb_url ?? variant.image_url),
      alt: `${product.name} — ${variant.option_label}`,
      price: variant.price,
      categoryName: product.category.name,
      categorySlug: product.category.slug,
      to: `/product/${product.slug}?variant=${variant.id}`,
      imageScale: scales ? scales[index] : null,
    }));
  });
}

export default function Shop() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');

  // Starts from the build-time catalog, so the prerendered HTML and the first
  // client render are identical and real content shows immediately; the API
  // fetch below then replaces it with live data (prices/stock edited since
  // the last deploy).
  const [categories, setCategories] = useState(snapshotCategories);
  const [rows, setRows] = useState(() => toRows(snapshotProducts));
  const [loading, setLoading] = useState(snapshotProducts.length === 0);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');
  // Always 'All' on the first render (a static file can't see ?category=);
  // the effect below applies the URL's category right after hydration.
  const [category, setCategory] = useState('All');
  const [priceBucket, setPriceBucket] = useState('all');

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Promise.all([api.getCatalog('/categories'), api.getCatalog('/products')])
      .then(([categoriesRes, productsRes]) => {
        setCategories(categoriesRes.data);
        setRows(toRows(productsRes.data));
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load shop catalog:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const bucket = priceBuckets.find((b) => b.key === priceBucket);
    return rows.filter((row) => {
      if (category !== 'All' && row.categorySlug !== category) return false;
      if (!bucket.test(row)) return false;
      if (q && !row.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, category, priceBucket]);

  const grouped = categories
    .map((cat) => ({
      category: cat,
      items: filtered.filter((row) => row.categorySlug === cat.slug),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div>
      {/* Canonical is always bare /shop: ?category=food and the shop copies under the preview routes are the same page. */}
      <Seo
        title="Shop | One Organic"
        description="Browse One Organic's organic virgin coconut oil, coconut flower syrup, and handcrafted coconut oil soap, with prices in Thai baht. Purchases are completed on Shopee."
        path="/shop"
      />
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '48px var(--gutter) 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-label)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-label)', margin: '0 0 10px' }}>
          The Collection
        </p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 24, margin: 0 }}>Shop</h1>
      </div>

      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          background: 'var(--color-bg)',
          borderTop: '0.5px solid var(--color-border)',
          borderBottom: '0.5px solid var(--color-border)',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--page-max-width)',
            margin: '0 auto',
            padding: '16px var(--gutter)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            style={{
              flex: '1 1 180px',
              minWidth: 0,
              border: 'none',
              borderBottom: '0.5px solid var(--color-border)',
              background: 'transparent',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              padding: '4px 0',
              color: 'var(--color-text)',
            }}
          />
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <TextTab label="All" active={category === 'All'} onClick={() => setCategory('All')} />
            {categories.map((cat) => (
              <TextTab key={cat.slug} label={cat.name} active={category === cat.slug} onClick={() => setCategory(cat.slug)} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            {priceBuckets.map((b) => (
              <TextTab key={b.key} label={b.label} active={priceBucket === b.key} onClick={() => setPriceBucket(b.key)} />
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '32px var(--gutter) 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px 24px' }}>
            {Array.from({ length: 8 }, (_, i) => (
              <CatalogCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {error && rows.length === 0 && (
        <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '48px var(--gutter)', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--color-secondary-text)', margin: 0 }}>
            Couldn&rsquo;t load the shop right now ({error}).
          </p>
        </div>
      )}

      {!loading && !(error && rows.length === 0) && grouped.length === 0 && (
        <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '48px var(--gutter)', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--color-secondary-text)', margin: 0 }}>No products match your search.</p>
        </div>
      )}

      {grouped.map((group, i) => (
        <div
          key={group.category.slug}
          style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: i === grouped.length - 1 ? '32px var(--gutter) 48px' : '32px var(--gutter) 8px' }}
        >
          <p style={{ fontFamily: 'var(--font-label)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-label)', margin: '0 0 18px' }}>
            {group.category.name}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px 24px' }}>
            {group.items.map((row) => (
              <CatalogCard
                key={row.key}
                image={row.image}
                alt={row.alt}
                name={row.name}
                price={row.price}
                to={row.to}
                imageScale={row.imageScale}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
