"use client";

import { getPack } from "@/lib/pack-loader";
import { getPersona, personas } from "@/lib/orchestrator";
import { stageCast } from "@/lib/stage-cast";
import { useVerseStore } from "@/lib/store";
import type { PersonaId } from "@/lib/types";
import { useMemo } from "react";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Thin crew radar — avatar pills filtered to active pack stageVisible. */
export function TeamMemberBar() {
  const selected = useVerseStore((s) => s.selectedPersona);
  const focusId = useVerseStore((s) => s.interaction.focusId);
  const busy = useVerseStore((s) => s.busy);
  const agentStates = useVerseStore((s) => s.agentStates);
  const selectPersona = useVerseStore((s) => s.selectPersona);
  const summonPersona = useVerseStore((s) => s.summonPersona);
  const activePackId = useVerseStore((s) => s.activePackId);

  const onStage = useMemo(() => {
    const pack = getPack(activePackId);
    const cast = stageCast(pack);
    return personas
      .filter((p) => cast.includes(p.id as PersonaId))
      .map((p) => getPersona(p.id as PersonaId, pack));
  }, [activePackId]);

  return (
    <nav
      className="team-bar radar"
      aria-label="Office crew"
      data-testid="team-bar-cast"
      data-pack={activePackId}
    >
      <div className="team-bar-track">
        {onStage.map((p) => {
          const id = p.id as PersonaId;
          const on = selected === id || focusId === id;
          const working = agentStates[id]?.working;
          const thinking = busy && selected === id;
          return (
            <button
              key={p.id}
              type="button"
              className={`team-card${on ? " on" : ""}${thinking ? " thinking" : ""}`}
              style={{ ["--p" as string]: p.color }}
              title={`${p.name} · ${p.role}`}
              aria-label={`${p.name}, ${p.role}`}
              data-persona-id={id}
              onClick={() => {
                selectPersona(id);
                summonPersona(id);
              }}
            >
              <span className="team-avatar" aria-hidden>
                {initials(p.name)}
              </span>
              <span className="team-meta">
                <strong>{p.name}</strong>
                <small>{p.role}</small>
              </span>
              <span
                className={`team-dot${working || thinking ? " live" : " idle"}`}
                title={thinking ? "Thinking" : working ? "Working" : "At desk"}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
