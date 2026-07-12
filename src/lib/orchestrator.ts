import personasDoc from "@/prompts/personas.json";
import type { PersonaId, Quest } from "./types";

export type PersonaDef = (typeof personasDoc.personas)[number] & {
  id: PersonaId;
};

export const personas = personasDoc.personas as PersonaDef[];
export const orchestratorId = personasDoc.orchestratorId as PersonaId;

export function getPersona(id: PersonaId): PersonaDef {
  const p = personas.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown persona ${id}`);
  return p;
}

/** Rajveer routes a user prompt to the best specialist. */
export function routeQuest(userText: string): {
  assignee: PersonaId;
  title: string;
  description: string;
  composedPrompt: string;
} {
  const lower = userText.toLowerCase();
  const raj = getPersona("rajveer");
  const table = (raj as PersonaDef & {
    routingKeywords?: Record<string, string[]>;
  }).routingKeywords;

  let best: PersonaId = "arjun";
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
  if (bestScore === 0) {
    if (/^(hi|hello|hey|thanks)\b/.test(lower)) best = "meera";
    else best = "arjun";
  }

  const agent = getPersona(best);
  const title = `Mission → ${agent.name}`;
  const description = userText.trim().slice(0, 160);
  const composedPrompt = [
    `[AgentVerse orchestrator: Rajveer]`,
    `Assignee: ${agent.name} (${agent.role})`,
    `---`,
    agent.systemPrompt,
    `---`,
    `User quest:`,
    userText.trim(),
  ].join("\n");

  return { assignee: best, title, description, composedPrompt };
}

export function makeQuest(
  assignee: PersonaId,
  title: string,
  description: string,
): Quest {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    description,
    assignee,
    status: "active",
    createdAt: Date.now(),
  };
}
