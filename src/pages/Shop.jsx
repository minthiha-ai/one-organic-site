import ProductCard from '../components/ProductCard.jsx';
import EyebrowLabel from '../components/EyebrowLabel.jsx';
import ScriptText from '../components/ScriptText.jsx';
import { vcoJars, syrupJar, soapPlain, soapCastor } from '../assets/images/index.js';

export default function Shop() {
  return (
    <>
      <div style={{ padding: '32px 24px 8px' }}>
        <ScriptText size={20} style={{ margin: '0 0 4px' }}>the collection</ScriptText>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600, margin: 0 }}>Shop</h1>
      </div>

      <div style={{ padding: '24px 24px 8px' }}>
        <EyebrowLabel>Coconut Oil</EyebrowLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <ProductCard
            image={vcoJars}
            alt="Virgin Coconut Oil jars"
            name="Virgin Coconut Oil"
            tagline="Earth's greatest gift to mankind"
            tags={['Cold Pressed', 'High Lauric Acid', 'Vegan & GF']}
            to="/product/virgin-coconut-oil"
          />
        </div>
      </div>

      <div style={{ padding: '24px 24px 8px' }}>
        <EyebrowLabel>Coconut Syrup</EyebrowLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <ProductCard
            image={syrupJar}
            alt="Coconut Syrup jar"
            name="Coconut Syrup"
            tagline="One of the most nutritious sugars"
            tags={['Low GI: 35', 'High in Minerals', 'Vegan & GF']}
            to="#"
          />
        </div>
      </div>

      <div style={{ padding: '24px 24px 32px' }}>
        <EyebrowLabel>Bath &amp; Body</EyebrowLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <ProductCard
            image={soapPlain}
            alt="Coconut Oil Soap - Just Coconut Oil"
            name="Coconut Oil Soap"
            tagline="Just Coconut Oil"
            tags={['No SLS', 'No Preservatives', 'Handcrafted']}
            to="#"
          />
          <ProductCard
            image={soapCastor}
            alt="Coconut Oil Soap - With Castor Oil"
            name="Coconut Oil Soap"
            tagline="With Castor Oil"
            tags={['No SLS', 'No Preservatives', 'Handcrafted']}
            to="#"
          />
        </div>
      </div>
    </>
  );
}
