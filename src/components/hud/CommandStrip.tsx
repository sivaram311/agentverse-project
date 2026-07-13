"use client";

import { getPersona, orchestratorId } from "@/lib/orchestrator";
import { useVerseStore } from "@/lib/store";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Single bottom command strip for portrait immersion:
 * agent pulse + live status + open-chat (replaces separate status + comms).
 */
export function CommandStrip({
  onOpenSessions,
}: {
  onOpenSessions?: () => void;
} = {}) {
  const selected = useVerseStore((s) => s.selectedPersona);
  const busy = useVerseStore((s) => s.busy);
  const streamingHint = useVerseStore((s) => s.streamingHint);
  const quests = useVerseStore((s) => s.quests);
  const interaction = useVerseStore((s) => s.interaction);
  const agentState = useVerseStore((s) => s.agentStates[selected]);
  const openChat = useVerseStore((s) => s.openChat);
  const bumpChatFocus = useVerseStore((s) => s.bumpChatFocus);
  const setComposeDraft = useVerseStore((s) => s.setComposeDraft);
  const persona = getPersona(selected);

  const activeTasks = quests.filter(
    (q) => q.status === "active" || q.status === "open",
  ).length;

  const liveLabel = (() => {
    if (busy || streamingHint) return streamingHint || "Thinking…";
    if (interaction.mode === "approaching") return "Walking over…";
    if (interaction.mode === "greeting" || interaction.mode === "talking") {
      return "In conversation";
    }
    if (interaction.mode === "returning") return "Returning to desk…";
    return agentState?.status || "Online · tap seat or talk";
  })();

  function openTalk(draft?: string) {
    if (draft) setComposeDraft(draft);
    openChat();
    bumpChatFocus();
  }

  return (
    <div className="command-strip" style={{ ["--p" as string]: persona.color }}>
      <button
        type="button"
        className={`command-agent${busy || streamingHint ? " live" : ""}`}
        onClick={() => openTalk()}
        aria-label={`Open chat with ${persona.name}`}
      >
        <span className="command-avatar" aria-hidden>
          {initials(persona.name)}
        </span>
        <span className="command-screen" aria-hidden>
          <span className="comms-scan" />
          <span className="comms-lines">
            <i />
            <i />
            <i />
          </span>
        </span>
      </button>

      <div className="command-meta">
        <strong>
          {persona.name}
          <span className="muted"> · {persona.role}</span>
        </strong>
        <small>
          <span className={`live-dot${busy ? " pulse" : ""}`} />
          {liveLabel}
          {activeTasks > 0 ? ` · ${activeTasks} task${activeTasks === 1 ? "" : "s"}` : ""}
        </small>
      </div>

      <div className="command-actions">
        {onOpenSessions ? (
          <button
            type="button"
            className="chip command-chip"
            onClick={onOpenSessions}
            title="Sessions — create, archive, restore"
          >
            Sessions
          </button>
        ) : null}
        <button
          type="button"
          className="chip command-chip"
          onClick={() => openTalk("Please share a quick update on what you're working on.")}
        >
          Update
        </button>
        <button
          type="button"
          className="command-talk"
          onClick={() => openTalk()}
        >
          Talk
        </button>
      </div>

      <button
        type="button"
        className="command-delegate"
        title="Delegate via Rajesh"
        onClick={() => {
          useVerseStore.getState().selectPersona(orchestratorId);
          openTalk("Delegate this: ");
        }}
      >
        +
      </button>
    </div>
  );
}
