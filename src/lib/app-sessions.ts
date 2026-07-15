import { portalApi } from "@/lib/api";
import {
  getPack,
  listLabeledPacks,
  listWorkPlanePacks,
  type Pack,
} from "@/lib/pack-loader";
import type { AuthConfig, Session } from "@/lib/types";

export type EnsureSessionsResult = {
  created: string[];
  existing: string[];
  errors: string[];
};

/** Soft-coded session titles when pack JSON omits `sessionTitle`. */
const FALLBACK_SESSION_TITLES: Record<string, string> = {
  proddeck: "AgentVerse · ProdDeck",
  "agentverse-upgrade": "AgentVerse · Upgrade",
  css: "AgentVerse · CSS",
  "css-next": "AgentVerse · CSS Next",
  "agent-portal": "AgentVerse · Agent Portal",
  "stack-pilot": "AgentVerse · Stack Pilot",
  "h-drive-server": "AgentVerse · H-Drive",
  agentverse: "AgentVerse · Classic",
  "agentverse-v2": "AgentVerse · V2",
  library: "AgentVerse · Library",
};

export function packSessionTitle(pack: Pack): string {
  return (
    pack.sessionTitle?.trim() ||
    FALLBACK_SESSION_TITLES[pack.appId] ||
    `AgentVerse · ${pack.appId}`
  );
}

export function findSessionForPack(
  sessions: Session[],
  pack: Pack,
): Session | undefined {
  const titleKey = packSessionTitle(pack).toLowerCase();
  return sessions.find(
    (session) =>
      session.status !== "ARCHIVED" &&
      (session.title?.trim().toLowerCase() ?? "") === titleKey,
  );
}

async function ensureSessionsForPacks(
  authConfig: AuthConfig,
  packs: Pack[],
): Promise<EnsureSessionsResult> {
  const created: string[] = [];
  const existing: string[] = [];
  const errors: string[] = [];

  let sessions: Session[];
  try {
    sessions = await portalApi.listSessions(authConfig);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list sessions";
    return { created, existing, errors: [message] };
  }

  for (const pack of packs) {
    const match = findSessionForPack(sessions, pack);
    if (match) {
      existing.push(pack.appId);
      continue;
    }

    const title = packSessionTitle(pack);
    try {
      const session = await portalApi.createSession(
        {
          workspacePath: pack.workspacePath,
          title,
          provider: "cursor",
        },
        authConfig,
      );
      created.push(pack.appId);
      sessions = [...sessions, session];
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "createSession failed";
      errors.push(`${pack.appId}: ${message}`);
    }
  }

  return { created, existing, errors };
}

export async function ensureWorkPlaneSessions(
  authConfig: AuthConfig,
): Promise<EnsureSessionsResult> {
  const packs = listWorkPlanePacks();
  if (packs.length > 0) {
    return ensureSessionsForPacks(authConfig, packs);
  }

  const fallbackIds = [
    "proddeck",
    "agentverse-upgrade",
    "css",
    "css-next",
    "agent-portal",
    "stack-pilot",
    "h-drive-server",
  ];
  const fallbackPacks = fallbackIds
    .map((id) => getPack(id))
    .filter((pack): pack is Pack => pack != null);
  return ensureSessionsForPacks(authConfig, fallbackPacks);
}

export async function ensureAllPlannedSessions(
  authConfig: AuthConfig,
): Promise<EnsureSessionsResult> {
  const work = listWorkPlanePacks();
  const labeled = listLabeledPacks();
  const packs = [...work, ...labeled];
  if (packs.length > 0) {
    return ensureSessionsForPacks(authConfig, packs);
  }

  const fallbackIds = [
    "proddeck",
    "agentverse-upgrade",
    "css",
    "css-next",
    "agent-portal",
    "stack-pilot",
    "h-drive-server",
    "agentverse",
    "agentverse-v2",
    "library",
  ];
  const fallbackPacks = fallbackIds
    .map((id) => getPack(id))
    .filter((pack): pack is Pack => pack != null);
  return ensureSessionsForPacks(authConfig, fallbackPacks);
}
