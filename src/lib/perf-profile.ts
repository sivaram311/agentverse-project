/** Mobile / low-end render budget for AgentVerse HQ. */

export type PerfTier = "high" | "medium" | "low";

export type PerfProfile = {
  tier: PerfTier;
  lod: "full" | "simple";
  dpr: [number, number];
  antialias: boolean;
  shadows: boolean;
  environment: boolean;
  contactShadows: boolean;
  ambientWalkers: boolean;
  dataOrbs: boolean;
  /** Max team pods mounted at once (rest culled). */
  maxTeamClusters: number;
  /** Max pods with full desk detail. */
  maxFullClusters: number;
  /** Cull teams beyond this distance (m). */
  teamCullDist: number;
  /** Full detail within this distance (m). */
  teamNearDist: number;
  showGlassCube: boolean;
  showSideConference: boolean;
  showSatelliteProjects: boolean;
  cameraFar: number;
  fogNear: number;
  fogFar: number;
};

function isCoarsePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function isSmallViewport(): boolean {
  if (typeof window === "undefined") return false;
  return Math.min(window.innerWidth, window.innerHeight) <= 500
    || window.innerWidth <= 900;
}

function saveData(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } })
    .connection;
  return !!conn?.saveData;
}

/** Resolve once per resize — phones/tablets default to low/medium. */
export function resolvePerfProfile(
  width: number,
  height: number,
  viewMode: string,
): PerfProfile {
  const compact =
    viewMode === "portrait-compact" || viewMode === "landscape-compact";
  const narrowPhone = width <= 360 && height > width;
  const mobileLike = isCoarsePointer() || isSmallViewport() || saveData();
  const low = narrowPhone || compact || saveData()
    || (mobileLike && Math.min(width, height) <= 430);

  if (low) {
    return {
      tier: "low",
      lod: "simple",
      dpr: [1, 1],
      antialias: false,
      shadows: false,
      environment: false,
      contactShadows: false,
      ambientWalkers: false,
      dataOrbs: false,
      maxTeamClusters: 4,
      maxFullClusters: 1,
      teamCullDist: 16,
      teamNearDist: 10,
      showGlassCube: true,
      showSideConference: false,
      showSatelliteProjects: false,
      cameraFar: 55,
      fogNear: 12,
      fogFar: 38,
    };
  }

  if (mobileLike) {
    return {
      tier: "medium",
      lod: "simple",
      dpr: [1, 1.25],
      antialias: false,
      shadows: false,
      environment: false,
      contactShadows: false,
      ambientWalkers: false,
      dataOrbs: false,
      maxTeamClusters: 6,
      maxFullClusters: 2,
      teamCullDist: 20,
      teamNearDist: 12,
      showGlassCube: true,
      showSideConference: true,
      showSatelliteProjects: true,
      cameraFar: 70,
      fogNear: 18,
      fogFar: 48,
    };
  }

  return {
    tier: "high",
    lod: "full",
    dpr: [1, 1.5],
    antialias: true,
    shadows: true,
    environment: true,
    contactShadows: true,
    ambientWalkers: true,
    dataOrbs: true,
    maxTeamClusters: 12,
    maxFullClusters: 4,
    teamCullDist: 28,
    teamNearDist: 14,
    showGlassCube: true,
    showSideConference: true,
    showSatelliteProjects: true,
    cameraFar: 100,
    fogNear: 28,
    fogFar: 65,
  };
}
