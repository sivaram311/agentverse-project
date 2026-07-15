"use client";

import { getAccessToken } from "./auth";
import type { AgentEvent, Message } from "./types";

export type SessionRealtimeOptions = {
  cssEnabled?: boolean;
  onEvent?: (event: AgentEvent) => void;
  onError?: (error: Error) => void;
  /** Called with full transcript snapshots from same-origin portal proxy. */
  onMessages?: (messages: Message[]) => void;
};

export type RealtimeConnection = {
  disconnect: () => Promise<void>;
};

const BASE_MS = 8000;
const MAX_MS = 30000;

/**
 * Same-origin realtime without SockJS/STOMP.
 * Avoids cross-origin CORS on :8080/ws and sockjs-client `unload` Permissions-Policy violations.
 * Polls portal messages through Next rewrite `/api/portal`.
 * Backs off on 429/5xx so promote smoke and multi-tab use do not trip portal rate limits.
 */
export function connectSessionEvents(
  sessionId: string,
  { onMessages, onError }: SessionRealtimeOptions,
): RealtimeConnection {
  if (typeof window === "undefined") {
    return { disconnect: async () => undefined };
  }

  let closed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastFingerprint = "";
  let delayMs = BASE_MS;

  const schedule = () => {
    if (closed) return;
    timer = setTimeout(tick, delayMs);
  };

  const tick = async () => {
    if (closed) return;
    try {
      const headers: Record<string, string> = {};
      const token = getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`/api/portal/sessions/${sessionId}/messages`, { headers });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          onError?.(new Error(`Realtime auth failed (${res.status})`));
          delayMs = Math.min(MAX_MS, delayMs * 2);
          schedule();
          return;
        }
        if (res.status === 429 || res.status >= 500) {
          delayMs = Math.min(MAX_MS, Math.max(delayMs * 2, 5000));
          schedule();
          return;
        }
        throw new Error(`Realtime poll failed (${res.status})`);
      }
      delayMs = BASE_MS;
      const messages = (await res.json()) as Message[];
      const fingerprint = messages
        .map((m) => `${m.id}:${m.content.length}`)
        .join("|");
      if (fingerprint !== lastFingerprint) {
        lastFingerprint = fingerprint;
        onMessages?.(messages);
      }
    } catch (error) {
      delayMs = Math.min(MAX_MS, delayMs * 2);
      onError?.(error instanceof Error ? error : new Error("Realtime poll failed"));
    } finally {
      schedule();
    }
  };

  void tick();

  return {
    disconnect: async () => {
      closed = true;
      if (timer) clearTimeout(timer);
    },
  };
}
