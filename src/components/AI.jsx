chSynthesisUtterance(t));
   }
 }

 async function run(q) {
   setBusy(true);

   try {
     const r = await ai(q);
     const reply = r?.reply || "Done.";
     speak(reply);
     done?.(r);
   } catch {
     speak("I couldn't complete that.");
   } finally {
     setBusy(false);
   }
 }

 function tap() {
   if (on) {
     rec.current?.stop();
     setOn(false);
     return;
   }

   const R =
     window.SpeechRecognition || window.webkitSpeechRecognition;

   if (!R) {
     const q = prompt("Tell Rivetara what you need");
     if (q) run(q);
     return;
   }

   const r = new R();

   rec.current = r;
   r.lang = "en-GB";

   r.onresult = (e) => run(e.results[0][0].transcript);

   r.onend = () => {
     setOn(false);
   };

   r.start();
   setOn(true);
 }

 return (
   <div className="ai">
     <button
       className={on ? "listen" : ""}
       onClick={tap}
       disabled={busy}

       {on ? <Square /> : <Sparkles />}
     </button>

     <div>
       <b>{on ? "Listening…" : busy ? "Working…" : "Rivetara AI"}</b>
       <small>
         {on
           ? "Tap again to stop"
           : "Tell Rivetara once. Forget the admin."}
       </small>
     </div>
   </div>
 );
}
