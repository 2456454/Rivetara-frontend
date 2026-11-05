import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoiceCapture } from '../src/lib/voiceCapture.js';
function setup(t) {
 t.mock.timers.enable({apis:['setTimeout']});
 const result = {ended: [], errors:0, stops:0, captions:[]};
 const recorder = {start(){this.onstart();}, stop(){result.stops++; this.onend?.();}, abort(){}};
 const capture = createVoiceCapture(recorder, {onStart(){},onTranscript(words){result.captions.push(words);},onError(){result.errors++;},onEnd(words){result.ended.push(words);}});
 capture.start();
 const say = words => recorder.onresult({results: [[{transcript:words}]]});
 return {result, recorder, capture, say};
}
test('speech end sends one assembled note after a short pause', t => {
 const {result,recorder,say} = setup(t); say('Draft a quote'); recorder.onspeechend();
 t.mock.timers.tick(899); assert.equal(result.stops,0);
 t.mock.timers.tick(1); assert.deepEqual(result.ended,['Draft a quote']);
 recorder.onend(); t.mock.timers.tick(60000); assert.equal(result.stops,1); assert.equal(result.ended.length,1);
});
test('resumed speech renews the pause and includes the whole request', t => {
 const {result,recorder,say} = setup(t); say('Book a job'); recorder.onspeechend();
 t.mock.timers.tick(500); recorder.onspeechstart(); t.mock.timers.tick(700);
 assert.equal(result.stops,0); say('Book a job tomorrow at nine'); recorder.onspeechend();
 t.mock.timers.tick(900); assert.deepEqual(result.ended,['Book a job tomorrow at nine']);
});
test('browsers without speechend use result timeout; manual stop remains available', t => {
 const {result,say,capture} = setup(t); say('Expense twenty pounds');
 t.mock.timers.tick(1600); assert.deepEqual(result.ended,['Expense twenty pounds']);
 capture.stop(); assert.equal(result.stops,1);
});
test('silence, errors and navigation never create a request from missing words', t => {
 const {result,capture} = setup(t); t.mock.timers.tick(12000);
 assert.deepEqual(result.ended,['']);
 capture.cancel(); t.mock.timers.tick(60000); assert.equal(result.stops,1);
});
test('cancelling a captured note clears every timer without submitting', t => {
 const {result,say,capture} = setup(t); say('Do not submit'); capture.cancel();
 t.mock.timers.tick(60000); assert.deepEqual(result.ended,[]); assert.equal(result.stops,0);
});
