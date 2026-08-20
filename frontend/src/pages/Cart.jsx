import CartLineItem from '../components/CartLineItem.jsx';
import Button from '../components/Button.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  return (
    <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
      <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        <div style={{ padding: '32px var(--gutter) 8px' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 600, margin: 0 }}>Your Cart</h1>
        </div>

        {items.length === 0 ? (
          <div style={{ padding: '32px var(--gutter)', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--color-secondary-text)', margin: '0 0 20px' }}>Your cart is empty.</p>
            <Button to="/shop">Shop the collection</Button>
          </div>
        ) : (
          <>
            <div style={{ padding: '8px var(--gutter)' }}>
              {items.map((item) => (
                <CartLineItem
                  key={item.variantId}
                  image={item.image}
                  alt={`${item.productName} — ${item.variantLabel}`}
                  name={item.productName}
                  variant={item.variantLabel}
                  qty={item.quantity}
                  price={(item.price * item.quantity).toFixed(2)}
                  onIncrement={() => updateQuantity(item.variantId, item.quantity + 1)}
                  onDecrement={() => updateQuantity(item.variantId, item.quantity - 1)}
                  onRemove={() => removeItem(item.variantId)}
                />
              ))}
            </div>

            <div style={{ padding: '20px var(--gutter) 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-text)', margin: '0 0 6px' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 500 }}>฿{subtotal.toFixed(2)}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '0 0 20px' }}>
                Shipping calculated at checkout.
              </p>
              <Button to="/checkout" block>Proceed to checkout</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
