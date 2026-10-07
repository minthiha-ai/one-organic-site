import snapshot from '../data/homepageProducts.json';

// The build-time catalog (src/data/homepageProducts.json, written by
// scripts/fetch-products.mjs on every build). It lets /shop and the product
// pages render real content on their first paint — in the prerendered HTML and
// in the browser — instead of a loading skeleton, then refresh from the API.
// The API's list items and single-product responses have identical shapes, so
// a snapshot entry can stand in for either.

export const snapshotProducts = snapshot;

// Categories in the order their products first appear, which matches the order
// the /categories endpoint returns them in.
export const snapshotCategories = snapshot.reduce((acc, product) => {
  if (product.category && !acc.some((c) => c.slug === product.category.slug)) acc.push(product.category);
  return acc;
}, []);

export function snapshotProduct(slug) {
  return snapshot.find((p) => p.slug === slug) ?? null;
}
