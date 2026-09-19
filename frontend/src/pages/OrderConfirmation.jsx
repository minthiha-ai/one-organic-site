import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { XenditComponents } from 'xendit-components-web';
import EyebrowLabel from '../components/EyebrowLabel.jsx';
import { FormField } from '../components/FormField.jsx';
import Button from '../components/Button.jsx';
import PaymentOption from '../components/PaymentOption.jsx';
import { api, ApiError } from '../lib/api.js';
import { loadOrderEmail, storeOrderEmail } from '../lib/orderSession.js';

const POLL_INTERVAL_MS = 4000;

export default function OrderConfirmation() {
  const { orderNumber } = useParams();

  const [email, setEmail] = useState(() => loadOrderEmail(orderNumber) ?? '');
  const [emailInput, setEmailInput] = useState('');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [method, setMethod] = useState('promptpay');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  // The Components SDK can tell us a session died (expired/canceled) before
  // our backend knows — that only arrives via webhook/reconciliation. Track
  // it locally so the dead form doesn't linger under the error message
  // while waiting for a server round-trip to catch up.
  const [cardSessionDismissed, setCardSessionDismissed] = useState(false);

  const pollRef = useRef(null);
  const cardMountRef = useRef(null);
  const componentsRef = useRef(null);

  const fetchStatus = useCallback(
    (silent = false) => {
      if (!email) return;
      if (!silent) setLoading(true);
      api
        .post(`/orders/${orderNumber}/payment-status`, { email })
        .then((res) => {
          setOrder(res.data);
          setNotFound(false);
        })
        .catch((err) => {
          if (err instanceof ApiError && err.status === 422) {
            setNotFound(true);
          }
        })
        .finally(() => {
          if (!silent) setLoading(false);
        });
    },
    [orderNumber, email]
  );

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Poll for payment confirmation while something's actually pending —
  // stops itself once paid, or once there's nothing to wait on.
  useEffect(() => {
    const isPending = order?.status === 'pending' && order?.latest_payment?.status === 'pending';

    if (!isPending) {
      clearInterval(pollRef.current);
      return;
    }

    pollRef.current = setInterval(() => fetchStatus(true), POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [order, fetchStatus]);

  useEffect(() => {
    const qrString = order?.latest_payment?.method === 'promptpay' ? order.latest_payment.qr_string : null;
    if (!qrString) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(qrString, { width: 240, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [order]);

  // Mount Xendit's Components SDK once a card session exists — card details
  // are collected entirely inside Xendit's own hosted fields, never touching
  // our JS. Re-mounts if the session changes (e.g. after a retry).
  useEffect(() => {
    const payment = order?.latest_payment;
    const sdkKey = payment?.method === 'card' && payment.status === 'pending' ? payment.components_sdk_key : null;

    if (!sdkKey || !cardMountRef.current) {
      componentsRef.current = null;
      return;
    }

    setCardSessionDismissed(false);

    const components = new XenditComponents({ componentsSdkKey: sdkKey });
    componentsRef.current = components;

    // The SDK loads session data asynchronously — calling getActiveChannels/
    // createChannelComponent before "init" fires throws ("session data is
    // not loaded"), confirmed live.
    function onInit() {
      const cardsChannel = components.getActiveChannels({ filter: 'CARDS' })[0];
      if (cardsChannel && cardMountRef.current) {
        cardMountRef.current.replaceChildren(components.createChannelComponent(cardsChannel));
      }
    }
    function onComplete() {
      fetchStatus();
    }
    function onExpiredOrCanceled() {
      setErrorMessage('That payment session expired or was canceled. Start again below.');
      setCardSessionDismissed(true);
      fetchStatus();
    }
    function onFatalError() {
      setErrorMessage('Something went wrong with the payment form. Please try again.');
      setCardSessionDismissed(true);
    }

    components.addEventListener('init', onInit);
    components.addEventListener('session-complete', onComplete);
    components.addEventListener('session-expired-or-canceled', onExpiredOrCanceled);
    components.addEventListener('fatal-error', onFatalError);

    return () => {
      components.removeEventListener('init', onInit);
      components.removeEventListener('session-complete', onComplete);
      components.removeEventListener('session-expired-or-canceled', onExpiredOrCanceled);
      components.removeEventListener('fatal-error', onFatalError);
      componentsRef.current = null;
    };
  }, [order, fetchStatus]);

  function handleEmailSubmit(e) {
    e.preventDefault();
    storeOrderEmail(orderNumber, emailInput);
    setEmail(emailInput);
  }

  async function handleCreateQr() {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await api.post(`/orders/${orderNumber}/payments/promptpay`, { email });
      fetchStatus();
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? Object.values(err.errors)[0]?.[0] ?? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStartCard() {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await api.post(`/orders/${orderNumber}/payments/card`, { email });
      fetchStatus();
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? Object.values(err.errors)[0]?.[0] ?? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCardPay() {
    setErrorMessage(null);
    componentsRef.current?.submit();
  }

  if (!email) {
    return (
      <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto', padding: '64px var(--gutter)' }}>
        <EyebrowLabel>Order {orderNumber}</EyebrowLabel>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, margin: '0 0 16px' }}>
          Enter your email to view this order
        </h1>
        <form onSubmit={handleEmailSubmit}>
          <FormField
            label="Email"
            name="email"
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="jane@example.com"
            required
          />
          <Button type="submit">Continue</Button>
        </form>
      </div>
    );
  }

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
        <p style={{ fontSize: 14, color: 'var(--color-secondary-text)', margin: '0 0 16px' }}>
          No order found with that number and email.
        </p>
        <Link to="/shop" style={{ fontSize: 13, color: 'var(--color-accent)' }}>Back to shop</Link>
      </div>
    );
  }

  const payment = order.latest_payment;
  const isPaid = order.status === 'paid';
  const isCod = order.payment_method === 'cod';
  const isExpiredQr = payment?.method === 'promptpay' && payment.status === 'pending' && payment.expires_at && new Date(payment.expires_at) < new Date();
  const isExpiredCard = payment?.method === 'card' && payment.status === 'pending' && payment.expires_at && new Date(payment.expires_at) < new Date();
  const lastAttemptFailed = payment?.status === 'failed';

  return (
    <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto', padding: '64px var(--gutter)' }}>
      <EyebrowLabel>Order {order.order_number}</EyebrowLabel>

      {isPaid ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <i className="ti ti-circle-check" style={{ fontSize: 40, color: 'var(--color-accent)' }} aria-hidden="true" />
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, margin: '16px 0 8px' }}>Payment received</h1>
          <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', margin: '0 0 28px' }}>
            Total: ฿{order.total.toFixed(2)}. A confirmation has been sent to {order.guest_email}.
          </p>
          <Button to="/shop">Continue shopping</Button>
        </div>
      ) : isCod ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <i className="ti ti-truck-delivery" style={{ fontSize: 40, color: 'var(--color-accent)' }} aria-hidden="true" />
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, margin: '16px 0 8px' }}>Order placed</h1>
          <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', margin: '0 0 28px' }}>
            Total: ฿{order.total.toFixed(2)}, payable in cash when your order is delivered. A confirmation has been sent to{' '}
            {order.guest_email}.
          </p>
          <Button to="/shop">Continue shopping</Button>
        </div>
      ) : (
        <>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>
            Complete your payment
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', margin: '0 0 24px' }}>
            Total: ฿{order.total.toFixed(2)}
          </p>

          <PaymentOption
            icon="ti-qrcode"
            label="PromptPay QR"
            value="promptpay"
            checked={method === 'promptpay'}
            onChange={() => setMethod('promptpay')}
          />
          <PaymentOption
            icon="ti-credit-card"
            label="Credit / Debit Card"
            value="card"
            checked={method === 'card'}
            onChange={() => setMethod('card')}
          />

          {method === 'promptpay' && (
            <div style={{ margin: '20px 0', textAlign: 'center' }}>
              {payment?.method === 'promptpay' && payment.status === 'pending' && !isExpiredQr ? (
                <>
                  {qrDataUrl && <img src={qrDataUrl} alt="PromptPay QR code" width={240} height={240} />}
                  <p style={{ fontSize: 12, color: 'var(--color-secondary-text)', margin: '12px 0 0' }}>
                    Scan with your banking app to pay. Waiting for confirmation…
                  </p>
                </>
              ) : (
                <>
                  {isExpiredQr && (
                    <p style={{ fontSize: 12, color: 'var(--color-accent)', margin: '0 0 12px' }}>
                      That QR code expired. Generate a new one below.
                    </p>
                  )}
                  {payment?.method === 'promptpay' && lastAttemptFailed && (
                    <p style={{ fontSize: 12, color: 'var(--color-accent)', margin: '0 0 12px' }}>
                      That attempt didn't go through. Please try again.
                    </p>
                  )}
                  <Button onClick={handleCreateQr} disabled={submitting} block>
                    {submitting ? 'Generating…' : 'Generate QR code'}
                  </Button>
                </>
              )}
            </div>
          )}

          {method === 'card' && (
            <div style={{ margin: '20px 0' }}>
              {payment?.method === 'card' && payment.status === 'pending' && !isExpiredCard && !cardSessionDismissed ? (
                <>
                  <div ref={cardMountRef} style={{ minHeight: 60, margin: '0 0 16px' }} />
                  <Button onClick={handleCardPay} block>
                    {`Pay ฿${order.total.toFixed(2)}`}
                  </Button>
                </>
              ) : (
                <>
                  {isExpiredCard && (
                    <p style={{ fontSize: 12, color: 'var(--color-accent)', margin: '0 0 12px' }}>
                      That session expired. Start again below.
                    </p>
                  )}
                  {payment?.method === 'card' && lastAttemptFailed && (
                    <p style={{ fontSize: 12, color: 'var(--color-accent)', margin: '0 0 12px' }}>
                      That payment attempt didn't go through. Please try again.
                    </p>
                  )}
                  <Button onClick={handleStartCard} disabled={submitting} block>
                    {submitting ? 'Loading…' : 'Continue to card details'}
                  </Button>
                </>
              )}
            </div>
          )}

          {errorMessage && (
            <p style={{ fontSize: 12, color: 'var(--color-accent)', margin: '12px 0 0' }}>{errorMessage}</p>
          )}
        </>
      )}
    </div>
  );
}
