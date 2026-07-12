"use client";

import { useVerseStore } from "@/lib/store";

/**
 * Compact “office switch” — reveals the full top chrome when on.
 * Always visible so the immersive floor stays clear by default.
 */
export function OfficeSwitch() {
  const open = useVerseStore((s) => s.officeChromeOpen);
  const toggle = useVerseStore((s) => s.toggleOfficeChrome);
  const apiOnline = useVerseStore((s) => s.apiOnline);

  return (
    <button
      type="button"
      className={`office-switch${open ? " on" : ""}`}
      aria-pressed={open}
      aria-label={open ? "Hide office controls" : "Show office controls"}
      title={open ? "Hide controls" : "Office controls"}
      onClick={toggle}
    >
      <span className="office-switch-track" aria-hidden>
        <span className="office-switch-knob" />
      </span>
      <span className="office-switch-meta">
        <strong>Office</strong>
        <small>
          <i className={`conn-dot ${apiOnline ? "on" : "off"}`} />
          {open ? "controls on" : "floor focus"}
        </small>
      </span>
    </button>
  );
}
