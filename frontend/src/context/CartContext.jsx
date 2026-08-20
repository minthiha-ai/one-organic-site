import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'one_organic_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // `variant` is a ProductVariantResource payload from the API; `product`
  // supplies the parent name + slug for display/linking, since the variant
  // resource alone doesn't carry either.
  function addItem(product, variant, quantity = 1) {
    setItems((current) => {
      const existing = current.find((item) => item.variantId === variant.id);

      if (existing) {
        return current.map((item) =>
          item.variantId === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...current,
        {
          variantId: variant.id,
          productName: product.name,
          productSlug: product.slug,
          variantLabel: variant.option_label,
          sku: variant.sku,
          image: variant.image_url,
          price: variant.price,
          quantity,
        },
      ];
    });
  }

  function updateQuantity(variantId, quantity) {
    if (quantity < 1) {
      removeItem(variantId);
      return;
    }
    setItems((current) =>
      current.map((item) => (item.variantId === variantId ? { ...item, quantity } : item))
    );
  }

  function removeItem(variantId) {
    setItems((current) => current.filter((item) => item.variantId !== variantId));
  }

  function clear() {
    setItems([]);
  }

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const value = { items, addItem, updateQuantity, removeItem, clear, subtotal, count };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
