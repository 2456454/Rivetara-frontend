import { createClient } from '@supabase/supabase-js';
let authClient;
let tenantId = '';
export function configureAuth({url, anonKey}) {
  if (!url || !anonKey) throw Error('Sign-in is not configured yet.');
  authClient ||= createClient(url, anonKey, {auth: {
    persistSession: false, autoRefreshToken: true, detectSessionInUrl: false
  }});
  return authClient;
}
export async function getAccessToken() {
  if (!authClient) return '';
  const {data} = await authClient.auth.getSession();
  return data.session?.access_token || '';
}
export function selectBusiness(id) { tenantId = id || ''; }
export function getBusiness() { return tenantId; }
