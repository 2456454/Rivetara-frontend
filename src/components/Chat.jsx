import React,{useEffect,useRef,useState} from 'react';
import {MessageCircle,Mic,Square,Send} from 'lucide-react';
import {api,consents} from '../lib/api';
import {createVoiceCapture} from '../lib/voiceCapture';
import LiveConversation from './LiveConversation';
import WorkDraft from './WorkDraft';
export default function Chat({experience='trade',onSettings,onRecordsChange}) {
 const [session,setSession]=useState(()=>crypto.randomUUID());
 const [turns,setTurns]=useState([]);
 const [drafts,setDrafts]=useState([]);
 const [text,setText]=useState('');
 const [selected,setSelected]=useState(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [liveBusy,setLiveBusy]=useState(false);
 const [listening,setListening]=useState(false);
 const [message,setMessage]=useState('');
 const [retry,setRetry]=useState(null);
 const mounted=useRef(true),lock=useRef(false),capture=useRef(null);
 async function load() {
  setLoading(true);
  try {const state=await api('/api/chat?experience='+experience);if(!mounted.current)return;
   if(state.session)setSession(state.session.id);setTurns(state.turns);setDrafts(state.drafts);setMessage('');
  }catch{if(mounted.current)setMessage('Your conversation could not be loaded. Please retry.');}
  finally{if(mounted.current)setLoading(false);}
 }
 useEffect(()=>{mounted.current=true;load();return()=>{mounted.current=false;capture.current?.cancel();};},[experience]);
 async function send(value,retryRequest) {
  if(lock.current||liveBusy||!value.trim())return;lock.current=true;setBusy(true);setMessage('');
  const request=retryRequest||{session_id:session,request_id:crypto.randomUUID(),message:value.trim(),experience,selected_draft_id:selected?.id||null};
  setTurns(previous=>[...previous.filter(t=>t.id!==request.request_id),{id:request.request_id,message:request.message,reply:'',state:'processing'}]);
  try {
   const result=await api('/api/chat/message',{method:'POST',body:JSON.stringify(request)});
   if(!mounted.current)return;
   setTurns(previous=>previous.map(t=>t.id===result.turn.id?result.turn:t));setDrafts(result.drafts);setText('');
   if(result.turn.state==='processing'){setMessage('That reply is still being prepared. Check its status in a moment.');setRetry(request);}
   else setRetry(null);
   onRecordsChange?.();
  }catch(error){if(mounted.current){setMessage(error.status===403?'Allow AI processing in the Privacy Centre to use Chat.':'I couldn’t confirm the reply. Your message is kept here; check its status before starting again.');setRetry(request);}}
  finally{lock.current=false;if(mounted.current)setBusy(false);}
 }
 async function voice() {
  if(listening){capture.current?.stop();return;}
  if(busy||liveBusy||lock.current)return;
  try {
   const permissions=await consents();
   if(!permissions.ai||!permissions.microphone){setMessage('Allow AI processing and microphone access in the Privacy Centre first.');return;}
   const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
   if(!Speech){setMessage('Voice is not supported in this browser. You can type below.');return;}
   capture.current=createVoiceCapture(new Speech(),{
    onStart(){if(mounted.current)setListening(true);},onTranscript(words){if(mounted.current)setText(words);},
    onError(){if(mounted.current){setListening(false);setMessage('The microphone stopped. Your note is still available to edit.');}},
    onEnd(words){if(mounted.current){setListening(false);if(words)send(words);}}
   });capture.current.start();
  }catch{setMessage('Could not start the microphone. Type your message instead.');}
 }
 async function startDraft(kind) {
  if(busy)return;setBusy(true);
  try {const draft=await api('/api/work-drafts',{method:'POST',body:JSON.stringify({kind,data:{}})});setDrafts(previous=>[draft,...previous]);setSelected(draft);}
  catch{setMessage('Could not start that draft. Please try again.');}finally{setBusy(false);}
 }
 return <section className="chat-panel" aria-label={experience==='mentor'?'Business mentor chat':'Business chat'}>
  <header className="chat-heading"><div><span className="eyebrow">RIVETARA {experience==='mentor'?'MENTOR':'CHAT'}</span><h2><MessageCircle size={24}/>{experience==='mentor'?'Talk through your next step':'Tell me what you know so far'}</h2><p>{experience==='mentor'?'Your idea, your pace. Get help with the milestone you’re working on.':'Customer details, invoice notes, a quick question. Add the rest whenever you’re ready.'}</p></div><span className="draft-tag">Saved conversation</span></header>
  {loading?<p role="status">Loading your conversation…</p>:<>
   {turns.length===0&&<div className="chat-start"><p>{experience==='mentor'?'Start with your skills, an idea or the thing you’re unsure about.':'You don’t need everything to get started.'}</p>
    <div className="chat-suggestions">{(experience==='mentor'?['Help me choose a business idea','What should I do this week?']:['Start an invoice for a customer','Keep a customer’s details for later']).map(suggestion=><button key={suggestion} onClick={()=>setText(suggestion)}>{suggestion}</button>)}</div>
   </div>}
   <div className="chat-history" aria-live="polite" aria-relevant="additions text">{turns.map(turn=><div key={turn.id} className="chat-turn"><div className="chat-bubble from-user"><span>You</span><p>{turn.message}</p></div>
    {turn.reply?<div className="chat-bubble from-assistant"><span>Rivetara{experience==='mentor'?' Mentor':''}</span><p>{turn.reply}</p></div>:<p className="chat-pending" role="status">{busy?'Thinking…':'Reply not confirmed yet. Check its status below.'}</p>}
   </div>)}</div>
   {selected&&<p className="selected-draft">Continuing {selected.kind} draft{selected.data.customer_name?' for '+selected.data.customer_name:''}. <button onClick={()=>setSelected(null)}>Stop focusing on this draft</button></p>}
   <form className="chat-composer" onSubmit={event=>{event.preventDefault();send(text);}}>
    <label htmlFor={'chat-message-'+experience}>Message Rivetara{experience==='mentor'?' Mentor':''}</label>
    <textarea id={'chat-message-'+experience} rows={3} value={text} maxLength={10000} disabled={busy||liveBusy} onChange={event=>setText(event.target.value)} placeholder={experience==='mentor'?'I’m employed and want to try gardening at weekends…':'Invoice John for the tap repair. I’ll add the price later…'}/>
    <div className="chat-actions"><button type="button" onClick={voice} disabled={busy||liveBusy} aria-pressed={listening}>{listening?<Square size={17}/>:<Mic size={17}/>} {listening?'Stop recording':'Voice note'}</button><button type="submit" disabled={busy||liveBusy||listening||!text.trim()}><Send size={17}/>{busy?'Working…':'Send message'}</button></div>
   </form>
  </>}
  {message&&<p role="status">{message}</p>}
  <div className="chat-small-actions"><button onClick={load} disabled={busy}>Reload conversation</button>{onSettings&&<button onClick={onSettings}>Privacy Centre</button>}{retry&&<button disabled={busy} onClick={()=>send(retry.message,retry)}>Check last message status</button>}</div>
  {experience==='trade'&&<section className="working-drafts" aria-label="Saved working drafts"><div className="section-heading"><div><h3>Your working drafts</h3><p>They stay here while you carry on chatting.</p></div><div><button disabled={busy} onClick={()=>startDraft('customer')}>New customer note</button><button disabled={busy} onClick={()=>startDraft('invoice')}>New invoice note</button></div></div>
   {drafts.map(draft=><WorkDraft key={draft.id} draft={draft} onContinue={setSelected} onChanged={row=>{setDrafts(previous=>previous.map(d=>d.id===row.id?row:d));if(selected?.id===row.id)setSelected(row);}} onCreated={id=>{setDrafts(previous=>previous.filter(d=>d.id!==id));if(selected?.id===id)setSelected(null);onRecordsChange?.();}}/>)}
  </section>}
  <LiveConversation onSettings={onSettings} onBusy={setLiveBusy} disabled={busy||listening}/>
 </section>;
}
