import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import EyebrowLabel from '../components/EyebrowLabel.jsx';
import { FormField } from '../components/FormField.jsx';
import SummaryLine from '../components/SummaryLine.jsx';
import PaymentOption from '../components/PaymentOption.jsx';
import Button from '../components/Button.jsx';
import { api, ApiError } from '../lib/api.js';
import { storeOrderEmail } from '../lib/orderSession.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
};

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const { isAuthenticated, customer } = useAuth();

  const [form, setForm] = useState(() =>
    customer
      ? { ...emptyForm, fullName: customer.name, email: customer.email, phone: customer.phone ?? '' }
      : emptyForm
  );
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null); // null = enter address manually

  // Real interim flat rate (Phase 0.5.5) — was hardcoded "0.00" here while
  // the actual charge already included a real shipping fee, so the
  // customer's pre-payment total silently understated what they'd pay.
  const [shippingRate, setShippingRate] = useState(null);

  useEffect(() => {
    api
      .get('/shipping-rate')
      .then((res) => setShippingRate(res.data.rate))
      .catch((err) => {
        // Left null — the summary just omits the shipping line rather than
        // guessing a number; the actual charge is still correct either way
        // since that comes from the server at order-creation time.
        console.error('Failed to load shipping rate:', err);
      });
  }, []);

  // `navigate()` updates window.location synchronously, but React Router's
  // own matched-route state lags a render behind — so Checkout can render
  // one more time (cart already cleared, route still "us") before the swap
  // to /order/:orderNumber commits. Without this, that extra render hits
  // the empty-cart guard below and clobbers the pending navigation with a
  // replace to /cart. Confirmed live: real orders were created but every
  // customer landed on an empty cart with no confirmation.
  const orderPlacedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .get('/addresses')
      .then((res) => {
        setAddresses(res.data);
        const defaultAddress = res.data.find((a) => a.is_default) ?? res.data[0];
        if (defaultAddress) setSelectedAddressId(defaultAddress.id);
      })
      .catch((err) => {
        // Non-fatal — checkout still works with manual address entry.
        console.error('Failed to load saved addresses:', err);
      });
  }, [isAuthenticated]);

  function updateField(name) {
    return (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const usingSavedAddress = isAuthenticated && selectedAddressId != null;

      const result = await api.post('/checkout', {
        items: items.map((item) => ({ product_variant_id: item.variantId, quantity: item.quantity })),
        guest_name: form.fullName,
        guest_email: form.email,
        guest_phone: form.phone,
        ...(usingSavedAddress
          ? { address_id: selectedAddressId }
          : {
              shipping: {
                recipient_name: form.fullName,
                phone: form.phone,
                line1: form.address,
                city: form.city,
                postal_code: form.postalCode,
                country: 'TH',
              },
            }),
        payment_method: paymentMethod,
      });

      const placedOrder = result.data;
      storeOrderEmail(placedOrder.order_number, placedOrder.guest_email);
      orderPlacedRef.current = true;
      navigate(`/order/${placedOrder.order_number}`);
      clear();
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

  if (items.length === 0 && !orderPlacedRef.current) {
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

          {addresses.length > 0 && (
            <div style={{ margin: '0 0 16px' }}>
              {addresses.map((address) => (
                <label key={address.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--color-text)', margin: '0 0 8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="shippingAddress"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                    style={{ marginTop: 3 }}
                  />
                  <span>
                    <strong>{address.label || address.recipient_name}</strong>
                    <br />
                    <span style={{ fontSize: 12, color: 'var(--color-secondary-text)' }}>
                      {address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city} {address.postal_code}
                    </span>
                  </span>
                </label>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text)', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="shippingAddress"
                  checked={selectedAddressId === null}
                  onChange={() => setSelectedAddressId(null)}
                />
                Enter a new address
              </label>
            </div>
          )}

          {(addresses.length === 0 || selectedAddressId === null) && (
            <>
              <FormField label="Address" name="address" value={form.address} onChange={updateField('address')} placeholder="Street address" required />
              <div style={{ display: 'flex', gap: 12, margin: '0 0 12px' }}>
                <FormField label="City" name="city" value={form.city} onChange={updateField('city')} placeholder="Bangkok" style={{ flex: 1 }} required />
                <FormField label="Postal code" name="postalCode" value={form.postalCode} onChange={updateField('postalCode')} placeholder="10110" style={{ flex: 1 }} required />
              </div>
            </>
          )}
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
            <SummaryLine label="Shipping (estimated)" price={shippingRate != null ? shippingRate.toFixed(2) : '—'} size={13} />
            <SummaryLine
              label="Total"
              price={(subtotal + (shippingRate ?? 0)).toFixed(2)}
              size={15}
              weight={600}
              color="var(--color-text)"
              style={{ marginTop: 8, marginBottom: 0 }}
            />
          </div>
          <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '8px 0 0' }}>
            Final shipping is calculated from your delivery address when you place the order — the total you're charged may differ slightly from this estimate.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '24px var(--gutter) 8px' }}>
        <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
          <EyebrowLabel>Payment method</EyebrowLabel>
          <PaymentOption
            icon="ti-credit-card"
            label="Pay online now (Card or PromptPay)"
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
            {paymentMethod === 'card'
              ? "You'll choose between card and PromptPay on the next page."
              : 'Your order will be marked pending — no payment is collected online for Cash on Delivery.'}
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
          <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '10px 0 0', textAlign: 'center' }}>
            By placing this order you agree to our{' '}
            <Link to="/terms-of-service" style={{ color: 'inherit' }}>Terms of Service</Link> and{' '}
            <Link to="/refund-policy" style={{ color: 'inherit' }}>Refund Policy</Link>.
          </p>
        </div>
      </div>
    </form>
  );
}
