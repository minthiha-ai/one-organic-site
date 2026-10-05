// Build-time generators for sitemap.xml and llms.txt, fed by the same product
// snapshot the homepage uses (src/data/homepageProducts.json), so both files
// list exactly the products that exist at deploy time — no hand-maintained
// URL list to forget updating when a product is added. Wired into the build
// by seoFilesPlugin in vite.config.js, which emits them straight into dist/.
import { ORGANIZATION, productPath, SITE_NAME, SITE_URL, STATIC_PATHS } from '../src/lib/site.js';

function xmlEscape(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// No <lastmod>: nothing here tracks when a page's content last changed, and
// stamping every URL with the build date would be a claim we can't back up
// (Google discards lastmod values it finds unreliable).
export function buildSitemapXml(products) {
  const paths = [
    ...STATIC_PATHS,
    ...products.flatMap((p) => p.variants.map((v) => productPath(p.slug, v.id))),
  ];
  const urls = paths.map((path) => `  <url><loc>${xmlEscape(`${SITE_URL}${path}`)}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

// Format per llmstxt.org. No prices on purpose: this file is regenerated only
// on deploy, so a price edited in the admin would be stale here until the next
// one — each product page is the source of truth for current prices.
export function buildLlmsTxt(products) {
  const productLines = products
    .map((p) => {
      const sizes = p.variants.map((v) => v.option_label).join(', ');
      const first = p.variants.find((v) => v.is_default) ?? p.variants[0];
      return `- [${p.name}](${SITE_URL}${productPath(p.slug, first.id)}): ${p.tagline ? `${p.tagline}. ` : ''}Options: ${sizes}.`;
    })
    .join('\n');

  const { address } = ORGANIZATION;
  return `# ${SITE_NAME}

> Organic virgin coconut oil, coconut flower syrup, and coconut oil soap. Cold-pressed and handcrafted in small batches by ${ORGANIZATION.legalName} USDA Organic and EU Organic certified.

Customers browse the catalog on ${SITE_URL.replace('https://', '')} and complete purchases on the brand's Shopee store; each product page links to the matching Shopee listing. The site does not take payment itself.

## Products

${productLines}

## Pages

- [Shop](${SITE_URL}/shop): The full catalog.
- [Contact](${SITE_URL}/contact): Questions about products, wholesale, or an order.

## Policies

- [Privacy Policy](${SITE_URL}/privacy-policy)
- [Terms of Service](${SITE_URL}/terms-of-service)
- [Refund Policy](${SITE_URL}/refund-policy)

## Company

${ORGANIZATION.legalName}
${address.streetAddress}, ${address.addressLocality}, ${address.addressRegion} ${address.postalCode}, Thailand
Email: ${ORGANIZATION.email}
`;
}
