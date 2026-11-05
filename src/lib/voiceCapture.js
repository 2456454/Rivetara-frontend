// Browser speech endpointing, with a short pause fallback for engines that keep
// continuous recognition open. Silence alone can never submit an empty request.
export function createVoiceCapture(recorder, callbacks) {
 let words = '';
 let ended = false;
 let stopping = false;
 let quietTimer;
 let limitTimer;
 const clearTimers = () => { clearTimeout(quietTimer); clearTimeout(limitTimer); };
 const armPause = delay => {
   clearTimeout(quietTimer);
   if (words.trim() && !ended && !stopping) quietTimer = setTimeout(stop, delay);
 };
 function stop() {
   if (ended || stopping) return;
   stopping = true; clearTimers(); callbacks.onStopping?.();
   try { recorder.stop(); } catch { fail(); }
 }
 function fail() {
   if (ended) return;
   ended = true; clearTimers(); callbacks.onError();
   recorder.onend = null;
   try { recorder.abort(); } catch { /* Already stopped. */ }
 }
 recorder.lang = 'en-GB'; recorder.continuous = true; recorder.interimResults = true;
 recorder.onstart = () => {
   callbacks.onStart();
   quietTimer = setTimeout(() => { if (!words.trim()) stop(); }, 12000);
   limitTimer = setTimeout(stop, 60000);
 };
 recorder.onspeechstart = () => { clearTimeout(quietTimer); };
 recorder.onspeechend = () => armPause(900);
 recorder.onresult = event => {
   if (ended) return;
   words = Array.from(event.results).map(result => result[0].transcript).join(' ').trim();
   callbacks.onTranscript(words);
   // Some browsers omit speechend. Interim/final updates renew this timer.
   armPause(1600);
 };
 recorder.onerror = fail;
 recorder.onend = () => {
   if (ended) return;
   ended = true; clearTimers(); callbacks.onEnd(words);
 };
 return {
   start() { try { recorder.start(); } catch { fail(); } },
   stop,
   cancel() {
     ended = true; clearTimers();
     recorder.onstart = recorder.onresult = recorder.onend = recorder.onerror = null;
     recorder.onspeechstart = recorder.onspeechend = null;
     try { recorder.abort(); } catch { /* Already stopped. */ }
   }
 };
}
