/**
 * Per-appId persona/camera "packs" — see docs/PACK-TEMPLATE.md.
 * Pilots: proddeck, agentverse-upgrade, css (W6). Pure data module —
 * no store/orchestrator imports here to keep the dependency graph a DAG.
 */
import proddeckPackJson from "@/prompts/packs/proddeck.json";
import agentverseUpgradePackJson from "@/prompts/packs/agentverse-upgrade.json";
import cssPackJson from "@/prompts/packs/css.json";

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

export const PACKS_BY_ID: Record<string, Pack> = {
  [proddeckPackJson.appId]: proddeckPackJson as Pack,
  [agentverseUpgradePackJson.appId]: agentverseUpgradePackJson as Pack,
  [cssPackJson.appId]: cssPackJson as Pack,
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
  "css-next": "css",
};

export function resolvePackIdFromSrc(src: string | null): string {
  if (!src) return DEFAULT_APP_ID;
  const key = src.trim().toLowerCase();
  return SRC_TO_APPID[key] ?? DEFAULT_APP_ID;
}

function normalizeWorkspacePath(path: string): string {
  return path.replace(/\\/g, "/").toLowerCase().replace(/\/+$/, "");
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
