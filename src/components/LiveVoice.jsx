import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Volume2, VolumeX } from 'lucide-react';
import { consents, createLiveSession } from '../lib/api';
import { LiveVoiceSession } from '../lib/liveVoice';

export default function LiveVoice({available, onSettings, onBusy}) {
 const session = useRef(null);
 const mounted = useRef(true);
 const [state, setState] = useState('idle');
 const [message, setMessage] = useState('');
 const [groups, setGroups] = useState([]);
 const [muted, setMuted] = useState(false);
 const [blocked, setBlocked] = useState(false);
 const [permission, setPermission] = useState(false);
 const [sessionId, setSessionId] = useState('');
 const busy = ['checking', 'connecting', 'active', 'closing'].includes(state);
 const lock = useRef(false);
 useEffect(() => {
   mounted.current = true;
   return () => { mounted.current = false; session.current?.close(); };
 }, []);
 useEffect(() => { onBusy?.(busy); return () => onBusy?.(false); }, [busy, onBusy]);
 async function connect() {
   if (busy || lock.current) return;
   lock.current = true; setState('checking'); setMessage('Checking your permissions…'); setPermission(false);
   try {
     const choices = await consents();
     if (!mounted.current) return;
     if (!choices.ai || !choices.microphone) {
       setPermission(true); setState('idle'); setMessage('Allow AI processing and microphone access in the Privacy Centre first.'); return;
     }
     if (!window.RTCPeerConnection || !navigator.mediaDevices?.getUserMedia) {
       setState('idle'); setMessage('Live voice needs a supported browser and a secure HTTPS connection.'); return;
     }
     window.speechSynthesis?.cancel(); setGroups([]); setSessionId('');
     const live = new LiveVoiceSession({
       createSession: createLiveSession,
       onState(next, detail) {
         if (!mounted.current) return;
         setState(next); setMessage(detail || (next === 'active'
           ? 'Microphone on. Speak naturally; Rivetara responds when you finish. End conversation to stop the microphone.'
           : 'Connecting your voice…'));
         if (live.id) setSessionId(live.id);
       },
       onTranscript(next) { if (mounted.current) setGroups(next); },
       onPlaybackBlocked(value) { if (mounted.current) setBlocked(value); }
     });
     session.current = live; live.setMuted(muted); await live.start();
   } catch {
     if (mounted.current) { setState('incomplete'); setMessage('Could not start Live voice. No completed session was confirmed.'); }
   } finally { lock.current = false; }
 }
 return <section className={`live-voice ${state === 'active' ? 'live-connected' : ''}`} aria-label="Live voice conversation">
   <div className="live-heading"><div><h3>Talk to Rivetara</h3><p>A natural voice conversation. No need to tap after every sentence.</p></div><span className="live-badge">AI-generated voice</span></div>
   <p className="live-scope">Live voice can discuss your work and search the web. It isn’t connected to tools that change your business records.</p>
   {!available && <p className="live-notice">Live voice isn’t configured on the server yet. You can still use the short voice note or typed request below.</p>}
   <div className="live-controls">
     {state === 'active' ? <button className="live-primary" onClick={() => session.current?.close()}><Square size={16}/> End conversation</button> : <button className="live-primary" disabled={!available || busy} onClick={connect}><Mic size={17}/>{state === 'closing' ? 'Finishing…' : state === 'connecting' || state === 'checking' ? 'Connecting…' : 'Start Live voice'}</button>}
     <button className="voice-toggle" aria-label={muted ? 'Unmute Live audio' : 'Mute Live audio'} aria-pressed={muted} onClick={() => {const next = !muted; setMuted(next); session.current?.setMuted(next);}}>{muted ? <VolumeX size={17}/> : <Volume2 size={17}/>}<span>{muted ? 'Audio off' : 'Audio on'}</span></button>
   </div>
   {message && <p role="status" className={state === 'incomplete' ? 'live-incomplete' : 'live-status'}>{message}</p>}
   {permission && <button className="assistant-secondary" onClick={onSettings}>Open Privacy Centre</button>}
   {blocked && <button className="assistant-secondary" onClick={() => session.current?.resumeAudio()}>Play Live audio</button>}
   <div className="live-transcripts" aria-label="Timed Live transcript" aria-live="polite" aria-relevant="additions text">
     {groups.map(group => <div key={group.id} className={`live-transcript ${group.kind}`} data-start-ms={group.start_ms} data-end-ms={group.end_ms}>
       <span>{group.kind === 'input' ? 'You' : 'Rivetara'}{group.start_ms !== null && group.end_ms !== null && <time> · {(group.start_ms / 1000).toFixed(1)}s–{(group.end_ms / 1000).toFixed(1)}s</time>}</span>
       <p>{group.text}</p>
     </div>)}
   </div>
   {sessionId && <details className="live-session-info"><summary>Session reference</summary><code>{sessionId}</code></details>}
 </section>;
}
