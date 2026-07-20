import EyebrowLabel from '../components/EyebrowLabel.jsx';
import { FormField } from '../components/FormField.jsx';
import SummaryLine from '../components/SummaryLine.jsx';
import PaymentOption from '../components/PaymentOption.jsx';
import Button from '../components/Button.jsx';

export default function Checkout() {
  return (
    <>
      <div style={{ padding: '32px 24px 8px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600, margin: 0 }}>Checkout</h1>
      </div>

      <div style={{ padding: '16px 24px 8px' }}>
        <EyebrowLabel>Contact &amp; shipping</EyebrowLabel>
        <FormField label="Full name" placeholder="Jane Doe" />
        <FormField label="Email" type="email" placeholder="jane@example.com" />
        <FormField label="Phone" type="tel" placeholder="+66 XX XXX XXXX" />
        <FormField label="Address" placeholder="Street address" />
        <div style={{ display: 'flex', gap: 12, margin: '0 0 12px' }}>
          <FormField label="City" placeholder="Bangkok" style={{ flex: 1 }} />
          <FormField label="Postal code" placeholder="10110" style={{ flex: 1 }} />
        </div>
      </div>

      <div
        style={{
          padding: '24px 24px',
          background: 'var(--color-tint)',
          borderTop: '0.5px solid var(--color-border)',
          borderBottom: '0.5px solid var(--color-border)',
        }}
      >
        <EyebrowLabel>Order summary</EyebrowLabel>
        <SummaryLine label="Virgin Coconut Oil — 450ml × 1" price="14.99" />
        <SummaryLine label="Coconut Syrup — 600g × 1" price="12.99" />
        <SummaryLine label="Coconut Oil Soap — Just Coconut Oil × 2" price="13.98" />
        <div style={{ borderTop: '0.5px solid var(--color-border)', marginTop: 8, paddingTop: 12 }}>
          <SummaryLine label="Subtotal" price="41.96" size={13} />
          <SummaryLine label="Shipping" price="4.00" size={13} />
          <SummaryLine label="Total" price="45.96" size={15} weight={600} color="var(--color-text)" style={{ marginTop: 8, marginBottom: 0 }} />
        </div>
      </div>

      <div style={{ padding: '24px 24px 8px' }}>
        <EyebrowLabel>Payment method</EyebrowLabel>
        <PaymentOption icon="ti-credit-card" label="Credit / Debit Card" checked />
        <PaymentOption icon="ti-cash" label="Cash on Delivery" />
      </div>

      <div style={{ padding: '16px 24px 32px' }}>
        <Button to="#" block>Place order</Button>
      </div>
    </>
  );
}
