import test from 'node:test';
import assert from 'node:assert/strict';
import { LiveVoiceSession, appendTranscript } from '../src/lib/liveVoice.js';

function harness(t) {
 t.mock.timers.enable({apis:['setTimeout']});
 const events=[],sent=[],groups=[];
 const track={enabled:true,stops:0,stop(){this.stops++;}};
 const stream={getTracks:()=>[track],getAudioTracks:()=>[track]};
 const channel={readyState:'open',closed:false,send(data){sent.push(JSON.parse(data));},close(){this.closed=true;}};
 class Peer {
   iceGatheringState='complete'; connectionState='connected'; closed=false;
   createDataChannel(label){assert.equal(label,'oai-events');return channel;}
   addTrack(){} async createOffer(){return {type:'offer',sdp:'v=0\r\noffer'};}
   async setLocalDescription(value){this.localDescription=value;}
   async setRemoteDescription(value){this.remoteDescription=value;}
   close(){this.closed=true;}
 }
 const audio={autoplay:false,srcObject:'remote-audio',paused:false,async play(){},pause(){this.paused=true;}};
 const live=new LiveVoiceSession({
   createSession:async (sdp) => {assert.equal(sdp,'v=0\r\noffer');return {session:{id:'opaque/id:keep exact'},transport:{sdp:'v=0\r\nanswer'}};},
   onState:(...value)=>events.push(value),onTranscript:value=>groups.push(value),PeerConnection:Peer,
   mediaDevices:{getUserMedia:async()=>stream},audio,closeTimeout:100,startTimeout:1000
 });
 return {live,events,sent,track,audio,channel,groups};
}
test('transcript deltas preserve exact whitespace and group media intervals independently of speakers', () => {
 let groups=[];
 for (const event of [
   {type:'session.input_transcript.delta',delta:'  Fix',start_ms:0,end_ms:500},
   {type:'session.output_transcript.delta',delta:'I can ',start_ms:0,end_ms:500},
   {type:'session.input_transcript.delta',delta:' the sink. ',start_ms:500,end_ms:1000},
   {type:'session.output_transcript.delta',delta:'help.',start_ms:500,end_ms:1000},
   {type:'session.input_transcript.delta',delta:'Next note',start_ms:3000,end_ms:3500}
 ]) groups=appendTranscript(groups,event);
 assert.equal(groups.length,3); assert.equal(groups[0].text,'  Fix the sink. ');
 assert.equal(groups[1].text,'I can help.'); assert.equal(groups[0].end_ms,1000);
 assert.equal(groups[2].start_ms,3000);
});
test('WebRTC waits for session.started, uses remote SDP and never resends startup configuration', async t => {
 const {live,events,sent,track}=harness(t); await live.start();
 assert.equal(live.id,'opaque/id:keep exact');assert.equal(track.enabled,false);
 assert.deepEqual(live.peer.remoteDescription,{type:'answer',sdp:'v=0\r\nanswer'});
 assert.deepEqual(sent,[]); assert.equal(events.at(-1)[0],'connecting');
 live.handle({type:'session.started'});assert.equal(track.enabled,true);assert.equal(events.at(-1)[0],'active');
 live.handle({type:'session.closed'});
});
test('session.close retains transport and audio until session.closed and accepts final deltas', async t => {
 const {live,channel,audio,sent,groups}=harness(t);await live.start();live.handle({type:'session.started'});
 const closing=live.close();assert.deepEqual(sent,[{type:'session.close'}]);
 assert.equal(channel.closed,false);assert.equal(live.peer.closed,false);assert.equal(audio.paused,false);
 live.handle({type:'session.output_transcript.delta',delta:'Final words. ',start_ms:50,end_ms:100});
 assert.equal(groups.at(-1)[0].text,'Final words. ');
 live.handle({type:'session.closed'});assert.equal((await closing).state,'closed');
 assert.equal(channel.closed,true);assert.equal(audio.paused,true);assert.equal(live.peer.closed,true);
});
test('close timeout reports incomplete finalization instead of success', async t => {
 const {live,events}=harness(t);await live.start();live.handle({type:'session.started'});
 const closing=live.close();t.mock.timers.tick(100);
 assert.equal((await closing).state,'incomplete');assert.match(events.at(-1)[1],/timed out/);
});
test('disconnect before session.closed reports incomplete finalization', async t => {
 const {live,events}=harness(t);await live.start();live.handle({type:'session.started'});
 live.peer.connectionState='disconnected';live.peer.onconnectionstatechange();
 assert.equal(events.at(-1)[0],'incomplete');
});
test('close requested during startup waits for session.started before sending close', async t => {
 const {live,sent}=harness(t);await live.start();const closing=live.close();assert.deepEqual(sent,[]);
 live.handle({type:'session.started'});assert.deepEqual(sent,[{type:'session.close'}]);
 live.handle({type:'session.closed'});await closing;
});
test('provider session.close also preserves transport until session.closed without echoing startup or close', async t => {
 const {live,channel,sent,audio}=harness(t);await live.start();live.handle({type:'session.started'});
 live.handle({type:'session.close'});assert.equal(channel.closed,false);assert.equal(audio.paused,false);assert.deepEqual(sent,[]);
 live.handle({type:'session.closed'});assert.equal(channel.closed,true);assert.equal(audio.paused,true);
});
