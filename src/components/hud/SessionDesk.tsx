"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { portalApi } from "@/lib/api";
import {
  ensureAllPlannedSessions,
  ensureWorkPlaneSessions,
  findSessionForPack,
  packSessionTitle,
} from "@/lib/app-sessions";
import {
  listLabeledPacks,
  listWorkPlanePacks,
  resolvePackIdForSession,
  type Pack,
} from "@/lib/pack-loader";
import { useVerseStore } from "@/lib/store";
import type { Session, SessionStatus } from "@/lib/types";
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

const STATUS_FILTERS: Array<"all" | SessionStatus | "BUSY"> = [
  "all",
  "BUSY",
  "IDLE",
  "STREAMING",
  "WAITING_PERMISSION",
  "WAITING_PLAN",
  "FAILED",
  "COMPLETED",
  "CANCELLED",
];

const BUSY = new Set(["STREAMING", "WAITING_PERMISSION", "WAITING_PLAN"]);

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
  const apiOnline = useVerseStore((s) => s.apiOnline);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState<FilterMode>("active");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [draftPath, setDraftPath] = useState(workspacePath);
  const [draftTitle, setDraftTitle] = useState("");
  const [ensureNote, setEnsureNote] = useState<string | null>(null);
  const ensuredOnOpenRef = useRef(false);

  const workPlanePacks = useMemo(() => listWorkPlanePacks(), []);
  const labeledPacks = useMemo(() => listLabeledPacks(), []);

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

  const runEnsure = useCallback(
    async (includeLabeled = false) => {
      if (!authConfig) return;
      setBusy("ensure");
      setEnsureNote(null);
      try {
        const result = includeLabeled
          ? await ensureAllPlannedSessions(authConfig)
          : await ensureWorkPlaneSessions(authConfig);
        if (result.created.length > 0) {
          await refresh();
        }
        const parts: string[] = [];
        if (result.created.length > 0) {
          parts.push(`Created ${result.created.length}`);
        }
        if (result.existing.length > 0) {
          parts.push(`${result.existing.length} already present`);
        }
        if (result.errors.length > 0) {
          parts.push(`${result.errors.length} skipped`);
        }
        setEnsureNote(parts.length > 0 ? parts.join(" · ") : "No packs to ensure");
      } catch (error) {
        reportError(error, "Failed to ensure app sessions");
      } finally {
        setBusy(null);
      }
    },
    [authConfig, refresh],
  );

  useEffect(() => {
    if (open) {
      setDraftPath(workspacePath);
      void refresh();
    }
  }, [open, refresh, workspacePath]);

  useEffect(() => {
    if (!open) {
      ensuredOnOpenRef.current = false;
      return;
    }
    if (!authConfig || ensuredOnOpenRef.current) return;
    ensuredOnOpenRef.current = true;
    void runEnsure(false);
  }, [open, authConfig, runEnsure]);

  const visibleSessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((session) => {
      const archivedOk =
        filter === "archived"
          ? session.status === "ARCHIVED"
          : session.status !== "ARCHIVED";
      if (!archivedOk) return false;
      if (statusFilter === "BUSY") {
        if (!BUSY.has(session.status)) return false;
      } else if (statusFilter !== "all" && session.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        sessionLabel(session).toLowerCase().includes(q) ||
        session.workspacePath.toLowerCase().includes(q) ||
        session.id.toLowerCase().includes(q) ||
        (session.ownerUsername || "").toLowerCase().includes(q) ||
        (session.provider || "").toLowerCase().includes(q)
      );
    });
  }, [filter, query, sessions, statusFilter]);

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
      store.syncQuestFromSessionStatus(latest.id, latest.status);
      store.setActivePack(resolvePackIdForSession(latest), "session");
      store.openChat();
      onClose?.();
    } catch (error) {
      reportError(error, "Failed to open session");
    } finally {
      setBusy(null);
    }
  }

  async function cancelRun(session: Session) {
    setBusy(`cancel:${session.id}`);
    try {
      await portalApi.cancelRun(session.id, authConfig);
      const latest = await portalApi.getSession(session.id, authConfig);
      setSessions((prev) =>
        [...prev.filter((s) => s.id !== latest.id), latest].sort(sortSessions),
      );
      const store = useVerseStore.getState();
      if (store.session?.id === latest.id) store.setSession(latest);
      store.syncQuestFromSessionStatus(latest.id, latest.status);
    } catch (error) {
      reportError(error, "Failed to cancel run");
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
      const label = draftTitle.trim() || pathLabel(trimmed);
      const created = await portalApi.createSession(
        {
          workspacePath: trimmed,
          title: draftTitle.trim() || `AgentVerse · ${label}`,
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
      store.setActivePack(resolvePackIdForSession(created), "session");
      store.openChat();
      setCreateOpen(false);
      setDraftTitle("");
      onClose?.();
      await refresh();
    } catch (error) {
      reportError(error, "Failed to create session");
    } finally {
      setBusy(null);
    }
  }

  async function openPackSession(pack: Pack) {
    const existing = findSessionForPack(sessions, pack);
    if (existing) {
      await openSession(existing);
      return;
    }

    setBusy(`pack:${pack.appId}`);
    try {
      const created = await portalApi.createSession(
        {
          workspacePath: pack.workspacePath,
          title: packSessionTitle(pack),
          provider: "cursor",
        },
        authConfig,
      );
      setSessions((prev) => [...prev.filter((s) => s.id !== created.id), created].sort(sortSessions));
      await openSession(created);
    } catch (error) {
      reportError(error, `Failed to open ${packSessionTitle(pack)}`);
    } finally {
      setBusy(null);
    }
  }

  function renderAppSessionChips(packs: Pack[], muted = false) {
    return packs.map((pack) => {
      const hasSession = Boolean(findSessionForPack(sessions, pack));
      const packBusy = busy === `pack:${pack.appId}`;
      return (
        <button
          key={pack.appId}
          type="button"
          className={muted ? "muted" : undefined}
          data-testid="app-session-chip"
          data-app-id={pack.appId}
          onClick={() => void openPackSession(pack)}
          disabled={busy !== null}
          title={pack.workspacePath}
        >
          {packBusy ? "Opening…" : packSessionTitle(pack)}
          {!hasSession ? " +" : ""}
        </button>
      );
    });
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
          <p className="session-desk-hint muted">
            {apiOnline
              ? "Search, filter, cancel runs. Title is set at create (portal has no rename API)."
              : "Portal API offline — showing last loaded list if any."}
          </p>
        </div>
        <div className="session-desk-actions">
          <button
            type="button"
            className="ghost"
            onClick={() => void runEnsure(false)}
            disabled={busy !== null}
            aria-label="Ensure work-plane app sessions"
          >
            {busy === "ensure" ? "Ensuring" : "Ensure app sessions"}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => void runEnsure(true)}
            disabled={busy !== null}
            aria-label="Ensure work-plane and labeled app sessions"
            title="Also seed classic, v2, and library sessions"
          >
            Seed labeled too
          </button>
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

      <div className="session-desk-apps" aria-label="App sessions">
        <p className="session-desk-apps-label">App sessions</p>
        <div className="session-desk-apps-chips">{renderAppSessionChips(workPlanePacks)}</div>
        {labeledPacks.length > 0 ? (
          <div className="session-desk-apps-labeled">
            <p className="session-desk-apps-label muted">Labeled</p>
            <div className="session-desk-apps-chips muted">
              {renderAppSessionChips(labeledPacks, true)}
            </div>
          </div>
        ) : null}
        {ensureNote ? <p className="session-desk-hint muted">{ensureNote}</p> : null}
      </div>

      <div className="session-desk-search">
        <label htmlFor="session-desk-query" className="sr-only">
          Search sessions
        </label>
        <input
          id="session-desk-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, path, id, owner…"
          autoComplete="off"
        />
      </div>

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

      <div className="session-desk-status-filters" aria-label="Status filters">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            className={statusFilter === s ? "on" : undefined}
            onClick={() => setStatusFilter(s)}
            aria-pressed={statusFilter === s}
          >
            {s === "all" ? "All status" : s.replace(/_/g, " ").toLowerCase()}
          </button>
        ))}
      </div>

      {createOpen ? (
        <form className="session-desk-create" onSubmit={createSession}>
          <label htmlFor="session-desk-title">
            Title (set at create)
            <input
              id="session-desk-title"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="Optional session title"
              autoComplete="off"
              disabled={busy === "create"}
            />
          </label>
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
              busy === `restore:${session.id}` ||
              busy === `cancel:${session.id}`;
            const canCancel = BUSY.has(session.status);
            return (
              <article className="session-desk-row" key={session.id}>
                <div className="session-desk-main">
                  <div className="session-desk-title">
                    <strong title={sessionLabel(session)}>{sessionLabel(session)}</strong>
                    <span
                      className={`session-desk-status status-${session.status.toLowerCase()}`}
                    >
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
                      {canCancel ? (
                        <button
                          type="button"
                          className="ghost danger"
                          onClick={() => void cancelRun(session)}
                          disabled={busy !== null}
                          aria-label={`Cancel run ${sessionLabel(session)}`}
                        >
                          {busy === `cancel:${session.id}` ? "Cancelling" : "Cancel run"}
                        </button>
                      ) : null}
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
