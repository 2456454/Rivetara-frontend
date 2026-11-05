import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Square } from "lucide-react";
import { ai, consents } from "../lib/api";

export default function AI({ done }) {
 const [on, setOn] = useState(false);
 const [busy, setBusy] = useState(false);
 const [message, setMessage] = useState("");
 const [text, setText] = useState("");
 const rec = useRef(null);
 useEffect(() => () => { rec.current?.abort(); window.speechSynthesis?.cancel(); }, []);

 async function permitted(microphone = false) {
   try {
     const choices = await consents();
     if (!choices.ai || (microphone && !choices.microphone)) {
       setMessage("Open Settings → Privacy Centre to allow AI processing" + (microphone ? " and microphone use." : "."));
       return false;
     }
     return true;
   } catch {
     setMessage("Cannot check permissions. No request was sent. Please try again when connected.");
     return false;
   }
 }

 function speak(text) {
   if ("speechSynthesis" in window) {
     window.speechSynthesis.cancel();

     const utterance = new SpeechSynthesisUtterance(text);
     window.speechSynthesis.speak(utterance);
   }
 }

 async function run(q) {
   setBusy(true);
   setMessage("Processing your request…");

   try {
     if (!(await permitted())) return;
     const r = await ai(q);

     if (!r) {
       throw new Error("No response from Rivetara backend");
     }

     const reply = r.reply || "No result was confirmed. Please review your records.";
     setMessage(reply);

     speak(reply);

     if (typeof done === "function") {
       done(reply);
     }
   } catch (error) {
     setMessage("Request failed. No result was confirmed. Check your records before retrying.");
     speak("I couldn't complete that.");
   } finally {
     setBusy(false);
   }
 }

 async function tap() {
   if (on) {
     if (rec.current) {
       rec.current.stop();
     }

     setOn(false);
     return;
   }

   setBusy(true);
   const allowed = await permitted(true);
   setBusy(false);
   if (!allowed) return;

   const SpeechRecognition =
     window.SpeechRecognition || window.webkitSpeechRecognition;

   if (!SpeechRecognition) {
     setMessage("Voice input is unavailable in this browser. Type your request below.");
     return;
   }

   const recognition = new SpeechRecognition();

   rec.current = recognition;
   recognition.lang = "en-GB";

   recognition.onresult = (event) => {
     const transcript = event.results[0][0].transcript;
     run(transcript);
   };

   recognition.onend = () => {
     setOn(false);
   };

   recognition.onerror = (event) => {
     setMessage("Voice capture stopped. You can type your request instead.");
     setOn(false);
   };

   try {
     recognition.start();
     setOn(true);
   } catch {
     setMessage("Microphone could not start. You can type your request instead.");
   }
 }

 return (
   <section aria-label="Rivetara AI">
   <div className="ai">
     <button
       className={on ? "listen" : ""}
       onClick={tap}
       aria-label={on ? "Stop listening" : "Start listening"}
       aria-pressed={on}
       disabled={busy}>

       {on ? <Square /> : <Sparkles />}
     </button>

     <div>
       <b>
         {on ? "Listening…" : busy ? "Working…" : "Rivetara AI"}
       </b>

       <small>
         {on
           ? "Tap again to stop"
           : "Tell Rivetara once. Forget the admin."}
       </small>
     </div>
   </div>
   <form onSubmit={event => { event.preventDefault(); if (text.trim()) run(text.trim()); }}>
     <label htmlFor="ai-request">Or type your request</label>
     <textarea id="ai-request" value={text} maxLength={10000}
       onChange={event => setText(event.target.value)} disabled={busy || on} />
     <button type="submit" disabled={busy || on || !text.trim()}>Send request</button>
   </form>
   <p role="status" aria-live="polite">{on ? "Microphone listening. Tap again to stop." : message}</p>
   </section>
 );
}
