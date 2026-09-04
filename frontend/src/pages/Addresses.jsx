import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EyebrowLabel from '../components/EyebrowLabel.jsx';
import { FormField } from '../components/FormField.jsx';
import Button from '../components/Button.jsx';
import { api, ApiError } from '../lib/api.js';

const emptyForm = {
  label: '',
  recipient_name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'TH',
  is_default: false,
};

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null); // null | 'new' | address id
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  function loadAddresses() {
    setLoading(true);
    return api
      .get('/addresses')
      .then((res) => setAddresses(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  function updateField(name) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [name]: value }));
    };
  }

  function startAdd() {
    setForm(emptyForm);
    setErrorMessage(null);
    setEditingId('new');
  }

  function startEdit(address) {
    setForm({
      label: address.label ?? '',
      recipient_name: address.recipient_name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? '',
      city: address.city,
      state: address.state ?? '',
      postal_code: address.postal_code,
      country: address.country ?? 'TH',
      is_default: address.is_default,
    });
    setErrorMessage(null);
    setEditingId(address.id);
  }

  function cancelEdit() {
    setEditingId(null);
    setErrorMessage(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingId === 'new') {
        await api.post('/addresses', form);
      } else {
        await api.put(`/addresses/${editingId}`, form);
      }
      await loadAddresses();
      setEditingId(null);
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = Object.values(err.errors)[0]?.[0];
        setErrorMessage(firstError ?? err.message);
      } else {
        setErrorMessage('Something went wrong saving that address.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setAddresses((current) => current.filter((a) => a.id !== id));
    try {
      await api.delete(`/addresses/${id}`);
    } catch {
      loadAddresses(); // out of sync with the server — refetch to correct
    }
  }

  return (
    <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
      <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        <div style={{ padding: '32px var(--gutter) 8px' }}>
          <Link to="/account" style={{ fontSize: 12, color: 'var(--color-secondary-text)' }}>← Account</Link>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, margin: '10px 0 0' }}>Saved addresses</h1>
        </div>

        <div style={{ padding: '20px var(--gutter) 48px' }}>
          {loading && <p style={{ fontSize: 14, color: 'var(--color-secondary-text)' }}>Loading…</p>}

          {!loading && editingId === null && (
            <>
              {addresses.length === 0 && (
                <p style={{ fontSize: 14, color: 'var(--color-secondary-text)', margin: '0 0 16px' }}>No saved addresses yet.</p>
              )}

              {addresses.map((address) => (
                <div key={address.id} style={{ padding: '14px 0', borderBottom: '0.5px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 4px' }}>
                        {address.label || address.recipient_name}
                        {address.is_default && (
                          <span style={{ fontSize: 10, color: 'var(--color-accent)', border: '0.5px solid var(--color-accent)', borderRadius: 'var(--radius-pill)', padding: '2px 8px', marginLeft: 8 }}>
                            Default
                          </span>
                        )}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--color-secondary-text)', lineHeight: 1.6, margin: 0 }}>
                        {address.recipient_name}<br />
                        {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
                        {address.city}{address.state ? `, ${address.state}` : ''} {address.postal_code}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                      <button type="button" onClick={() => startEdit(address)} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(address.id)} style={{ background: 'none', border: 'none', color: 'var(--color-secondary-text)', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 20 }}>
                <Button onClick={startAdd}>Add an address</Button>
              </div>
            </>
          )}

          {editingId !== null && (
            <form onSubmit={handleSubmit}>
              <EyebrowLabel>{editingId === 'new' ? 'New address' : 'Edit address'}</EyebrowLabel>
              <FormField label="Label (optional)" name="label" placeholder="Home, Office…" value={form.label} onChange={updateField('label')} />
              <FormField label="Recipient name" name="recipient_name" value={form.recipient_name} onChange={updateField('recipient_name')} required />
              <FormField label="Phone" type="tel" name="phone" value={form.phone} onChange={updateField('phone')} required />
              <FormField label="Address line 1" name="line1" value={form.line1} onChange={updateField('line1')} required />
              <FormField label="Address line 2 (optional)" name="line2" value={form.line2} onChange={updateField('line2')} />
              <div style={{ display: 'flex', gap: 12 }}>
                <FormField label="City" name="city" value={form.city} onChange={updateField('city')} style={{ flex: 1, margin: '0 0 12px' }} required />
                <FormField label="Postal code" name="postal_code" value={form.postal_code} onChange={updateField('postal_code')} style={{ flex: 1, margin: '0 0 12px' }} required />
              </div>
              <FormField label="State/Province (optional)" name="state" value={form.state} onChange={updateField('state')} />

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text)', margin: '0 0 20px' }}>
                <input type="checkbox" checked={form.is_default} onChange={updateField('is_default')} />
                Set as default address
              </label>

              {errorMessage && (
                <p style={{ fontSize: 12, color: 'var(--color-accent)', margin: '0 0 12px' }}>{errorMessage}</p>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save address'}
                </Button>
                <button type="button" onClick={cancelEdit} style={{ background: 'none', border: 'none', color: 'var(--color-secondary-text)', fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
