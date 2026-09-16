// Remembers which email an order was placed under, per order number, so a
// guest can refresh the payment/confirmation page without re-entering it.
// sessionStorage only — never sent anywhere, never put in a URL.

const KEY_PREFIX = 'one_organic_order_email_';

export function loadOrderEmail(orderNumber) {
  try {
    return sessionStorage.getItem(KEY_PREFIX + orderNumber);
  } catch {
    return null;
  }
}

export function storeOrderEmail(orderNumber, email) {
  try {
    sessionStorage.setItem(KEY_PREFIX + orderNumber, email);
  } catch {
    // Private browsing / storage disabled — non-fatal, just won't survive a refresh.
  }
}
