"use client";

import { workspaceHintForProject } from "@/lib/project-workspace";
import { useVerseStore } from "@/lib/store";

export function ProjectSwitcher() {
  const projects = useVerseStore((s) => s.projects);
  const activeProjectId = useVerseStore((s) => s.activeProjectId);
  const setActiveProject = useVerseStore((s) => s.setActiveProject);

  return (
    <div className="project-switcher" role="group" aria-label="Projects">
      {projects.map((p) => {
        const hint = workspaceHintForProject(p);
        const path = p.workspacePath?.trim() || hint;
        return (
          <button
            key={p.id}
            type="button"
            className={activeProjectId === p.id ? "on" : undefined}
            style={{ ["--p" as string]: p.color }}
            title={p.idea ? `${p.idea}\n${path}` : path}
            onClick={() => setActiveProject(p.id)}
          >
            {p.name}
            <span style={{ opacity: 0.55, marginLeft: "0.35em" }}>· {hint}</span>
          </button>
        );
      })}
    </div>
  );
}
