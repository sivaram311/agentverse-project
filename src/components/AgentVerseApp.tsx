"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { portalApi } from "@/lib/api";
import { getAccessToken, getStoredUser, verifyPortalAuth } from "@/lib/auth";
import { ChatPanel } from "@/components/hud/ChatPanel";
import { CommandStrip } from "@/components/hud/CommandStrip";
import { LoginOverlay } from "@/components/hud/LoginOverlay";
import { OfficeSwitch } from "@/components/hud/OfficeSwitch";
import { QuestPanel } from "@/components/hud/QuestPanel";
import { SessionDesk } from "@/components/hud/SessionDesk";
import { StageControls } from "@/components/hud/StageControls";
import { TeamMemberBar } from "@/components/hud/TeamMemberBar";
import { TopBar } from "@/components/hud/TopBar";
import { TouchJoystick } from "@/components/hud/TouchJoystick";
import {
  parseDeepLinkParams,
  resolveCrewPersona,
  sanitizeReturnUrl,
} from "@/lib/session-share";
import { useVerseStore } from "@/lib/store";

const HubScene = dynamic(
  () => import("@/components/scene/HubScene").then((m) => m.HubScene),
  { ssr: false, loading: () => <div className="hub-canvas placeholder" /> },
);

function applyDeepLinkAfterAuth() {
  const deep = parseDeepLinkParams();
  const store = useVerseStore.getState();
  const safeReturn = sanitizeReturnUrl(deep.returnUrl);
  if (safeReturn) store.setReturnUrl(safeReturn);

  const isProdDeck = (deep.src || "").toLowerCase() === "proddeck";
  const crew = resolveCrewPersona(deep.crew);
  if (crew && deep.intent === "hire") {
    store.selectPersona(crew);
  }

  if (deep.brief || isProdDeck) {
    store.setIncidentBrief(deep.brief, deep.evidence, isProdDeck);
  }

  if (deep.brief) {
    const seed = deep.brief.startsWith("Investigate:")
      ? deep.brief
      : `Investigate: ${deep.brief}`;
    store.setComposeDraft(seed);
    store.bumpChatFocus();
  } else if (deep.intent === "hire" || isProdDeck) {
    store.openChat();
    store.bumpChatFocus();
  }

  if (deep.intent === "session-desk" || deep.intent === "hire") {
    store.requestSessionDesk();
  }
}

export function AgentVerseApp() {
  const authConfig = useVerseStore((s) => s.authConfig);
  const authenticated = useVerseStore((s) => s.authenticated);
  const error = useVerseStore((s) => s.error);
  const subtitle = useVerseStore((s) => s.subtitle);
  const focusId = useVerseStore((s) => s.interaction.focusId);
  const interactionMode = useVerseStore((s) => s.interaction.mode);
  const busy = useVerseStore((s) => s.busy);
  const officeChromeOpen = useVerseStore((s) => s.officeChromeOpen);
  const chatOpen = useVerseStore((s) => s.chatOpen);
  const sessionDeskRequestNonce = useVerseStore((s) => s.sessionDeskRequestNonce);
  const [sessionDeskOpen, setSessionDeskOpen] = useState(false);
  const [deepLinkApplied, setDeepLinkApplied] = useState(false);

  useEffect(() => {
    document.body.dataset.avFocus = focusId ?? "";
    document.body.dataset.avMode = interactionMode;
    document.body.dataset.avSubtitle = subtitle ? "1" : "0";
    document.body.dataset.avBusy = busy ? "1" : "0";
    document.body.dataset.avChrome = officeChromeOpen ? "1" : "0";
    document.body.dataset.avChat = chatOpen ? "1" : "0";
  }, [focusId, interactionMode, subtitle, busy, officeChromeOpen, chatOpen]);

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
        if (cfg.cssEnabled && cfg.authUrl) {
          try {
            const cssRes = await fetch(`${cfg.authUrl.replace(/\/$/, "")}/health`, {
              method: "GET",
              mode: "cors",
            }).catch(() => null);
            store.setCssOnline(cssRes?.ok ?? null);
          } catch {
            store.setCssOnline(false);
          }
        } else {
          store.setCssOnline(null);
        }
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
    if (!authenticated || deepLinkApplied) return;
    applyDeepLinkAfterAuth();
    setDeepLinkApplied(true);
  }, [authenticated, deepLinkApplied]);

  useEffect(() => {
    if (sessionDeskRequestNonce > 0) {
      setSessionDeskOpen(true);
    }
  }, [sessionDeskRequestNonce]);

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
    <div
      className={`verse-shell${officeChromeOpen ? " chrome-open" : " chrome-closed"}${
        chatOpen ? " chat-open" : " chat-closed"
      }`}
    >
      <div className="chrome-rail">
        <OfficeSwitch />
        {officeChromeOpen ? (
          <TopBar onOpenSessions={() => setSessionDeskOpen(true)} />
        ) : null}
      </div>
      <TeamMemberBar />
      <main className="verse-main">
        <HubScene />
        {showLogin ? null : (
          <>
            <div
              className={`hud-layer${chatOpen ? "" : " dormant"}`}
              aria-hidden={!chatOpen}
            >
              {chatOpen ? <QuestPanel /> : null}
              <ChatPanel />
            </div>
            {!chatOpen ? (
              <div className="command-layer">
                <CommandStrip
                  onOpenSessions={() => setSessionDeskOpen(true)}
                />
              </div>
            ) : null}
            {sessionDeskOpen ? (
              <div className="session-desk-layer">
                <SessionDesk
                  open
                  overlay
                  onClose={() => setSessionDeskOpen(false)}
                />
              </div>
            ) : null}
            <TouchJoystick />
          </>
        )}
        {/* Reachable pre-auth and when chat closed — operator chrome prefs. */}
        {!chatOpen ? <StageControls /> : null}
        <div className="hero-copy" aria-hidden="true">
          <p className="brand-kicker">Siruseri floor</p>
          <h1>Digital office</h1>
          <p>WASD / joystick to walk · approach an agent to talk</p>
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
