"use client";

import { useVerseStore } from "@/lib/store";

export function ProjectSwitcher() {
  const projects = useVerseStore((s) => s.projects);
  const activeProjectId = useVerseStore((s) => s.activeProjectId);
  const setActiveProject = useVerseStore((s) => s.setActiveProject);

  return (
    <div className="project-switcher" role="group" aria-label="Projects">
      {projects.map((p) => (
        <button
          key={p.id}
          type="button"
          className={activeProjectId === p.id ? "on" : undefined}
          style={{ ["--p" as string]: p.color }}
          title={p.idea}
          onClick={() => setActiveProject(p.id)}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}
