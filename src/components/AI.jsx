import React, { useEffect, useRef, useState } from 'react';
import { ai } from '../lib/api';
export default function AI({done}) {
 const [phase,setPhase]=useState('idle'), [message,setMessage]=useState(''), [text,setText]=useState('');
 const rec=useRef(null), generation=useRef(0), controller=useRef(null), utterance=useRef(null);
 useEffect(()=>()=>{generation.current++;rec.current?.abort();controller.current?.abort();window.speechSynthesis?.cancel();},[]);
 function stop(){generation.current++;rec.current?.abort();controller.current?.abort();window.speechSynthesis?.cancel();setPhase('idle');setMessage('Stopped. A request already sent may still have saved changes.');}
 function speak(reply,id){
  if(!window.speechSynthesis){setPhase('idle');return;}
  window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(reply);utterance.current=u;u.lang='en-GB';
  u.onstart=()=>{if(id===generation.current)setPhase('speaking');};
  u.onend=u.onerror=()=>{if(id===generation.current)setPhase('idle');};window.speechSynthesis.speak(u);
 }
 async function run(q){
  if(!q.trim())return;const id=++generation.current;controller.current=new AbortController();setPhase('working');setMessage('');
  try{const r=await ai(q,{signal:controller.current.signal});if(id!==generation.current)return;
   if(!r?.reply)throw Error('No reply');setMessage(r.reply);done?.(r.reply);setPhase('idle');speak(r.reply,id);
  }catch(e){if(id!==generation.current)return;setPhase('idle');setMessage('Could not confirm completion. Check your jobs before retrying.');}
 }
 function tap(){
  if(phase==='listening'){rec.current?.stop();return;}
  if(phase==='working'){stop();return;}
  if(phase==='speaking'){generation.current++;window.speechSynthesis?.cancel();setPhase('idle');}
  const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Speech){setMessage('Voice is unavailable in this browser. Type your request below.');return;}
  const id=++generation.current, r=new Speech();rec.current=r;r.lang='en-GB';r.interimResults=false;let received=false;
  r.onresult=e=>{if(id!==generation.current)return;received=true;run(e.results[0][0].transcript);};
  r.onend=()=>{if(id===generation.current&&!received)setPhase('idle');};
  r.onerror=e=>{if(id===generation.current){setPhase('idle');setMessage(e.error==='not-allowed'?'Allow microphone access or type below.':'Voice could not be captured. Try again or type below.');}};
  try{r.start();setPhase('listening');setMessage('');}catch{setPhase('idle');setMessage('Microphone unavailable. Type below.');}
 }
 const labels={idle:'Rivetara AI',listening:'Listening…',working:'Working…',speaking:'Speaking…'};
 return <section className={'ai ai-'+phase} aria-label="Rivetara assistant"><div className="ai-main"><button className="orb" onClick={tap} aria-label={phase==='idle'?'Start voice request':phase==='listening'?'Finish speaking':phase==='working'?'Stop waiting':'Interrupt reply and start listening'}><span className="orb-core"/><span className="orb-ring"/></button><div><b>{labels[phase]}</b><small>{phase==='idle'?'Tell Rivetara once. Forget the admin.':phase==='listening'?'Tap the orb when finished':phase==='working'?'Saving your request':'Tap the orb to interrupt'}</small></div>{phase!=='idle'&&<button className="soft" onClick={stop}>Stop</button>}</div><p className="ai-message" role="status" aria-live="polite">{message}</p><details><summary>Type instead</summary><form onSubmit={e=>{e.preventDefault();run(text);setText('');}}><label htmlFor="ai-request">What do you need?</label><input id="ai-request" value={text} onChange={e=>setText(e.target.value)} placeholder="Add a job to change a lock" required disabled={phase!=='idle'}/><button className="soft" disabled={phase!=='idle'}>Send</button></form></details></section>;
}
