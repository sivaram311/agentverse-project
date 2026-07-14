"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, portalApi } from "@/lib/api";
import { clearTokens, getAccessToken, getStoredUser } from "@/lib/auth";
import {
  getPersona,
  makeQuest,
  orchestratorId,
  routeQuest,
} from "@/lib/orchestrator";
import { connectSessionEvents } from "@/lib/realtime";
import { readSessionIdFromUrl } from "@/lib/session-share";
import { useVerseStore } from "@/lib/store";
import type { Session } from "@/lib/types";
import { IncidentStrip } from "./IncidentStrip";
import { SessionTabs } from "./SessionTabs";
import { WorkspacePicker } from "./WorkspacePicker";

const BUSY_STATUSES = new Set([
  "STREAMING",
  "WAITING_PERMISSION",
  "WAITING_PLAN",
]);

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

  if (BUSY_STATUSES.has(latest.status)) {
    return portalApi.createSession(
      {
        workspacePath,
        title: `AgentVerse · ${workspacePath.replace(/\\/g, "/").split("/").pop() || "Hub"}`,
        provider: "cursor",
      },
      authConfig,
    );
  }
  return latest;
}

function tickQuestProgress(questId: string) {
  let n = 12;
  const id = window.setInterval(() => {
    n = Math.min(92, n + 8 + Math.floor(Math.random() * 10));
    const store = useVerseStore.getState();
    const q = store.quests.find((x) => x.id === questId);
    if (!q || q.status === "done") {
      window.clearInterval(id);
      return;
    }
    store.updateQuest(questId, { progress: n });
  }, 900);
  return () => window.clearInterval(id);
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
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const persona = useMemo(() => getPersona(selectedPersona), [selectedPersona]);

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

    return () => {
      void connection.disconnect();
    };
  }, [session?.id, authConfig?.cssEnabled]);

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
          return;
        }

        const urlSessionId = readSessionIdFromUrl();
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

    const quest = makeQuest(
      routed.assignee,
      routed.title,
      routed.description,
      projectId,
    );
    store.addQuest(quest);
    store.selectPersona(routed.assignee);
    if (!routed.projectIdea) {
      store.setStreamingHint(`${getPersona(routed.assignee).name} is on it…`);
    }
    const stopProgress = tickQuestProgress(quest.id);

    try {
      let active = await ensureIdleSession(session, authConfig, store.workspacePath);
      store.setSession(active);
      store.registerSessionForPath(active.workspacePath || store.workspacePath, active.id);
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
          await portalApi.sendPrompt(active.id, routed.composedPrompt, authConfig);
        } else {
          throw err;
        }
      }
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        try {
          const msgs = await portalApi.getMessages(active.id, authConfig);
          store.setMessages(msgs);
          if (msgs.some((m) => m.role === "ASSISTANT")) break;
        } catch {
          /* keep waiting */
        }
      }
      stopProgress();
      store.updateQuest(quest.id, { status: "done", progress: 100 });
    } catch (err) {
      stopProgress();
      if (isAuthRejection(err)) {
        forceSignOut("Auth rejected — please sign in again.");
      } else {
        store.setError(err instanceof Error ? err.message : "Prompt failed");
      }
      store.updateQuest(quest.id, { status: "open" });
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
            <span className="demo-badge">demo</span>
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
