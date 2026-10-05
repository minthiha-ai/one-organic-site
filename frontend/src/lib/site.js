// Plain ESM with no browser/Node-only imports on purpose: this is imported by
// the React app AND by scripts/generate-seo-files.mjs at build time.

export const SITE_URL = 'https://one-organic.com';
export const SITE_NAME = 'One Organic';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

// Keep in sync with the static <title>/<meta name="description"> in
// index.html — those are what crawlers that don't run JavaScript see.
export const HOME_TITLE = 'One Organic: Organic Virgin Coconut Oil, Syrup & Soap | Thailand';
export const HOME_DESCRIPTION =
  'Organic virgin coconut oil, coconut flower syrup, and coconut oil soap. Cold-pressed and handcrafted in small batches by One Organic (Thailand). Available on Shopee.';

export const ORGANIZATION = {
  legalName: 'One Organic (Thailand) Co., Ltd.',
  email: 'hello@one-organic.com',
  address: {
    streetAddress: '5/3 LaSalle Park Building B, G Floor, LaSalle 10 Soi, Sukhumvit 105 Road',
    addressLocality: 'Bangna',
    addressRegion: 'Bangkok',
    postalCode: '10260',
    addressCountry: 'TH',
  },
};

// Paths of the pages worth indexing that aren't products.
export const STATIC_PATHS = ['/', '/shop', '/contact', '/privacy-policy', '/terms-of-service', '/refund-policy'];

// Each variant is its own canonical URL (own price/size/photo), so the
// sitemap lists these and ProductDetail's canonical resolves to the same
// shape even when the visitor arrived without a ?variant= param.
export function productPath(slug, variantId) {
  return `/product/${slug}?variant=${variantId}`;
}
