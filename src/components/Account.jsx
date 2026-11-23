import React, { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { configureAuth, selectBusiness } from "../lib/session";
import SignInScene from "./SignInScene";

export default function Account({ children, onBack }) {
  const client = useRef(null);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [businesses, setBusinesses] = useState(null);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let subscription;
    api("/api/auth/config")
      .then((config) => {
        if (!active) return;
        client.current = configureAuth(config);
        subscription = client.current.auth.onAuthStateChange(
          (_event, session) => {
            if (!active) return;
            setSignedIn(Boolean(session));
            if (!session) {
              selectBusiness("");
              setSelected("");
              setBusinesses(null);
            }
          },
        ).data.subscription;
        setReady(true);
      })
      .catch(() => {
        if (active)
          setError("Sign-in is not configured yet. Please try again later.");
      });
    const expired = () => {
      client.current?.auth.signOut({ scope: "local" });
      setError("Your session has expired. Please sign in again.");
    };
    window.addEventListener("rivetara:auth-expired", expired);
    return () => {
      active = false;
      subscription?.unsubscribe();
      window.removeEventListener("rivetara:auth-expired", expired);
    };
  }, []);
  useEffect(() => {
    if (!signedIn) return;
    let active = true;
    api("/api/auth/me")
      .then((me) => {
        if (!active) return;
        setBusinesses(me.businesses);
        if (me.businesses.length) {
          selectBusiness(me.businesses[0].tenant_id);
          setSelected(me.businesses[0].tenant_id);
        }
      })
      .catch(() => {
        if (active)
          setError(
            "Business access could not be verified. Please sign out and try again.",
          );
      });
    return () => {
      active = false;
    };
  }, [signedIn]);
  async function signIn(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const fields = new FormData(event.currentTarget);
    try {
      const { data, error: failure } =
        await client.current.auth.signInWithPassword({
          email: fields.get("email"),
          password: fields.get("password"),
        });
      if (failure || !data.user?.email_confirmed_at) throw Error();
    } catch {
      setError(
        "Sign-in failed. Check your email and password, and confirm your email first.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function createBusiness(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const name = new FormData(event.currentTarget).get("name");
    try {
      await api("/api/businesses", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      const me = await api("/api/auth/me");
      setBusinesses(me.businesses);
      if (me.businesses.length) {
        selectBusiness(me.businesses[0].tenant_id);
        setSelected(me.businesses[0].tenant_id);
      }
    } catch {
      setError("Your business could not be set up. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    selectBusiness("");
    setSelected("");
    setBusinesses(null);
    setSignedIn(false);
    await client.current?.auth.signOut({ scope: "local" });
    onBack();
  }
  if (signedIn && selected && businesses)
    return (
      <>
        <div className="account-bar">
          <label>
            Business{" "}
            <select
              aria-label="Business"
              value={selected}
              onChange={(event) => {
                selectBusiness(event.target.value);
                setSelected(event.target.value);
              }}
            >
              {businesses.map((b) => (
                <option key={b.tenant_id} value={b.tenant_id}>
                  {b.organisations?.name || "Your business"}
                </option>
              ))}
            </select>
          </label>
          <button onClick={signOut}>Sign out</button>
        </div>
        {children(selected)}
      </>
    );
  return (
    <SignInScene signedIn={signedIn} onBack={signedIn ? signOut : onBack}>
      <div className="signin-form-heading">
        <span className="signin-eyebrow">
          {signedIn ? "MAKE IT YOURS" : "A LITTLE FOCUS. A LOT OF POSSIBILITY."}
        </span>
        <h1>{signedIn ? "Make room for your idea." : "Welcome back."}</h1>
        <p>
          {signedIn
            ? "Let’s give your next chapter a place to grow."
            : "Your next big idea is in good company. Let’s get back to building it."}
        </p>
      </div>
      {!signedIn ? (
        <form className="signin-form" onSubmit={signIn}>
          <div className="signin-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@yourbusiness.com"
              required
              maxLength={254}
            />
          </div>
          <div className="signin-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              maxLength={128}
            />
          </div>
          <button
            className="signin-submit"
            disabled={!ready || busy}
            type="submit"
          >
            {busy ? "Signing in…" : "Sign in"}
            <span aria-hidden="true">→</span>
          </button>
          <p className="signin-verified">
            Use the email you verified when creating your account.
          </p>
          <details className="signin-session">
            <summary>About your session</summary>
            <p>
              For now, refreshing or closing this page signs you out. Your saved
              business records remain in your workspace.
            </p>
          </details>
        </form>
      ) : businesses?.length === 0 ? (
        <form className="signin-form" onSubmit={createBusiness}>
          <p className="signin-helper">
            An idea or project name is fine if you’re just starting out.
          </p>
          <div className="signin-field">
            <label htmlFor="business-name">Workspace or business name</label>
            <input
              id="business-name"
              name="name"
              placeholder="The beginning of something good"
              required
              maxLength={200}
            />
          </div>
          <button className="signin-submit" disabled={busy} type="submit">
            {busy ? "Setting up…" : "Create business"}
            <span aria-hidden="true">→</span>
          </button>
        </form>
      ) : (
        <p className="signin-helper" role="status">
          Checking business access…
        </p>
      )}
      {error && (
        <p className="signin-error" role="alert">
          {error}
        </p>
      )}
      <div className="signin-form-bottom">
        <span>One idea. One next step. Your pace.</span>
      </div>
    </SignInScene>
  );
}
