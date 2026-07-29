import {
  vco900,
  vco450,
  vco125,
  syrupJar,
  soapPlain,
  soapCastor,
  soapShea,
  soapCharcoal,
} from '../assets/images/index.js';

const vcoHighlights = [
  'Low Moisture & High Purity',
  'Fast Absorption Into Skin',
  'High MC',
  'High Lauric Acid',
  'Cold Pressed',
  'Centrifuge Extraction',
  'Gluten Free',
  'Vegan',
];

const vcoUsage = [
  { icon: 'ti-flame', label: 'Healthy Cooking Oil' },
  { icon: 'ti-droplet', label: 'Skin & Hair Moisturizer' },
  { icon: 'ti-leaf', label: 'Keto Diet Essential' },
  { icon: 'ti-massage', label: 'Massage Oil' },
  { icon: 'ti-sparkles', label: 'Make Up Remover' },
  { icon: 'ti-dental', label: 'Oil Pulling For Oral Health' },
];

const vcoStorage = ['Store in a cool, dry place.', 'Store away from sunlight.'];

const syrupHighlights = ['Low Glycemic Index: 35', 'Gluten Free', 'Vegan', 'High in Minerals', 'Mild Sweet Taste'];

const syrupUsage = [
  { icon: 'ti-cup', label: 'Sweetener for Beverages' },
  { icon: 'ti-bread', label: 'Baking' },
  { icon: 'ti-leaf', label: 'Honey Alternative' },
];

const syrupStorage = ['Refrigerate after opening.'];

const soapHighlightsBase = ['No SLS', 'No SLES', 'No Sulphates', 'No Preservatives', 'No Fragrances', 'Handcrafted'];

const soapUsage = [
  { icon: 'ti-droplet', label: 'Face & Body Wash' },
  { icon: 'ti-sparkles', label: 'Gentle Exfoliation' },
];

const soapStorage = ['Store in cool, dry place.', 'Cut bar in half and keep dry between uses to prolong its life.'];

export const products = [
  {
    slug: 'virgin-coconut-oil',
    sizeGroup: 'vco',
    category: 'Coconut Oil',
    name: 'Virgin Coconut Oil',
    optionLabel: '450ml',
    tagline: "Earth's greatest gift to mankind",
    scriptEyebrow: "one of earth's greatest gifts to mankind",
    price: 14.99,
    image: vco450,
    alt: 'Virgin Coconut Oil, 450ml glass jar',
    tags: ['Most Popular', 'Cold Pressed', 'Vegan & GF'],
    highlights: vcoHighlights,
    usageItems: vcoUsage,
    storage: vcoStorage,
  },
  {
    slug: 'vco-900',
    sizeGroup: 'vco',
    category: 'Coconut Oil',
    name: 'Virgin Coconut Oil',
    optionLabel: '900ml',
    tagline: "Earth's greatest gift to mankind",
    scriptEyebrow: "one of earth's greatest gifts to mankind",
    price: 24.99,
    image: vco900,
    alt: 'Virgin Coconut Oil, 900ml glass jar',
    tags: ['Family Size', 'Cold Pressed', 'Vegan & GF'],
    highlights: vcoHighlights,
    usageItems: vcoUsage,
    storage: vcoStorage,
  },
  {
    slug: 'vco-125',
    sizeGroup: 'vco',
    category: 'Coconut Oil',
    name: 'Virgin Coconut Oil',
    optionLabel: '125ml',
    tagline: "Earth's greatest gift to mankind",
    scriptEyebrow: "one of earth's greatest gifts to mankind",
    price: 6.99,
    image: vco125,
    alt: 'Virgin Coconut Oil, 125ml glass jar',
    tags: ['Travel Size', 'Cold Pressed', 'Vegan & GF'],
    highlights: vcoHighlights,
    usageItems: vcoUsage,
    storage: vcoStorage,
  },
  {
    slug: 'coconut-syrup',
    sizeGroup: 'syrup',
    category: 'Coconut Syrup',
    name: 'Coconut Syrup',
    optionLabel: '600g',
    tagline: 'One of the most nutritious sugars',
    scriptEyebrow: 'one of the most nutritious sugars',
    price: 12.99,
    image: syrupJar,
    alt: 'Coconut Syrup jar',
    tags: ['Low GI: 35', 'High in Minerals', 'Vegan & GF'],
    highlights: syrupHighlights,
    usageItems: syrupUsage,
    storage: syrupStorage,
  },
  {
    slug: 'soap-plain',
    sizeGroup: 'soap',
    category: 'Bath & Body',
    name: 'Coconut Oil Soap',
    optionLabel: 'Just Coconut Oil',
    tagline: 'Just Coconut Oil',
    scriptEyebrow: 'love yourself, love earth',
    price: 6.99,
    image: soapPlain,
    alt: 'Coconut Oil Soap - Just Coconut Oil',
    tags: ['Antibacterial', 'Oily/Normal Skin', 'Heavy Duty Cleansing'],
    highlights: ['Heavy Duty Daily Cleansing', 'Antibacterial', ...soapHighlightsBase],
    usageItems: soapUsage,
    storage: soapStorage,
  },
  {
    slug: 'soap-castor',
    sizeGroup: 'soap',
    category: 'Bath & Body',
    name: 'Coconut Oil Soap',
    optionLabel: 'With Castor Oil',
    tagline: 'With Castor Oil',
    scriptEyebrow: 'love yourself, love earth',
    price: 7.99,
    image: soapCastor,
    alt: 'Coconut Oil Soap - With Castor Oil',
    tags: ['Hydrating', 'Detoxifies', 'Normal/Dry Skin'],
    highlights: ['Hydrates & Soothes Skin', 'Detoxifies', ...soapHighlightsBase],
    usageItems: soapUsage,
    storage: soapStorage,
  },
  {
    slug: 'soap-shea',
    sizeGroup: 'soap',
    category: 'Bath & Body',
    name: 'Coconut Oil Soap',
    optionLabel: 'With Shea Butter',
    tagline: 'With Shea Butter',
    scriptEyebrow: 'love yourself, love earth',
    price: 7.99,
    image: soapShea,
    alt: 'Coconut Oil Soap - With Shea Butter',
    tags: ['Hydrating', 'Anti-Inflammatory', 'Dry Skin'],
    highlights: ['Hydrates & Soothes Skin', 'Anti-Inflammatory', ...soapHighlightsBase],
    usageItems: soapUsage,
    storage: soapStorage,
  },
  {
    slug: 'soap-charcoal',
    sizeGroup: 'soap',
    category: 'Bath & Body',
    name: 'Coconut Oil Soap',
    optionLabel: 'With Charcoal Powder',
    tagline: 'With Charcoal Powder',
    scriptEyebrow: 'love yourself, love earth',
    price: 7.99,
    image: soapCharcoal,
    alt: 'Coconut Oil Soap - With Charcoal Powder',
    tags: ['Detoxifying', 'Draws Out Impurities', 'Oily/Normal Skin'],
    highlights: ['Deeply Detoxifying', 'Draws Out Impurities', ...soapHighlightsBase],
    usageItems: soapUsage,
    storage: soapStorage,
  },
];

export const categories = ['Coconut Oil', 'Coconut Syrup', 'Bath & Body'];

export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug);
}

export function getSiblings(product) {
  return products.filter((p) => p.sizeGroup === product.sizeGroup);
}
