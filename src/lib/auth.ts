import type { AuthConfig } from "./types";
import { useVerseStore } from "./store";

/** AgentVerse-only keys — do NOT fall back to Angular portal tokens (cross-env JWT poison). */
const ACCESS = "agentVerseAccessToken";
const REFRESH = "agentVerseRefreshToken";
const USER = "agentVerseUser";

const CSS_PROXY_BASE = "/api/css";

export type JwtClaims = {
  iss?: string;
  sub?: string;
  exp?: number;
  aud?: string | string[];
  client_id?: string;
};

export function decodeJwtPayload(token: string): JwtClaims | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    return JSON.parse(atob(padded + pad)) as JwtClaims;
  } catch {
    return null;
  }
}

/** Expected issuer for DEV portal = CSS authUrl without trailing slash. */
export function expectedIssuer(config: AuthConfig | null | undefined): string {
  const raw = (config?.authUrl || "http://localhost:9000").trim().replace(/\/$/, "");
  return raw;
}

/**
 * Portal CssJwtValidator requires matching issuer + audience/client_id.
 * Reject tokens from prod/preprod CSS that would yield anonymous→403.
 */
export function isTokenAcceptableForPortal(
  token: string | null | undefined,
  config: AuthConfig | null | undefined,
): boolean {
  if (!token) return false;
  const claims = decodeJwtPayload(token);
  if (!claims) return false;
  if (claims.exp && Date.now() >= claims.exp * 1000) return false;
  const iss = expectedIssuer(config);
  if (claims.iss && claims.iss.replace(/\/$/, "") !== iss) return false;
  const clientId = config?.clientId || "agent-portal";
  const aud = claims.aud;
  const audOk = Array.isArray(aud)
    ? aud.includes(clientId)
    : aud === clientId || claims.client_id === clientId;
  return audOk;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const fromStore = useVerseStore.getState().accessToken;
  if (fromStore) return fromStore;
  return localStorage.getItem(ACCESS);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH);
}

export function setTokens(access: string, refresh?: string, user?: unknown) {
  localStorage.setItem(ACCESS, access);
  useVerseStore.getState().setAccessToken(access);
  if (refresh) localStorage.setItem(REFRESH, refresh);
  if (user !== undefined) localStorage.setItem(USER, JSON.stringify(user));
}

export function clearTokens() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
  localStorage.removeItem(USER);
  // Also scrub shared Angular keys so they cannot poison the next login.
  localStorage.removeItem("agentPortalAccessToken");
  localStorage.removeItem("agentPortalRefreshToken");
  localStorage.removeItem("agentPortalUser");
  const store = useVerseStore.getState();
  store.setAccessToken(null);
  store.setAuthenticated(false, null);
  store.setSession(null);
  store.setMessages([]);
}

export function getStoredUser(): { username?: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { username?: string };
  } catch {
    return null;
  }
}

function cssUrl(config: AuthConfig, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") return `${CSS_PROXY_BASE}${p}`;
  return `${config.authUrl.replace(/\/$/, "")}${p}`;
}

export function isAccessTokenExpired(token?: string | null, skewSeconds = 60): boolean {
  const raw = token ?? getAccessToken();
  if (!raw) return true;
  const claims = decodeJwtPayload(raw);
  if (!claims?.exp) return !claims; // undecodable → treat expired
  return Date.now() >= (claims.exp - skewSeconds) * 1000;
}

export async function loginWithCss(
  config: AuthConfig,
  username: string,
  password: string,
): Promise<void> {
  // Drop any poisoned tokens before login.
  clearTokens();
  const url = cssUrl(config, config.loginPath || "/auth/login");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password,
      clientId: config.clientId || "agent-portal",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Login failed (${res.status})`);
  }
  const data = (await res.json()) as {
    accessToken?: string;
    token?: string;
    refreshToken?: string;
    user?: unknown;
    username?: string;
  };
  const access = data.accessToken || data.token;
  if (!access) throw new Error("No access token in login response");
  if (!isTokenAcceptableForPortal(access, config)) {
    throw new Error(
      `CSS issued an incompatible JWT (iss=${decodeJwtPayload(access)?.iss}). Expected ${expectedIssuer(config)}.`,
    );
  }
  setTokens(access, data.refreshToken, data.user ?? { username: data.username ?? username });
}

export async function refreshCss(config: AuthConfig): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  const url = cssUrl(config, config.refreshPath || "/auth/refresh");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: refresh,
        clientId: config.clientId || "agent-portal",
      }),
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const data = (await res.json()) as {
      accessToken?: string;
      token?: string;
      refreshToken?: string;
    };
    const access = data.accessToken || data.token;
    if (!access || !isTokenAcceptableForPortal(access, config)) {
      clearTokens();
      return false;
    }
    setTokens(access, data.refreshToken ?? refresh);
    return true;
  } catch {
    return false;
  }
}

export async function ensureFreshToken(
  config: AuthConfig | null | undefined,
): Promise<string | null> {
  let token = getAccessToken();
  if (token && !isTokenAcceptableForPortal(token, config)) {
    clearTokens();
    token = null;
  }
  if (token && !isAccessTokenExpired(token)) return token;
  if (!config?.cssEnabled) return token;
  const ok = await refreshCss(config);
  return ok ? getAccessToken() : null;
}

export async function verifyPortalAuth(config: AuthConfig): Promise<boolean> {
  const token = await ensureFreshToken(config);
  if (!token) return false;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  let res = await fetch("/api/portal/sessions", { headers });
  if (res.status === 401 || res.status === 403) {
    const ok = await refreshCss(config);
    if (!ok) {
      clearTokens();
      return false;
    }
    headers.Authorization = `Bearer ${getAccessToken()}`;
    res = await fetch("/api/portal/sessions", { headers });
  }
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) clearTokens();
    return false;
  }
  return true;
}
