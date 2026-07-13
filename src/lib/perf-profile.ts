/** GPU knobs only — office geometry is always PROD-full (no distance streaming). */

export type PerfTier = "high" | "medium" | "low";

export type PerfProfile = {
  tier: PerfTier;
  /** Always "full" — Expanded HQ is constructed like PROD. */
  lod: "full";
  dpr: [number, number];
  antialias: boolean;
  shadows: boolean;
  environment: boolean;
  contactShadows: boolean;
  ambientWalkers: boolean;
  dataOrbs: boolean;
  lightBoost: boolean;
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

/**
 * Resolve once per resize.
 * Visual construction is identical on all devices (full LOD, all pods, glass, walkers).
 * Only DPR / AA / shadow maps soften on weak GPUs.
 */
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
      lod: "full",
      dpr: [1, 1],
      antialias: false,
      shadows: true,
      environment: true,
      contactShadows: true,
      ambientWalkers: true,
      dataOrbs: true,
      lightBoost: false,
      showGlassCube: true,
      showSideConference: true,
      showSatelliteProjects: true,
      cameraFar: 100,
      fogNear: 28,
      fogFar: 65,
    };
  }

  if (mobileLike) {
    return {
      tier: "medium",
      lod: "full",
      dpr: [1, 1.25],
      antialias: false,
      shadows: true,
      environment: true,
      contactShadows: true,
      ambientWalkers: true,
      dataOrbs: true,
      lightBoost: false,
      showGlassCube: true,
      showSideConference: true,
      showSatelliteProjects: true,
      cameraFar: 100,
      fogNear: 28,
      fogFar: 65,
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
    showGlassCube: true,
    showSideConference: true,
    showSatelliteProjects: true,
    cameraFar: 100,
    fogNear: 28,
    fogFar: 65,
  };
}
