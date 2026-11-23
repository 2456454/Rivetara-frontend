import React, { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, ArrowLeft, LoaderCircle } from "lucide-react";
import { api } from "../lib/api";
import BrandMark from "../components/BrandMark";

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
    <div className="welcome-page">
      <header className="welcome-nav">
        <button className="wordmark" onClick={onBack}>
          <BrandMark />
          rivetara<span className="brand-dot">.</span>
        </button>
        <button className="welcome-login" onClick={onSignIn}>
          Sign in <ArrowRight size={16} />
        </button>
      </header>
      <main className="welcome-main">
        <section className="signup-layout">
          <div className="signup-intro">
            <button className="back-link" onClick={() => onBack()}>
              <ArrowLeft size={16} /> Back to welcome
            </button>
            <p className="welcome-eyebrow">LESS ADMIN. MORE LIFE.</p>
            <h1>
              A little help.
              <br />A lot off your mind.
            </h1>
            <p>
              Make room for the work you love. A simpler way to keep your jobs
              and paperwork in order.
            </p>
            <div className="signup-trust">
              <ShieldCheck size={20} />
              <span>
                Your business stays yours. Optional AI and microphone
                permissions start off.
              </span>
            </div>
          </div>
          <div className="signup-card">
            <BrandMark className="signup-mark" />
            <h2>{sent ? "Check your email" : "Let’s get you started."}</h2>
            <p>
              {sent
                ? "One step closer to less admin."
                : "Create your Rivetara account."}
            </p>
            {!sent && (
              <form onSubmit={submit}>
                <fieldset disabled={!available || busy}>
                  <label htmlFor="signup-name">Your name</label>
                  <input
                    id="signup-name"
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    placeholder="Alex Taylor"
                    disabled={busy}
                  />
                  <label htmlFor="signup-email">Email address</label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    placeholder="you@yourbusiness.co.uk"
                    disabled={busy}
                  />
                  <label htmlFor="signup-password">Create a password</label>
                  <input
                    id="signup-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                    placeholder="At least 12 characters"
                    disabled={busy}
                  />
                  <small>
                    No payment details needed to request an account. A
                    subscription or trial is not started here.
                  </small>
                  <button className="primary-cta" disabled={busy} type="submit">
                    {busy ? (
                      <>
                        <LoaderCircle size={18} /> Creating account…
                      </>
                    ) : (
                      <>
                        Create account <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </fieldset>
              </form>
            )}
            {!available && !sent && (
              <p className="signup-message">
                Account creation isn’t open yet. Explore the demo below while we
                get things ready.
              </p>
            )}
            {message && (
              <p className="signup-message" role="status">
                {message}
              </p>
            )}
            <button className="demo-link" onClick={onSignIn}>
              Already have an account? Sign in
            </button>
            <button className="demo-link" onClick={onExplore}>
              Just looking? Explore the demo
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
