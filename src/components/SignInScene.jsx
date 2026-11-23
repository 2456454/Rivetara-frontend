import React from "react";
import IdeaSuggestions from "./IdeaSuggestions";
import RivetaraSymbol from "./RivetaraSymbol";
import { ArrowLeft } from "lucide-react";
import "../pages/fonts.css";
import "./signin-font.css";
import "./signin.css";

export default function SignInScene({
  children,
  signedIn,
  onBack,
  mode = "signin",
}) {
  return (
    <main className="signin-view">
      <section
        className="signin-art"
        aria-label="A little inspiration for your next chapter"
      >
        <div className="signin-landscape" aria-hidden="true" />
        <div className="signin-image-shade" aria-hidden="true" />
        <a
          href="#"
          className="signin-brand"
          onClick={(event) => {
            event.preventDefault();
            onBack();
          }}
          aria-label="Rivetara — back to welcome"
        >
          <RivetaraSymbol />
          <span>RIVETARA</span>
        </a>
        <div className="signin-art-content">
          <span className="signin-eyebrow">YOUR AMBITION BELONGS HERE</span>
          <h2>
            Your next chapter
            <br />
            starts with <em>an idea.</em>
          </h2>
          <p className="signin-art-intro">
            You don’t have to have it all figured out.
            <br />
            Just a little curiosity about what comes next.
          </p>
          <IdeaSuggestions />
        </div>
        <div className="signin-art-footer">
          <span>BUILD SOMETHING THAT’S YOURS.</span>
          <span>With Rivetara.</span>
        </div>
      </section>
      <section
        className="signin-panel"
        aria-label={
          signedIn
            ? "Set up your business"
            : mode === "signup"
              ? "Create your Rivetara account"
              : "Sign in to Rivetara"
        }
      >
        <div className="signin-panel-top">
          <button type="button" className="signin-back" onClick={onBack}>
            <ArrowLeft size={14} />
            {signedIn ? "Sign out" : "Back to welcome"}
          </button>
          <span className="signin-panel-note">YOUR SPACE TO GROW</span>
        </div>
        <div className="signin-form-wrap">{children}</div>
        <footer className="signin-panel-footer">
          <span>
            Built around your business.
            <br />
            And the person behind it.
          </span>
          <RivetaraSymbol className="signin-footer-symbol" />
        </footer>
      </section>
    </main>
  );
}
