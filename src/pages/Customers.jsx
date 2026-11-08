import React, {useEffect, useState} from 'react';
import {api, list} from '../lib/api';
const empty = {name: '', email: '', phone: '', address: ''};
export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [fields, setFields] = useState(empty);
  const [editing, setEditing] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  async function load() {
    setLoading(true);
    try {setCustomers(await list('customers')); setMessage('');}
    catch {setMessage('Customers could not be loaded. Please try again.');}
    finally {setLoading(false);}
  }
  useEffect(() => {load();}, []);
  async function save(event) {
    event.preventDefault(); if (busy) return; setBusy(true); setMessage('');
    try {
      const customer = await api('/api/customers' + (editing ? '/' + editing : ''), {
        method: editing ? 'PATCH' : 'POST', body: JSON.stringify(fields)
      });
      setCustomers(previous => [customer, ...previous.filter(c => c.id !== customer.id)]);
      setFields(empty); setEditing(''); setMessage('Customer saved.');
    } catch {setMessage('Customer could not be saved. Your details are still here.');}
    finally {setBusy(false);}
  }
  async function archive(customer) {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await api('/api/customers/' + customer.id, {method: 'PATCH', body: JSON.stringify({archived: !customer.archived})});
      setCustomers(previous => previous.map(c => c.id === updated.id ? updated : c));
      setMessage(updated.archived ? 'Customer archived. Existing records are retained.' : 'Customer restored.');
    } catch {setMessage('Customer could not be updated.');}
    finally {setBusy(false);}
  }
  return <>
    <h1>Customers</h1><p>Customer details for the selected business.</p>
    <section className="card"><h2>{editing ? 'Edit customer' : 'Add customer'}</h2>
      <form className="record-form" onSubmit={save}><fieldset disabled={busy}>
        {['name', 'email', 'phone', 'address'].map(field => <label key={field} htmlFor={'customer-' + field}>
          {field[0].toUpperCase() + field.slice(1)}
          <input id={'customer-' + field} type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} required={field === 'name'}
            maxLength={{name: 200, email: 254, phone: 50, address: 1000}[field]}
            value={fields[field]} onChange={event => setFields({...fields, [field]: event.target.value})}/>
        </label>)}
        <button>{busy ? 'Saving…' : 'Save customer'}</button>
        {editing && <button type="button" onClick={() => {setEditing(''); setFields(empty);}}>Cancel edit</button>}
      </fieldset></form>
    </section>
    {message && <p role="status">{message}</p>}
    <section className="card" aria-label="Customer records">
      {loading ? <p role="status">Loading customers…</p> : <>
        <button onClick={load} disabled={busy}>Refresh customers</button>
        {!customers.length && <p>No customers yet. Add your first customer above.</p>}
        {customers.map(customer => <article className="customer-record" key={customer.id}>
          <h3>{customer.name}{customer.archived ? ' · Archived' : ''}</h3>
          <p>{[customer.email, customer.phone, customer.address].filter(Boolean).join(' · ') || 'No contact details added'}</p>
          <button disabled={busy} onClick={() => {setEditing(customer.id); setFields({name: customer.name, email: customer.email, phone: customer.phone, address: customer.address});}}>Edit</button>
          <button disabled={busy || editing === customer.id} onClick={() => archive(customer)}>{customer.archived ? 'Restore' : 'Archive'}</button>
        </article>)}
      </>}
    </section>
  </>;
}
