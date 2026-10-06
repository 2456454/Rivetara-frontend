import React, { useState } from "react";
import { authClient } from "../lib/auth";
export default function Login({ onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    if (!authClient || busy) return;
    setBusy(true); setError("");
    try {
      const result = await authClient.auth.signInWithPassword({ email: email.trim(), password });
      setPassword("");
      if (result.error) { setError("Unable to sign in. Check your details and confirm your email."); return; }
      const verified = await authClient.auth.getUser();
      if (verified.error || !verified.data.user?.email_confirmed_at) {
        await authClient.auth.signOut();
        setError("Confirm your email before signing in."); return;
      }
      onSignedIn?.(verified.data.user);
    } catch { setPassword(""); setError("Sign-in is unavailable. Please try again later."); }
    finally { setBusy(false); }
  }
  return <main className="login-page">
    <a className="login-brand" href="/">RIVETARA</a>
    <section className="login-card">
      <p className="eye">YOUR BUSINESS, IN ONE PLACE</p>
      <h1>Welcome back.</h1>
      <p className="muted">Sign in to your Rivetara account.</p>
      {!authClient && <p className="login-notice" role="status">Sign-in is not available yet. This preview is waiting for account setup.</p>}
      <form onSubmit={submit}>
        <label htmlFor="login-email">Email address</label>
        <input id="login-email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} disabled={!authClient || busy} />
        <label htmlFor="login-password">Password</label>
        <div className="login-password">
          <input id="login-password" type={visible ? "text" : "password"} autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} disabled={!authClient || busy} />
          <button type="button" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={()=>setVisible(!visible)} disabled={!authClient || busy}>{visible ? "Hide" : "Show"}</button>
        </div>
        {error && <p role="alert" className="login-error">{error}</p>}
        <button className="login-submit" disabled={!authClient || busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="muted login-help">Account registration and password recovery are not available in this preview.</p>
      <a href="/">Back to Rivetara</a>
    </section>
  </main>;
}
