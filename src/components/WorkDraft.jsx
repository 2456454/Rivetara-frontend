import React, {useEffect, useRef, useState} from 'react';
import {api, list} from '../lib/api';
const labels={customer_name:'Customer name',customer_email:'Email (optional)',customer_phone:'Phone (optional)',customer_address:'Address (optional)',description:'Work description',amount:'Amount (£)',due_date:'Due date (optional)'};
export default function WorkDraft({draft,onChanged,onCreated,onContinue}) {
 const [data,setData]=useState(draft.data);
 const [customers,setCustomers]=useState([]);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const lock=useRef(false);
 useEffect(()=>{setData(draft.data);},[draft.id,draft.version]);
 useEffect(()=>{list('customers').then(rows=>setCustomers(rows.filter(c=>!c.archived))).catch(()=>{});},[]);
 const invoice=draft.kind==='invoice';
 const change=(field,value)=>setData(previous=>({...previous,[field]:value}));
 async function save(create=false) {
  if(lock.current)return;lock.current=true;setBusy(true);setMessage('');
  try {
   const result=await api('/api/work-drafts/'+draft.id+(create?'/create':''),{method:create?'POST':'PATCH',body:JSON.stringify({data,version:draft.version})});
   if(create){setMessage(invoice?'Invoice draft created. Nothing has been sent.':'Customer created.');onCreated?.(draft.id,result.record);}
   else {onChanged?.(result);setMessage('Progress saved. You can finish this later.');}
  }catch(error){setMessage(error.status===409?'This draft changed elsewhere. Reload before saving.':error.message||'Could not save. Your details are still here.');}
  finally{lock.current=false;setBusy(false);}
 }
 const missing=[];
 if(!data.customer_id&&!data.customer_name?.trim())missing.push('customer name');
 if(invoice&&!data.description?.trim())missing.push('work description');
 if(invoice&&(data.amount===null||data.amount===undefined||data.amount===''))missing.push('amount');
 const fields=['customer_name','customer_email','customer_phone','customer_address',...(invoice?['description','amount','due_date']:[])];
 return <article className="work-draft card" aria-label={`${invoice?'Invoice':'Customer'} working draft`}>
  <div className="draft-heading"><div><span className="eyebrow">SAVED WORKING DRAFT</span><h3>{invoice?'Invoice':'Customer'}{data.customer_name?' · '+data.customer_name:''}</h3></div><span className="draft-tag">Finish later</span></div>
  <p>Keep what you know now. Email, phone, address and due date are optional.</p>
  {onContinue&&<button type="button" onClick={()=>onContinue(draft)}>Continue this in chat</button>}
  <form className="record-form" onSubmit={event=>{event.preventDefault();save(false);}}><fieldset disabled={busy}>
   <label>Use an existing customer (optional)<select value={data.customer_id||''} onChange={event=>{
    const found=customers.find(c=>c.id===event.target.value);
    setData(previous=>({...previous,customer_id:found?.id||null,...(found?{customer_name:found.name}:{}),new_customer:false}));
   }}><option value="">Use the details below</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}{c.email?' · '+c.email:''}</option>)}</select></label>
   {fields.map(field=><label key={field}>{labels[field]}
    {field==='description'||field==='customer_address'?<textarea rows={field==='description'?3:2} maxLength={field==='description'?10000:1000} value={data[field]||''} onChange={event=>change(field,event.target.value)}/>:
     <input type={field==='amount'?'number':field==='due_date'?'date':field==='customer_email'?'email':field==='customer_phone'?'tel':'text'}
      min={field==='amount'?0:undefined} step={field==='amount'?'.01':undefined} maxLength={field==='customer_name'?200:254}
      value={field==='due_date'?(data[field]||'').slice(0,10):data[field]??''}
      onChange={event=>change(field,field==='amount'?(event.target.value===''?null:Number(event.target.value)):field==='due_date'?(event.target.value?event.target.value+'T12:00:00Z':null):event.target.value)}
      disabled={Boolean(data.customer_id)&&field==='customer_name'}/>}
   </label>)}
   {!data.customer_id&&<label className="checkbox-label"><input type="checkbox" checked={data.new_customer===true} onChange={event=>change('new_customer',event.target.checked)}/>Create a separate customer if this name already exists</label>}
   <div className="draft-actions"><button type="submit">{busy?'Saving…':'Save progress'}</button><button type="button" disabled={busy||missing.length>0} onClick={()=>save(true)}>{invoice?'Create invoice draft':'Create customer'}</button></div>
  </fieldset></form>
  {missing.length>0&&<p className="muted">To create the {invoice?'invoice':'customer'} later, add {missing.join(', ')}. You can save progress now.</p>}
  {message&&<p role="status">{message}</p>}
 </article>;
}
