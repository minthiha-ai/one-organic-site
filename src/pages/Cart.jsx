import CartLineItem from '../components/CartLineItem.jsx';
import Button from '../components/Button.jsx';
import { vco450, syrupJar, soapPlain } from '../assets/images/index.js';

export default function Cart() {
  return (
    <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
      <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        <div style={{ padding: '32px var(--gutter) 8px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600, margin: 0 }}>Your Cart</h1>
        </div>

        <div style={{ padding: '8px var(--gutter)' }}>
          <CartLineItem
            image={vco450}
            alt="Virgin Coconut Oil, 450ml jar"
            name="Virgin Coconut Oil"
            variant="450ml"
            qty={1}
            price="14.99"
          />
          <CartLineItem
            image={syrupJar}
            alt="Coconut Syrup jar"
            name="Coconut Syrup"
            variant="600g"
            qty={1}
            price="12.99"
          />
          <CartLineItem
            image={soapPlain}
            alt="Coconut Oil Soap - Just Coconut Oil"
            name="Coconut Oil Soap"
            variant="Just Coconut Oil · 100g"
            qty={2}
            price="13.98"
          />
        </div>

        <div style={{ padding: '20px var(--gutter) 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-text)', margin: '0 0 6px' }}>
            <span>Subtotal</span>
            <span style={{ fontWeight: 500 }}>$41.96</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '0 0 20px' }}>
            Shipping and taxes calculated at checkout.
          </p>
          <Button to="/checkout" block>Proceed to checkout</Button>
        </div>
      </div>
    </div>
  );
}
