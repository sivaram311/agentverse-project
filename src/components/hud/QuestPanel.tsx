"use client";

import { getPersona } from "@/lib/orchestrator";
import { useVerseStore } from "@/lib/store";

export function QuestPanel() {
  const quests = useVerseStore((s) => s.quests);
  const selectPersona = useVerseStore((s) => s.selectPersona);

  return (
    <aside className="quest-panel">
      <header>
        <h2>Quests</h2>
        <p className="muted">Missions routed by Rajveer</p>
      </header>
      <ul>
        {quests.length === 0 ? (
          <li className="muted">No active missions yet.</li>
        ) : (
          quests.map((q) => {
            const agent = getPersona(q.assignee);
            return (
              <li key={q.id}>
                <button
                  type="button"
                  className={`quest-card status-${q.status}`}
                  onClick={() => selectPersona(q.assignee)}
                  style={{ borderColor: agent.color }}
                >
                  <strong>{q.title}</strong>
                  <span>{q.description}</span>
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
