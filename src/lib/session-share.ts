/** Session share helpers for cross-device join via ?session= */

export function readSessionIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const id = new URLSearchParams(window.location.search).get("session");
  return id?.trim() || null;
}

export function buildSessionShareUrl(sessionId: string): string {
  if (typeof window === "undefined") return `/?session=${sessionId}`;
  const url = new URL(window.location.href);
  url.searchParams.set("session", sessionId);
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
