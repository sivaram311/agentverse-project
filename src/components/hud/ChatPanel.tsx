"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, portalApi } from "@/lib/api";
import { clearTokens, getAccessToken, getStoredUser } from "@/lib/auth";
import { getPersona, makeQuest, routeQuest } from "@/lib/orchestrator";
import { connectSessionEvents } from "@/lib/realtime";
import { readSessionIdFromUrl } from "@/lib/session-share";
import { useVerseStore } from "@/lib/store";
import type { Session } from "@/lib/types";
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
        title: "AgentVerse Hub",
        provider: "cursor",
      },
      authConfig,
    );
  }
  return latest;
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
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const persona = useMemo(() => getPersona(selectedPersona), [selectedPersona]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingHint]);

  useEffect(() => {
    if (chatFocusNonce > 0) {
      inputRef.current?.focus();
    }
  }, [chatFocusNonce]);

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
        if (store.session) return;

        const urlSessionId = readSessionIdFromUrl();
        const preferredId = urlSessionId || store.persistedSessionId;

        if (preferredId) {
          try {
            const existing = await portalApi.getSession(preferredId, authConfig);
            if (cancelled) return;
            if (existing.status !== "ARCHIVED") {
              store.setSession(existing);
              const msgs = await portalApi.getMessages(existing.id, authConfig);
              if (!cancelled) store.setMessages(msgs);
              return;
            }
          } catch {
            /* fall through to list / create */
          }
        }

        const sessions = await portalApi.listSessions(authConfig);
        if (cancelled) return;
        const existing = sessions.find(
          (s) =>
            s.title?.toLowerCase().includes("agentverse") &&
            s.status !== "ARCHIVED" &&
            !BUSY_STATUSES.has(s.status),
        );
        const path = store.workspacePath;
        const next =
          existing ??
          (await portalApi.createSession(
            {
              workspacePath: path,
              title: "AgentVerse Hub",
              provider: "cursor",
            },
            authConfig,
          ));
        if (cancelled) return;
        store.setSession(next);
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
      selectedPersona === "rajveer"
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
          };

    const quest = makeQuest(routed.assignee, routed.title, routed.description);
    store.addQuest(quest);
    store.selectPersona(routed.assignee);
    store.setStreamingHint(`${getPersona(routed.assignee).name} is on it…`);

    try {
      let active = await ensureIdleSession(session, authConfig, store.workspacePath);
      store.setSession(active);
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
              title: "AgentVerse Hub",
              provider: "cursor",
            },
            authConfig,
          );
          store.setSession(active);
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
      store.updateQuest(quest.id, { status: "done" });
    } catch (err) {
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
      <aside className="chat-panel">
        <header>
          <h2>Mission chat</h2>
          <p className="muted">Sign in to talk with the crew.</p>
        </header>
      </aside>
    );
  }

  if (!authConfig?.cssEnabled && !getAccessToken() && !getStoredUser()) {
    // CSS off — local demo path
  }

  return (
    <aside className="chat-panel">
      <header>
        <h2>Talk to {persona.name}</h2>
        <p className="muted">
          {persona.title} · {persona.role}
        </p>
        <WorkspacePicker />
      </header>
      <div className="chat-log" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <p className="muted">
            Tap a persona to summon them, or ask Rajveer to route a quest.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`bubble ${m.role.toLowerCase()}`}>
              <span className="role">{m.role}</span>
              <p>{m.content}</p>
            </div>
          ))
        )}
        {streamingHint ? <p className="streaming">{streamingHint}</p> : null}
        <div ref={endRef} />
      </div>
      <form onSubmit={onSubmit} className="chat-compose">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            selectedPersona === "rajveer"
              ? "Describe a quest for Rajveer to route…"
              : `Message ${persona.name}…`
          }
          disabled={busy || !session}
          aria-label="Mission prompt"
        />
        <button type="submit" disabled={busy || !session || !text.trim()}>
          {busy ? "…" : "Send"}
        </button>
      </form>
      {session ? (
        <p className="session-meta muted">
          Session {session.id.slice(0, 8)}… · {workspacePath}
        </p>
      ) : null}
    </aside>
  );
}
