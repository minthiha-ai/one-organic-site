import { useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import EyebrowLabel from '../components/EyebrowLabel.jsx';
import ScriptText from '../components/ScriptText.jsx';
import { products, categories } from '../data/products.js';

const priceBuckets = [
  { key: 'all', label: 'All prices', test: () => true },
  { key: 'under10', label: 'Under $10', test: (p) => p.price < 10 },
  { key: '10to20', label: '$10 – $20', test: (p) => p.price >= 10 && p.price <= 20 },
  { key: 'over20', label: 'Over $20', test: (p) => p.price > 20 },
];

function FilterSelect({ icon, value, onChange, options, label }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <i
        className={`ti ${icon}`}
        style={{ position: 'absolute', left: 12, fontSize: 14, color: 'var(--color-secondary-text)', pointerEvents: 'none' }}
        aria-hidden="true"
      />
      <select
        value={value}
        onChange={onChange}
        aria-label={label}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          color: 'var(--color-text)',
          padding: '10px 30px 10px 34px',
          border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--color-tint)',
          cursor: 'pointer',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <i
        className="ti ti-chevron-down"
        style={{ position: 'absolute', right: 12, fontSize: 12, color: 'var(--color-secondary-text)', pointerEvents: 'none' }}
        aria-hidden="true"
      />
    </div>
  );
}

export default function Shop() {
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
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '32px var(--gutter) 8px', textAlign: 'center' }}>
        <ScriptText size={20} style={{ margin: '0 0 4px' }}>the collection</ScriptText>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600, margin: 0 }}>Shop</h1>
      </div>

      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto 24px',
          padding: '14px var(--gutter)',
          background: 'var(--color-bg)',
          border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 16px rgba(38,32,20,0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
          <i
            className="ti ti-search"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: 'var(--color-secondary-text)' }}
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--color-text)',
              padding: '10px 12px 10px 36px',
              border: '0.5px solid var(--color-border)',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-tint)',
            }}
          />
        </div>

        <FilterSelect
          icon="ti-category"
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={[{ value: 'All', label: 'All categories' }, ...categories.map((cat) => ({ value: cat, label: cat }))]}
        />

        <FilterSelect
          icon="ti-currency-dollar"
          label="Price"
          value={priceBucket}
          onChange={(e) => setPriceBucket(e.target.value)}
          options={priceBuckets.map((b) => ({ value: b.key, label: b.label }))}
        />
      </div>

      {grouped.length === 0 && (
        <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '48px var(--gutter)', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--color-secondary-text)', margin: 0 }}>
            No products match your search. Try a different filter.
          </p>
        </div>
      )}

      {grouped.map((group, i) => (
        <div
          key={group.category}
          style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: i === grouped.length - 1 ? '24px var(--gutter) 32px' : '24px var(--gutter) 8px' }}
        >
          <EyebrowLabel>{group.category}</EyebrowLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {group.items.map((p) => (
              <ProductCard
                key={p.slug}
                image={p.image}
                alt={p.alt}
                name={p.sizeGroup === 'soap' ? p.name : `${p.name} — ${p.optionLabel}`}
                tagline={p.tagline}
                price={p.price}
                tags={p.tags}
                to={`/product/${p.slug}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
