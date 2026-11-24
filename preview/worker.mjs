const pages = new Map([['/', "__HOME__"], ['/explore', "__EXPLORE__"], ['/start', "__START__"], ['/search-preview.html', "__SEARCH__"]]);
const railway = 'https://rivatera-backend-production.up.railway.app/api/preview/starter-plan';
const privateHeaders = {'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex'};
const unavailable = () => Response.json({error: 'STARTER_UNAVAILABLE'}, {status: 503, headers: privateHeaders});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/starter-plan') {
      if (request.method !== 'POST') return new Response(null, {status: 405, headers: {Allow: 'POST'}});
      if (request.headers.get('Origin') !== url.origin ||
          request.headers.get('Content-Type')?.split(';')[0] !== 'application/json') {
        return new Response(null, {status: 403});
      }
      const secret = env?.STARTER_PLAN_BRIDGE_SECRET || globalThis.process?.env?.STARTER_PLAN_BRIDGE_SECRET;
      if (!secret) {
        console.warn('Starter plan bridge is not configured');
        return unavailable();
      }
      const reader = request.body?.getReader();
      if (!reader) return new Response(null, {status: 400});
      const decoder = new TextDecoder();
      let body = '';
      let size = 0;
      try {
        for (;;) {
          const {done, value} = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 4096) {
            await reader.cancel();
            return new Response(null, {status: 413});
          }
          body += decoder.decode(value, {stream: true});
        }
        body += decoder.decode();
        const response = await fetch(railway, {
          method: 'POST',
          redirect: 'error',
          headers: {
            'Authorization': 'Bearer ' + secret,
            'Content-Type': 'application/json',
          },
          body,
          signal: AbortSignal.timeout(22000),
        });
        if (!response.ok) {
          console.warn('Starter plan upstream status', response.status);
          return unavailable();
        }
        return new Response(response.body, {headers: {...privateHeaders, 'Content-Type': 'application/json'}});
      } catch (error) {
        console.warn('Starter plan request failed', error?.name);
        return unavailable();
      }
    }
    if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, {status: 405, headers: {Allow: 'GET, HEAD'}});
    if (!pages.has(url.pathname)) return new Response(null, {status: 404});
    return new Response(request.method === 'HEAD' ? null : pages.get(url.pathname), {
      headers: {...privateHeaders, 'Content-Type': 'text/html; charset=utf-8'},
    });
  },
};
