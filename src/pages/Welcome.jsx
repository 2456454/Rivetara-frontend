import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Mic, ClipboardCheck, ShieldCheck, ArrowLeft, Check, LoaderCircle } from 'lucide-react';
import { api } from '../lib/api';

export default function Welcome({ onExplore }) {
 const [signup, setSignup] = useState(false);
 const [busy, setBusy] = useState(false);
 const [message, setMessage] = useState('');
 const [sent, setSent] = useState(false);
 const [available, setAvailable] = useState(false);
 useEffect(() => { api('/api/auth/status').then(result => setAvailable(result.signupAvailable === true)).catch(() => setAvailable(false)); }, []);
 async function submit(event) {
   event.preventDefault(); setBusy(true); setMessage('');
   const fields = new FormData(event.currentTarget);
   try {
     const result = await api('/api/auth/signup', {method: 'POST', body: JSON.stringify({
       name: fields.get('name'), email: fields.get('email'), password: fields.get('password')
     })});
     if (result.status !== 'verification_required') throw Error('Account setup was not confirmed.');
     setSent(true); setMessage('Check your inbox for the next step. If this email is eligible, you’ll receive an account confirmation link.');
   } catch (error) {
     setMessage(error.message.includes('SIGNUP_UNAVAILABLE')
       ? 'Account creation isn’t open just yet. You can explore the demo below — no account needed.'
       : 'We couldn’t complete sign-up. Please try again later.');
   } finally { setBusy(false); }
 }
 return <div className="welcome-page">
   <header className="welcome-nav"><a href="#" className="wordmark" onClick={event => {event.preventDefault(); setSignup(false);}}><span><Sparkles size={21}/></span>rivetara<span className="brand-dot">.</span></a><button className="welcome-login" onClick={onExplore}>Explore the demo <ArrowUp/></button></header>
   <main className="welcome-main">
     {signup ? <section className="signup-layout">
       <div className="signup-intro"><button className="back-link" onClick={() => setSignup(false)}><ArrowLeft size={16}/> Back to welcome</button><p className="welcome-eyebrow">LESS ADMIN. MORE LIFE.</p><h1>A little help.<br/>A lot off your mind.</h1><p>Make room for the work you love. Your AI office manager starts here.</p><div className="signup-trust"><ShieldCheck size={20}/><span>Your business stays yours. Optional AI and microphone permissions start off.</span></div></div>
       <div className="signup-card"><span className="signup-mark"><Sparkles size={25}/></span><h2>{sent ? 'Check your email' : 'Let’s get you started.'}</h2><p>{sent ? 'One step closer to less admin.' : 'Create your Rivetara account.'}</p>
         {!sent && <form onSubmit={submit}><fieldset disabled={!available || busy}><label htmlFor="signup-name">Your name</label><input id="signup-name" name="name" autoComplete="name" required maxLength={100} placeholder="Alex Taylor" disabled={busy}/><label htmlFor="signup-email">Email address</label><input id="signup-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@yourbusiness.co.uk" disabled={busy}/><label htmlFor="signup-password">Create a password</label><input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required placeholder="At least 12 characters" disabled={busy}/><small>No payment details needed to request an account. A subscription or trial is not started here.</small><button className="primary-cta" disabled={busy} type="submit">{busy ? <><LoaderCircle size={18}/> Creating account…</> : <>Create account <ArrowRight size={18}/></>}</button></fieldset></form>}
         {!available && !sent && <p className="signup-message">Account creation isn’t open yet. Explore the demo below while we get things ready.</p>}
         {message && <p className="signup-message" role="status">{message}</p>}
         <button className="demo-link" onClick={onExplore}>Just looking? Explore the demo</button>
       </div>
     </section> : <>
       <section className="welcome-hero"><div className="welcome-copy"><p className="welcome-eyebrow"><span/> AN EXTRA PAIR OF HANDS. WITHOUT THE HIRING.</p><h1>You handle the job.<br/><span>We’ll help with<br/>the admin.</span></h1><p className="hero-description">Meet Rivetara. An AI office manager for your trade business. Turn a quick conversation into organised jobs, quotes and invoice drafts — with you in control.</p><div className="welcome-actions"><button className="primary-cta" onClick={() => setSignup(true)}>Get started <ArrowRight size={19}/></button><button className="secondary-cta" onClick={onExplore}>Take a look around</button></div><p className="hero-footnote">Built for busy tradespeople. Designed to keep things simple.</p></div>
         <div className="welcome-preview" aria-label="Example of a Rivetara conversation"><div className="preview-top"><span><i/> RIVETARA AI</span><span>Illustrative example</span></div><div className="preview-orb" aria-hidden="true"><Sparkles size={40}/></div><h2>A thought off your mind.</h2><p className="preview-user">“Draft a £150 quote for the kitchen repair.”</p><div className="preview-answer"><Sparkles size={19}/><div><b>Ready for your review.</b><p>A £150 quote draft for the kitchen repair. Nothing sent until you’re ready.</p></div></div><div className="preview-bottom"><Mic size={16}/> A quick word. A clearer day.</div></div>
       </section>
       <section className="welcome-benefits" aria-label="How Rivetara helps">{[[Mic,'Say it, don’t file it.','Speak naturally, or type a quick note. Start with what’s on your mind.'],[ClipboardCheck,'Keep the details together.','Jobs, quotes and invoice drafts, in one place you can come back to.'],[ShieldCheck,'You’re always in control.','Review your records and choose what you share with AI.']].map(([Icon,title,body]) => <article key={title}><span><Icon size={23}/></span><h3>{title}</h3><p>{body}</p></article>)}</section>
       <section className="welcome-pricing"><div><p className="welcome-eyebrow">A LITTLE HELP GOES A LONG WAY</p><h2>Your admin, handled<br/>for £19.99 a month.</h2><p>One place for voice-led jobs, quotes and invoice drafts.</p></div><div><p className="price">£19.99<span>/month</span></p><p><Check size={16}/> Planned UK subscription price</p><small>Billing and trials are not active in this development preview. No payment is taken.</small><button className="primary-cta" onClick={() => setSignup(true)}>Get started <ArrowRight size={18}/></button></div></section>
     </>}
   </main><footer className="welcome-footer"><span>Rivetara · More room for the work that matters.</span><span>Development preview · Please use test data only.</span></footer>
 </div>;
}
function ArrowUp() { return <ArrowRight size={16}/>; }
