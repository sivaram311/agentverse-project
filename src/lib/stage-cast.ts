/**
 * Stage cast helpers — pack.stageVisible ∩ known PersonaId.
 * See agents/pre-work/waves/0.3.5/02-architecture.md
 */
import { getPack, type Pack } from "@/lib/pack-loader";
import { orchestratorId, personas } from "@/lib/orchestrator";
import type { PersonaId } from "@/lib/types";

const KNOWN = new Set(personas.map((p) => p.id as PersonaId));

export type ContextDecisionKind = "adopt" | "switch" | "hire";

export type PackContextActivityEvent = {
  at: string;
  session: string;
  provider: "cursor" | "antigravity" | "other";
  role: string;
  kind: ContextDecisionKind;
  appId: string;
  packEpoch: number;
  personaId?: string;
  fromPersonaId?: string;
  hireNotePath?: string;
  ownershipPaths?: string[];
  reason?: string;
  fleet: "3312/4312/5312";
};

export type HireReplacementArgs = {
  personaId: PersonaId;
  hireNotePath: string;
  reason: string;
  ownershipPaths?: string[];
  bumpEpoch?: boolean;
};

/** Intersect pack.stageVisible with known PersonaId; drop unknown ids. */
export function stageCast(pack: Pack | null): PersonaId[] {
  if (!pack?.stageVisible?.length) {
    return personas.map((p) => p.id as PersonaId);
  }
  const out: PersonaId[] = [];
  for (const id of pack.stageVisible) {
    if (KNOWN.has(id as PersonaId)) {
      out.push(id as PersonaId);
    } else if (typeof console !== "undefined") {
      console.warn(`[stage-cast] dropped unknown stageVisible id: ${id}`);
    }
  }
  return out.length ? out : [orchestratorId];
}

export function stageCastForPackId(appId: string): PersonaId[] {
  return stageCast(getPack(appId));
}

export function isOnStage(id: PersonaId, pack: Pack | null): boolean {
  return stageCast(pack).includes(id);
}

/**
 * Prefer helpdesk if in cast; else keep preferred if on stage;
 * else orchestrator if on stage; else first cast id.
 */
export function defaultTalkTarget(
  pack: Pack | null,
  preferred?: PersonaId | null,
): PersonaId {
  const cast = stageCast(pack);
  if (preferred && cast.includes(preferred)) return preferred;
  if (cast.includes("helpdesk")) return "helpdesk";
  if (cast.includes(orchestratorId)) return orchestratorId;
  return cast[0] ?? orchestratorId;
}

export function nowIstStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  // Approx IST display: machine local is already IST on this host (+5:30)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
