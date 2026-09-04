import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ScriptText from '../components/ScriptText.jsx';
import { FormField } from '../components/FormField.jsx';
import Button from '../components/Button.jsx';
import { ApiError } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
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
      await login(form.email, form.password);
      const redirectTo = location.state?.from?.pathname ?? '/account';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = Object.values(err.errors)[0]?.[0];
        setErrorMessage(firstError ?? err.message);
      } else {
        setErrorMessage('Something went wrong signing you in.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
      <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        <div style={{ padding: '32px var(--gutter) 8px' }}>
          <ScriptText size={20} style={{ margin: '0 0 4px' }}>welcome back</ScriptText>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 600, margin: 0 }}>Log in</h1>
        </div>

        <div style={{ padding: '12px var(--gutter) 32px' }}>
          <form onSubmit={handleSubmit}>
            <FormField label="Email" type="email" name="email" placeholder="jane@example.com" value={form.email} onChange={updateField('email')} required />
            <FormField label="Password" type="password" name="password" placeholder="••••••••" value={form.password} onChange={updateField('password')} required />

            {errorMessage && (
              <p style={{ fontSize: 12, color: 'var(--color-accent)', margin: '0 0 12px' }}>{errorMessage}</p>
            )}

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Log in'}
            </Button>
          </form>

          <p style={{ fontSize: 13, color: 'var(--color-secondary-text)', margin: '20px 0 0' }}>
            New here? <Link to="/register" style={{ color: 'var(--color-accent)' }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
