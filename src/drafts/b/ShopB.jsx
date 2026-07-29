import { useMemo, useState } from 'react';
import { products, categories } from '../../data/products.js';
import CatalogCard from './CatalogCard.jsx';

const priceBuckets = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'under10', label: 'Under $10', test: (p) => p.price < 10 },
  { key: '10to20', label: '$10–$20', test: (p) => p.price >= 10 && p.price <= 20 },
  { key: 'over20', label: 'Over $20', test: (p) => p.price > 20 },
];

function TextTab({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: 'inherit',
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

export default function ShopB() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [priceBucket, setPriceBucket] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const bucket = priceBuckets.find((b) => b.key === priceBucket);
    return products.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (!bucket.test(p)) return false;
      if (q && !`${p.name} ${p.tagline} ${p.optionLabel}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, category, priceBucket]);

  const grouped = categories
    .map((cat) => ({ category: cat, items: filtered.filter((p) => p.category === cat) }))
    .filter((group) => group.items.length > 0);

  return (
    <div>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '48px var(--gutter) 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-label)', margin: '0 0 10px' }}>
          The Collection
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 24, margin: 0 }}>Shop</h1>
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
              <TextTab key={cat} label={cat} active={category === cat} onClick={() => setCategory(cat)} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            {priceBuckets.map((b) => (
              <TextTab key={b.key} label={b.label} active={priceBucket === b.key} onClick={() => setPriceBucket(b.key)} />
            ))}
          </div>
        </div>
      </div>

      {grouped.length === 0 && (
        <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '48px var(--gutter)', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--color-secondary-text)', margin: 0 }}>No products match your search.</p>
        </div>
      )}

      {grouped.map((group, i) => (
        <div
          key={group.category}
          style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: i === grouped.length - 1 ? '32px var(--gutter) 48px' : '32px var(--gutter) 8px' }}
        >
          <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-label)', margin: '0 0 18px' }}>
            {group.category}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px 24px' }}>
            {group.items.map((p) => (
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
      ))}
    </div>
  );
}
