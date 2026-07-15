"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, portalApi } from "@/lib/api";
import { clearTokens, getAccessToken } from "@/lib/auth";
import { getPack } from "@/lib/pack-loader";
import {
  getPersona,
  makeQuest,
  orchestratorId,
  routeQuest,
} from "@/lib/orchestrator";
import { connectSessionEvents } from "@/lib/realtime";
import {
  buildSessionShareUrl,
  parseDeepLinkParams,
  readSessionIdFromUrl,
  restoreLastDeskUrlIfNeeded,
  saveLastDeskUrl,
} from "@/lib/session-share";
import { useVerseStore } from "@/lib/store";
import type { PermissionDto, Session } from "@/lib/types";
import { IncidentStrip } from "./IncidentStrip";
import { SessionTabs } from "./SessionTabs";
import { WorkspacePicker } from "./WorkspacePicker";

const BUSY_STATUSES = new Set([
  "STREAMING",
  "WAITING_PERMISSION",
  "WAITING_PLAN",
]);

const PLAN_MARKDOWN_PREVIEW_CHARS = 1200;

function truncatePlanMarkdown(markdown: string, max = PLAN_MARKDOWN_PREVIEW_CHARS): string {
  const trimmed = markdown.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trimEnd()}\n…`;
}

function forceSignOut(message: string) {
  clearTokens();
  const store = useVerseStore.getState();
  store.setError(message);
}

function isAuthRejection(error: unknown): error is ApiError {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 401) return true;
  if (error.status !== 403) return false;

  const indicatesSecurityFailure = (value?: string) => {
    const normalized = value?.trim().toLowerCase();
    return (
      normalized === "forbidden" ||
      normalized === "403 forbidden" ||
      normalized?.includes("not signed in") === true
    );
  };

  if (indicatesSecurityFailure(error.message) || indicatesSecurityFailure(error.body)) {
    return true;
  }
  try {
    const body = JSON.parse(error.body) as { error?: string; message?: string };
    return indicatesSecurityFailure(body.error) || indicatesSecurityFailure(body.message);
  } catch {
    return false;
  }
}

/** Prefer cancel+reuse over spawning a new session when busy. */
async function ensureIdleSession(
  session: Session,
  authConfig: Parameters<typeof portalApi.cancelRun>[1],
  workspacePath: string,
): Promise<Session> {
  let latest = session;
  try {
    latest = await portalApi.getSession(session.id, authConfig);
  } catch {
    /* fall through with local copy */
  }
  useVerseStore.getState().setSession(latest);
  useVerseStore.getState().syncQuestFromSessionStatus(latest.id, latest.status);

  if (!BUSY_STATUSES.has(latest.status)) return latest;

  try {
    await portalApi.cancelRun(latest.id, authConfig);
    for (let i = 0; i < 6; i++) {
      await new Promise((r) => setTimeout(r, 400));
      latest = await portalApi.getSession(session.id, authConfig);
      useVerseStore.getState().setSession(latest);
      useVerseStore.getState().syncQuestFromSessionStatus(latest.id, latest.status);
      if (!BUSY_STATUSES.has(latest.status)) return latest;
    }
  } catch {
    /* fall through to fork */
  }

  return portalApi.createSession(
    {
      workspacePath,
      title: `AgentVerse · ${workspacePath.replace(/\\/g, "/").split("/").pop() || "Hub"}`,
      provider: "cursor",
    },
    authConfig,
  );
}

function statusChipClass(status: string): string {
  const u = status.toUpperCase();
  if (u === "STREAMING") return "chip streaming";
  if (u === "WAITING_PERMISSION" || u === "WAITING_PLAN") return "chip waiting";
  if (u === "FAILED") return "chip failed";
  if (u === "IDLE" || u === "COMPLETED") return "chip idle";
  return "chip";
}

export function ChatPanel() {
  const authConfig = useVerseStore((s) => s.authConfig);
  const authenticated = useVerseStore((s) => s.authenticated);
  const selectedPersona = useVerseStore((s) => s.selectedPersona);
  const session = useVerseStore((s) => s.session);
  const messages = useVerseStore((s) => s.messages);
  const busy = useVerseStore((s) => s.busy);
  const streamingHint = useVerseStore((s) => s.streamingHint);
  const workspacePath = useVerseStore((s) => s.workspacePath);
  const chatFocusNonce = useVerseStore((s) => s.chatFocusNonce);
  const activeProjectId = useVerseStore((s) => s.activeProjectId);
  const returnUrl = useVerseStore((s) => s.returnUrl);
  const activePackId = useVerseStore((s) => s.activePackId);
  const [text, setText] = useState("");
  const [pendingPerms, setPendingPerms] = useState<PermissionDto[]>([]);
  const [permBusy, setPermBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pack = getPack(activePackId);
  const persona = useMemo(
    () => getPersona(selectedPersona, pack),
    [selectedPersona, activePackId],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingHint]);

  useEffect(() => {
    if (chatFocusNonce > 0) {
      const draft = useVerseStore.getState().consumeComposeDraft();
      if (draft) setText(draft);
      inputRef.current?.focus();
    }
  }, [chatFocusNonce]);

  useEffect(() => {
    if (!session?.id) return;
    saveLastDeskUrl(buildSessionShareUrl(session.id));
  }, [session?.id]);

  function initials(name: string): string {
    return name
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  useEffect(() => {
    if (!session || !getAccessToken()) return;

    const connection = connectSessionEvents(session.id, {
      cssEnabled: authConfig?.cssEnabled ?? false,
      onMessages: (msgs) => {
        useVerseStore.getState().setMessages(msgs);
      },
      onError: () => undefined,
    });

    let cancelled = false;
    const pollStatus = async () => {
      try {
        const latest = await portalApi.getSession(session.id, authConfig);
        if (cancelled) return;
        useVerseStore.getState().setSession(latest);
        useVerseStore.getState().syncQuestFromSessionStatus(latest.id, latest.status);
        if (
          latest.status === "WAITING_PERMISSION" ||
          latest.status === "WAITING_PLAN"
        ) {
          try {
            const perms = await portalApi.listPermissions(latest.id, authConfig);
            if (!cancelled) {
              setPendingPerms(perms.filter((p) => p.status === "PENDING"));
            }
          } catch {
            if (!cancelled) setPendingPerms([]);
          }
        } else if (!cancelled) {
          setPendingPerms([]);
        }
      } catch {
        /* keep prior */
      }
    };
    void pollStatus();
    // Busy statuses need tighter refresh; idle/terminal can wait longer (rate-limit friendly).
    const busy = new Set(["STREAMING", "WAITING_PERMISSION", "WAITING_PLAN"]);
    let delay = busy.has(session.status) ? 8_000 : 20_000;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      timer = setTimeout(async () => {
        await pollStatus();
        if (cancelled) return;
        const st = useVerseStore.getState().session?.status ?? session.status;
        delay = busy.has(st) ? 8_000 : 20_000;
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      void connection.disconnect();
    };
  }, [session?.id, authConfig]);

  useEffect(() => {
    if (!authenticated) return;
    if (authConfig?.cssEnabled && !getAccessToken()) {
      forceSignOut("Session expired — sign in again.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const store = useVerseStore.getState();
        if (store.session) {
          store.registerSessionForPath(
            store.session.workspacePath || store.workspacePath,
            store.session.id,
          );
          saveLastDeskUrl(buildSessionShareUrl(store.session.id));
          return;
        }

        restoreLastDeskUrlIfNeeded();
        const deep = parseDeepLinkParams();
        const urlSessionId = deep.session || readSessionIdFromUrl();
        const pathKey = store.workspacePath;
        const mappedId = store.sessionsByPath[pathKey];
        const preferredId = urlSessionId || mappedId || store.persistedSessionId;

        if (preferredId) {
          try {
            const existing = await portalApi.getSession(preferredId, authConfig);
            if (cancelled) return;
            if (existing.status !== "ARCHIVED") {
              store.setSession(existing);
              store.registerSessionForPath(
                existing.workspacePath || pathKey,
                existing.id,
              );
              store.syncQuestFromSessionStatus(existing.id, existing.status);
              const msgs = await portalApi.getMessages(existing.id, authConfig);
              if (!cancelled) store.setMessages(msgs);
              return;
            }
          } catch {
            /* fall through */
          }
        }

        const sessions = await portalApi.listSessions(authConfig);
        if (cancelled) return;
        const existing = sessions.find(
          (s) =>
            s.workspacePath === pathKey &&
            s.status !== "ARCHIVED" &&
            !BUSY_STATUSES.has(s.status),
        ) ??
          sessions.find(
            (s) =>
              s.title?.toLowerCase().includes("agentverse") &&
              s.status !== "ARCHIVED" &&
              !BUSY_STATUSES.has(s.status),
          );
        const next =
          existing ??
          (await portalApi.createSession(
            {
              workspacePath: pathKey,
              title: "AgentVerse Office Hub",
              provider: "cursor",
            },
            authConfig,
          ));
        if (cancelled) return;
        store.setSession(next);
        store.registerSessionForPath(next.workspacePath || pathKey, next.id);
        const msgs = await portalApi.getMessages(next.id, authConfig);
        if (!cancelled) store.setMessages(msgs);
      } catch (err) {
        if (cancelled) return;
        if (isAuthRejection(err)) {
          forceSignOut("Auth rejected by portal API — please sign in again.");
          return;
        }
        useVerseStore
          .getState()
          .setError(err instanceof Error ? err.message : "Session bootstrap failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authenticated, authConfig]);

  async function onCancelRun() {
    if (!session) return;
    const store = useVerseStore.getState();
    store.setBusy(true);
    try {
      await portalApi.cancelRun(session.id, authConfig);
      const latest = await portalApi.getSession(session.id, authConfig);
      store.setSession(latest);
      store.syncQuestFromSessionStatus(latest.id, latest.status);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      store.setBusy(false);
    }
  }

  async function onResolvePermission(
    permissionId: string,
    decision: "allow" | "deny",
  ) {
    if (!session) return;
    setPermBusy(true);
    try {
      await portalApi.resolvePermission(
        session.id,
        permissionId,
        decision,
        undefined,
        authConfig,
      );
      const latest = await portalApi.getSession(session.id, authConfig);
      useVerseStore.getState().setSession(latest);
      useVerseStore.getState().syncQuestFromSessionStatus(latest.id, latest.status);
      const perms = await portalApi.listPermissions(session.id, authConfig);
      setPendingPerms(perms.filter((p) => p.status === "PENDING"));
    } catch (err) {
      useVerseStore
        .getState()
        .setError(err instanceof Error ? err.message : "Permission resolve failed");
    } finally {
      setPermBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const prompt = text.trim();
    if (!prompt || !session || busy) return;

    const store = useVerseStore.getState();
    if (authConfig?.cssEnabled && !store.accessToken && !getAccessToken()) {
      forceSignOut("Sign in required");
      return;
    }
    store.setBusy(true);
    store.setError(null);
    setText("");

    const routed =
      selectedPersona === orchestratorId
        ? routeQuest(prompt)
        : {
            assignee: selectedPersona,
            title: `Direct → ${persona.name}`,
            description: prompt.slice(0, 160),
            composedPrompt: [
              `[AgentVerse direct: ${persona.name}]`,
              persona.systemPrompt,
              `---`,
              prompt,
            ].join("\n"),
            projectIdea: null as string | null,
          };

    let projectId = store.activeProjectId;
    if (routed.projectIdea && selectedPersona === orchestratorId) {
      const shortName =
        routed.projectIdea.split(/[\n.!?]/)[0]?.slice(0, 32).trim() || "New Project";
      const project = store.deployProject(shortName, routed.projectIdea);
      projectId = project.id;
      store.setStreamingHint(
        `Rajesh deploying ${project.name} — Muthu + crew at new desks…`,
      );
      store.summonPersona("muthu");
    }

    try {
      let active = await ensureIdleSession(session, authConfig, store.workspacePath);
      store.setSession(active);
      store.registerSessionForPath(active.workspacePath || store.workspacePath, active.id);

      const quest = makeQuest(
        routed.assignee,
        routed.title,
        routed.description,
        projectId,
        active.id,
      );
      store.addQuest(quest);
      store.selectPersona(routed.assignee);
      if (!routed.projectIdea) {
        store.setStreamingHint(`${getPersona(routed.assignee, pack).name} is on it…`);
      }

      try {
        await portalApi.sendPrompt(active.id, routed.composedPrompt, authConfig);
      } catch (err) {
        if (
          err instanceof ApiError &&
          (err.message.includes("active run") || err.status === 400)
        ) {
          active = await portalApi.createSession(
            {
              workspacePath: store.workspacePath,
              title: `AgentVerse · ${store.workspacePath.replace(/\\/g, "/").split("/").pop() || "Hub"}`,
              provider: "cursor",
            },
            authConfig,
          );
          store.setSession(active);
          store.registerSessionForPath(
            active.workspacePath || store.workspacePath,
            active.id,
          );
          store.updateQuest(quest.id, { sessionId: active.id });
          await portalApi.sendPrompt(active.id, routed.composedPrompt, authConfig);
        } else {
          throw err;
        }
      }
      for (let i = 0; i < 12; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        try {
          const latest = await portalApi.getSession(active.id, authConfig);
          store.setSession(latest);
          store.syncQuestFromSessionStatus(latest.id, latest.status);
          const msgs = await portalApi.getMessages(active.id, authConfig);
          store.setMessages(msgs);
          if (
            !BUSY_STATUSES.has(latest.status) &&
            msgs.some((m) => m.role === "ASSISTANT")
          ) {
            break;
          }
        } catch {
          /* keep waiting */
        }
      }
    } catch (err) {
      if (isAuthRejection(err)) {
        forceSignOut("Auth rejected — please sign in again.");
      } else {
        store.setError(err instanceof Error ? err.message : "Prompt failed");
      }
    } finally {
      store.setBusy(false);
      store.setStreamingHint(null);
    }
  }

  if (!authenticated && authConfig?.cssEnabled) {
    return (
      <aside className="chat-panel glass-panel">
        <header className="chat-head">
          <h2>Office chat</h2>
          <p className="muted">Sign in to talk with the crew.</p>
        </header>
      </aside>
    );
  }

  const portalUiBase =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_PORTAL_UI_URL || ""
      : "";

  return (
    <aside className="chat-panel glass-panel">
      <header className="chat-head">
        <div className="chat-title-row">
          <h2>
            Talk to {persona.name}
            <span className="chat-role">
              {" "}
              — {persona.title} · {persona.role}
            </span>
          </h2>
          <div className="chat-head-actions">
            {session ? (
              <span className={statusChipClass(session.status)} title={session.status}>
                {session.status.replace(/_/g, " ").toLowerCase()}
              </span>
            ) : null}
            {session && BUSY_STATUSES.has(session.status) ? (
              <button
                type="button"
                className="ghost danger"
                onClick={() => void onCancelRun()}
                disabled={busy}
                aria-label="Cancel run"
              >
                Cancel run
              </button>
            ) : null}
            {returnUrl ? (
              <a className="ghost keep-mobile return-link" href={returnUrl}>
                Back to Home
              </a>
            ) : null}
            <button
              type="button"
              className="chat-close"
              aria-label="Close chat"
              onClick={() => useVerseStore.getState().closeChat()}
            >
              ×
            </button>
          </div>
        </div>
        <SessionTabs />
        <WorkspacePicker />
      </header>
      <IncidentStrip />
      {(session?.status === "WAITING_PERMISSION" ||
        session?.status === "WAITING_PLAN") && (
        <div className="permission-banner" role="status">
          <p>
            Session is{" "}
            <strong>{session.status.replace(/_/g, " ").toLowerCase()}</strong>
            {pendingPerms.length === 0
              ? " — resolve in Agent Portal if controls do not appear."
              : ` — ${pendingPerms.length} pending.`}
          </p>
          {pendingPerms.map((p) => (
            <div key={p.id} className="permission-row">
              <span className="muted">
                {p.kind || "permission"} · {(p.detailsJson || "").slice(0, 80)}
              </span>
              {p.planMarkdown?.trim() ? (
                <pre
                  className="permission-plan muted"
                  title={p.planMarkdown}
                  style={{
                    margin: 0,
                    maxHeight: "10rem",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontSize: "0.78rem",
                    fontFamily: "inherit",
                    lineHeight: 1.35,
                  }}
                >
                  {truncatePlanMarkdown(p.planMarkdown)}
                </pre>
              ) : null}
              <div className="permission-actions">
                <button
                  type="button"
                  disabled={permBusy}
                  onClick={() => void onResolvePermission(p.id, "allow")}
                >
                  Allow
                </button>
                <button
                  type="button"
                  className="ghost danger"
                  disabled={permBusy}
                  onClick={() => void onResolvePermission(p.id, "deny")}
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
          {portalUiBase ? (
            <a
              className="muted"
              href={`${portalUiBase.replace(/\/$/, "")}/sessions/${session.id}`}
              target="_blank"
              rel="noreferrer"
            >
              Open Portal
            </a>
          ) : null}
        </div>
      )}
      <div className="chat-log" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p className="muted">
              Tap a desk or crew card, then ask {persona.name} — or start a new
              project with Rajesh.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`bubble ${m.role.toLowerCase()}`}>
              {m.role === "SYSTEM" ? (
                <p className="system-line">{m.content}</p>
              ) : (
                <>
                  <span className="role">{m.role === "USER" ? "You" : persona.name}</span>
                  <p>{m.content}</p>
                </>
              )}
            </div>
          ))
        )}
        {streamingHint ? (
          <p className="streaming thinking-line">
            <span className="think-dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            {streamingHint}
          </p>
        ) : null}
        <div ref={endRef} />
      </div>
      <form onSubmit={onSubmit} className="chat-compose">
        <span
          className="compose-avatar"
          style={{ background: persona.color }}
          aria-hidden
        >
          {initials(persona.name)}
        </span>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            selectedPersona === orchestratorId
              ? `Ask ${persona.name} or start a new project…`
              : `Ask ${persona.name}…`
          }
          disabled={busy || !session}
          aria-label="Mission prompt"
        />
        <button
          type="submit"
          className="send-btn"
          disabled={busy || !session || !text.trim()}
        >
          {busy ? "…" : "Send"}
        </button>
      </form>
      {session ? (
        <p className="session-meta muted">
          Session {session.id.slice(0, 8)}… · {workspacePath}
          {activeProjectId !== "hub" ? ` · project ${activeProjectId.slice(0, 10)}` : ""}
        </p>
      ) : null}
    </aside>
  );
}
