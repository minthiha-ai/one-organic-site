import LegalPage from '../components/LegalPage.jsx';

export default function RefundPolicy() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund Policy"
      description="How refunds and returns work for One Organic products, including items bought through our Shopee store."
      path="/refund-policy"
      lastUpdated="September 30, 2026"
    >
      <p>
        Purchases are currently made through our official Shopee store, not directly on this
        site. Returns and refunds for those orders are handled through Shopee's own return and
        refund process — start a return from your Shopee order, or contact Shopee support
        directly. The payment and refund methods, timelines, and eligibility windows are set by
        Shopee, not by this document.
      </p>

      <h2>Product quality issues</h2>
      <p>
        If an item you bought through our Shopee store arrives damaged, defective, or incorrect,
        you're welcome to also email us at{' '}
        <a href="mailto:hello@one-organic.com">hello@one-organic.com</a> with your Shopee order
        number and a photo of the issue — we're happy to help alongside your Shopee return, but
        the actual return/refund is processed through Shopee.
      </p>

      <h2>Eligibility</h2>
      <p>
        We do not offer refunds for change of mind. Because these are food and cosmetic
        products, returns are only intended for items that arrive damaged, defective, or
        incorrect.
      </p>

      <h2>Contact</h2>
      <p>
        One Organic (Thailand) Co., Ltd.
        <br />
        <a href="mailto:hello@one-organic.com">hello@one-organic.com</a>
      </p>
    </LegalPage>
  );
}
