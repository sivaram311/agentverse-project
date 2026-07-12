"use client";

import { FormEvent, useState } from "react";
import { ApiError, portalApi } from "@/lib/api";
import { useVerseStore } from "@/lib/store";

/**
 * Directory picker — each path can own an independent portal session.
 */
export function WorkspacePicker() {
  const workspacePath = useVerseStore((s) => s.workspacePath);
  const recent = useVerseStore((s) => s.recentWorkspaces);
  const rememberWorkspace = useVerseStore((s) => s.rememberWorkspace);
  const authConfig = useVerseStore((s) => s.authConfig);
  const sessionsByPath = useVerseStore((s) => s.sessionsByPath);
  const [draft, setDraft] = useState(workspacePath);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  async function activatePath(path: string) {
    const trimmed = path.trim();
    if (!trimmed) return;
    rememberWorkspace(trimmed);
    setOpen(false);
    setSwitching(true);
    const store = useVerseStore.getState();
    try {
      const existingId = sessionsByPath[trimmed];
      if (existingId) {
        try {
          const session = await portalApi.getSession(existingId, authConfig);
          if (session.status !== "ARCHIVED") {
            store.setSession(session);
            store.registerSessionForPath(trimmed, session.id);
            const msgs = await portalApi.getMessages(session.id, authConfig);
            store.setMessages(msgs);
            return;
          }
        } catch {
          /* create below */
        }
      }
      const created = await portalApi.createSession(
        {
          workspacePath: trimmed,
          title: `AgentVerse · ${trimmed.replace(/\\/g, "/").split("/").pop() || "dir"}`,
          provider: "cursor",
        },
        authConfig,
      );
      store.setSession(created);
      store.registerSessionForPath(trimmed, created.id);
      store.setMessages([]);
    } catch (err) {
      if (err instanceof ApiError) {
        store.setError(err.message);
      } else {
        store.setError(err instanceof Error ? err.message : "Workspace switch failed");
      }
    } finally {
      setSwitching(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void activatePath(draft);
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
        disabled={switching}
      >
        <span className="muted">{switching ? "Switching…" : "Directory session"}</span>
        <strong>{short}</strong>
      </button>
      {open ? (
        <form className="workspace-pop" onSubmit={onSubmit}>
          <label htmlFor="av-workspace">
            Folder / path
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
                  <button type="button" onClick={() => void activatePath(p)}>
                    {p}
                    {sessionsByPath[p] ? " · open" : ""}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="workspace-actions">
            <button type="button" className="ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit">Open session</button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
