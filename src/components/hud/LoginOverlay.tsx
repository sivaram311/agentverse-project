"use client";

import { FormEvent, useState } from "react";
import { getAccessToken, loginWithCss, verifyPortalAuth } from "@/lib/auth";
import { useVerseStore } from "@/lib/store";

function isLocalDevHost() {
  if (typeof window === "undefined") return true;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

export function LoginOverlay() {
  const authConfig = useVerseStore((s) => s.authConfig);
  const setAuthenticated = useVerseStore((s) => s.setAuthenticated);
  const setAccessToken = useVerseStore((s) => s.setAccessToken);
  const setError = useVerseStore((s) => s.setError);
  const error = useVerseStore((s) => s.error);
  const localDev = isLocalDevHost();
  const [username, setUsername] = useState("admin");
  // DEV CSS seeds admin/admin123; staging/prod use CSS admin password (never prefill).
  const [password, setPassword] = useState(localDev ? "admin123" : "");
  const [busy, setBusy] = useState(false);

  if (!authConfig?.cssEnabled) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!authConfig) return;
    setBusy(true);
    setError(null);
    try {
      await loginWithCss(authConfig, username, password);
      const ok = await verifyPortalAuth(authConfig);
      if (!ok) throw new Error("Login succeeded but portal API rejected the token");
      setAccessToken(getAccessToken());
      setAuthenticated(true, username);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-overlay">
      <form className="login-card" onSubmit={onSubmit}>
        <p className="brand-kicker">AgentVerse</p>
        <h1>Enter the hub</h1>
        <p className="muted">
          CSS (`{authConfig.clientId}`)
          {localDev
            ? " — DEV: admin / admin123"
            : " — use CSS admin credentials (not DEV admin123)"}
        </p>
        <label htmlFor="av-username">
          Username
          <input
            id="av-username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label htmlFor="av-password">
          Password
          <input
            id="av-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Join lobby"}
        </button>
      </form>
    </div>
  );
}
