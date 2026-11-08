import React, {useEffect, useRef, useState} from 'react';
import {list, confirmProposal, cancelProposal} from '../lib/api';
function localDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
const fieldLabels = {title: 'Job title', description: 'Description', supplier: 'Supplier', scheduled_for: 'Job date and time', due_date: 'Due date and time', amount: 'Amount (£)', status: 'Status'};
const labels = {create_job: 'Job', create_quote: 'Quote draft', create_invoice: 'Invoice draft', add_expense: 'Expense'};
export default function ProposalReview({proposal, onFinished}) {
  const [args, setArgs] = useState(proposal.args);
  const [customers, setCustomers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [customerError, setCustomerError] = useState(false);
  const lock = useRef(false);
  const requiresCustomer = proposal.action !== 'add_expense';
  async function loadCustomers() {
    try {setCustomers((await list('customers')).filter(c => !c.archived)); setCustomerError(false);}
    catch {setCustomerError(true);}
  }
  useEffect(() => {if (requiresCustomer) loadCustomers();}, []);
  function change(field, value) {setArgs(previous => ({...previous, [field]: value}));}
  async function finish(confirm) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      if (confirm) {
        await confirmProposal(proposal.id, args);
        onFinished(proposal.id, 'Saved successfully.');
      } else {
        await cancelProposal(proposal.id);
        onFinished(proposal.id, 'Proposal cancelled. No business record was created.');
      }
    } catch (failure) {
      setError(failure.status === 409 ? 'This proposal is cancelled or expired. Start a new request.'
        : 'The result could not be confirmed. Your details are kept here. Retry this confirmation to check safely.');
    } finally {lock.current = false; setBusy(false);}
  }
  return <section className="card proposal-review" aria-label={`Review ${labels[proposal.action]}`}>
    <h3>Review {labels[proposal.action]}</h3><p>Check and edit the details. Nothing is saved to your business records until you confirm.</p>
    <form className="record-form" onSubmit={event => {event.preventDefault(); finish(true);}}><fieldset disabled={busy}>
      {requiresCustomer && <label htmlFor={'proposal-customer-' + proposal.id}>Customer
        <select id={'proposal-customer-' + proposal.id} required value={args.customer_id || ''} onChange={event => change('customer_id', event.target.value)}>
          <option value="">Select a customer</option>{customers.map(c => <option value={c.id} key={c.id}>{c.name}{c.email || c.phone ? ' · ' + (c.email || c.phone) : ''}</option>)}
        </select>
        {proposal.args.customer_name && <small>Heard customer name: {proposal.args.customer_name}</small>}
      </label>}
      {requiresCustomer && <><p>{customerError ? 'Could not load customers.' : 'Missing a customer? Add them in Customers, then return here. Your pending review will be kept.'}</p><button type="button" onClick={loadCustomers}>Refresh customer choices</button></>}
      {['title', 'description', 'supplier', 'scheduled_for', 'due_date', 'amount', 'status'].filter(field =>
        Object.hasOwn(args, field) || (proposal.action === 'create_job' && ['title','description','scheduled_for','status'].includes(field))
      ).map(field => <label key={field} htmlFor={proposal.id + field}>{fieldLabels[field]}
        {field === 'status' ? <select id={proposal.id + field} value={args.status || 'scheduled'} onChange={event => change(field, event.target.value)}>
          {(proposal.action === 'create_job' ? ['scheduled','in_progress','completed','overdue'] : ['draft']).map(value => <option key={value}>{value}</option>)}
        </select> : <input id={proposal.id + field} value={['scheduled_for','due_date'].includes(field) ? localDate(args[field]) : args[field] ?? ''} type={field === 'amount' ? 'number' : ['scheduled_for','due_date'].includes(field) ? 'datetime-local' : 'text'}
          required={['title','description','amount'].includes(field) && !(proposal.action === 'create_job' && field === 'description')}
          min={field === 'amount' ? '0' : undefined} step={field === 'amount' ? '0.01' : undefined} maxLength={10000}
          onChange={event => change(field, field === 'amount' ? Number(event.target.value) : ['scheduled_for','due_date'].includes(field) ? event.target.value ? new Date(event.target.value).toISOString() : null : event.target.value)}/>}
      </label>)}
      <button type="submit" disabled={busy || requiresCustomer && (!customers.some(c => c.id === args.customer_id) || customerError)}>{busy ? 'Checking…' : 'Confirm and save'}</button>
      <button type="button" onClick={() => finish(false)}>Cancel proposal</button>
    </fieldset></form>
    {error && <p role="alert">{error}</p>}
  </section>;
}
