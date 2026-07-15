"use client";

import { getPack } from "@/lib/pack-loader";
import { getPersona } from "@/lib/orchestrator";
import { useVerseStore } from "@/lib/store";

/**
 * Creative stand-in for the chat panel when closed —
 * a glowing desk-comms terminal on the floor HUD.
 */
export function CommsDock() {
  const selected = useVerseStore((s) => s.selectedPersona);
  const busy = useVerseStore((s) => s.busy);
  const streamingHint = useVerseStore((s) => s.streamingHint);
  const openChat = useVerseStore((s) => s.openChat);
  const bumpChatFocus = useVerseStore((s) => s.bumpChatFocus);
  const activePackId = useVerseStore((s) => s.activePackId);
  const pack = getPack(activePackId);
  const persona = getPersona(selected, pack);

  return (
    <button
      type="button"
      className={`comms-dock${busy || streamingHint ? " live" : ""}`}
      style={{ ["--p" as string]: persona.color }}
      onClick={() => {
        openChat();
        bumpChatFocus();
      }}
      aria-label={`Open chat with ${persona.name}`}
    >
      <span className="comms-screen" aria-hidden>
        <span className="comms-scan" />
        <span className="comms-lines">
          <i />
          <i />
          <i />
        </span>
      </span>
      <span className="comms-copy">
        <strong>Desk comms</strong>
        <small>
          Talk to {persona.name}
          {streamingHint ? " · live" : ""}
        </small>
      </span>
      <span className="comms-pulse" aria-hidden />
    </button>
  );
}
