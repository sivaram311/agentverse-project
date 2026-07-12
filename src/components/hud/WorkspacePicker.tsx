"use client";

import { FormEvent, useState } from "react";
import { useVerseStore } from "@/lib/store";

export function WorkspacePicker() {
  const workspacePath = useVerseStore((s) => s.workspacePath);
  const recent = useVerseStore((s) => s.recentWorkspaces);
  const rememberWorkspace = useVerseStore((s) => s.rememberWorkspace);
  const [draft, setDraft] = useState(workspacePath);
  const [open, setOpen] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    rememberWorkspace(draft);
    setOpen(false);
  }

  const short = workspacePath.replace(/\\/g, "/").split("/").pop() || workspacePath;

  return (
    <div className="workspace-picker">
      <button
        type="button"
        className="workspace-chip"
        onClick={() => {
          setDraft(workspacePath);
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        title={workspacePath}
      >
        <span className="muted">Workspace</span>
        <strong>{short}</strong>
      </button>
      {open ? (
        <form className="workspace-pop" onSubmit={onSubmit}>
          <label htmlFor="av-workspace">
            Directory / path
            <input
              id="av-workspace"
              name="workspace"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. E:\MyWorkspace\agentverse-project"
              autoComplete="off"
            />
          </label>
          {recent.length > 0 ? (
            <ul className="workspace-recent">
              {recent.map((p) => (
                <li key={p}>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(p);
                      rememberWorkspace(p);
                      setOpen(false);
                    }}
                  >
                    {p}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="workspace-actions">
            <button type="button" className="ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit">Use path</button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
