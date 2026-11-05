import React, { useEffect, useState } from "react";
import { consents, setConsent } from "../lib/api";

export default function Settings() {
 const [choices, setChoices] = useState(null);
 const [busy, setBusy] = useState(false);
 const [message, setMessage] = useState("");
 useEffect(() => { consents().then(setChoices).catch(() => setMessage("Privacy choices could not be loaded. Optional processing stays off.")); }, []);
 async function change(purpose, allowed) {
   setBusy(true);
   try {
     setChoices(await setConsent(purpose, allowed, choices.version));
     setMessage(allowed ? "Permission recorded." : "Permission withdrawn. Future use is blocked.");
   } catch { setMessage("Your choice could not be saved. Please try again."); }
   finally { setBusy(false); }
 }
 return <>
   <h1>Settings</h1>
   <div className="card">
     <h2>Privacy Centre</h2>
     <p>Optional permissions start off. You can withdraw them here at any time.</p>
     {[['ai', 'AI processing'], ['microphone', 'Microphone']].map(([purpose, label]) => <div className="row" key={purpose}>
       <label htmlFor={`consent-${purpose}`}><b>{label}</b><small>{choices?.purposes[purpose] || "Loading permission details…"}</small></label>
       <input id={`consent-${purpose}`} type="checkbox" checked={choices?.[purpose] === true}
         disabled={!choices || busy} onChange={event => change(purpose, event.target.checked)} />
     </div>)}
     <p role="status">{message}</p>
     <p className="muted">Browser microphone permission is separate. You can revoke it in your browser’s site settings. Optional diagnostics and marketing collection are not enabled.</p>
     <h3>Your data rights</h3>
     <p>Account export and deletion are not available in this development build. Do not enter real customer data yet.</p>
   </div>
   <div className="card"><h2>Plan &amp; Billing</h2><b>Rivetara · £19.99/month</b>
     <p>Your admin, handled for £19.99 a month.</p>
     <p className="muted">Subscriptions, trials, renewal dates and purchase restoration are not connected in this development build. No payment is taken.</p>
   </div>
 </>;
}
