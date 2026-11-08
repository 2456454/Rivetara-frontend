import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Square, Send, Volume2, VolumeX, RotateCcw, Mic } from "lucide-react";
import { ai, consents, liveStatus, list } from "../lib/api";
import ProposalReview from "./ProposalReview";
import LiveVoice from "./LiveVoice";
import { createVoiceCapture } from "../lib/voiceCapture";

function preferredVoice(voices) {
 const score = voice => (voice.lang.toLowerCase() === 'en-gb' ? 20 : 0) +
   (/^en/i.test(voice.lang) ? 10 : -100) +
   (/natural|premium|enhanced|neural/i.test(voice.name) ? 8 : 0) +
   (/sonia|serena|daniel|samantha|google uk/i.test(voice.name) ? 4 : 0);
 return [...voices].sort((a, b) => score(b) - score(a))[0];
}

export default function AI({ done, onSettings }) {
 const [reviewsLoaded, setReviewsLoaded] = useState(false);
 const [proposals, setProposals] = useState([]);
 const [phase, setPhase] = useState('idle');
 const [mode, setMode] = useState('note');
 const [liveAvailable, setLiveAvailable] = useState(false);
 const [liveBusy, setLiveBusy] = useState(false);
 const [reply, setReply] = useState('');
 const [request, setRequest] = useState('');
 const [text, setText] = useState('');
 const [transcript, setTranscript] = useState('');
 const [muted, setMuted] = useState(false);
 const [speaking, setSpeaking] = useState(false);
 const [permissionNeeded, setPermissionNeeded] = useState(false);
 const [outcome, setOutcome] = useState('');
 const recognition = useRef(null);
 const voice = useRef(null);
 const mounted = useRef(true);
 const locked = useRef(false);
 const mutedRef = useRef(false);
 const abortRequest = useRef(null);
 const busy = ['checking', 'processing', 'starting', 'finishing'].includes(phase);
 const listening = phase === 'listening';

 async function loadReviews() {
   try {
     const saved = await list('proposals');
     if (mounted.current) {setProposals(saved); setReviewsLoaded(true);}
   } catch {
     if (mounted.current) setReply('Pending reviews could not be loaded. Retry before starting another request.');
   }
 }

 useEffect(() => {
   mounted.current = true;
   loadReviews();
   liveStatus().then(result => { if (mounted.current) setLiveAvailable(result.available); }).catch(() => {});
   const synth = window.speechSynthesis;
   const update = () => { voice.current = preferredVoice(synth?.getVoices() || []); };
   update(); synth?.addEventListener('voiceschanged', update);
   return () => {
     mounted.current = false;
     abortRequest.current?.abort();
     recognition.current?.cancel();
     synth?.removeEventListener('voiceschanged', update);
     synth?.cancel();
   };
 }, []);

 function speak(message) {
   if (!window.speechSynthesis || mutedRef.current) return;
   window.speechSynthesis.cancel();
   const utterance = new SpeechSynthesisUtterance(message);
   utterance.voice = voice.current || null;
   utterance.lang = voice.current?.lang || 'en-GB';
   utterance.rate = 0.96;
   utterance.pitch = 1;
   utterance.onstart = () => { if (mounted.current) setSpeaking(true); };
   const finish = () => { if (mounted.current) setSpeaking(false); };
   utterance.onend = finish; utterance.onerror = finish;
   window.speechSynthesis.speak(utterance);
 }

 async function permitted(microphone = false) {
   const choices = await consents();
   if (!mounted.current) return false;
   if (!choices.ai || (microphone && !choices.microphone)) {
     setPermissionNeeded(true);
     setReply('Let’s set up your permissions first. You choose whether Rivetara can process requests and use your microphone.');
     setPhase('permission');
     return false;
   }
   setPermissionNeeded(false);
   return true;
 }

 async function run(q) {
   if (locked.current || !reviewsLoaded || proposals.length || !q.trim()) return;
   locked.current = true;
   window.speechSynthesis?.cancel(); setSpeaking(false);
   setRequest(q); setReply(''); setOutcome(''); setPhase('processing');
   try {
     if (!(await permitted())) return;
     if (!mounted.current) return;
     abortRequest.current = new AbortController();
     const result = await ai(q, { signal: abortRequest.current.signal });
     if (!mounted.current) return;
     const answer = result?.reply || 'I couldn’t confirm a result. Please check your records before trying again.';
     const actions = result?.actions || [];
     setProposals(actions.filter(a => a.result?.status === 'proposed').map(a => a.result.proposal));
     const status = actions.some(a => a.result?.status === 'proposed') ? 'Review before saving' : actions.some(a => a.result?.status === 'needs_review') ? 'Needs your review' :
       actions.some(a => a.result?.status === 'drafted') ? 'Draft ready to review' :
       actions.length ? 'Action completed' : 'Rivetara’s reply';
     setOutcome(status); setReply(answer); setPhase('result'); setText('');
     speak(answer); done?.();
   } catch (error) {
     if (!mounted.current || error.name === 'AbortError') return;
     setPhase('error');
     setReply(navigator.onLine === false
       ? 'You’re offline. This request hasn’t been saved or sent. Keep your note here and try again when connected.'
       : 'I couldn’t confirm that request. Check your records before trying again. Your note is still here.');
   } finally { locked.current = false; }
 }

 async function tap() {
   if (listening) { recognition.current?.stop(); return; }
   if (busy || locked.current) return;
   locked.current = true;
   setPhase('checking'); setReply(''); setOutcome('');
   window.speechSynthesis?.cancel(); setSpeaking(false);
   try {
     if (!(await permitted(true))) return;
     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
     if (!SpeechRecognition) {
       setPhase('error'); setReply('Voice input isn’t available in this browser. You can still type your request below.'); return;
     }
     const recorder = new SpeechRecognition();
     recognition.current = createVoiceCapture(recorder, {
       onStart() { if (mounted.current) setPhase('listening'); },
       onStopping() { if (mounted.current) setPhase('finishing'); },
       onTranscript(words) { if (mounted.current) { setTranscript(words); setText(words); } },
       onError() {
         recognition.current = null;
         if (mounted.current) { setPhase('error'); setReply('The microphone stopped. Check your browser permission, or type your request below.'); }
       },
       onEnd(words) {
         recognition.current = null;
         if (!mounted.current) return;
         if (words) run(words);
         else { setPhase('idle'); setReply('I didn’t catch anything. Tap the microphone to try again, or type below.'); }
       }
     });
     setTranscript(''); setPhase('starting'); recognition.current.start();
   } catch {
     if (mounted.current) { setPhase('error'); setReply('I couldn’t start listening. Check your connection and microphone permission, or type below.'); }
   } finally { locked.current = false; }
 }

 function toggleVoice() {
   mutedRef.current = !mutedRef.current; setMuted(mutedRef.current);
   if (mutedRef.current) { window.speechSynthesis?.cancel(); setSpeaking(false); }
 }
 const stateLabel = listening ? 'Listening to you' : phase === 'processing' ? 'Thinking it through' :
   phase === 'checking' ? 'Checking permissions' : phase === 'starting' ? 'Opening microphone' : phase === 'finishing' ? 'Finishing your note' :
   speaking ? 'Speaking to you' : phase === 'error' ? 'Let’s try that again' : 'Your AI office manager';
 return <section className={`assistant-panel ${listening ? 'is-listening' : ''} ${busy ? 'is-thinking' : ''} ${speaking ? 'is-speaking' : ''}`} aria-label="Rivetara AI">
   <div className="assistant-topline"><span><i aria-hidden="true" /> RIVETARA AI</span>
     {mode === 'note' && <button className="voice-toggle" onClick={toggleVoice} aria-pressed={muted} aria-label={muted ? 'Turn spoken replies on' : 'Mute spoken replies'}>
       {muted ? <VolumeX size={18}/> : <Volume2 size={18}/>}<span>{muted ? 'Voice off' : 'Voice on'}</span>
     </button>}
   </div>
   <div className="voice-mode-picker" role="group" aria-label="Voice mode">
     <button aria-pressed={mode === 'live'} disabled={listening || busy} onClick={() => {window.speechSynthesis?.cancel(); setSpeaking(false); setMode('live');}}>Natural conversation</button>
     <button aria-pressed={mode === 'note'} disabled={liveBusy} onClick={() => setMode('note')}>Quick voice note</button>
   </div>
   {mode === 'live' ? <LiveVoice available={liveAvailable} onSettings={onSettings} onBusy={setLiveBusy}/> : <>
   <div className="assistant-stage">
     <div className="orb-wrap"><span className="orb-ring ring-one" aria-hidden="true"/><span className="orb-ring ring-two" aria-hidden="true"/>
       <button className="assistant-orb" onClick={tap} disabled={busy || !reviewsLoaded || proposals.length > 0} aria-label={listening ? 'Stop listening and prepare a preview' : 'Start listening'} aria-pressed={listening}>
         <span className="orb-glow" aria-hidden="true"/>{listening ? <Square size={26}/> : <Sparkles size={32}/>}
       </button>
     </div>
     <div className="assistant-intro"><p className="assistant-state" role="status">{stateLabel}</p>
       <h2>{listening ? 'Go on, I’m listening.' : busy ? 'A little less admin, coming up.' : 'What can I take off your hands?'}</h2>
       <p>{listening ? 'I’ll send your request after a short pause. You can also tap to finish.' : 'Tap once and tell me what you need. I’ll prepare details for you to review when you finish speaking.'}</p>
     </div>
   </div>
   <div className="assistant-conversation" aria-live="polite" aria-atomic="true">
     {listening ? <div className="listening-caption"><span className="voice-bars" aria-hidden="true">{[0,1,2,3,4].map(i => <i key={i} style={{animationDelay:`${i * .12}s`}}/>)}</span><p>{transcript || 'Microphone is on. Tell me what you need…'}</p></div> : <>
       {request && <p className="request-caption"><span>You asked</span>{request}</p>}
       {phase === 'processing' && <p className="thinking-caption">Working on your request<span className="thinking-dots" aria-hidden="true">…</span></p>}
       {reply && <div className={`assistant-reply ${phase === 'error' ? 'reply-error' : ''}`}><div className="reply-heading"><Sparkles size={17}/><b>{outcome || (phase === 'error' ? 'Request not confirmed' : 'Rivetara')}</b></div><p>{reply}</p>
         {permissionNeeded && <button className="assistant-secondary" onClick={onSettings}>Open Privacy Centre</button>}
         {phase === 'result' && !muted && 'speechSynthesis' in window && <button className="replay-reply" onClick={() => speak(reply)} disabled={speaking}><RotateCcw size={14}/> Hear again</button>}
       </div>}
     </>}
   </div>
   {!reviewsLoaded && <button className="assistant-secondary" onClick={loadReviews}>Reload pending reviews</button>}
   {proposals.map(proposal => <ProposalReview key={proposal.id} proposal={proposal} onFinished={(id, message) => {
     setProposals(previous => previous.filter(p => p.id !== id)); setReply(message); setOutcome('Your decision recorded'); done?.();
   }}/>)}
   <form className="assistant-composer" onSubmit={event => { event.preventDefault(); run(text.trim()); }}>
     <label htmlFor="ai-request">Or type your request</label>
     <div className="composer-field"><textarea id="ai-request" value={text} maxLength={10000} rows={2} placeholder="e.g. Draft a £150 quote for the kitchen repair" onChange={event => setText(event.target.value)} disabled={busy || listening || !reviewsLoaded || proposals.length > 0}/>
       <button type="submit" disabled={busy || listening || !reviewsLoaded || proposals.length > 0 || !text.trim()} aria-label="Send your request"><Send size={19}/></button>
     </div>
     <small><Mic size={13}/> You’re in control. The microphone only listens when you turn it on.</small>
   </form>
   </>}
 </section>;
}
