import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import SignInScene from "../components/SignInScene";

export default function AccountSignup({ onExplore, onSignIn, onBack }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    api("/api/auth/status")
      .then((result) => setAvailable(result.signupAvailable === true))
      .catch(() => setAvailable(false));
  }, []);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const fields = new FormData(event.currentTarget);
    try {
      const result = await api("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: fields.get("name"),
          email: fields.get("email"),
          password: fields.get("password"),
        }),
      });
      if (result.status !== "verification_required")
        throw Error("Account setup was not confirmed.");
      setSent(true);
      setMessage(
        "Check your inbox for the next step. If this email is eligible, you’ll receive an account confirmation link.",
      );
    } catch (error) {
      setMessage(
        error.message.includes("SIGNUP_UNAVAILABLE")
          ? "Account creation isn’t open just yet. You can explore the demo below — no account needed."
          : "We couldn’t complete sign-up. Please try again later.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <SignInScene mode="signup" onBack={onBack}>
      <div className="signin-form-heading">
        <span className="signin-eyebrow">START SMALL. THINK BIG.</span>
        <h1>{sent ? "One step closer." : "Make a start."}</h1>
        <p>
          {sent
            ? "Your next chapter is taking shape. Check your inbox for the next step."
            : "Your idea doesn’t need to be perfect. Give it a place to grow, one practical step at a time."}
        </p>
      </div>
      {!sent && (
        <form className="signin-form" onSubmit={submit}>
          <fieldset
            className="signin-signup-fields"
            disabled={!available || busy}
          >
            <div className="signin-field">
              <label htmlFor="signup-name">Your name</label>
              <input
                id="signup-name"
                name="name"
                autoComplete="name"
                required
                maxLength={100}
                placeholder="Alex Taylor"
              />
            </div>
            <div className="signin-field">
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@yourbusiness.com"
              />
            </div>
            <div className="signin-field">
              <label htmlFor="signup-password">Create a password</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
                placeholder="At least 12 characters"
              />
            </div>
            <button className="signin-submit" type="submit" disabled={busy}>
              {busy ? "Creating account…" : "Create account"}
              <ArrowRight size={16} />
            </button>
            <p className="signin-verified">
              No payment details. No subscription started here.
            </p>
          </fieldset>
        </form>
      )}
      {!available && !sent && (
        <p className="signin-availability" role="status">
          Account creation isn’t open yet. Explore the demo while we get things
          ready, or join early access on the welcome page.
        </p>
      )}
      {message && (
        <p className="signin-helper" role="status">
          {message}
        </p>
      )}
      <div className="signin-account-links">
        <button type="button" onClick={onSignIn}>
          Already have an account? <span>Sign in ↗</span>
        </button>
        <button type="button" onClick={onExplore}>
          Take a look around <ArrowRight size={13} />
        </button>
      </div>
      <div className="signin-form-bottom">
        Your ambition. Your pace. A clearer way forward.
      </div>
    </SignInScene>
  );
}
