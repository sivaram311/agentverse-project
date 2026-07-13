/** Open-plan Siruseri floor camera — agents + mandala + park glass. */

export type ViewMode =
  | "portrait"
  | "portrait-compact"
  | "landscape"
  | "landscape-compact";

/** User-selectable framing (menu). Default is head & shoulders. */
export type OrbitShot =
  | "shoulders"
  | "close"
  | "face"
  | "over"
  | "desk"
  | "sideL"
  | "sideR"
  | "rear"
  | "high"
  | "wide";

export type CameraPreset = {
  position: [number, number, number];
  fov: number;
  target: [number, number, number];
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  minAzimuthAngle?: number;
  maxAzimuthAngle?: number;
};

/** Sync with SiruseriOffice SIRUSERI */
export const OFFICE_BOUNDS = {
  halfW: 10.5,
  backZ: -9.2,
  openZ: 7.4,
  floorH: 4.35,
  floors: 1,
  get roofY() {
    return this.floorH;
  },
} as const;

/** Follow-cam offsets relative to player (x,y,z) → look at head. */
export type ShotFollow = {
  label: string;
  /** Camera offset from player feet */
  offset: [number, number, number];
  /** Look-at height (head ~1.45, chest ~1.2) */
  lookY: number;
  fov: number;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
};

export const ORBIT_SHOTS: Record<OrbitShot, ShotFollow> = {
  /** Default — head & shoulders */
  shoulders: {
    label: "Shoulders",
    offset: [0.35, 1.48, 2.15],
    lookY: 1.42,
    fov: 48,
    minDistance: 1.6,
    maxDistance: 3.4,
    minPolarAngle: 0.95,
    maxPolarAngle: 1.45,
  },
  close: {
    label: "Close",
    offset: [0.2, 1.5, 1.35],
    lookY: 1.48,
    fov: 42,
    minDistance: 1.1,
    maxDistance: 2.2,
    minPolarAngle: 1.05,
    maxPolarAngle: 1.5,
  },
  face: {
    label: "Face",
    offset: [0.05, 1.55, 0.95],
    lookY: 1.52,
    fov: 38,
    minDistance: 0.75,
    maxDistance: 1.5,
    minPolarAngle: 1.1,
    maxPolarAngle: 1.55,
  },
  over: {
    label: "Over",
    offset: [-0.45, 1.62, 1.55],
    lookY: 1.4,
    fov: 46,
    minDistance: 1.2,
    maxDistance: 2.8,
    minPolarAngle: 1.0,
    maxPolarAngle: 1.48,
  },
  desk: {
    label: "Desk",
    offset: [1.2, 1.65, 2.6],
    lookY: 1.15,
    fov: 50,
    minDistance: 2.2,
    maxDistance: 5.5,
    minPolarAngle: 0.7,
    maxPolarAngle: 1.4,
  },
  sideL: {
    label: "Left",
    offset: [-2.4, 1.5, 0.6],
    lookY: 1.4,
    fov: 48,
    minDistance: 1.8,
    maxDistance: 4.2,
    minPolarAngle: 0.9,
    maxPolarAngle: 1.45,
  },
  sideR: {
    label: "Right",
    offset: [2.4, 1.5, 0.6],
    lookY: 1.4,
    fov: 48,
    minDistance: 1.8,
    maxDistance: 4.2,
    minPolarAngle: 0.9,
    maxPolarAngle: 1.45,
  },
  rear: {
    label: "Rear",
    offset: [0.15, 1.55, -2.3],
    lookY: 1.4,
    fov: 50,
    minDistance: 1.7,
    maxDistance: 3.8,
    minPolarAngle: 0.95,
    maxPolarAngle: 1.45,
  },
  high: {
    label: "High",
    offset: [0.2, 3.4, 3.2],
    lookY: 1.2,
    fov: 46,
    minDistance: 3.2,
    maxDistance: 7.5,
    minPolarAngle: 0.55,
    maxPolarAngle: 1.25,
  },
  wide: {
    label: "Wide",
    offset: [0, 5.8, 11.2],
    lookY: 1.3,
    fov: 42,
    minDistance: 7,
    maxDistance: 18,
    minPolarAngle: 0.5,
    maxPolarAngle: Math.PI / 2.12,
  },
};

export const ORBIT_SHOT_ORDER: OrbitShot[] = [
  "face",
  "close",
  "shoulders",
  "over",
  "desk",
  "sideL",
  "sideR",
  "rear",
  "high",
  "wide",
];

/** Portrait — elevated view of open floor + hex desks (wide fallback). */
export const PORTRAIT_PRESET: CameraPreset = {
  position: [0, 6.8, 12.5],
  fov: 42,
  target: [0, 1.4, -0.5],
  minDistance: 8,
  maxDistance: 18,
  minPolarAngle: 0.55,
  maxPolarAngle: Math.PI / 2.15,
  minAzimuthAngle: -0.9,
  maxAzimuthAngle: 0.9,
};

export const PORTRAIT_COMPACT_PRESET: CameraPreset = {
  position: [0, 7.4, 13.8],
  fov: 46,
  target: [0, 1.5, -0.2],
  minDistance: 9,
  maxDistance: 20,
  minPolarAngle: 0.58,
  maxPolarAngle: Math.PI / 2.18,
  minAzimuthAngle: -0.85,
  maxAzimuthAngle: 0.85,
};

export const LANDSCAPE_PRESET: CameraPreset = {
  position: [0, 6.2, 11.5],
  fov: 40,
  target: [0, 1.3, -0.6],
  minDistance: 7.5,
  maxDistance: 17,
  minPolarAngle: 0.5,
  maxPolarAngle: Math.PI / 2.12,
  minAzimuthAngle: -1.0,
  maxAzimuthAngle: 1.0,
};

export const LANDSCAPE_COMPACT_PRESET: CameraPreset = {
  position: [0, 6.8, 12.8],
  fov: 44,
  target: [0, 1.4, -0.3],
  minDistance: 8.5,
  maxDistance: 18,
  minPolarAngle: 0.55,
  maxPolarAngle: Math.PI / 2.15,
  minAzimuthAngle: -0.95,
  maxAzimuthAngle: 0.95,
};

export function resolveViewMode(width: number, height: number): ViewMode {
  if (width > height) {
    return height <= 430 ? "landscape-compact" : "landscape";
  }
  return width <= 400 ? "portrait-compact" : "portrait";
}

export function presetForView(mode: ViewMode): CameraPreset {
  switch (mode) {
    case "portrait-compact":
      return PORTRAIT_COMPACT_PRESET;
    case "landscape-compact":
      return LANDSCAPE_COMPACT_PRESET;
    case "landscape":
      return LANDSCAPE_PRESET;
    default:
      return PORTRAIT_PRESET;
  }
}

export function isPortraitView(mode: ViewMode): boolean {
  return mode === "portrait" || mode === "portrait-compact";
}
