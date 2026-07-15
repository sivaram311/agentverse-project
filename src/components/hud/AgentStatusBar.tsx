"use client";

import { getPack } from "@/lib/pack-loader";
import { getPersona, orchestratorId } from "@/lib/orchestrator";
import { useVerseStore } from "@/lib/store";

/** Thin status strip + quick action chips above the chat / over the scene. */
export function AgentStatusBar() {
  const selected = useVerseStore((s) => s.selectedPersona);
  const busy = useVerseStore((s) => s.busy);
  const streamingHint = useVerseStore((s) => s.streamingHint);
  const quests = useVerseStore((s) => s.quests);
  const interaction = useVerseStore((s) => s.interaction);
  const agentState = useVerseStore((s) => s.agentStates[selected]);
  const activePackId = useVerseStore((s) => s.activePackId);
  const pack = getPack(activePackId);
  const persona = getPersona(selected, pack);

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
    return agentState?.status || "Online";
  })();

  function quick(prompt: string, personaId = selected) {
    const store = useVerseStore.getState();
    store.selectPersona(personaId);
    store.setComposeDraft(prompt);
    store.bumpChatFocus();
  }

  return (
    <div className="agent-status-bar">
      <div className="agent-status-main">
        <span className="agent-status-swatch" style={{ background: persona.color }} />
        <div className="agent-status-text">
          <strong>
            {persona.name}
            <span className="muted"> — {persona.title}</span>
          </strong>
          <small>
            <span className={`live-dot${busy ? " pulse" : ""}`} />
            {liveLabel}
            {activeTasks > 0 ? ` · ${activeTasks} task${activeTasks === 1 ? "" : "s"}` : ""}
          </small>
        </div>
      </div>
      <div className="agent-quick-actions" role="group" aria-label="Quick actions">
        <button
          type="button"
          className="chip"
          onClick={() => quick("Delegate this: ", orchestratorId)}
        >
          Delegate task
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => quick("Give me a status report on current quests.")}
        >
          View reports
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => quick("Please share a quick update on what you're working on.")}
        >
          Ask for update
        </button>
      </div>
    </div>
  );
}
