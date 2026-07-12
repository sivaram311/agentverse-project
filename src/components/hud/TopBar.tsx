"use client";

import { clearTokens } from "@/lib/auth";
import { copySessionShareUrl } from "@/lib/session-share";
import { personas } from "@/lib/orchestrator";
import { useVerseStore } from "@/lib/store";
import type { PersonaId } from "@/lib/types";
import { useState } from "react";
import { LanguagePicker } from "./LanguagePicker";
import { ProjectSwitcher } from "./ProjectSwitcher";

export function TopBar() {
  const apiOnline = useVerseStore((s) => s.apiOnline);
  const authenticated = useVerseStore((s) => s.authenticated);
  const username = useVerseStore((s) => s.username);
  const selected = useVerseStore((s) => s.selectedPersona);
  const summonPersona = useVerseStore((s) => s.summonPersona);
  const selectPersona = useVerseStore((s) => s.selectPersona);
  const authConfig = useVerseStore((s) => s.authConfig);
  const setAuthenticated = useVerseStore((s) => s.setAuthenticated);
  const session = useVerseStore((s) => s.session);
  const [copied, setCopied] = useState(false);

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">AV</span>
        <div>
          <strong>AgentVerse</strong>
          <small>TN digital office · portal API</small>
        </div>
      </div>
      <nav className="persona-rail" aria-label="Office crew">
        {personas.map((p) => (
          <button
            key={p.id}
            type="button"
            className={selected === p.id ? "on" : undefined}
            style={{ ["--p" as string]: p.color }}
            onClick={() => {
              selectPersona(p.id as PersonaId);
              summonPersona(p.id as PersonaId);
            }}
          >
            {p.name}
          </button>
        ))}
      </nav>
      <div className="status-cluster">
        <LanguagePicker />
        <span className={`pill ${apiOnline ? "ok" : "bad"}`}>
          API {apiOnline ? "online" : "offline"}
        </span>
        {authConfig?.cssEnabled ? (
          <span className={`pill ${authenticated ? "ok" : "warn"}`}>
            {authenticated ? username || "signed in" : "auth required"}
          </span>
        ) : (
          <span className="pill ok">CSS off</span>
        )}
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
        {authenticated ? (
          <button
            type="button"
            className="ghost"
            onClick={() => {
              clearTokens();
              setAuthenticated(false, null);
              useVerseStore.getState().setSession(null);
              useVerseStore.getState().setMessages([]);
            }}
          >
            Sign out
          </button>
        ) : null}
      </div>
      <div className="topbar-projects">
        <ProjectSwitcher />
      </div>
    </header>
  );
}
