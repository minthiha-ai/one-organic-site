import { ORGANIZATION, SITE_NAME, SITE_URL } from './site.js';

// schema.org JSON-LD builders. Only states what the site itself already
// shows — no ratings, reviews, social profiles, or GTINs, because none exist
// to cite and inventing them is worse than omitting them.

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        legalName: ORGANIZATION.legalName,
        url: SITE_URL,
        logo: `${SITE_URL}/apple-touch-icon.png`,
        email: ORGANIZATION.email,
        address: { '@type': 'PostalAddress', ...ORGANIZATION.address },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  };
}

// One Product per variant, matching how the site treats each variant as its
// own canonical URL. `url` must be that canonical URL.
export function productJsonLd(product, variant, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.name} (${variant.option_label})`,
    description: productDescription(product, variant),
    image: variant.image_url ? [variant.image_url] : undefined,
    sku: variant.sku,
    brand: { '@type': 'Brand', name: SITE_NAME },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'THB',
      price: Number(variant.price).toFixed(2),
      availability: variant.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}/#organization` },
    },
  };
}

// The API's product `description` is null for every product today, so this
// is assembled from fields that are populated: tagline + the variant's first
// highlights. Reads naturally and stays in sync with what's edited in the
// admin. Trimmed on a word boundary to the length search results display.
export function productDescription(product, variant) {
  const parts = [`${product.name} (${variant.option_label}) by ${SITE_NAME}.`];
  if (product.tagline) parts.push(`${product.tagline}.`);
  const highlights = (variant.highlights ?? []).slice(0, 3);
  if (highlights.length) parts.push(`${highlights.join(', ')}.`);
  parts.push('Buy on Shopee.');
  return truncate(parts.join(' '), 158);
}

function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}
