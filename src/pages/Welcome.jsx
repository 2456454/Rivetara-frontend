import React, { useState } from "react";
import { api } from "../lib/api";
import AccountSignup from "./AccountSignup";
import "./fonts.css";
import "./landing.css";
import { ArrowUpRight } from "lucide-react";
const examples = {
  jobs: {
    label: "Win the work",
    request:
      "“Put together a quote for the kitchen renovation from my job notes.”",
    title: "A professional quote, ready to review.",
    copy: "Your job details, scope of work and costs brought into one clear draft. Check the details, make it yours and decide when it’s ready.",
    count: "01 / 03",
  },
  numbers: {
    label: "Sort the numbers",
    request: "“Help me get my receipts and expenses ready for my accountant.”",
    title: "A clearer picture of your paperwork.",
    copy: "Bring your expense records together, flag missing details and prepare an organised summary for your accountant to check.",
    count: "02 / 03",
  },
  growth: {
    label: "Find new customers",
    request: "“Help me promote my business to more local customers.”",
    title: "Your next campaign starts here.",
    copy: "Develop a focused advertising idea, draft the message and shape a practical campaign plan. Review the direction before taking it live.",
    count: "03 / 03",
  },
};
export default function Welcome({ onExplore, onSignIn }) {
  const [demo, setDemo] = useState("jobs");
  const [createAccount, setCreateAccount] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ kind: "", text: "" });
  const example = examples[demo];
  function changeTab(event, key) {
    const keys = Object.keys(examples);
    const index = keys.indexOf(key);
    const next = {
      ArrowRight: keys[(index + 1) % 3],
      ArrowLeft: keys[(index + 2) % 3],
      Home: keys[0],
      End: keys[2],
    }[event.key];
    if (next) {
      event.preventDefault();
      setDemo(next);
      document.getElementById("tab-" + next)?.focus();
    }
  }
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (busy || !form.reportValidity()) return;
    const fields = new FormData(form);
    setBusy(true);
    setStatus({ kind: "", text: "Saving your place…" });
    try {
      await api("/api/early-access", {
        method: "POST",
        body: JSON.stringify({
          email: fields.get("email"),
          consent: fields.get("consent") === "yes",
          website: fields.get("website") || "",
        }),
      });
      setStatus({
        kind: "success",
        text: "You’re on the list. We’ll email you with Rivetara news and early-access updates.",
      });
      form.reset();
    } catch {
      setStatus({
        kind: "error",
        text: "We couldn’t save your email. Please try again shortly. Your details are still here.",
      });
    } finally {
      setBusy(false);
    }
  }
  if (createAccount)
    return (
      <AccountSignup
        onExplore={onExplore}
        onSignIn={onSignIn}
        onBack={() => setCreateAccount(false)}
      />
    );
  return (
    <div className="rivetara-landing">
      <main>
        <div className="top">
          <div className="wrap">
            <header className="nav">
              <a href="#" className="brand" aria-label="Rivetara home">
                <span className="mark" aria-hidden="true">
                  R
                </span>
                RIVETARA
              </a>
              <nav className="navlinks" aria-label="Main navigation">
                <a href="#possibilities">The possibilities</a>
                <a href="#how-it-works">How it works</a>
                <a href="#questions">Questions</a>
              </nav>
              <div className="navright">
                <button
                  type="button"
                  className="text-button"
                  onClick={onSignIn}
                >
                  Sign in
                </button>
                <a className="btn" href="#early-access">
                  Get early access <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </header>
            <section className="hero">
              <div>
                <div className="eyebrow">Your business. A bigger future.</div>
                <h1>
                  You bring
                  <br />
                  the ambition.
                  <br />
                  <span>
                    Let AI handle
                    <br />
                    the everyday.
                  </span>
                </h1>
                <p className="intro">
                  Build the business you imagined, without carrying it all
                  yourself. One place to move your work forward, stay on top of
                  the numbers and make room to grow.
                </p>
                <div className="heroactions">
                  <a className="btn" href="#early-access">
                    Get early access{" "}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    className="btn outline"
                    onClick={onExplore}
                  >
                    Explore the demo{" "}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </button>
                </div>
                <div className="smallnote">
                  <b>✓</b> Less on your plate. More in your hands.
                </div>
              </div>
              <div>
                <div
                  className="workspace"
                  aria-label="Illustrative Rivetara business dashboard"
                >
                  <div className="windowbar">
                    <span className="dots">
                      <i></i>
                      <i></i>
                      <i></i>
                    </span>
                    <span>YOUR BUSINESS, CONNECTED</span>
                    <span>R</span>
                  </div>
                  <div className="windowbody">
                    <div className="whead">
                      <div>
                        <h3>A little more breathing room.</h3>
                        <p>Here’s what your business has lined up.</p>
                      </div>
                      <span className="avatar">JD</span>
                    </div>
                    <div className="brief">
                      <div className="eyebrow">Your daily brief</div>
                      <p>
                        <strong>The next steps are ready.</strong>
                        <br />
                        Your quote is drafted, this week’s promotion is
                        prepared, and your expenses are organised for review.
                      </p>
                    </div>
                    <div className="task">
                      <span className="check">✓</span>
                      <div>
                        Quote for the kitchen renovation
                        <small>Prepared from your job notes</small>
                      </div>
                      <span className="tag pending">Review draft</span>
                    </div>
                    <div className="task">
                      <span className="check">✓</span>
                      <div>
                        Your next advertising campaign
                        <small>Copy and creative direction, together</small>
                      </div>
                      <span className="tag pending">Review draft</span>
                    </div>
                    <div className="task">
                      <span className="check">✓</span>
                      <div>
                        Expenses, ready for your accountant
                        <small>Receipts and records in one place</small>
                      </div>
                      <span className="tag">Organised</span>
                    </div>
                    <div className="wfoot">
                      <span>Working with you, every step</span>
                      <span>You’re in control ↗</span>
                    </div>
                  </div>
                  <div className="floating">
                    <span className="seal">✓</span>
                    <div>
                      <strong>Less chasing. More building.</strong>
                      <small>
                        Your next chapter starts with a clearer day.
                      </small>
                    </div>
                  </div>
                </div>
                <p className="example">
                  ILLUSTRATIVE PRODUCT PREVIEW · EXAMPLE CONTENT
                </p>
              </div>
            </section>
            <div className="scope">
              <span>
                SUPPORT FOR THE WHOLE
                <br />
                BUSINESS JOURNEY
              </span>
              <b>Jobs &amp; customers</b>
              <b>Quotes &amp; invoices</b>
              <b>Advertising &amp; growth</b>
              <b>Expenses &amp; tax preparation</b>
            </div>
          </div>
        </div>
        <section className="section" id="possibilities">
          <div className="wrap">
            <div className="sectionhead">
              <div>
                <div className="eyebrow">Built around your ambition</div>
                <h2>
                  A business to build.
                  <br />A life to get back to.
                </h2>
              </div>
              <p>
                The vision for Rivetara is simple: bring the work behind your
                business together, with AI helping you take the next step.
              </p>
            </div>
            <div className="capabilities">
              <article className="cap">
                <span className="num">01 / RUN THE DAY</span>
                <h3>From first enquiry to paid.</h3>
                <p>
                  Turn job details into clear next steps. Keep customers, quotes
                  and invoices connected, so the admin doesn’t take over the
                  evening.
                </p>
                <ul>
                  <li>Jobs &amp; customer details</li>
                  <li>Quotes &amp; invoice drafts</li>
                </ul>
              </article>
              <article className="cap">
                <span className="num">02 / KNOW YOUR NUMBERS</span>
                <h3>More clarity. Fewer loose ends.</h3>
                <p>
                  Bring receipts, expenses and records into view. Make tax
                  preparation feel less like a scramble, with organised
                  information for your accountant.
                </p>
                <ul>
                  <li>Expenses &amp; paperwork</li>
                  <li>Tax preparation support</li>
                </ul>
              </article>
              <article className="cap">
                <span className="num">03 / BUILD WHAT’S NEXT</span>
                <h3>Give growth some attention.</h3>
                <p>
                  Make space for the work that brings in more work. Develop
                  advertising ideas, prepare customer messages and turn your
                  plans into action.
                </p>
                <ul>
                  <li>Advertising &amp; campaigns</li>
                  <li>Customer follow-ups</li>
                </ul>
              </article>
            </div>
          </div>
        </section>
        <section className="demoarea" id="demo">
          <div className="wrap demogrid">
            <div>
              <div className="eyebrow">A new way to move forward</div>
              <h2>
                Start with what
                <br />
                you need done.
              </h2>
              <p>
                No complicated brief. No blank page. Just a clear request, and a
                useful next step to review.
              </p>
              <div
                className="tabs"
                role="tablist"
                aria-label="Explore example workflows"
              >
                {Object.entries(examples).map(([key, data]) => (
                  <button
                    key={key}
                    id={"tab-" + key}
                    type="button"
                    role="tab"
                    aria-selected={demo === key}
                    aria-controls="examplepanel"
                    tabIndex={demo === key ? 0 : -1}
                    onClick={() => setDemo(key)}
                    onKeyDown={(event) => changeTab(event, key)}
                  >
                    {data.label}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="democard"
              id="examplepanel"
              role="tabpanel"
              aria-labelledby={"tab-" + demo}
              tabIndex="0"
            >
              <div className="demotop">
                <b>Your next step, made simpler.</b>
                <span>EXAMPLE WORKFLOW</span>
              </div>
              <div className="request" id="request">
                {example.request}
              </div>
              <div className="response">
                <span className="minimark">R</span>
                <div>
                  <strong id="result-title">{example.title}</strong>
                  <span id="result-copy">{example.copy}</span>
                </div>
              </div>
              <div className="demofooter">
                <span>Prepared with AI. Approved by you.</span>
                <span id="demo-count">{example.count}</span>
              </div>
            </div>
          </div>
        </section>
        <section className="section" id="how-it-works">
          <div className="wrap control">
            <div>
              <div className="eyebrow">Less effort. Your direction.</div>
              <h2>
                Support that works.
                <br />
                Control that stays yours.
              </h2>
              <p>
                The dream is a business that runs with less effort from you. The
                foundation is knowing what’s happening, what’s ready and what
                needs your decision.
              </p>
              <a href="#demo" className="btn dark">
                Explore the examples{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
            <div className="steps">
              <div className="step">
                <span>01</span>
                <div>
                  <h3>Tell Rivetara what you need.</h3>
                  <p>
                    Start with a job, an idea or the admin you’ve been putting
                    off.
                  </p>
                </div>
              </div>
              <div className="step">
                <span>02</span>
                <div>
                  <h3>Move from thinking to doing.</h3>
                  <p>
                    Bring the information together and turn it into a practical
                    draft or next step.
                  </p>
                </div>
              </div>
              <div className="step">
                <span>03</span>
                <div>
                  <h3>Review it. Make it yours. Move forward.</h3>
                  <p>
                    You choose what’s right for your business and what’s ready
                    to share.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section faq" id="questions">
          <div className="wrap faqgrid">
            <div>
              <div className="eyebrow">A few things, made clear</div>
              <h2>
                Big ambition.
                <br />
                Clear expectations.
              </h2>
            </div>
            <div>
              <details>
                <summary>Is this just for the paperwork?</summary>
                <p>
                  The Rivetara vision goes beyond admin: supporting the journey
                  from winning work to organising finances and planning growth.
                  This front-page preview illustrates that direction; it is not
                  a confirmed feature or availability list.
                </p>
              </details>
              <details>
                <summary>Do I stay in control of my business?</summary>
                <p>
                  Yes. The experience is designed around preparing work for your
                  review, with clear opportunities to check details and choose
                  your next step.
                </p>
              </details>
              <details>
                <summary>What does tax support mean?</summary>
                <p>
                  Helping organise expenses and business records for tax
                  preparation. Tax advice and filing depend on your
                  circumstances and should be handled with a qualified
                  professional. This preview does not submit returns.
                </p>
              </details>
            </div>
          </div>
        </section>
        <section className="section signup-section" id="early-access">
          <div className="wrap signup-grid">
            <div>
              <div className="eyebrow">Be part of what’s next</div>
              <h2>
                Your next chapter.
                <br />
                Get there early.
              </h2>
              <p>
                Join the Rivetara early-access list for product updates and news
                about launch availability.
              </p>
            </div>
            <form id="signup-form" onSubmit={submit}>
              <label htmlFor="signup-email">Your email address</label>
              <div className="signup-row">
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@yourbusiness.com"
                  maxLength="254"
                  required
                  aria-describedby="signup-note signup-status"
                />
                <button className="btn dark" type="submit" disabled={busy}>
                  {busy ? "Saving your place…" : "Join early access"}{" "}
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
              <div className="bot-field" aria-hidden="true">
                <label htmlFor="website">Leave this field empty</label>
                <input
                  id="website"
                  name="website"
                  tabIndex="-1"
                  autoComplete="off"
                />
              </div>
              <label className="consent">
                <input name="consent" type="checkbox" required value="yes" />
                <span>
                  I’d like to receive Rivetara early-access and product updates
                  by email.
                </span>
              </label>
              <p id="signup-note" className="signup-note">
                Your email is saved for Rivetara updates. Unsubscribe any time
                using the link in future emails.{" "}
                <a href="#early-access-privacy">Privacy notice</a>
              </p>
              <p
                id="signup-status"
                className={status.kind}
                role="status"
                aria-live="polite"
              >
                {status.text}
              </p>
            </form>
          </div>
        </section>
        <section className="privacy-section" id="early-access-privacy">
          <div className="wrap">
            <details>
              <summary>How we use your early-access email</summary>
              <p>
                We store your email address, signup date and consent to receive
                Rivetara early-access and product updates. The list is private
                and joining does not create a paid account or guarantee access.
                We use the hosted database supporting Rivetara to keep these
                records. You can withdraw consent using the unsubscribe link in
                future update emails or request removal by replying to an
                update. Automated update emails are not active yet.
              </p>
            </details>
          </div>
        </section>
        <section className="closing">
          <div className="wrap closinginner">
            <div>
              <div className="eyebrow">Make room for what’s next</div>
              <h2>
                Your ambition deserves
                <br />
                more than your spare time.
              </h2>
              <p>Imagine what you could build with less holding you back.</p>
            </div>
            <a className="btn" href="#early-access">
              Join the early-access list{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
      <footer>
        <div className="wrap foot">
          <a href="#" className="brand">
            <span className="mark" aria-hidden="true">
              R
            </span>
            RIVETARA
          </a>
          <span>Built around your business. And the person behind it.</span>
          <button
            type="button"
            className="text-button"
            onClick={() => setCreateAccount(true)}
          >
            Create an account
          </button>
          <a href="#">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}
