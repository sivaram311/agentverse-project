"use client";

import { clearTokens } from "@/lib/auth";
import { copySessionShareUrl } from "@/lib/session-share";
import { useVerseStore } from "@/lib/store";
import { useState } from "react";
import { LanguagePicker } from "./LanguagePicker";
import { MoodPicker } from "./MoodPicker";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { VoicePicker } from "./VoicePicker";

export function TopBar({
  onOpenSessions,
}: {
  onOpenSessions?: () => void;
} = {}) {
  const apiOnline = useVerseStore((s) => s.apiOnline);
  const authenticated = useVerseStore((s) => s.authenticated);
  const username = useVerseStore((s) => s.username);
  const authConfig = useVerseStore((s) => s.authConfig);
  const setAuthenticated = useVerseStore((s) => s.setAuthenticated);
  const cameraMode = useVerseStore((s) => s.cameraMode);
  const toggleCameraMode = useVerseStore((s) => s.toggleCameraMode);
  const joystickVisible = useVerseStore((s) => s.joystickVisible);
  const toggleJoystickVisible = useVerseStore((s) => s.toggleJoystickVisible);
  const cameraViewsVisible = useVerseStore((s) => s.cameraViewsVisible);
  const toggleCameraViewsVisible = useVerseStore(
    (s) => s.toggleCameraViewsVisible,
  );
  const session = useVerseStore((s) => s.session);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const userLabel = authenticated ? username || "admin" : "guest";
  const userInitial = (userLabel[0] || "A").toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-row">
        <div className="brand">
          <span className="brand-mark">AV</span>
          <div>
            <strong>AgentVerse</strong>
            <small>Digital office</small>
          </div>
        </div>

        <LanguagePicker />

        <div className="status-cluster">
          <span className={`pill ${apiOnline ? "ok pulse-soft" : "bad"}`}>
            <i className={`conn-dot ${apiOnline ? "on" : "off"}`} aria-hidden />
            API {apiOnline ? "online" : "offline"}
          </span>
          {authConfig?.cssEnabled ? (
            <span className={`pill ${authenticated ? "ok" : "warn"}`}>
              {authenticated ? userLabel : "auth required"}
            </span>
          ) : (
            <span className="pill ok">local</span>
          )}
          <VoicePicker />
          <MoodPicker />
          <button
            type="button"
            className={`ghost keep-mobile${joystickVisible ? " is-on" : ""}`}
            onClick={toggleJoystickVisible}
            aria-pressed={joystickVisible}
            title={joystickVisible ? "Hide on-screen joystick" : "Show on-screen joystick"}
          >
            Joystick
          </button>
          <button
            type="button"
            className={`ghost keep-mobile${cameraViewsVisible ? " is-on" : ""}`}
            onClick={toggleCameraViewsVisible}
            aria-pressed={cameraViewsVisible}
            title={
              cameraViewsVisible
                ? "Hide camera angle picker"
                : "Show camera angle picker"
            }
          >
            Views
          </button>
          {authenticated ? (
            <button
              type="button"
              className="ghost keep-mobile"
              onClick={toggleCameraMode}
              title={
                cameraMode === "firstPerson"
                  ? "Switch to orbit overview"
                  : "Switch to first-person walk"
              }
              aria-label={
                cameraMode === "firstPerson"
                  ? "Camera: first person. Switch to orbit."
                  : "Camera: orbit. Switch to first person."
              }
            >
              {cameraMode === "firstPerson" ? "Walk" : "Overview"}
            </button>
          ) : null}
          {authenticated && onOpenSessions ? (
            <button
              type="button"
              className="ghost keep-mobile"
              onClick={onOpenSessions}
            >
              Sessions
            </button>
          ) : null}
          {authenticated && session ? (
            <button
              type="button"
              className="ghost keep-mobile"
              onClick={async () => {
                const ok = await copySessionShareUrl(session.id);
                setCopied(ok);
                window.setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "Copied" : "Share"}
            </button>
          ) : null}
          <button
            type="button"
            className="user-chip"
            aria-expanded={menuOpen}
            aria-label="User menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="user-avatar">{userInitial}</span>
          </button>
          {menuOpen ? (
            <div className="user-menu">
              <p className="muted">{userLabel}</p>
              {authenticated ? (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    clearTokens();
                    setAuthenticated(false, null);
                    useVerseStore.getState().setSession(null);
                    useVerseStore.getState().setMessages([]);
                    setMenuOpen(false);
                  }}
                >
                  Sign out
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <div className="topbar-projects">
        <ProjectSwitcher />
      </div>
    </header>
  );
}
