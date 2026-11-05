// Transcript intervals are media timestamps, not conversation turns. Preserve
// every delta character, including whitespace, in its timestamp interval.
export function appendTranscript(groups, event) {
 const kind = event.type === 'session.input_transcript.delta' ? 'input' :
   event.type === 'session.output_transcript.delta' ? 'output' : null;
 if (!kind || typeof event.delta !== 'string') return groups;
 const start = Number.isFinite(event.start_ms) ? event.start_ms : null;
 const end = Number.isFinite(event.end_ms) ? event.end_ms : null;
 const next = groups.map(group => ({...group}));
 const index = start !== null && end !== null ? next.findLastIndex(group =>
   group.kind === kind && group.start_ms !== null && group.end_ms !== null &&
   start <= group.end_ms && end >= group.start_ms) : -1;
 if (index >= 0) {
   const group = next[index];
   group.text += event.delta;
   group.start_ms = Math.min(group.start_ms, start); group.end_ms = Math.max(group.end_ms, end);
 } else next.push({kind, start_ms: start, end_ms: end, text: event.delta, id: next.length});
 return next;
}

export class LiveVoiceSession {
 constructor({createSession, onState, onTranscript, onPlaybackBlocked = () => {},
   PeerConnection = globalThis.RTCPeerConnection, mediaDevices = globalThis.navigator?.mediaDevices,
   audio = new Audio(), closeTimeout = 15000, startTimeout = 30000}) {
   Object.assign(this, {createSession, onState, onTranscript, onPlaybackBlocked,
     PeerConnection, mediaDevices, audio, closeTimeout, startTimeout});
   this.groups = []; this.finished = false; this.closing = false; this.started = false;
   this.abort = new AbortController();
   this.audio.autoplay = true;
 }
 async start() {
   this.onState('connecting');
   this.startTimer = setTimeout(() => this.finish('incomplete', 'Session startup timed out; finalization was not confirmed.'), this.startTimeout);
   try {
     this.stream = await this.mediaDevices.getUserMedia({audio: true});
     if (this.finished) { this.stream.getTracks().forEach(track => track.stop()); return; }
     // No microphone audio is sent before the authoritative session.started event.
     this.stream.getAudioTracks().forEach(track => { track.enabled = false; if (this.closing) track.stop(); });
     this.peer = new this.PeerConnection();
     this.peer.ontrack = event => {
       if (this.finished) return;
       this.audio.srcObject = event.streams[0] || new MediaStream([event.track]);
       this.resumeAudio();
     };
     this.peer.onconnectionstatechange = () => {
       if (['failed', 'disconnected', 'closed'].includes(this.peer.connectionState) && !this.finished) {
         this.finish('incomplete', 'Connection lost. Finalization was not confirmed.');
       }
     };
     this.channel = this.peer.createDataChannel('oai-events');
     this.channel.onmessage = event => {
       try { this.handle(JSON.parse(event.data)); }
       catch { this.finish('incomplete', 'An unreadable Live event interrupted this conversation.'); }
     };
     this.channel.onclose = () => {
       if (!this.finished) this.finish('incomplete', 'Event channel disconnected before session.closed.');
     };
     this.channel.onerror = () => this.finish('incomplete', 'The event channel failed before finalization.');
     this.stream.getTracks().forEach(track => this.peer.addTrack(track, this.stream));
     await this.peer.setLocalDescription(await this.peer.createOffer());
     if (this.finished) return;
     await this.waitForIce();
     if (this.finished) return;
     const result = await this.createSession(this.peer.localDescription.sdp, this.abort.signal);
     if (this.finished) return;
     this.id = result.session.id; // Opaque: never parse, transform or reconstruct it.
     await this.peer.setRemoteDescription({type: 'answer', sdp: result.transport.sdp});
     // No session.update or other startup configuration is sent. Server defaults
     // and the handoff JSON have already been applied during session creation.
   } catch {
     if (!this.finished) this.finish('incomplete', 'Live voice could not connect. Session finalization was not confirmed.');
   }
 }
 waitForIce() {
   if (this.peer.iceGatheringState === 'complete') return Promise.resolve();
   return new Promise((resolve, reject) => {
     const cleanup = () => {
       clearTimeout(timer); this.peer.removeEventListener('icegatheringstatechange', check);
       this.abort.signal.removeEventListener('abort', abort);
     };
     const check = () => { if (this.peer.iceGatheringState === 'complete') { cleanup(); resolve(); } };
     const abort = () => { cleanup(); reject(new Error('Aborted')); };
     const timer = setTimeout(() => { cleanup(); reject(new Error('ICE timeout')); }, 10000);
     this.peer.addEventListener('icegatheringstatechange', check);
     this.abort.signal.addEventListener('abort', abort, {once: true});
   });
 }
 handle(event) {
   if (this.finished) return;
   if (event.type === 'session.started') {
     this.started = true; clearTimeout(this.startTimer);
     if (this.closing) { if (this.closeRequestedByClient) this.sendClose(); }
     else {
       this.stream?.getAudioTracks().forEach(track => { track.enabled = true; });
       this.onState('active');
     }
   } else if (event.type === 'session.close') {
     this.close(false);
   } else if (event.type === 'session.closed') {
     this.finish('closed', 'Conversation ended.');
   } else if (event.type === 'session.input_transcript.delta' || event.type === 'session.output_transcript.delta') {
     this.groups = appendTranscript(this.groups, event); this.onTranscript(this.groups);
   } else if (event.type === 'error' || event.type === 'session.error') {
     this.finish('incomplete', 'The Live service reported an error. Finalization was not confirmed.');
   }
 }
 async resumeAudio() {
   if (this.finished) return;
   try { await this.audio.play(); if (!this.finished) this.onPlaybackBlocked(false); }
   catch { if (!this.finished) this.onPlaybackBlocked(true); }
 }
 setMuted(muted) { this.audio.muted = muted; }
 close(sendRequest = true) {
   if (this.finished) return this.closePromise || Promise.resolve();
   if (this.closing) return this.closePromise;
   this.closing = true;
   this.closeRequestedByClient = sendRequest;
   this.closePromise = new Promise(resolve => { this.resolveClose = resolve; });
   // Stop capture now; retain remote audio, the event channel and peer until
   // session.closed, or explicitly report incomplete finalization on failure.
   this.stream?.getTracks().forEach(track => track.stop());
   this.onState('closing', 'Finishing the conversation…');
   this.closeTimer = setTimeout(() => this.finish('incomplete', 'Finalization timed out. The conversation may be incomplete.'), this.closeTimeout);
   if (this.started && sendRequest) this.sendClose();
   return this.closePromise;
 }
 sendClose() {
   if (this.closeSent) return;
   if (this.channel?.readyState !== 'open') {
     this.finish('incomplete', 'Could not request session.close. Finalization is incomplete.'); return;
   }
   this.closeSent = true;
   try { this.channel.send(JSON.stringify({type: 'session.close'})); }
   catch { this.finish('incomplete', 'Could not send session.close. Finalization is incomplete.'); }
 }
 finish(state, message) {
   if (this.finished) return;
   this.finished = true; clearTimeout(this.startTimer); clearTimeout(this.closeTimer);
   this.abort.abort(); this.stream?.getTracks().forEach(track => track.stop());
   this.channel?.close(); this.peer?.close(); this.audio.pause(); this.audio.srcObject = null;
   this.onState(state, message); this.resolveClose?.({state, message});
 }
}
