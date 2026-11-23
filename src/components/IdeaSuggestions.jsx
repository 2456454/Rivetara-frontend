import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { inspirationPrompts, createPromptSequence } from "./inspirationPrompts";

export default function IdeaSuggestions() {
  const sequence = useRef(null);
  if (!sequence.current)
    sequence.current = createPromptSequence(inspirationPrompts.length);
  const [active, setActive] = useState(() => sequence.current.next());
  const [hovered, setHovered] = useState(false);
  const reducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  useEffect(() => {
    if (reducedMotion || hovered) return;
    const timer = setInterval(() => setActive(sequence.current.next()), 8000);
    return () => clearInterval(timer);
  }, [reducedMotion, hovered]);
  const suggestion = inspirationPrompts[active];
  return (
    <section
      className="signin-suggestions"
      aria-label="Ideas to try in Rivetara"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="signin-tip-top">
        <span>LET’S MAKE SOMETHING HAPPEN</span>
      </div>
      <div className="signin-tip-window" aria-live="off">
        <div className="signin-tip-copy signin-tip-random" key={active}>
          <span className="signin-tip-category">{suggestion.category}</span>
          <p className="signin-tip-quote">{suggestion.prompt}</p>
          <p className="signin-tip-detail">{suggestion.detail}</p>
          <div className="signin-tip-location">
            <ArrowUpRight size={13} />
            <span>Try it in {suggestion.location}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
