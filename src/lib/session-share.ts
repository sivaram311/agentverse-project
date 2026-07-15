/** Session share + ProdDeck / Cloud OS deep-link contract helpers */

import type { DeepLinkIntent, DeepLinkParams, PersonaId } from "./types";

/** PWA / cold-start: last desk share URL (same-origin `?session=`). */
export const LAST_DESK_URL_KEY = "agentverse-last-desk-url";

let lastDeskRestoreAttempted = false;

const PERSONA_IDS = new Set<PersonaId>([
  "rajesh",
  "karthik",
  "lavanya",
  "aravind",
  "meenakshi",
  "muthu",
  "kabilan",
  "helpdesk",
]);

/** Hosts allowed for deep-link `return` (open-redirect guard). */
const RETURN_HOST_ALLOWLIST = new Set([
  "localhost",
  "127.0.0.1",
  "home.delena.buzz",
  "home-staging.delena.buzz",
  "agentverse.delena.buzz",
  "agentverse-staging.delena.buzz",
  "agentverse-v2.delena.buzz",
  "agentverse-v2-staging.delena.buzz",
  "agentverse-upgrade.delena.buzz",
  "agentverse-upgrade-staging.delena.buzz",
]);

export function readSessionIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("session");
  return id?.trim() || null;
}

export function parseDeepLinkParams(
  search = typeof window !== "undefined" ? window.location.search : "",
): DeepLinkParams {
  const params = new URLSearchParams(
    search.startsWith("?") ? search : search ? `?${search}` : "",
  );
  const rawIntent = (params.get("intent") || "").trim().toLowerCase();
  const intent: DeepLinkIntent =
    rawIntent === "session-desk" || rawIntent === "hire" ? rawIntent : "";

  return {
    src: params.get("src")?.trim() || null,
    crew: params.get("crew")?.trim() || null,
    session: params.get("session")?.trim() || null,
    intent,
    brief: decodeMaybe(params.get("brief")),
    skills: params.get("skills")?.trim() || null,
    returnUrl: params.get("return")?.trim() || null,
    env: params.get("env")?.trim() || null,
    evidence: decodeMaybe(params.get("evidence")),
  };
}

/**
 * Dual decode for `brief` / `evidence`:
 * 1. URLSearchParams already applies standard URI decode (canonical ProdDeck).
 * 2. Tolerate leftover `%XX` sequences via decodeURIComponent.
 * 3. If the result still looks like base64url, try base64url → UTF-8 (legacy ProdDeck).
 */
function decodeMaybe(value: string | null): string | null {
  if (!value?.trim()) return null;
  let text = value.trim();
  // URLSearchParams already URI-decoded; only re-decode lingering percent-escapes
  if (/%[0-9A-Fa-f]{2}/.test(text)) {
    try {
      text = decodeURIComponent(text);
    } catch {
      /* keep current text */
    }
  }
  return tryDecodeBase64UrlUtf8(text) ?? text;
}

function looksBase64Url(s: string): boolean {
  if (s.length < 12 || /\s/.test(s)) return false;
  return /^[A-Za-z0-9_-]+={0,2}$/.test(s);
}

/** Legacy ProdDeck packed brief; returns null if not valid base64url UTF-8. */
function tryDecodeBase64UrlUtf8(s: string): string | null {
  if (!looksBase64Url(s)) return null;
  try {
    const padded = s.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (padded.length % 4)) % 4;
    const b64 = padded + "=".repeat(padLen);
    const binary =
      typeof atob === "function"
        ? atob(b64)
        : Buffer.from(b64, "base64").toString("binary");
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (!decoded.trim()) return null;
    for (const ch of decoded) {
      const code = ch.charCodeAt(0);
      if (code !== 9 && code !== 10 && code !== 13 && (code < 32 || code === 127)) {
        return null;
      }
    }
    return decoded;
  } catch {
    return null;
  }
}

export function resolveCrewPersona(crew: string | null): PersonaId | null {
  if (!crew) return null;
  const id = crew.trim().toLowerCase() as PersonaId;
  return PERSONA_IDS.has(id) ? id : null;
}

