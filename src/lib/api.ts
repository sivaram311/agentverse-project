import {
  clearTokens,
  ensureFreshToken,
  getAccessToken,
  isTokenAcceptableForPortal,
  refreshCss,
} from "./auth";
import { useVerseStore } from "./store";
import type {
  AuthConfig,
  CreateSessionRequest,
  Health,
  Message,
  Session,
} from "./types";

const API_BASE = "/api/portal";

export class ApiError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(extractErrorMessage(body, status));
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function extractErrorMessage(body: string, status: number): string {
  try {
    const parsed = JSON.parse(body) as { error?: string; message?: string };
    if (parsed.error) return parsed.error;
    if (parsed.message) return parsed.message;
  } catch {
    /* raw */
  }
  return body || `HTTP ${status}`;
}

function isSecurityForbidden(status: number, body: string): boolean {
  if (status === 401) return true;
  if (status !== 403) return false;
  try {
    const parsed = JSON.parse(body) as { error?: string };
    if (parsed.error && parsed.error !== "Forbidden") return false;
    return true;
  } catch {
    // Empty body 403 from Spring Security for anonymous access
    return true;
  }
}

async function resolveToken(authConfig?: AuthConfig | null): Promise<string | null> {
  const token = await ensureFreshToken(authConfig);
  if (!token) return null;
  if (!isTokenAcceptableForPortal(token, authConfig)) {
    clearTokens();
    return null;
  }
  return token;
}

async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  authConfig?: AuthConfig | null,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  let token = await resolveToken(authConfig);
  const needsAuth =
    authConfig?.cssEnabled === true &&
    !path.startsWith("/health") &&
    !path.startsWith("/auth/config");
  if (needsAuth && !token) {
    throw new ApiError(
      401,
      "Not signed in — CSS JWT missing or incompatible with DEV portal",
    );
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  let refreshFailed = false;

  if ((res.status === 401 || res.status === 403) && authConfig?.cssEnabled) {
    const bodyPeek = await res.clone().text();
    if (isSecurityForbidden(res.status, bodyPeek)) {
      const ok = await refreshCss(authConfig);
      if (ok) {
        token = getAccessToken();
        const retryHeaders = new Headers(init.headers);
        if (!retryHeaders.has("Content-Type") && init.body) {
          retryHeaders.set("Content-Type", "application/json");
        }
        if (token) retryHeaders.set("Authorization", `Bearer ${token}`);
        res = await fetch(`${API_BASE}${path}`, { ...init, headers: retryHeaders });
      } else {
        refreshFailed = true;
        clearTokens();
      }
    }
  }

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401 || res.status === 403 || refreshFailed) {
      // Auth rejection — force clean slate (poisoned JWT / anonymous)
      if (isSecurityForbidden(res.status, text) || refreshFailed) {
        clearTokens();
      }
    }
    throw new ApiError(res.status, text || `${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const portalApi = {
  health: () => apiFetch<Health>("/health"),
  authConfig: () => apiFetch<AuthConfig>("/auth/config"),
  listSessions: (authConfig?: AuthConfig | null) =>
    apiFetch<Session[]>("/sessions", {}, authConfig),
  getSession: (id: string, authConfig?: AuthConfig | null) =>
    apiFetch<Session>(`/sessions/${id}`, {}, authConfig),
  createSession: (body: CreateSessionRequest, authConfig?: AuthConfig | null) =>
    apiFetch<Session>(
      "/sessions",
      { method: "POST", body: JSON.stringify(body) },
      authConfig,
    ),
  getMessages: (id: string, authConfig?: AuthConfig | null) =>
    apiFetch<Message[]>(`/sessions/${id}/messages`, {}, authConfig),
  cancelRun: (id: string, authConfig?: AuthConfig | null) =>
    apiFetch<{ status: string }>(
      `/sessions/${id}/cancel`,
      { method: "POST", body: "{}" },
      authConfig,
    ),
  sendPrompt: (id: string, prompt: string, authConfig?: AuthConfig | null) =>
    apiFetch<Message>(
      `/sessions/${id}/prompt`,
      { method: "POST", body: JSON.stringify({ prompt }) },
      authConfig,
    ),
};
