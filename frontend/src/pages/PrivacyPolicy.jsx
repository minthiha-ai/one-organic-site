import LegalPage from '../components/LegalPage.jsx';

export default function PrivacyPolicy() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" lastUpdated="September 20, 2026">
      <p>
        One Organic (Thailand) Co., Ltd. ("One Organic," "we," "us") operates one-organic.com.
        This policy explains what personal information we collect, why, and what we do with it.
      </p>

      <h2>Information we collect</h2>
      <p>
        <strong>When you place an order</strong> (with or without an account): your name, email
        address, phone number, and delivery address (recipient name, phone, address, city,
        state/province, postal code, country).
      </p>
      <p>
        <strong>If you create an account</strong>: your name, email address, phone number, and a
        password (stored encrypted — we never see or store your password in plain text). You may
        also save one or more delivery addresses to your account.
      </p>
      <p>
        <strong>If you contact us</strong> through the contact form: your name, email address,
        and the message you send. This is emailed directly to our team — we do not keep a
        separate stored copy of contact form submissions beyond that email.
      </p>
      <p>
        <strong>Payment information</strong>: when you pay by card or PromptPay, your payment
        details are collected directly by Xendit, our payment processor, through their own
        secure payment form — your card number never passes through or is stored on our servers.
        We keep a record of which payment method you used, the payment status, and a payment
        reference number, but never your full card details.
      </p>
      <p>
        <strong>What we do not collect</strong>: we do not use cookies, and we do not run any
        analytics or advertising tracking (e.g. Google Analytics, Facebook Pixel) on the site.
      </p>
      <p>
        <strong>Browser storage</strong>: if you're logged in, your session is kept in your
        browser's local storage so you don't have to log in on every visit. If you check out as
        a guest, we briefly remember which email address you used for that specific order in
        your browser (not on our servers) so you can safely refresh the order confirmation page.
        Neither of these is shared with us or anyone else.
      </p>

      <h2>Who we share your information with</h2>
      <ul>
        <li>
          <strong>Xendit</strong> (payment processing) — receives your payment details directly
          to process card and PromptPay payments.
        </li>
        <li>
          <strong>SHIPPOP, and the courier they route your delivery through</strong> (currently
          Kerry Express) — receives your name, phone number, and delivery address to generate a
          shipping label and deliver your order.
        </li>
        <li>
          <strong>Our email service provider</strong> — used to send order confirmations and
          respond to messages you send us.
        </li>
      </ul>
      <p>We do not sell or rent your personal information to third parties for marketing purposes.</p>

      <h2>How long we keep your information</h2>
      <p>
        We keep order records, account data, and contact-form correspondence for 5 years from
        the order date, in line with Thai tax record-keeping requirements.
      </p>

      <h2>Your rights</h2>
      <p>
        Under Thailand's Personal Data Protection Act (PDPA), you have the right to access,
        correct, or request deletion of your personal information, and to withdraw consent where
        applicable. To exercise any of these rights, contact us at{' '}
        <a href="mailto:min@one-organic.com">min@one-organic.com</a>.
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
