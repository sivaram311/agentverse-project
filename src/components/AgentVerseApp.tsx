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
  const subtitle = useVerseStore((s) => s.subtitle);
  const focusId = useVerseStore((s) => s.interaction.focusId);
  const interactionMode = useVerseStore((s) => s.interaction.mode);

  useEffect(() => {
    document.body.dataset.avFocus = focusId ?? "";
    document.body.dataset.avMode = interactionMode;
    document.body.dataset.avSubtitle = subtitle ? "1" : "0";
  }, [focusId, interactionMode, subtitle]);

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

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "agentverse-verse" || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue) as {
          state?: {
            selectedPersona?: string;
            workspacePath?: string;
          };
        };
        const remote = parsed.state;
        if (!remote) return;
        const store = useVerseStore.getState();
        if (remote.selectedPersona && remote.selectedPersona !== store.selectedPersona) {
          store.selectPersona(remote.selectedPersona as never);
        }
        if (remote.workspacePath && remote.workspacePath !== store.workspacePath) {
          store.setWorkspacePath(remote.workspacePath);
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
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
          <p>Tap a persona to summon · Rajveer routes the crew.</p>
        </div>
        {subtitle && focusId ? (
          <div className="verse-subtitle persona-subtitle" role="status">
            {subtitle}
          </div>
        ) : null}
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
