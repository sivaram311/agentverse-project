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
  lightBoost: boolean;
  maxTeamClusters: number;
  maxFullClusters: number;
  teamCullDist: number;
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
      ambientWalkers: true,
      dataOrbs: false,
      lightBoost: true,
      maxTeamClusters: 6,
      maxFullClusters: 2,
      teamCullDist: 22,
      teamNearDist: 14,
      showGlassCube: true,
      showSideConference: false,
      showSatelliteProjects: false,
      cameraFar: 70,
      fogNear: 22,
      fogFar: 55,
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
      ambientWalkers: true,
      dataOrbs: false,
      lightBoost: true,
      maxTeamClusters: 8,
      maxFullClusters: 3,
      teamCullDist: 26,
      teamNearDist: 16,
      showGlassCube: true,
      showSideConference: true,
      showSatelliteProjects: true,
      cameraFar: 80,
      fogNear: 24,
      fogFar: 58,
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
    lightBoost: false,
    maxTeamClusters: 10,
    maxFullClusters: 5,
    teamCullDist: 32,
    teamNearDist: 16,
    showGlassCube: true,
    showSideConference: true,
    showSatelliteProjects: true,
    cameraFar: 100,
    fogNear: 28,
    fogFar: 65,
  };
}
