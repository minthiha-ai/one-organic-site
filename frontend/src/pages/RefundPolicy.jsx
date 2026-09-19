import LegalPage from '../components/LegalPage.jsx';

export default function RefundPolicy() {
  return (
    <LegalPage eyebrow="Legal" title="Refund Policy" lastUpdated="September 20, 2026">
      <p>
        Refund requests are currently handled manually — there is no automated "request a
        refund" button in your account yet. To request a refund, email us at{' '}
        <a href="mailto:min@one-organic.com">min@one-organic.com</a> with your order number and
        the reason for your request.
      </p>

      <h2>Eligibility</h2>
      <p>
        We do not offer refunds for change of mind. Refunds and returns are only available for
        items that arrive damaged, defective, or incorrect, and must be requested within 7 days
        of delivery. Because these are food and cosmetic products, we can only accept returns on
        unopened, unused items — this does not apply to damaged or incorrect items, which are
        always eligible regardless of condition.
      </p>
      <p>
        Return shipping is covered by us when the item arrived damaged, defective, or incorrect.
      </p>

      <h2>Damaged or incorrect items</h2>
      <p>
        Email <a href="mailto:min@one-organic.com">min@one-organic.com</a> within 48 hours of
        delivery with your order number and a photo of the issue. We'll offer you either a
        replacement or a full refund, your choice.
      </p>

      <h2>How refunds are processed</h2>
      <p>
        <strong>For card payments</strong>: the refund is issued back to your original card via
        Xendit. This usually takes 7–14 business days, set by your card-issuing bank rather than
        by us — if 14 days pass with no sign of it, contact your bank directly with the
        transaction reference.
      </p>
      <p>
        <strong>For PromptPay and Cash on Delivery orders</strong>: refunds are paid by bank
        transfer to your account instead, since these payment methods can't be refunded back
        automatically.
      </p>

      <h2>Contact</h2>
      <p>
        One Organic (Thailand) Co., Ltd.
        <br />
        <a href="mailto:min@one-organic.com">min@one-organic.com</a>
      </p>
    </LegalPage>
  );
}
