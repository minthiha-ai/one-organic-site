import ScriptText from '../components/ScriptText.jsx';
import { FormField, TextAreaField } from '../components/FormField.jsx';
import Button from '../components/Button.jsx';
import EyebrowLabel from '../components/EyebrowLabel.jsx';

export default function Contact() {
  return (
    <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
      <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        <div style={{ padding: '32px var(--gutter) 8px' }}>
          <ScriptText size={20} style={{ margin: '0 0 4px' }}>say hello</ScriptText>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 600, margin: 0 }}>Contact</h1>
        </div>

        <div style={{ padding: '12px var(--gutter) 8px' }}>
          <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', lineHeight: 1.6, margin: '0 0 20px' }}>
            Questions about our products, wholesale, or an order? Send a message and we'll get back to you.
          </p>

          <FormField label="Name" placeholder="Jane Doe" />
          <FormField label="Email" type="email" placeholder="jane@example.com" />
          <TextAreaField label="Message" placeholder="How can we help?" />
          <Button to="#">Send message</Button>
        </div>

        <div style={{ padding: '28px var(--gutter) 32px', marginTop: 16, borderTop: '0.5px solid var(--color-border)' }}>
          <EyebrowLabel style={{ margin: '20px 0 12px' }}>Get in touch</EyebrowLabel>
          <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', margin: '0 0 8px' }}>
            <i className="ti ti-mail" style={{ color: 'var(--color-accent)', marginRight: 6, verticalAlign: -2 }} aria-hidden="true" />
            hello@one-organic.com
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', margin: '0 0 8px' }}>
            <i className="ti ti-phone" style={{ color: 'var(--color-accent)', marginRight: 6, verticalAlign: -2 }} aria-hidden="true" />
            +66 XX XXX XXXX
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', margin: 0 }}>
            <i className="ti ti-map-pin" style={{ color: 'var(--color-accent)', marginRight: 6, verticalAlign: -2 }} aria-hidden="true" />
            Address to be provided
          </p>
        </div>
      </div>
    </div>
  );
}
