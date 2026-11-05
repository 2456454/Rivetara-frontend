import React, { useEffect, useState } from 'react';
import { ArrowRight, Mic, ClipboardCheck, ShieldCheck, ArrowLeft, Check, LoaderCircle, Wrench, FileText, CalendarDays } from 'lucide-react';
import { api } from '../lib/api';
import BrandMark from '../components/BrandMark';

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
   <header className="welcome-nav"><a href="#" className="wordmark" onClick={event => {event.preventDefault(); setSignup(false);}}><BrandMark/>rivetara<span className="brand-dot">.</span></a><button className="welcome-login" onClick={onExplore}>Explore the demo <ArrowUp/></button></header>
   <main className="welcome-main">
     {signup ? <section className="signup-layout">
       <div className="signup-intro"><button className="back-link" onClick={() => setSignup(false)}><ArrowLeft size={16}/> Back to welcome</button><p className="welcome-eyebrow">LESS ADMIN. MORE LIFE.</p><h1>A little help.<br/>A lot off your mind.</h1><p>Make room for the work you love. A simpler way to keep your jobs and paperwork in order.</p><div className="signup-trust"><ShieldCheck size={20}/><span>Your business stays yours. Optional AI and microphone permissions start off.</span></div></div>
       <div className="signup-card"><BrandMark className="signup-mark"/><h2>{sent ? 'Check your email' : 'Let’s get you started.'}</h2><p>{sent ? 'One step closer to less admin.' : 'Create your Rivetara account.'}</p>
         {!sent && <form onSubmit={submit}><fieldset disabled={!available || busy}><label htmlFor="signup-name">Your name</label><input id="signup-name" name="name" autoComplete="name" required maxLength={100} placeholder="Alex Taylor" disabled={busy}/><label htmlFor="signup-email">Email address</label><input id="signup-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@yourbusiness.co.uk" disabled={busy}/><label htmlFor="signup-password">Create a password</label><input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required placeholder="At least 12 characters" disabled={busy}/><small>No payment details needed to request an account. A subscription or trial is not started here.</small><button className="primary-cta" disabled={busy} type="submit">{busy ? <><LoaderCircle size={18}/> Creating account…</> : <>Create account <ArrowRight size={18}/></>}</button></fieldset></form>}
         {!available && !sent && <p className="signup-message">Account creation isn’t open yet. Explore the demo below while we get things ready.</p>}
         {message && <p className="signup-message" role="status">{message}</p>}
         <button className="demo-link" onClick={onExplore}>Just looking? Explore the demo</button>
       </div>
     </section> : <>
       <section className="welcome-hero"><div className="welcome-copy"><p className="welcome-eyebrow"><span/> BUILT FOR THE TOOLS. NOT MORE PAPERWORK.</p><h1>Good at your trade.<br/><span>Fed up with<br/>the admin?</span></h1><p className="hero-description">You’ve got enough to do without another evening of paperwork. Tell Rivetara about the job and keep your jobs, quotes and invoice drafts together. Speak it or type it. Keep it simple.</p><div className="welcome-actions"><button className="primary-cta" onClick={() => setSignup(true)}>Get started <ArrowRight size={19}/></button><button className="secondary-cta" onClick={onExplore}>Take a look around</button></div><p className="hero-footnote">For plumbers, electricians, builders and everyone busy on the tools.</p></div>
         <div className="welcome-preview trade-preview" aria-label="Illustrative examples of trade work, not live records">
           <div className="trade-board-heading"><span className="trade-board-icon"><Wrench size={21}/></span><div><p>THE WORK, WITHOUT THE PAPERWORK</p><h2>One less thing on your mind.</h2></div></div>
           <span className="example-label">Illustrative examples</span>
           <div className="trade-example"><span className="trade-task-icon"><CalendarDays size={21}/></span><div><b>Keep the next job in view.</b><p>Kitchen repair · Tomorrow, 9 am</p></div><span className="trade-task-tag">Job</span></div>
           <div className="trade-example"><span className="trade-task-icon"><FileText size={21}/></span><div><b>Get that quote out of your head.</b><p>Kitchen repair · £150 quote draft</p></div><span className="trade-task-tag">Draft</span></div>
           <div className="trade-spoken-note"><Mic size={19}/><p>“Draft a £150 quote for the kitchen repair.”<span>A quick word now. Less to remember later.</span></p></div>
           <p className="trade-preview-note"><ShieldCheck size={15}/> Check the details. Nothing sent on your behalf.</p>
         </div>
       </section>
       <section className="welcome-benefits" aria-label="How Rivetara helps">{[[Mic,'Hands full? Just say it.','Tap the microphone, tell Rivetara about the job, and pause when you’re done.'],[ClipboardCheck,'Keep on top of the paperwork.','Find jobs, quotes and invoice drafts together. No hunting through scraps of paper.'],[ShieldCheck,'You know your business best.','Check the details, make changes, and choose what you share. You stay in charge.']].map(([Icon,title,body]) => <article key={title}><span><Icon size={23}/></span><h3>{title}</h3><p>{body}</p></article>)}</section>
       <section className="welcome-pricing"><div><p className="welcome-eyebrow">SIMPLE TO USE. CLEAR ON PRICE.</p><h2>Your admin, handled<br/>for £19.99 a month.</h2><p>Jobs, quotes and invoice drafts. All in one place.</p></div><div><p className="price">£19.99<span>/month</span></p><p><Check size={16}/> Planned UK subscription price</p><small>Billing and trials are not active in this development preview. No payment is taken.</small><button className="primary-cta" onClick={() => setSignup(true)}>Get started <ArrowRight size={18}/></button></div></section>
     </>}
   </main><footer className="welcome-footer"><span>Rivetara · More room for the work that matters.</span><span>Development preview · Please use test data only.</span></footer>
 </div>;
}
function ArrowUp() { return <ArrowRight size={16}/>; }
