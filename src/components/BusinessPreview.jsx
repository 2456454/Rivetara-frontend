import React, { useEffect, useState } from "react";

const scenes = [
  {
    label: "Everyday",
    title: "A clearer day starts here.",
    subtitle: "Your jobs, paperwork and next steps.",
    eyebrow: "RUN THE DAY",
    headline: "From enquiry to a clear next step.",
    text: "Bring job details together, prepare your paperwork and review what’s ready.",
    rows: [
      ["A new customer enquiry", "Details ready to organise", "Next step"],
      [
        "Quote for the kitchen renovation",
        "Prepared from your job notes",
        "Draft",
      ],
      [
        "Invoice for completed work",
        "Check the details before sharing",
        "Draft",
      ],
    ],
    footer: "Less chasing. More building.",
    note: "A little more breathing room in your day.",
  },
  {
    label: "Planning",
    title: "Give your idea a way forward.",
    subtitle: "A practical place to start building.",
    eyebrow: "BUILD YOUR BUSINESS",
    headline: "One idea. One manageable next step.",
    text: "Explore your skills, time and budget, then shape a plan you can work through.",
    rows: [
      [
        "Your business starting point",
        "Skills, time and budget, together",
        "Your plan",
      ],
      [
        "A small test of your idea",
        "Learn before making a bigger commitment",
        "Next step",
      ],
      [
        "Your first customer profile",
        "Get clearer on who you want to help",
        "Explore",
      ],
    ],
    footer: "Start small. Keep moving.",
    note: "Build around your ambition and your circumstances.",
  },
  {
    label: "Marketing",
    title: "Help the right people find you.",
    subtitle: "Make room for your next opportunity.",
    eyebrow: "ADVERTISING & GROWTH",
    headline: "Turn a useful idea into a clear message.",
    text: "Explore campaign ideas, prepare your words and review the direction before publishing.",
    rows: [
      [
        "Your next campaign idea",
        "A focused message for local customers",
        "Idea",
      ],
      ["A business introduction", "Clear words for what you do", "Draft"],
      [
        "A customer follow-up",
        "A thoughtful message, ready to review",
        "Draft",
      ],
    ],
    footer: "Make your next move a thoughtful one.",
    note: "Your message, your voice, your final decision.",
  },
  {
    label: "Finances",
    title: "Bring the numbers into focus.",
    subtitle: "Fewer loose ends. A clearer picture.",
    eyebrow: "EXPENSES & TAX PREPARATION",
    headline: "Organised records. An easier handover.",
    text: "Bring receipts and expenses together, spot missing details and prepare for your accountant.",
    rows: [
      ["Receipts and expenses", "Business records in one place", "Organise"],
      ["Missing paperwork", "Know which details need checking", "Review"],
      [
        "Your accountant handover",
        "Records prepared for professional review",
        "Prepare",
      ],
    ],
    footer: "A little clarity goes a long way.",
    note: "Organisation support, with professional review where needed.",
  },
];
export default function BusinessPreview() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const reduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  useEffect(() => {
    if (reduced || held) return;
    const timer = setInterval(
      () => setActive((index) => (index + 1) % scenes.length),
      8000,
    );
    return () => clearInterval(timer);
  }, [reduced, held, active]);
  function selectWithKeys(event, index) {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % scenes.length;
    if (event.key === "ArrowLeft")
      next = (index + scenes.length - 1) % scenes.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = scenes.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      setActive(next);
      document.getElementById("business-preview-tab-" + next)?.focus();
    }
  }
  const scene = scenes[active];
  return (
    <div
      className="workspace business-preview"
      aria-label="Illustrative Rivetara business support tools"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false);
      }}
    >
      <div className="windowbar">
        <span className="dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>YOUR BUSINESS, CONNECTED</span>
        <span aria-hidden="true">R</span>
      </div>
      <div
        className="business-preview-tabs"
        role="tablist"
        aria-label="Explore business support tools"
      >
        {scenes.map((item, index) => (
          <button
            type="button"
            key={item.label}
            id={"business-preview-tab-" + index}
            role="tab"
            aria-controls="business-preview-panel"
            aria-selected={active === index}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => selectWithKeys(event, index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        className="business-preview-panel"
        id="business-preview-panel"
        role="tabpanel"
        aria-labelledby={"business-preview-tab-" + active}
        aria-live="off"
      >
        <div className="windowbody business-preview-scene" key={active}>
          <div className="whead">
            <div>
              <h3>{scene.title}</h3>
              <p>{scene.subtitle}</p>
            </div>
          </div>
          <div className="brief">
            <div className="eyebrow">{scene.eyebrow}</div>
            <p>
              <strong>{scene.headline}</strong>
              <br />
              {scene.text}
            </p>
          </div>
          {scene.rows.map(([title, detail, status]) => (
            <div className="task" key={title}>
              <span className="check" aria-hidden="true">
                ✓
              </span>
              <div>
                {title}
                <small>{detail}</small>
              </div>
              <span className="tag pending">{status}</span>
            </div>
          ))}
          <div className="wfoot">
            <span>Working with you, every step</span>
            <span>You’re in control ↗</span>
          </div>
        </div>
        <div className="floating">
          <span className="seal" aria-hidden="true">
            ✓
          </span>
          <div>
            <strong>{scene.footer}</strong>
            <small>{scene.note}</small>
          </div>
        </div>
      </div>
    </div>
  );
}
