import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ScriptText from '../components/ScriptText.jsx';
import { FormField } from '../components/FormField.jsx';
import Button from '../components/Button.jsx';
import { ApiError } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const emptyForm = { name: '', email: '', phone: '', password: '', password_confirmation: '' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  function updateField(name) {
    return (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await register(form);
      navigate('/account', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = Object.values(err.errors)[0]?.[0];
        setErrorMessage(firstError ?? err.message);
      } else {
        setErrorMessage('Something went wrong creating your account.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
      <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        <div style={{ padding: '32px var(--gutter) 8px' }}>
          <ScriptText size={20} style={{ margin: '0 0 4px' }}>join us</ScriptText>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 600, margin: 0 }}>Create an account</h1>
        </div>

        <div style={{ padding: '12px var(--gutter) 32px' }}>
          <form onSubmit={handleSubmit}>
            <FormField label="Name" name="name" placeholder="Jane Doe" value={form.name} onChange={updateField('name')} required />
            <FormField label="Email" type="email" name="email" placeholder="jane@example.com" value={form.email} onChange={updateField('email')} required />
            <FormField label="Phone" type="tel" name="phone" placeholder="+66 XX XXX XXXX" value={form.phone} onChange={updateField('phone')} />
            <FormField label="Password" type="password" name="password" placeholder="At least 8 characters" value={form.password} onChange={updateField('password')} required />
            <FormField label="Confirm password" type="password" name="password_confirmation" placeholder="••••••••" value={form.password_confirmation} onChange={updateField('password_confirmation')} required />

            {errorMessage && (
              <p style={{ fontSize: 12, color: 'var(--color-accent)', margin: '0 0 12px' }}>{errorMessage}</p>
            )}

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', margin: '20px 0 0' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--color-accent)' }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
