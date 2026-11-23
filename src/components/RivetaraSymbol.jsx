import React from "react";

// The same forest/ivory R and orange stroke used by the Rivetara page wordmark.
export default function RivetaraSymbol({ className = "" }) {
  return (
    <span className={`signin-symbol ${className}`} aria-hidden="true">
      R
    </span>
  );
}
