import LegalPage from '../components/LegalPage.jsx';

export default function PrivacyPolicy() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" lastUpdated="September 30, 2026">
      <p>
        One Organic (Thailand) Co., Ltd. ("One Organic," "we," "us") operates one-organic.com.
        This policy explains what personal information we collect, why, and what we do with it.
      </p>

      <h2>Information we collect</h2>
      <p>
        <strong>Purchases</strong>: purchases are made through our official Shopee store, not
        directly on this site. Shopee collects and processes your order, payment, and delivery
        information as part of that purchase, under its own privacy policy — we do not receive
        or store your payment details, and we don't collect delivery information ourselves for
        Shopee orders.
      </p>
      <p>
        <strong>If you create an account</strong> on this site: your name, email address, phone
        number, and a password (stored encrypted — we never see or store your password in plain
        text). You may also save one or more delivery addresses to your account.
      </p>
      <p>
        <strong>If you contact us</strong> through the contact form: your name, email address,
        and the message you send. This is emailed directly to our team — we do not keep a
        separate stored copy of contact form submissions beyond that email.
      </p>
      <p>
        <strong>What we do not collect</strong>: we do not use cookies, and we do not run any
        analytics or advertising tracking (e.g. Google Analytics, Facebook Pixel) on the site.
      </p>
      <p>
        <strong>Browser storage</strong>: if you're logged in, your session is kept in your
        browser's local storage so you don't have to log in on every visit. This isn't shared
        with us or anyone else.
      </p>

      <h2>Who we share your information with</h2>
      <ul>
        <li>
          <strong>Shopee</strong> — when you buy through our Shopee store, your order, payment,
          and delivery information is handled directly by Shopee, under its own privacy policy,
          not this one.
        </li>
        <li>
          <strong>Our email service provider</strong> — used to respond to messages you send us
          through the contact form.
        </li>
      </ul>
      <p>We do not sell or rent your personal information to third parties for marketing purposes.</p>

      <h2>How long we keep your information</h2>
      <p>
        We keep account data and contact-form correspondence for 5 years, in line with Thai
        record-keeping requirements. We do not hold payment or delivery information for
        purchases made through Shopee — that's retained by Shopee under its own policy.
      </p>

      <h2>Your rights</h2>
      <p>
        Under Thailand's Personal Data Protection Act (PDPA), you have the right to access,
        correct, or request deletion of your personal information, and to withdraw consent where
        applicable. To exercise any of these rights, contact us at{' '}
        <a href="mailto:hello@one-organic.com">hello@one-organic.com</a>.
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
