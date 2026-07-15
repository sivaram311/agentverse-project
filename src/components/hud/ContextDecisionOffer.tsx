"use client";

import { listWorkPlanePacks } from "@/lib/pack-loader";
import { personas } from "@/lib/orchestrator";
import { stageCast } from "@/lib/stage-cast";
import { getPack } from "@/lib/pack-loader";
import { useVerseStore } from "@/lib/store";
import type { PersonaId } from "@/lib/types";
import { useMemo, useState } from "react";

/**
 * Single affordance for W4: Adopt · Switch · Hire (one decision per turn).
 * Hire is SOP-only (logs event; does not call Cursor/CLI).
 */
export function ContextDecisionOffer() {
  const open = useVerseStore((s) => s.contextDecisionOpen);
  const setOpen = useVerseStore((s) => s.setContextDecisionOpen);
  const activePackId = useVerseStore((s) => s.activePackId);
  const packEpoch = useVerseStore((s) => s.packEpoch);
  const selected = useVerseStore((s) => s.selectedPersona);
  const adoptPersona = useVerseStore((s) => s.adoptPersona);
  const switchPack = useVerseStore((s) => s.switchPack);
  const hireReplacement = useVerseStore((s) => s.hireReplacement);
  const canDecide = useVerseStore((s) => s.canMakeContextDecision);
  const error = useVerseStore((s) => s.error);

  const [tab, setTab] = useState<"adopt" | "switch" | "hire">("adopt");
  const [hireNote, setHireNote] = useState(
    "agents/hires/operator-hire-note.md",
  );
  const [hireReason, setHireReason] = useState("poisoned");

  const cast = useMemo(
    () => stageCast(getPack(activePackId)),
    [activePackId],
  );
  const castPersonas = personas.filter((p) =>
    cast.includes(p.id as PersonaId),
  );
  const workPacks = listWorkPlanePacks();

  if (!open) return null;

  const locked = !canDecide();

  return (
    <div
      className="context-decision"
      role="dialog"
      aria-label="Context decision"
      data-testid="context-decision"
    >
      <header className="context-decision__head">
        <div>
          <p className="context-decision__kicker">One decision this turn</p>
          <h2 className="context-decision__title">Adopt · Switch · Hire</h2>
          <p className="context-decision__meta">
            Stage <strong>{activePackId}</strong> · epoch {packEpoch}
          </p>
        </div>
        <button
          type="button"
          className="context-decision__close"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          ✕
        </button>
      </header>
      {locked ? (
        <p className="context-decision__lock" role="status">
          Wait a moment — one context decision per turn.
        </p>
      ) : null}
      {error ? (
        <p className="context-decision__err" role="alert">
          {error}
        </p>
      ) : null}
      <div className="context-decision__tabs" role="tablist">
        {(["adopt", "switch", "hire"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? "on" : undefined}
            onClick={() => setTab(t)}
          >
            {t === "adopt" ? "Adopt" : t === "switch" ? "Switch" : "Hire"}
          </button>
        ))}
      </div>
      {tab === "adopt" ? (
        <ul className="context-decision__list">
          {castPersonas.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                disabled={locked || selected === p.id}
                onClick={() => adoptPersona(p.id as PersonaId)}
              >
                {p.name}
                <small>{p.role}</small>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {tab === "switch" ? (
        <ul className="context-decision__list">
          {workPacks.map((pack) => (
            <li key={pack.appId}>
              <button
                type="button"
                disabled={locked || pack.appId === activePackId}
                onClick={() => switchPack(pack.appId, "switch")}
              >
                {pack.appId}
                <small>{pack.sessionTitle ?? pack.workspacePath}</small>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {tab === "hire" ? (
        <div className="context-decision__hire">
          <p className="context-decision__hint">
            Logs a Layer B SOP hire note — does not spawn Cursor/CLI or stage
            bodies.
          </p>
          <label>
            Persona
            <select
              id="hire-persona"
              defaultValue={selected}
              data-testid="hire-persona"
            >
              {castPersonas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Hire note path
            <input
              value={hireNote}
              onChange={(e) => setHireNote(e.target.value)}
            />
          </label>
          <label>
            Reason
            <input
              value={hireReason}
              onChange={(e) => setHireReason(e.target.value)}
            />
          </label>
          <button
            type="button"
            disabled={locked}
            onClick={() => {
              const el = document.getElementById(
                "hire-persona",
              ) as HTMLSelectElement | null;
              const personaId = (el?.value ?? selected) as PersonaId;
              hireReplacement({
                personaId,
                hireNotePath: hireNote.trim(),
                reason: hireReason.trim() || "replacement",
              });
            }}
          >
            Log hire (SOP)
          </button>
        </div>
      ) : null}
    </div>
  );
}
