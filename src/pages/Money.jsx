import React,{useEffect,useState} from 'react';
import {api,list,paid} from '../lib/api';
import WorkDraft from '../components/WorkDraft';
export default function Money(){
 const [invoices,setInvoices]=useState([]),[drafts,setDrafts]=useState([]),[error,setError]=useState('');
 async function load(){try{const [records,working]=await Promise.all([list('invoices'),api('/api/work-drafts')]);setInvoices(records);setDrafts(working.filter(d=>d.kind==='invoice'));setError('');}catch{setError('Your invoices could not be loaded. Please try again.');}}
 useEffect(()=>{load();},[]);
 async function markPaid(invoice){if(!window.confirm(`Record payment of £${Number(invoice.amount).toFixed(2)} from ${invoice.customer_name}?`))return;try{await paid(invoice.id);load();}catch{setError('Payment could not be confirmed. Please check the invoice before retrying.');}}
 return <><h1>Money</h1><p>Start an invoice in Chat with whatever you know. Add the rest here or carry on the conversation.</p>{error&&<p role="alert">{error}<button onClick={load}>Reload invoices</button></p>}
  <section aria-label="Invoice working drafts">{drafts.map(draft=><WorkDraft key={draft.id} draft={draft} onChanged={row=>setDrafts(previous=>previous.map(d=>d.id===row.id?row:d))} onCreated={load}/>)}</section>
  <section className="card"><h2>Invoice drafts and records</h2>{invoices.length?invoices.map(invoice=><article key={invoice.id} className="invoice-row"><div><h3>{invoice.customer_name||'Customer'} · £{Number(invoice.amount||0).toFixed(2)}</h3><p>{invoice.description}</p><small>{invoice.status}{invoice.due_date?' · Due '+new Date(invoice.due_date).toLocaleDateString('en-GB'):''}</small></div>{invoice.status==='draft'?<span className="draft-tag">Draft · not issued or sent</span>:invoice.status==='paid'?<span>Paid</span>:<button onClick={()=>markPaid(invoice)}>Record payment</button>}</article>):<p>No invoice records yet. Your unfinished notes stay in working drafts until you create the invoice draft.</p>}</section>
 </>;
}
