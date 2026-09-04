import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EyebrowLabel from '../components/EyebrowLabel.jsx';
import Button from '../components/Button.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Account() {
  const { customer, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/orders')
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
      <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '32px var(--gutter) 8px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>{customer.name}</h1>
            <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', margin: 0 }}>{customer.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={{ background: 'none', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '8px 14px', fontSize: 12, color: 'var(--color-secondary-text)', cursor: 'pointer' }}
          >
            Log out
          </button>
        </div>

        <div style={{ padding: '20px var(--gutter) 8px' }}>
          <Link to="/account/addresses" style={{ fontSize: 13, color: 'var(--color-accent)' }}>Saved addresses →</Link>
        </div>

        <div style={{ padding: '20px var(--gutter) 48px' }}>
          <EyebrowLabel>Order history</EyebrowLabel>

          {loading && (
            <p style={{ fontSize: 14, color: 'var(--color-secondary-text)' }}>Loading…</p>
          )}

          {!loading && error && (
            <p style={{ fontSize: 14, color: 'var(--color-secondary-text)' }}>Couldn't load your orders right now ({error}).</p>
          )}

          {!loading && !error && orders.length === 0 && (
            <div>
              <p style={{ fontSize: 14, color: 'var(--color-secondary-text)', margin: '0 0 16px' }}>You haven't placed an order yet.</p>
              <Button to="/shop">Shop the collection</Button>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div>
              {orders.map((order) => (
                <Link
                  key={order.order_number}
                  to={`/account/orders/${order.order_number}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 0',
                    borderBottom: '0.5px solid var(--color-border)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 2px' }}>{order.order_number}</p>
                    <p style={{ fontSize: 11, color: 'var(--color-secondary-text)', margin: 0 }}>
                      {new Date(order.created_at).toLocaleDateString()} · {order.status_label}
                    </p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>฿{order.total.toFixed(2)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
