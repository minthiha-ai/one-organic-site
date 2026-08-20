import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import EyebrowLabel from '../components/EyebrowLabel.jsx';
import { FormField } from '../components/FormField.jsx';
import SummaryLine from '../components/SummaryLine.jsx';
import PaymentOption from '../components/PaymentOption.jsx';
import Button from '../components/Button.jsx';
import { api, ApiError } from '../lib/api.js';
import { useCart } from '../context/CartContext.jsx';

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
};

export default function Checkout() {
  const { items, subtotal, clear } = useCart();

  const [form, setForm] = useState(emptyForm);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [order, setOrder] = useState(null);

  function updateField(name) {
    return (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await api.post('/checkout', {
        items: items.map((item) => ({ product_variant_id: item.variantId, quantity: item.quantity })),
        guest_name: form.fullName,
        guest_email: form.email,
        guest_phone: form.phone,
        shipping: {
          recipient_name: form.fullName,
          phone: form.phone,
          line1: form.address,
          city: form.city,
          postal_code: form.postalCode,
          country: 'TH',
        },
        payment_method: paymentMethod,
      });

      clear();
      setOrder(result.data);
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = Object.values(err.errors)[0]?.[0];
        setErrorMessage(firstError ?? err.message);
      } else {
        setErrorMessage('Something went wrong placing your order.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (order) {
    return (
      <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto', padding: '64px var(--gutter)', textAlign: 'center' }}>
        <i className="ti ti-circle-check" style={{ fontSize: 40, color: 'var(--color-accent)' }} aria-hidden="true" />
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, margin: '16px 0 8px' }}>Order placed</h1>
        <p style={{ fontSize: 14, color: 'var(--color-secondary-text)', margin: '0 0 4px' }}>
          Order number <strong style={{ color: 'var(--color-text)' }}>{order.order_number}</strong>
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', margin: '0 0 28px' }}>
          A confirmation has been sent to {order.guest_email}. Total: ฿{order.total.toFixed(2)}.
        </p>
        <Button to="/shop">Continue shopping</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '32px var(--gutter) 8px' }}>
        <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 600, margin: 0 }}>Checkout</h1>
        </div>
      </div>

      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '16px var(--gutter) 8px' }}>
        <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
          <EyebrowLabel>Contact &amp; shipping</EyebrowLabel>
          <FormField label="Full name" name="fullName" value={form.fullName} onChange={updateField('fullName')} placeholder="Jane Doe" required />
          <FormField label="Email" name="email" type="email" value={form.email} onChange={updateField('email')} placeholder="jane@example.com" required />
          <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={updateField('phone')} placeholder="+66 XX XXX XXXX" required />
          <FormField label="Address" name="address" value={form.address} onChange={updateField('address')} placeholder="Street address" required />
          <div style={{ display: 'flex', gap: 12, margin: '0 0 12px' }}>
            <FormField label="City" name="city" value={form.city} onChange={updateField('city')} placeholder="Bangkok" style={{ flex: 1 }} required />
            <FormField label="Postal code" name="postalCode" value={form.postalCode} onChange={updateField('postalCode')} placeholder="10110" style={{ flex: 1 }} required />
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 'var(--page-max-width)',
          margin: '24px auto',
          background: 'var(--color-tint)',
          border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px var(--gutter)',
        }}
      >
        <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
          <EyebrowLabel>Order summary</EyebrowLabel>
          {items.map((item) => (
            <SummaryLine
              key={item.variantId}
              label={`${item.productName} — ${item.variantLabel} × ${item.quantity}`}
              price={(item.price * item.quantity).toFixed(2)}
            />
          ))}
          <div style={{ borderTop: '0.5px solid var(--color-border)', marginTop: 8, paddingTop: 12 }}>
            <SummaryLine label="Subtotal" price={subtotal.toFixed(2)} size={13} />
            <SummaryLine label="Shipping" price="0.00" size={13} />
            <SummaryLine label="Total" price={subtotal.toFixed(2)} size={15} weight={600} color="var(--color-text)" style={{ marginTop: 8, marginBottom: 0 }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '24px var(--gutter) 8px' }}>
        <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
          <EyebrowLabel>Payment method</EyebrowLabel>
          <PaymentOption
            icon="ti-credit-card"
            label="Credit / Debit Card"
            value="card"
            checked={paymentMethod === 'card'}
            onChange={() => setPaymentMethod('card')}
          />
          <PaymentOption
            icon="ti-cash"
            label="Cash on Delivery"
            value="cod"
            checked={paymentMethod === 'cod'}
            onChange={() => setPaymentMethod('cod')}
          />
          <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '4px 0 0' }}>
            Online payment isn&rsquo;t wired up yet — orders are recorded as pending and Stephen will follow up to arrange payment.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 var(--gutter) 8px' }}>
          <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
            <p style={{ fontSize: 12, color: 'var(--color-accent)', margin: 0 }}>{errorMessage}</p>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '16px var(--gutter) 32px' }}>
        <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
          <Button type="submit" block disabled={submitting}>
            {submitting ? 'Placing order…' : 'Place order'}
          </Button>
        </div>
      </div>
    </form>
  );
}
