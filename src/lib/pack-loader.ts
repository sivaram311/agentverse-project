/**
 * Per-appId persona/camera "packs" — see docs/PACK-TEMPLATE.md.
 * W6 pack matrix (W6). Pure data module — no store/orchestrator imports
 * here to keep the dependency graph a DAG.
 */
import proddeckPackJson from "@/prompts/packs/proddeck.json";
import agentverseUpgradePackJson from "@/prompts/packs/agentverse-upgrade.json";
import cssPackJson from "@/prompts/packs/css.json";
import cssNextPackJson from "@/prompts/packs/css-next.json";
import agentPortalPackJson from "@/prompts/packs/agent-portal.json";
import stackPilotPackJson from "@/prompts/packs/stack-pilot.json";
import hDriveServerPackJson from "@/prompts/packs/h-drive-server.json";
import agentversePackJson from "@/prompts/packs/agentverse.json";
import agentverseV2PackJson from "@/prompts/packs/agentverse-v2.json";
import libraryPackJson from "@/prompts/packs/library.json";
import type { Session } from "./types";

export type PackOverlay = {
  role?: string;
  title?: string;
  /** Appended to the persona's base systemPrompt (capped — see PACK-TEMPLATE.md). */
  systemPromptAddendum?: string;
};

export type FleetPorts = {
  dev: number;
  preprod: number;
  prod: number;
};

export type Pack = {
  appId: string;
  version?: string;
  packEpoch: number;
  /** Exact Portal session title to create/find, e.g. `AgentVerse · ProdDeck`. */
  sessionTitle: string;
  /** Default true for desk targets; false = labeled only (not default work plane). */
  workPlane?: boolean;
  /** Canonical bound workspace path for this app. */
  workspacePath: string;
  /** Known secondary location for the same workspace — not a second SoT. */
  workspacePathAlias?: string;
  /** ViewMode id (see camera-framing.ts) or a free-form label if not yet wired. */
  cameraPreset: string;
  singleShot?: boolean;
  switchPolicy: "hard" | "soft";
  hireBurstMax?: number;
  playwrightOwner?: string;
  fleetPorts?: FleetPorts;
  cssClientId?: string;
  /** Persona ids visible on the 3D stage for this pack. */
  stageVisible: string[];
  /** Persona ids available as off-stage Layer B workers for this pack. */
  workerRoles: string[];
  /** Persona id → role/title/prompt overlay for this pack. */
  overlays: Record<string, PackOverlay>;
  /** Short one-liner seed for the compose box when this pack becomes active. */
  composeSeed?: string;
  notes?: string[];
};

const WORK_PLANE_ORDER = [
  "proddeck",
  "agentverse-upgrade",
  "css",
  "css-next",
  "agent-portal",
  "stack-pilot",
  "h-drive-server",
] as const;

const LABELED_ORDER = ["agentverse", "agentverse-v2", "library"] as const;

export const PACKS_BY_ID: Record<string, Pack> = {
  [proddeckPackJson.appId]: proddeckPackJson as Pack,
  [agentverseUpgradePackJson.appId]: agentverseUpgradePackJson as Pack,
  [cssPackJson.appId]: cssPackJson as Pack,
  [cssNextPackJson.appId]: cssNextPackJson as Pack,
  [agentPortalPackJson.appId]: agentPortalPackJson as Pack,
  [stackPilotPackJson.appId]: stackPilotPackJson as Pack,
  [hDriveServerPackJson.appId]: hDriveServerPackJson as Pack,
  [libraryPackJson.appId]: libraryPackJson as Pack,
  [agentversePackJson.appId]: agentversePackJson as Pack,
  [agentverseV2PackJson.appId]: agentverseV2PackJson as Pack,
};

/** Fallback pack when `src` is missing/unknown — the app we're running as. */
export const DEFAULT_APP_ID = "agentverse-upgrade";

/** Deep-link `src=` (caller id) → pack appId. See docs/DEEP-LINK-CONTRACT.md. */
export const SRC_TO_APPID: Record<string, string> = {
  proddeck: "proddeck",
  home: "proddeck",
  "agentverse-upgrade": "agentverse-upgrade",
  agentverse: "agentverse-upgrade",
  css: "css",
  "css-next": "css-next",
  "agent-portal": "agent-portal",
  portal: "agent-portal",
  "stack-pilot": "stack-pilot",
  stack: "stack-pilot",
  "h-drive-server": "h-drive-server",
  hdrive: "h-drive-server",
  "h-drive": "h-drive-server",
  library: "library",
  "agentverse-v2": "agentverse-v2",
};

export function resolvePackIdFromSrc(src: string | null): string {
  if (!src) return DEFAULT_APP_ID;
  const key = src.trim().toLowerCase();
  return SRC_TO_APPID[key] ?? DEFAULT_APP_ID;
}

function normalizeWorkspacePath(path: string): string {
  return path.replace(/\\/g, "/").toLowerCase().replace(/\/+$/, "");
}

function sessionTitleKey(title: string | null | undefined): string {
  return (title ?? "").trim().toLowerCase();
}

/** Case-insensitive exact match on pack.sessionTitle; null when no pack matches. */
export function resolvePackIdFromSessionTitle(
  title: string | null,
): string | null {
  if (!title?.trim()) return null;
  const needle = sessionTitleKey(title);
  for (const pack of Object.values(PACKS_BY_ID)) {
    if (sessionTitleKey(pack.sessionTitle) === needle) {
      return pack.appId;
    }
  }
  return null;
}

/** Portal session → pack appId: session title first, else workspace path. */
export function resolvePackIdForSession(
  session: Pick<Session, "title" | "workspacePath">,
): string {
  const fromTitle = resolvePackIdFromSessionTitle(session.title ?? null);
  if (fromTitle) return fromTitle;
  return resolvePackIdFromWorkspace(session.workspacePath);
}

/** Desk / Dispatch targets — stable work-plane order. */
export function listWorkPlanePacks(): Pack[] {
  return WORK_PLANE_ORDER.map((id) => PACKS_BY_ID[id]).filter(
    (pack): pack is Pack => Boolean(pack?.workPlane !== false),
  );
}

/** Labeled-only packs — rollback, experiment, candidate (workPlane === false). */
export function listLabeledPacks(): Pack[] {
  return LABELED_ORDER.map((id) => PACKS_BY_ID[id]).filter(
    (pack): pack is Pack => Boolean(pack && pack.workPlane === false),
  );
}

/** Bind an on-disk workspace path to a pack appId (project/session switches). */
export function resolvePackIdFromWorkspace(
  path: string | null | undefined,
): string {
  if (!path?.trim()) return DEFAULT_APP_ID;
  const normalized = normalizeWorkspacePath(path.trim());
  let best: { appId: string; len: number } | null = null;
  for (const pack of Object.values(PACKS_BY_ID)) {
    for (const candidate of [pack.workspacePath, pack.workspacePathAlias]) {
      if (!candidate) continue;
      const normPack = normalizeWorkspacePath(candidate);
      if (
        normalized === normPack ||
        normalized.endsWith(normPack) ||
        normalized.includes(normPack)
      ) {
        if (!best || normPack.length > best.len) {
          best = { appId: pack.appId, len: normPack.length };
        }
      }
    }
  }
  return best?.appId ?? DEFAULT_APP_ID;
}

export function getPack(appId: string): Pack | null {
  return PACKS_BY_ID[appId] ?? null;
}

export function listPackIds(): string[] {
  return Object.keys(PACKS_BY_ID);
}
