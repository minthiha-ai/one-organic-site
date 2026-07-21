import { vco900, vco450, vco125, vcoJars, syrupJar, coconutSugar, soapPlain, soapCastor, coconutBodyButter } from '../assets/images/index.js';

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

const syrupHighlights = [
  'Unrefined',
  'From the Coconut Flower',
  'Low Glycemic Index',
  'Rich in Minerals',
  'Vegan',
  'Gluten Free',
];

const syrupUsage = [
  { icon: 'ti-cup', label: 'Honey Alternative' },
  { icon: 'ti-bread', label: 'Bread Spread' },
  { icon: 'ti-leaf', label: 'Baking Sugar Substitute' },
];

const syrupStorage = ['Store in a cool, dry place.', 'Refrigerate after opening.'];

const sugarHighlights = ['Unrefined', 'From the Coconut Palm', 'Low Glycemic Index', 'Rich in Minerals', 'Vegan', 'Gluten Free'];

const sugarUsage = [
  { icon: 'ti-cup', label: 'Coffee & Tea Sweetener' },
  { icon: 'ti-bread', label: 'Baking Sugar Substitute' },
  { icon: 'ti-leaf', label: '1:1 Sugar Replacement' },
];

const sugarStorage = ['Store in a cool, dry place.', 'Keep tightly sealed.'];

const soapHighlights = ['No SLS', 'No Preservatives', 'Handcrafted', 'Cold Process', 'Palm-Free', 'Vegan'];

const soapUsage = [
  { icon: 'ti-droplet', label: 'Face & Body Wash' },
  { icon: 'ti-sparkles', label: 'Gentle Exfoliation' },
];

const soapStorage = ['Store in a dry soap dish between uses.', 'Keep away from direct water flow.'];

const bodyButterHighlights = ['Whipped Texture', 'Deep Moisturizing', 'No Parabens', 'No Synthetic Fragrance', 'Vegan', 'Cruelty-Free'];

const bodyButterUsage = [
  { icon: 'ti-droplet', label: 'Deep Moisturizer' },
  { icon: 'ti-massage', label: 'After-Shower Massage' },
];

const bodyButterStorage = ['Store in a cool, dry place.', 'Avoid direct sunlight to preserve texture.'];

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
    slug: 'vco-gift-set',
    sizeGroup: 'vco',
    category: 'Coconut Oil',
    name: 'Virgin Coconut Oil',
    optionLabel: 'Gift Set (3 Sizes)',
    tagline: 'All three sizes, one gift',
    scriptEyebrow: "one of earth's greatest gifts to mankind",
    price: 39.99,
    image: vcoJars,
    alt: 'Virgin Coconut Oil gift set with 125ml, 450ml, and 900ml glass jars',
    tags: ['Gift Set', 'Cold Pressed', 'Vegan & GF'],
    highlights: vcoHighlights,
    usageItems: vcoUsage,
    storage: vcoStorage,
  },
  {
    slug: 'syrup-300',
    sizeGroup: 'syrup',
    category: 'Coconut Syrup',
    name: 'Coconut Syrup',
    optionLabel: '300g',
    tagline: 'One of the most nutritious sugars',
    scriptEyebrow: 'one of the most nutritious sugars',
    price: 8.99,
    image: syrupJar,
    alt: 'Coconut Syrup jar',
    tags: ['Low GI: 35', 'Vegan & GF'],
    highlights: syrupHighlights,
    usageItems: syrupUsage,
    storage: syrupStorage,
  },
  {
    slug: 'syrup-600',
    sizeGroup: 'syrup',
    category: 'Coconut Syrup',
    name: 'Coconut Syrup',
    optionLabel: '600g',
    tagline: 'One of the most nutritious sugars',
    scriptEyebrow: 'one of the most nutritious sugars',
    price: 12.99,
    image: syrupJar,
    alt: 'Coconut Syrup jar',
    tags: ['Most Popular', 'Low GI: 35', 'Vegan & GF'],
    highlights: syrupHighlights,
    usageItems: syrupUsage,
    storage: syrupStorage,
  },
  {
    slug: 'syrup-1kg',
    sizeGroup: 'syrup',
    category: 'Coconut Syrup',
    name: 'Coconut Syrup',
    optionLabel: '1kg',
    tagline: 'One of the most nutritious sugars',
    scriptEyebrow: 'one of the most nutritious sugars',
    price: 19.99,
    image: syrupJar,
    alt: 'Coconut Syrup jar',
    tags: ['Family Size', 'Low GI: 35', 'Vegan & GF'],
    highlights: syrupHighlights,
    usageItems: syrupUsage,
    storage: syrupStorage,
  },
  {
    slug: 'coconut-sugar',
    sizeGroup: 'sugar',
    category: 'Coconut Syrup',
    name: 'Coconut Sugar',
    optionLabel: '350g',
    tagline: 'Natural, low-GI sweetener straight from the palm',
    scriptEyebrow: 'one of the most nutritious sugars',
    price: 9.99,
    image: coconutSugar,
    alt: 'Granulated coconut sugar in a jar',
    tags: ['Unrefined', 'Low GI', 'Vegan & GF'],
    highlights: sugarHighlights,
    usageItems: sugarUsage,
    storage: sugarStorage,
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
    tags: ['No SLS', 'No Preservatives', 'Handcrafted'],
    highlights: soapHighlights,
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
    tags: ['No SLS', 'No Preservatives', 'Handcrafted'],
    highlights: soapHighlights,
    usageItems: soapUsage,
    storage: soapStorage,
  },
  {
    slug: 'soap-value',
    sizeGroup: 'soap',
    category: 'Bath & Body',
    name: 'Coconut Oil Soap',
    optionLabel: 'Value Bar (150g)',
    tagline: 'Just Coconut Oil, Value Bar',
    scriptEyebrow: 'love yourself, love earth',
    price: 9.99,
    image: soapPlain,
    alt: 'Coconut Oil Soap - Value Bar, 150g',
    tags: ['No SLS', 'No Preservatives', 'Handcrafted'],
    highlights: soapHighlights,
    usageItems: soapUsage,
    storage: soapStorage,
  },
  {
    slug: 'body-butter',
    sizeGroup: 'bodycare',
    category: 'Bath & Body',
    name: 'Coconut Body Butter',
    optionLabel: '100g',
    tagline: 'Deep moisture for dry skin',
    scriptEyebrow: 'love yourself, love earth',
    price: 12.99,
    image: coconutBodyButter,
    alt: 'Whipped coconut body butter, scooped from an open jar',
    tags: ['Whipped', 'No Parabens', 'Vegan'],
    highlights: bodyButterHighlights,
    usageItems: bodyButterUsage,
    storage: bodyButterStorage,
  },
];

export const categories = ['Coconut Oil', 'Coconut Syrup', 'Bath & Body'];

export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug);
}

export function getSiblings(product) {
  return products.filter((p) => p.sizeGroup === product.sizeGroup);
}
