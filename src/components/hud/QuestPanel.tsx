"use client";

import { getPersona } from "@/lib/orchestrator";
import { useVerseStore } from "@/lib/store";

export function QuestPanel() {
  const quests = useVerseStore((s) => s.quests);
  const selectPersona = useVerseStore((s) => s.selectPersona);
  const projects = useVerseStore((s) => s.projects);

  return (
    <aside className="quest-panel">
      <header>
        <h2>Quests</h2>
        <p className="muted">Missions routed by Rajesh</p>
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
                  onClick={() => selectPersona(q.assignee)}
                  style={{ borderColor: agent.color }}
                >
                  <strong>{q.title}</strong>
                  <span>{q.description}</span>
                  {project ? <span className="quest-project">{project.name}</span> : null}
                  <em>
                    {q.status}
                    {typeof q.progress === "number" ? ` · ${q.progress}%` : ""}
                  </em>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
