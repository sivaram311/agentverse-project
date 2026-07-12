"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { portalApi } from "@/lib/api";
import { getAccessToken, getStoredUser, verifyPortalAuth } from "@/lib/auth";
import { ChatPanel } from "@/components/hud/ChatPanel";
import { LoginOverlay } from "@/components/hud/LoginOverlay";
import { QuestPanel } from "@/components/hud/QuestPanel";
import { TopBar } from "@/components/hud/TopBar";
import { useVerseStore } from "@/lib/store";

const HubScene = dynamic(
  () => import("@/components/scene/HubScene").then((m) => m.HubScene),
  { ssr: false, loading: () => <div className="hub-canvas placeholder" /> },
);

export function AgentVerseApp() {
  const authConfig = useVerseStore((s) => s.authConfig);
  const authenticated = useVerseStore((s) => s.authenticated);
  const error = useVerseStore((s) => s.error);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* optional offline shell */
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const store = useVerseStore.getState();
      try {
        const health = await portalApi.health();
        if (cancelled) return;
        store.setApiOnline(health.status === "ok" || !!health.status);
      } catch {
        if (!cancelled) store.setApiOnline(false);
      }
      try {
        const cfg = await portalApi.authConfig();
        if (cancelled) return;
        store.setAuthConfig(cfg);
        if (!cfg.cssEnabled) {
          store.setAuthenticated(true, getStoredUser()?.username ?? "local");
          return;
        }
        const ok = await verifyPortalAuth(cfg);
        if (cancelled) return;
        if (ok) {
          store.setAccessToken(getAccessToken());
          store.setAuthenticated(true, getStoredUser()?.username ?? "user");
        } else {
          store.setAuthenticated(false, null);
        }
      } catch (err) {
        if (!cancelled) {
          store.setError(
            err instanceof Error ? err.message : "Failed to load auth config",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const showLogin = !!authConfig?.cssEnabled && !authenticated;

  return (
    <div className="verse-shell">
      <TopBar />
      <main className="verse-main">
        <HubScene />
        <div className="hud-layer">
          <QuestPanel />
          <ChatPanel />
        </div>
        <div className="hero-copy" aria-hidden={showLogin}>
          <p className="brand-kicker">AgentVerse</p>
          <h1>Mission lobby</h1>
          <p>Rajveer routes quests across your Indian crew.</p>
        </div>
      </main>
      {error && !showLogin ? (
        <div className="toast error" role="alert">
          {error}
          <button type="button" onClick={() => useVerseStore.getState().setError(null)}>
            Dismiss
          </button>
        </div>
      ) : null}
      {showLogin ? <LoginOverlay /> : null}
    </div>
  );
}
