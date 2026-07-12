/** Open-plan Siruseri floor camera — agents + mandala + park glass. */

export type ViewMode =
  | "portrait"
  | "portrait-compact"
  | "landscape"
  | "landscape-compact";

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

/** Portrait — elevated view of open floor + hex desks. */
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
