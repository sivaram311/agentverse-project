import personasDoc from "@/prompts/personas.json";
import type { PersonaId, Quest, UiLanguage } from "./types";
import { hexSeatPosition } from "./hex-office";
import type { Pack } from "./pack-loader";

export type PersonaDef = (typeof personasDoc.personas)[number] & {
  id: PersonaId;
  deskIndex?: number;
  gender?: "male" | "female";
  skin?: string;
  hair?: string;
  greetings?: Partial<Record<UiLanguage, string>>;
  greeting?: string;
  position: [number, number, number];
};

/** Live hex seats from deskIndex so radius tweaks stay in sync. */
export const personas = (personasDoc.personas as PersonaDef[]).map((p) => {
  const deskIndex = p.deskIndex ?? 0;
  return {
    ...p,
    deskIndex,
    position: hexSeatPosition(deskIndex),
  };
});
export const orchestratorId = personasDoc.orchestratorId as PersonaId;

/** Merge a pack's overlay for this persona: role/title swap + addendum appended to systemPrompt. */
export function applyPackOverlay(persona: PersonaDef, pack?: Pack | null): PersonaDef {
  const overlay = pack?.overlays[persona.id];
  if (!overlay) return persona;
  return {
    ...persona,
    name: overlay.name ?? persona.name,
    role: overlay.role ?? persona.role,
    title: overlay.title ?? persona.title,
    systemPrompt: overlay.systemPromptAddendum
      ? `${persona.systemPrompt}\n\n${overlay.systemPromptAddendum}`
      : persona.systemPrompt,
  };
}

/**
 * Base persona lookup, optionally overlaid by an active pack.
 * Kept pack-agnostic by default (no store import here — avoids a
 * store.ts <-> orchestrator.ts circular import). Callers that know the
 * active pack (e.g. store.ts, UI) pass it explicitly.
 */
export function getPersona(id: PersonaId, pack?: Pack | null): PersonaDef {
  const p = personas.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown persona ${id}`);
  return pack ? applyPackOverlay(p, pack) : p;
}

/** Pick greeting for current UI language (Tamil default). */
export function greetingFor(persona: PersonaDef, lang: UiLanguage): string {
  const g = persona.greetings;
  if (g?.[lang]) return g[lang]!;
  if (g?.en) return g.en;
  if (persona.greeting) return persona.greeting;
  return `Vanakkam! Main ${persona.name}.`;
}

const PROJECT_PATTERNS =
  /\b(new project|create project|start project|deploy (a )?team|project idea|புதிய திட்டம்|नया प्रोजेक्ट)\b/i;

export function detectProjectIdea(userText: string): string | null {
  if (!PROJECT_PATTERNS.test(userText) && !/\bproject\b/i.test(userText)) {
    return null;
  }
  const cleaned = userText
    .replace(PROJECT_PATTERNS, "")
    .replace(/^[:\-\s]+/, "")
    .trim();
  return cleaned.length >= 8 ? cleaned : userText.trim();
}

/** Rajesh routes a user prompt to the best specialist. */
export function routeQuest(userText: string): {
  assignee: PersonaId;
  title: string;
  description: string;
  composedPrompt: string;
  projectIdea: string | null;
} {
  const lower = userText.toLowerCase();
  const raj = getPersona("rajesh");
  const table = (raj as PersonaDef & {
    routingKeywords?: Record<string, string[]>;
  }).routingKeywords;

  const projectIdea = detectProjectIdea(userText);

  let best: PersonaId = projectIdea ? "muthu" : "aravind";
  let bestScore = 0;
  if (table) {
    for (const [id, words] of Object.entries(table)) {
      const score = words.reduce(
        (acc, w) => acc + (lower.includes(w.toLowerCase()) ? 1 : 0),
        0,
      );
      if (score > bestScore) {
        bestScore = score;
        best = id as PersonaId;
      }
    }
  }
  if (bestScore === 0 && !projectIdea) {
    if (/^(hi|hello|hey|vanakkam|வணக்கம்|thanks)\b/i.test(lower)) {
      best = "meenakshi";
    } else {
      best = "aravind";
    }
  }

  const agent = getPersona(best);
  const title = projectIdea
    ? `Project deploy → ${agent.name}`
    : `Mission → ${agent.name}`;
  const description = userText.trim().slice(0, 160);
  const composedPrompt = [
    `[AgentVerse orchestrator: Rajesh]`,
    `Assignee: ${agent.name} (${agent.role})`,
    projectIdea ? `Project idea: ${projectIdea}` : null,
    `---`,
    agent.systemPrompt,
    `---`,
    `User quest:`,
    userText.trim(),
  ]
    .filter(Boolean)
    .join("\n");

  return { assignee: best, title, description, composedPrompt, projectIdea };
}

export function makeQuest(
  assignee: PersonaId,
  title: string,
  description: string,
  projectId?: string | null,
  sessionId?: string | null,
): Quest {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    description,
    assignee,
    status: "active",
    createdAt: Date.now(),
    progress: undefined,
    projectId: projectId ?? null,
    sessionId: sessionId ?? null,
  };
}

const CLUSTER_COLORS = ["#E8A838", "#4DA3FF", "#3DDC97", "#FF6BCB", "#C4A35A"];

/** Place successive project clusters around the office ring. */
export function nextClusterOffset(existingCount: number): [number, number, number] {
  const angle = (existingCount % 6) * ((Math.PI * 2) / 6) + Math.PI / 6;
  const radius = 11 + Math.floor(existingCount / 6) * 3;
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
}

export function projectColor(index: number): string {
  return CLUSTER_COLORS[index % CLUSTER_COLORS.length]!;
}
