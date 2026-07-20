import CertStrip from '../components/CertStrip.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import EyebrowLabel from '../components/EyebrowLabel.jsx';
import ScriptText from '../components/ScriptText.jsx';
import PillTag from '../components/PillTag.jsx';
import IconChip from '../components/IconChip.jsx';
import SizeOption from '../components/SizeOption.jsx';
import Button from '../components/Button.jsx';
import { vco450 } from '../assets/images/index.js';

const highlights = [
  'Low Moisture & High Purity',
  'Fast Absorption Into Skin',
  'High MC',
  'High Lauric Acid',
  'Cold Pressed',
  'Centrifuge Extraction',
  'Gluten Free',
  'Vegan',
];

const usageItems = [
  { icon: 'ti-flame', label: 'Healthy Cooking Oil' },
  { icon: 'ti-droplet', label: 'Skin & Hair Moisturizer' },
  { icon: 'ti-leaf', label: 'Keto Diet Essential' },
  { icon: 'ti-massage', label: 'Massage Oil' },
  { icon: 'ti-sparkles', label: 'Make Up Remover' },
  { icon: 'ti-dental', label: 'Oil Pulling For Oral Health' },
];

export default function ProductDetail() {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: '32px 24px' }}>
        <div style={{ flex: '0 0 220px' }}>
          <img
            src={vco450}
            alt="Virgin Coconut Oil, 450ml glass jar"
            style={{ width: '100%', display: 'block', borderRadius: 4 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <ScriptText size={18} style={{ margin: '0 0 4px' }}>one of earth's greatest gifts to mankind</ScriptText>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 23, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.25 }}>
            Virgin Coconut Oil
          </h1>
          <p style={{ fontSize: 19, fontWeight: 500, color: 'var(--color-text)', margin: '0 0 18px' }}>$14.99</p>

          <EyebrowLabel style={{ margin: '0 0 8px' }}>Size</EyebrowLabel>
          <div style={{ display: 'flex', gap: 8, margin: '0 0 22px' }}>
            <SizeOption label="125ml" />
            <SizeOption label="450ml" selected />
            <SizeOption label="900ml" />
          </div>

          <Button to="/cart">Add to cart</Button>
        </div>
      </div>

      <CertStrip showRecycle={false} />

      <div style={{ padding: '32px 24px 0' }}>
        <SectionHeading style={{ margin: '0 0 16px' }}>Highlights</SectionHeading>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {highlights.map((h) => (
            <PillTag key={h}>{h}</PillTag>
          ))}
        </div>
      </div>

      <div style={{ padding: '28px 24px 0' }}>
        <SectionHeading style={{ margin: '0 0 16px' }}>Ways to use</SectionHeading>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {usageItems.map(({ icon, label }) => (
            <IconChip key={label} icon={icon}>
              {label}
            </IconChip>
          ))}
        </div>
      </div>

      <div style={{ padding: '28px 24px 32px' }}>
        <SectionHeading style={{ margin: '0 0 12px' }}>Storage</SectionHeading>
        <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', lineHeight: 1.7, margin: 0 }}>
          Store in a cool, dry place.
          <br />
          Store away from sunlight.
        </p>
      </div>
    </>
  );
}
