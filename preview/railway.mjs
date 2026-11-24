import { timingSafeEqual } from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export function privatePreview(worker, {accessKey, bridgeSecret}) {
  const expected = accessKey && Buffer.from('Basic ' + Buffer.from('rivetara:' + accessKey).toString('base64'));
  return async (req, res, next) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/private-preview.mjs') {
      res.writeHead(404).end();
      return;
    }
    if (pathname !== '/preview' && !pathname.startsWith('/preview/')) return next();
    const headers = {'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex'};
    if (!expected) {
      res.writeHead(503, headers).end('Private preview is unavailable.');
      return;
    }
    if (pathname === '/preview') {
      res.writeHead(302, {...headers, Location: '/preview/'}).end();
      return;
    }
    const actual = Buffer.from(req.headers.authorization || '');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      res.writeHead(401, {...headers, 'WWW-Authenticate': 'Basic realm="Rivetara private preview", charset="UTF-8"'}).end('Sign in to the private preview.');
      return;
    }
    try {
      const protocol = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const url = new URL(req.url, protocol + '://' + req.headers.host);
      url.pathname = url.pathname.slice('/preview'.length);
      const requestHeaders = new Headers(req.headers);
      requestHeaders.delete('authorization');
      const init = {method: req.method, headers: requestHeaders};
      if (!['GET', 'HEAD'].includes(req.method)) {
        init.body = Readable.toWeb(req);
        init.duplex = 'half';
      }
      const response = await worker.fetch(new Request(url, init), {STARTER_PLAN_BRIDGE_SECRET: bridgeSecret});
      const responseHeaders = new Headers(response.headers);
      for (const [name, value] of Object.entries(headers)) responseHeaders.set(name, value);
      res.writeHead(response.status, Object.fromEntries(responseHeaders));
      if (response.body) await pipeline(Readable.fromWeb(response.body), res);
      else res.end();
    } catch {
      if (res.headersSent) res.destroy();
      else res.writeHead(503, headers).end('Private preview is unavailable.');
    }
  };
}
