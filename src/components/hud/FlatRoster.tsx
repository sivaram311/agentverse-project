"use client";

import { personas } from "@/lib/orchestrator";
import { useVerseStore } from "@/lib/store";
import type { PersonaId } from "@/lib/types";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** 2D persona roster when WebGL / Canvas hub cannot run. */
export function FlatRoster() {
  const selected = useVerseStore((s) => s.selectedPersona);
  const agentStates = useVerseStore((s) => s.agentStates);
  const selectPersona = useVerseStore((s) => s.selectPersona);
  const summonPersona = useVerseStore((s) => s.summonPersona);
  const openChat = useVerseStore((s) => s.openChat);
  const requestSessionDesk = useVerseStore((s) =>
    "requestSessionDesk" in s ? s.requestSessionDesk : undefined,
  );

  return (
    <div className="webgl-fallback flat-roster" role="region" aria-label="2D crew roster">
      <header className="flat-roster__header">
        <p className="flat-roster__kicker">WebGL unavailable</p>
        <h2 className="flat-roster__title">Crew roster</h2>
        <p className="flat-roster__hint">
          Tap an agent to talk. 3D office is disabled on this device.
        </p>
      </header>
      <ul className="flat-roster__list">
        {personas.map((p) => {
          const id = p.id as PersonaId;
          const on = selected === id;
          const working = agentStates[id]?.working;
          return (
            <li key={p.id} className="flat-roster__item">
              <button
                type="button"
                className={`flat-roster__card${on ? " flat-roster__card--on" : ""}`}
                style={{ ["--p" as string]: p.color }}
                aria-pressed={on}
                aria-label={`${p.name}, ${p.role}. Open chat.`}
                onClick={() => {
                  selectPersona(id);
                  summonPersona(id);
                  openChat();
                }}
              >
                <span className="flat-roster__avatar" aria-hidden>
                  {initials(p.name)}
                </span>
                <span className="flat-roster__meta">
                  <strong>{p.name}</strong>
                  <small>{p.role}</small>
                  {p.title ? <span className="flat-roster__title-line">{p.title}</span> : null}
                </span>
                <span
                  className={`flat-roster__status${working ? " flat-roster__status--live" : ""}`}
                  aria-hidden
                >
                  {working ? "Working" : "Ready"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {typeof requestSessionDesk === "function" ? (
        <div className="flat-roster__actions">
          <button
            type="button"
            className="flat-roster__desk-btn"
            onClick={() => requestSessionDesk()}
          >
            Open Session Desk
          </button>
        </div>
      ) : null}
    </div>
  );
}
