"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { portalApi } from "@/lib/api";
import { useVerseStore } from "@/lib/store";
import type { Session } from "@/lib/types";
import {
  getWorkspaceAllowlist,
  isWorkspaceAllowed,
  shortWorkspaceLabel,
} from "@/lib/workspaces";

type SessionDeskProps = {
  open?: boolean;
  overlay?: boolean;
  onClose?: () => void;
};

type FilterMode = "active" | "archived";

function sessionLabel(session: Session): string {
  return session.title?.trim() || pathLabel(session.workspacePath);
}

function pathLabel(path: string): string {
  return shortWorkspaceLabel(path.replace(/\\/g, "/"));
}

function statusLabel(status: Session["status"]): string {
  return status.replace(/_/g, " ").toLowerCase();
}

function sortSessions(a: Session, b: Session): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

function reportError(error: unknown, fallback: string) {
  useVerseStore
    .getState()
    .setError(error instanceof Error ? error.message : fallback);
}

export function SessionDesk({
  open = true,
  overlay = true,
  onClose,
}: SessionDeskProps) {
  const authConfig = useVerseStore((s) => s.authConfig);
  const workspacePath = useVerseStore((s) => s.workspacePath);
  const activeSessionId = useVerseStore((s) => s.activeTabSessionId);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState<FilterMode>("active");
  const [busy, setBusy] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [draftPath, setDraftPath] = useState(workspacePath);

  const allowlist = useMemo(() => getWorkspaceAllowlist(), []);

  const refresh = useCallback(async () => {
    if (!authConfig) return;
    setBusy("refresh");
    try {
      const next = await portalApi.listSessions(authConfig);
      setSessions([...next].sort(sortSessions));
    } catch (error) {
      reportError(error, "Failed to load sessions");
    } finally {
      setBusy(null);
    }
  }, [authConfig]);

  useEffect(() => {
    if (open) {
      setDraftPath(workspacePath);
      void refresh();
    }
  }, [open, refresh, workspacePath]);

  const visibleSessions = useMemo(
    () =>
      sessions.filter((session) =>
        filter === "archived"
          ? session.status === "ARCHIVED"
          : session.status !== "ARCHIVED",
      ),
    [filter, sessions],
  );

  function validatePath(path: string): string | null {
    const trimmed = path.trim();
    if (!trimmed) return "Workspace path is required";
    if (!isWorkspaceAllowed(trimmed)) return "Workspace path is not allowed";
    return null;
  }

  async function openSession(session: Session) {
    const path = session.workspacePath;
    const validation = validatePath(path);
    if (validation) {
      useVerseStore.getState().setError(validation);
      return;
    }

    setBusy(`open:${session.id}`);
    try {
      const store = useVerseStore.getState();
      const latest = await portalApi.getSession(session.id, authConfig);
      const resolvedPath = latest.workspacePath || path;
      const resolvedValidation = validatePath(resolvedPath);
      if (resolvedValidation) {
        store.setError(resolvedValidation);
        return;
      }
      const messages = await portalApi.getMessages(latest.id, authConfig);
      store.setSession(latest);
      store.setMessages(messages);
      store.registerSessionForPath(resolvedPath, latest.id, sessionLabel(latest));
      store.setWorkspacePath(resolvedPath);
      store.rememberWorkspace(resolvedPath);
      store.openChat();
      onClose?.();
    } catch (error) {
      reportError(error, "Failed to open session");
    } finally {
      setBusy(null);
    }
  }

  async function archiveSession(session: Session) {
    setBusy(`archive:${session.id}`);
    try {
      const store = useVerseStore.getState();
      await portalApi.archiveSession(session.id, authConfig);
      if (activeSessionId === session.id) store.closeSessionTab(session.id);
      await refresh();
    } catch (error) {
      reportError(error, "Failed to archive session");
    } finally {
      setBusy(null);
    }
  }

  async function restoreSession(session: Session) {
    setBusy(`restore:${session.id}`);
    try {
      await portalApi.unarchiveSession(session.id, authConfig);
      await refresh();
    } catch (error) {
      reportError(error, "Failed to restore session");
    } finally {
      setBusy(null);
    }
  }

  async function createSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draftPath.trim();
    const validation = validatePath(trimmed);
    if (validation) {
      useVerseStore.getState().setError(validation);
      return;
    }

    setBusy("create");
    try {
      const label = pathLabel(trimmed);
      const created = await portalApi.createSession(
        {
          workspacePath: trimmed,
          title: `AgentVerse · ${label}`,
          provider: "cursor",
        },
        authConfig,
      );
      const store = useVerseStore.getState();
      store.setSession(created);
      store.setMessages([]);
      store.registerSessionForPath(trimmed, created.id, label);
      store.setWorkspacePath(trimmed);
      store.rememberWorkspace(trimmed);
      store.openChat();
      setCreateOpen(false);
      onClose?.();
      await refresh();
    } catch (error) {
      reportError(error, "Failed to create session");
    } finally {
      setBusy(null);
    }
  }

  if (!open || !authConfig) return null;

  return (
    <section
      className="session-desk"
      role={overlay ? "dialog" : "region"}
      aria-modal={overlay ? true : undefined}
      aria-label="Session Desk"
    >
      <header className="session-desk-head">
        <div>
          <p className="brand-kicker">Session Desk</p>
          <h2>Portal sessions</h2>
        </div>
        <div className="session-desk-actions">
          <button
            type="button"
            className="ghost"
            onClick={() => void refresh()}
            disabled={busy !== null}
            aria-label="Refresh sessions"
          >
            {busy === "refresh" ? "Refreshing" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={() => {
              setDraftPath(workspacePath);
              setCreateOpen((value) => !value);
            }}
            disabled={busy !== null}
            aria-expanded={createOpen}
            aria-label="Create session"
          >
            New
          </button>
          {onClose ? (
            <button
              type="button"
              className="ghost"
              onClick={onClose}
              aria-label="Close session desk"
            >
              Close
            </button>
          ) : null}
        </div>
      </header>

      <div className="session-desk-filters" aria-label="Session filters">
        <button
          type="button"
          className={filter === "active" ? "on" : undefined}
          onClick={() => setFilter("active")}
          aria-pressed={filter === "active"}
        >
          Active
        </button>
        <button
          type="button"
          className={filter === "archived" ? "on" : undefined}
          onClick={() => setFilter("archived")}
          aria-pressed={filter === "archived"}
        >
          Archived
        </button>
      </div>

      {createOpen ? (
        <form className="session-desk-create" onSubmit={createSession}>
          <label htmlFor="session-desk-path">
            Workspace path
            <input
              id="session-desk-path"
              value={draftPath}
              onChange={(event) => setDraftPath(event.target.value)}
              placeholder="E:\MyWorkspace\agentverse-project"
              autoComplete="off"
              disabled={busy === "create"}
            />
          </label>
          {allowlist ? (
            <div className="session-desk-quick" aria-label="Allowed workspaces">
              {allowlist.map((path) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => setDraftPath(path)}
                  title={path}
                  disabled={busy === "create"}
                >
                  {pathLabel(path)}
                </button>
              ))}
            </div>
          ) : null}
          <div className="session-desk-form-actions">
            <button
              type="button"
              className="ghost"
              onClick={() => setCreateOpen(false)}
              disabled={busy === "create"}
            >
              Cancel
            </button>
            <button type="submit" disabled={busy === "create"}>
              {busy === "create" ? "Creating" : "Create"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="session-desk-list" aria-live="polite">
        {visibleSessions.length === 0 ? (
          <p className="session-desk-empty">
            {busy === "refresh" ? "Loading sessions..." : "No sessions in this view."}
          </p>
        ) : (
          visibleSessions.map((session) => {
            const rowBusy =
              busy === `open:${session.id}` ||
              busy === `archive:${session.id}` ||
              busy === `restore:${session.id}`;
            return (
              <article className="session-desk-row" key={session.id}>
                <div className="session-desk-main">
                  <div className="session-desk-title">
                    <strong title={sessionLabel(session)}>{sessionLabel(session)}</strong>
                    <span className="session-desk-status">
                      {statusLabel(session.status)}
                    </span>
                  </div>
                  <small title={session.workspacePath}>{session.workspacePath}</small>
                </div>
                <div className="session-desk-row-actions">
                  {session.status !== "ARCHIVED" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void openSession(session)}
                        disabled={busy !== null}
                        aria-label={`Open ${sessionLabel(session)}`}
                      >
                        {busy === `open:${session.id}` ? "Opening" : "Open"}
                      </button>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => void archiveSession(session)}
                        disabled={busy !== null}
                        aria-label={`Archive ${sessionLabel(session)}`}
                      >
                        {busy === `archive:${session.id}` ? "Archiving" : "Archive"}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void restoreSession(session)}
                      disabled={busy !== null}
                      aria-label={`Restore ${sessionLabel(session)}`}
                    >
                      {busy === `restore:${session.id}` ? "Restoring" : "Restore"}
                    </button>
                  )}
                </div>
                {rowBusy ? <span className="session-desk-busy">Working...</span> : null}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
