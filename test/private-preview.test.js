import { createServer } from 'node:http';
import { once } from 'node:events';
import assert from 'node:assert/strict';
import test from 'node:test';
import { privatePreview } from '../preview/railway.mjs';

test('the Railway gateway protects the preview and preserves the original request origin', async () => {
  const worker = {
    async fetch(request, env) {
      if (new URL(request.url).pathname === '/') return new Response('New Rivetara homepage');
      assert.equal(new URL(request.url).pathname, '/api/starter-plan');
      assert.equal(new URL(request.url).origin, request.headers.get('Origin'));
      assert.equal(request.headers.get('Authorization'), null);
      assert.equal(env.STARTER_PLAN_BRIDGE_SECRET, 'server-only');
      assert.deepEqual(await request.json(), {idea: 'Garden maintenance'});
      return Response.json({milestone: 'Draft your first quote'});
    }
  };
  const preview = privatePreview(worker, {accessKey: 'test-access', bridgeSecret: 'server-only'});
  const server = createServer((req, res) => preview(req, res, () => res.end('Public app')));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = 'http://127.0.0.1:' + server.address().port;
  try {
    const auth = {Authorization: 'Basic ' + Buffer.from('rivetara:test-access').toString('base64')};
    for (const path of ['/', '/app', '/index.html', '/assets/site.js']) {
      assert.equal((await fetch(base + path)).status, 401);
    }
    assert.equal(await (await fetch(base + '/healthz')).text(), 'ok');
    assert.equal(await (await fetch(base, {headers: auth})).text(), 'New Rivetara homepage');
    assert.equal(await (await fetch(base + '/app', {headers: auth})).text(), 'Public app');
    assert.equal((await fetch(base + '/preview/api/starter-plan', {method: 'POST'})).status, 401);
    const response = await fetch(base + '/preview/api/starter-plan', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from('rivetara:test-access').toString('base64'),
        'Content-Type': 'application/json',
        Origin: base,
      },
      body: JSON.stringify({idea: 'Garden maintenance'}),
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
    assert.deepEqual(await response.json(), {milestone: 'Draft your first quote'});
  } finally {
    server.close();
  }
});
