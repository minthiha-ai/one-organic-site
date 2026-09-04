import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import EyebrowLabel from '../components/EyebrowLabel.jsx';
import SummaryLine from '../components/SummaryLine.jsx';
import { api, ApiError } from '../lib/api.js';

export default function OrderDetail() {
  const { orderNumber } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api
      .get(`/orders/${orderNumber}`)
      .then((res) => setOrder(res.data))
      .catch((err) => {
        // Treat "not yours" and "doesn't exist" identically — don't leak
        // which one it is.
        if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '64px var(--gutter)', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--color-secondary-text)' }}>Loading…</p>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '64px var(--gutter)', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--color-secondary-text)', margin: '0 0 16px' }}>Order not found.</p>
        <Link to="/account" style={{ fontSize: 13, color: 'var(--color-accent)' }}>Back to your orders</Link>
      </div>
    );
  }

  const s = order.shipping;

  return (
    <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
      <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        <div style={{ padding: '32px var(--gutter) 8px' }}>
          <Link to="/account" style={{ fontSize: 12, color: 'var(--color-secondary-text)' }}>← Your orders</Link>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, margin: '10px 0 4px' }}>{order.order_number}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', margin: 0 }}>
            {new Date(order.created_at).toLocaleDateString()} · {order.status_label}
          </p>
        </div>

        <div style={{ padding: '24px var(--gutter) 8px' }}>
          <EyebrowLabel>Items</EyebrowLabel>
          {order.items.map((item) => (
            <SummaryLine
              key={item.id}
              label={`${item.product_name} — ${item.variant_label} × ${item.quantity}`}
              price={item.line_total.toFixed(2)}
            />
          ))}
          <div style={{ borderTop: '0.5px solid var(--color-border)', marginTop: 8, paddingTop: 12 }}>
            <SummaryLine label="Subtotal" price={order.subtotal.toFixed(2)} size={13} />
            <SummaryLine label="Shipping" price={order.shipping_cost.toFixed(2)} size={13} />
            {order.discount_total > 0 && (
              <SummaryLine label="Discount" price={`-${order.discount_total.toFixed(2)}`} size={13} />
            )}
            <SummaryLine label="Total" price={order.total.toFixed(2)} size={15} weight={600} color="var(--color-text)" style={{ marginTop: 8, marginBottom: 0 }} />
          </div>
        </div>

        {s && (
          <div style={{ padding: '24px var(--gutter) 48px' }}>
            <EyebrowLabel>Shipping to</EyebrowLabel>
            <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.7, margin: 0 }}>
              {s.recipient_name}<br />
              {s.line1}{s.line2 ? `, ${s.line2}` : ''}<br />
              {s.city}{s.state ? `, ${s.state}` : ''} {s.postal_code}<br />
              {s.phone}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
