"use client";

import { portalApi } from "@/lib/api";
import { useVerseStore } from "@/lib/store";

/** HUD tabs for multiple portal sessions (one per directory). */
export function SessionTabs() {
  const tabs = useVerseStore((s) => s.sessionTabs);
  const active = useVerseStore((s) => s.activeTabSessionId);
  const authConfig = useVerseStore((s) => s.authConfig);

  if (tabs.length === 0) return null;

  return (
    <div className="session-tabs" role="tablist" aria-label="Sessions">
      {tabs.map((tab) => (
        <button
          key={tab.sessionId}
          type="button"
          role="tab"
          aria-selected={active === tab.sessionId}
          className={active === tab.sessionId ? "on" : undefined}
          title={tab.workspacePath}
          onClick={async () => {
            const store = useVerseStore.getState();
            store.switchSessionTab(tab.sessionId);
            try {
              const session = await portalApi.getSession(tab.sessionId, authConfig);
              store.setSession(session);
              const msgs = await portalApi.getMessages(tab.sessionId, authConfig);
              store.setMessages(msgs);
            } catch (err) {
              store.setError(
                err instanceof Error ? err.message : "Failed to switch session",
              );
            }
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
