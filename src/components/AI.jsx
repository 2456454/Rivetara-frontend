import React, { useRef, useState } from "react";
import { Sparkles, Square } from "lucide-react";
import { ai } from "../lib/api";

export default function AI({ done }) {
 const [on, setOn] = useState(false);
 const [busy, setBusy] = useState(false);
 const rec = useRef(null);

 function speak(text) {
   if ("speechSynthesis" in window) {
     window.speechSynthesis.cancel();

     const utterance = new SpeechSynthesisUtterance(text);
     window.speechSynthesis.speak(utterance);
   }
 }

 async function run(q) {
   setBusy(true);

   try {
     const r = await ai(q);

     if (!r) {
       throw new Error("No response from Rivetara backend");
     }

     const reply = r.reply || "Request completed.";

     speak(reply);

     if (typeof done === "function") {
       done(reply);
     }
   } catch (error) {
     console.error("Rivetara AI error:", error);
     speak("I couldn't complete that.");
   } finally {
     setBusy(false);
   }
 }

 function tap() {
   if (on) {
     if (rec.current) {
       rec.current.stop();
     }

     setOn(false);
     return;
   }

   const SpeechRecognition =
     window.SpeechRecognition || window.webkitSpeechRecognition;

   if (!SpeechRecognition) {
     const q = window.prompt("Tell Rivetara what you need");

     if (q) {
       run(q);
     }

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
     console.error("Speech recognition error:", event);
     setOn(false);
   };

   recognition.start();
   setOn(true);
 }

 return (
   <div className="ai">
     <button
       className={on ? "listen" : ""}
       onClick={tap}
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
 );
}
