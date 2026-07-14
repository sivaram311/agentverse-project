"use client";

import { getPersona } from "@/lib/orchestrator";
import { useVerseStore } from "@/lib/store";
import { portalApi } from "@/lib/api";

export function QuestPanel() {
  const quests = useVerseStore((s) => s.quests);
  const selectPersona = useVerseStore((s) => s.selectPersona);
  const projects = useVerseStore((s) => s.projects);
  const authConfig = useVerseStore((s) => s.authConfig);
  const sessionTabs = useVerseStore((s) => s.sessionTabs);

  async function focusQuest(
    assignee: Parameters<typeof selectPersona>[0],
    sessionId?: string | null,
  ) {
    selectPersona(assignee);
    if (!sessionId || !authConfig) return;
    const store = useVerseStore.getState();
    try {
      const latest = await portalApi.getSession(sessionId, authConfig);
      const messages = await portalApi.getMessages(sessionId, authConfig);
      store.setSession(latest);
      store.setMessages(messages);
      const tab = sessionTabs.find((t) => t.sessionId === sessionId);
      store.registerSessionForPath(
        latest.workspacePath || tab?.workspacePath || store.workspacePath,
        latest.id,
        tab?.label,
      );
      store.syncQuestFromSessionStatus(latest.id, latest.status);
      store.openChat();
    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Could not open quest session");
    }
  }

  return (
    <aside className="quest-panel">
      <header>
        <h2>Quests</h2>
        <p className="muted">Missions bound to portal session status</p>
      </header>
      <ul>
        {quests.length === 0 ? (
          <li className="muted">No active missions yet.</li>
        ) : (
          quests.map((q) => {
            const agent = getPersona(q.assignee);
            const project = projects.find((p) => p.id === q.projectId);
            return (
              <li key={q.id}>
                <button
                  type="button"
                  className={`quest-card status-${q.status}`}
                  onClick={() => void focusQuest(q.assignee, q.sessionId)}
                  style={{ borderColor: agent.color }}
                >
                  <strong>{q.title}</strong>
                  <span>{q.description}</span>
                  {project ? <span className="quest-project">{project.name}</span> : null}
                  {q.sessionId ? (
                    <span className="quest-session muted">
                      session {q.sessionId.slice(0, 8)}…
                    </span>
                  ) : null}
                  <em>{q.status}</em>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
