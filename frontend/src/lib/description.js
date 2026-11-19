// The product description is entered in the admin, usually pasted from the
// Shopee listing. Paragraph breaks and emoji are kept as written; what is
// removed is the raw image links Shopee puts at the end of a copied description
// (https://cf.shopee.co.th/file/...), which are not text anyone should read.
// Nothing else is rewritten.
export function formatProductDescription(text) {
  if (!text) return '';
  return text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
