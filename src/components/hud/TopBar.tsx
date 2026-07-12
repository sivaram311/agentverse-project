"use client";

import { clearTokens } from "@/lib/auth";
import { personas } from "@/lib/orchestrator";
import { useVerseStore } from "@/lib/store";

export function TopBar() {
  const apiOnline = useVerseStore((s) => s.apiOnline);
  const authenticated = useVerseStore((s) => s.authenticated);
  const username = useVerseStore((s) => s.username);
  const selected = useVerseStore((s) => s.selectedPersona);
  const selectPersona = useVerseStore((s) => s.selectPersona);
  const authConfig = useVerseStore((s) => s.authConfig);
  const setAuthenticated = useVerseStore((s) => s.setAuthenticated);

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">AV</span>
        <div>
          <strong>AgentVerse</strong>
          <small>3D agent hub · portal API</small>
        </div>
      </div>
      <nav className="persona-rail" aria-label="Personas">
        {personas.map((p) => (
          <button
            key={p.id}
            type="button"
            className={selected === p.id ? "on" : undefined}
            style={{ ["--p" as string]: p.color }}
            onClick={() => selectPersona(p.id)}
          >
            {p.name}
          </button>
        ))}
      </nav>
      <div className="status-cluster">
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
        {authenticated ? (
          <button
            type="button"
            className="ghost"
            onClick={() => {
              clearTokens();
              setAuthenticated(false, null);
            }}
          >
            Sign out
          </button>
        ) : null}
      </div>
    </header>
  );
}