/** Returns sanitized absolute URL or null if unsafe. */
export function sanitizeReturnUrl(raw: string | null): string | null {
  if (!raw?.trim()) return null;
  try {
    const url = new URL(raw, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (!RETURN_HOST_ALLOWLIST.has(host)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function buildSessionShareUrl(sessionId: string): string {
  if (typeof window === "undefined") return `/?session=${sessionId}`;
  const url = new URL(window.location.href);
  url.pathname = "/";
  url.search = "";
  url.searchParams.set("session", sessionId);
  return url.toString();
}

export function saveLastDeskUrl(url: string): void {
  if (typeof window === "undefined") return;
  const trimmed = url.trim();
  if (!trimmed) return;
  try {
    localStorage.setItem(LAST_DESK_URL_KEY, trimmed);
  } catch {
    /* quota / private mode */
  }
}

export function readLastDeskUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LAST_DESK_URL_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Once per page load: if the URL has no `session=`, restore the last saved
 * same-origin desk/share URL via `history.replaceState` (PWA start_url `/`).
 * Returns the restored session id, or null.
 */
export function restoreLastDeskUrlIfNeeded(): string | null {
  if (typeof window === "undefined") return null;
  if (lastDeskRestoreAttempted) return null;
  lastDeskRestoreAttempted = true;

  if (readSessionIdFromUrl() || parseDeepLinkParams().session) return null;

  const last = readLastDeskUrl();
  if (!last) return null;

  try {
    const target = new URL(last, window.location.origin);
    if (target.origin !== window.location.origin) return null;
    const path = target.pathname || "/";
    if (path !== "/" && path !== "/desk") return null;
    const sessionId = target.searchParams.get("session")?.trim() || null;
    if (!sessionId) return null;
    window.history.replaceState(
      null,
      "",
      `${path}${target.search}${target.hash}`,
    );
    return sessionId;
  } catch {
    return null;
  }
}

export function buildDeskDeepLink(partial: Partial<DeepLinkParams>): string {
  if (typeof window === "undefined") {
    const q = new URLSearchParams();
    if (partial.session) q.set("session", partial.session);
    if (partial.intent) q.set("intent", partial.intent);
    return `/desk?${q.toString()}`;
  }
  const url = new URL("/desk", window.location.origin);
  if (partial.src) url.searchParams.set("src", partial.src);
  if (partial.crew) url.searchParams.set("crew", partial.crew);
  if (partial.session) url.searchParams.set("session", partial.session);
  if (partial.intent) url.searchParams.set("intent", partial.intent);
  if (partial.brief) url.searchParams.set("brief", encodeURIComponent(partial.brief));
  if (partial.skills) url.searchParams.set("skills", partial.skills);
  if (partial.returnUrl) url.searchParams.set("return", partial.returnUrl);
  if (partial.env) url.searchParams.set("env", partial.env);
  if (partial.evidence) url.searchParams.set("evidence", encodeURIComponent(partial.evidence));
  return url.toString();
}

export async function copySessionShareUrl(sessionId: string): Promise<boolean> {
  const link = buildSessionShareUrl(sessionId);
  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = link;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/** Detect deploy env from public config / host. */
export function detectDeployEnv(): "DEV" | "PREPROD" | "PROD" | "UNKNOWN" {
  const baked =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_AV_ENV?.toUpperCase()
      : undefined;
  if (baked === "DEV" || baked === "PREPROD" || baked === "PROD") return baked;
  if (typeof window === "undefined") return "UNKNOWN";
  const host = window.location.hostname.toLowerCase();
  if (host === "agentverse-upgrade.delena.buzz") return "PROD";
  if (host === "agentverse-upgrade-staging.delena.buzz") return "PREPROD";
  if (host === "agentverse.delena.buzz") return "PROD";
  if (host === "agentverse-staging.delena.buzz") return "PREPROD";
  if (host === "localhost" || host === "127.0.0.1") return "DEV";
  return "UNKNOWN";
}
