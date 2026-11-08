import { getAccessToken, getBusiness } from './session';
const base = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
export async function api(path, options = {}) {
  if (!base) throw Error('Rivetara backend URL is not configured');
  // Capture scope before awaiting refresh; switching businesses cannot redirect an in-flight mutation.
  const tenant = getBusiness();
  const token = await getAccessToken();
  const response = await fetch(base + path, {...options, headers: {
    'Content-Type': 'application/json', ...options.headers,
    ...(token ? {Authorization: `Bearer ${token}`} : {}),
    ...(tenant ? {'x-tenant-id': tenant} : {})
  }});
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event('rivetara:auth-expired'));
    throw Object.assign(Error(payload.error || 'Request could not be completed'), {status: response.status});
  }
  return payload;
}
export const dashboard = () => api('/api/dashboard');
export const list = table => api('/api/' + table);
export const ai = (message, options = {}) => api('/api/ai/message', {...options, method: 'POST', body: JSON.stringify({message})});
export const paid = id => api(`/api/invoices/${id}/paid`, {method: 'PATCH'});
export const consents = () => api('/api/privacy/consents');
export const setConsent = (purpose, allowed, version) => api('/api/privacy/consents', {
  method: 'PUT', body: JSON.stringify({purpose, allowed, version})
});
export const liveStatus = () => api('/api/live/status');
export const createLiveSession = (sdp, signal) => api('/api/live/sessions', {method: 'POST', body: JSON.stringify({sdp}), signal});
export const confirmProposal = (id, args) => api(`/api/proposals/${id}/confirm`, {method: 'POST', body: JSON.stringify({args})});
export const cancelProposal = id => api(`/api/proposals/${id}/cancel`, {method: 'POST'});
