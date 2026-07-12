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

/**
 * Same-origin realtime without SockJS/STOMP.
 * Avoids cross-origin CORS on :8080/ws and sockjs-client `unload` Permissions-Policy violations.
 * Polls portal messages through Next rewrite `/api/portal`.
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
          return;
        }
        throw new Error(`Realtime poll failed (${res.status})`);
      }
      const messages = (await res.json()) as Message[];
      const fingerprint = messages
        .map((m) => `${m.id}:${m.content.length}`)
        .join("|");
      if (fingerprint !== lastFingerprint) {
        lastFingerprint = fingerprint;
        onMessages?.(messages);
        const last = messages[messages.length - 1];
        if (last) {
          // Compatibility for callers still listening for STOMP-shaped events.
          // no-op if only onMessages is used
        }
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error("Realtime poll failed"));
    } finally {
      if (!closed) {
        timer = setTimeout(tick, 1200);
      }
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
