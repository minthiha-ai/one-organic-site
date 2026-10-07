import { useState } from 'react';
import ScriptText from '../components/ScriptText.jsx';
import { FormField, TextAreaField } from '../components/FormField.jsx';
import Button from '../components/Button.jsx';
import EyebrowLabel from '../components/EyebrowLabel.jsx';
import Seo from '../components/Seo.jsx';
import { api, ApiError } from '../lib/api.js';
import Icon from '../components/Icon.jsx';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      await api.post('/contact', form, { auth: false });
      setForm({ name: '', email: '', message: '' });
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
      <Seo
        title="Contact | One Organic"
        description="Questions about our products, wholesale, or an order? Email hello@one-organic.com or write to us at LaSalle Park, Sukhumvit 105, Bangna, Bangkok."
        path="/contact"
      />
      <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        <div style={{ padding: '32px var(--gutter) 8px' }}>
          <ScriptText size={20} style={{ margin: '0 0 4px' }}>say hello</ScriptText>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 600, margin: 0 }}>Contact</h1>
        </div>

        <div style={{ padding: '12px var(--gutter) 8px' }}>
          <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', lineHeight: 1.6, margin: '0 0 20px' }}>
            Questions about our products, wholesale, or an order? Send a message and we'll get back to you.
          </p>

          {status === 'sent' ? (
            <p style={{ fontSize: 13, color: 'var(--color-text)', margin: '0 0 12px' }}>
              Thanks — your message is on its way. We'll get back to you soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <FormField label="Name" name="name" placeholder="Jane Doe" value={form.name} onChange={handleChange} required />
              <FormField label="Email" type="email" name="email" placeholder="jane@example.com" value={form.email} onChange={handleChange} required />
              <TextAreaField label="Message" name="message" placeholder="How can we help?" value={form.message} onChange={handleChange} required />

              {status === 'error' && (
                <p style={{ fontSize: 12, color: 'var(--color-accent)', margin: '0 0 12px' }}>{errorMessage}</p>
              )}

              <Button type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </Button>
            </form>
          )}
        </div>

        <div style={{ padding: '28px var(--gutter) 32px', marginTop: 16, borderTop: '0.5px solid var(--color-border)' }}>
          <EyebrowLabel style={{ margin: '20px 0 12px' }}>Get in touch</EyebrowLabel>
          <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', margin: '0 0 8px' }}>
            <Icon name="mail" style={{ color: 'var(--color-accent)', marginRight: 6, verticalAlign: -2 }} />
            hello@one-organic.com
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', margin: 0, lineHeight: 1.6 }}>
            <Icon name="map-pin" style={{ color: 'var(--color-accent)', marginRight: 6, verticalAlign: -2 }} />
            5/3 LaSalle Park Building B, G Floor
            <br />
            LaSalle 10 Soi, Sukhumvit 105 Road
            <br />
            Bangna, Bangkok 10260 Thailand
          </p>
        </div>
      </div>
    </div>
  );
}
