/** Open-plan Siruseri floor camera — Expanded HQ Bigger Mandala. */

import { HQ_BOUNDS } from "@/lib/office-layout";
import type { OfficeZoneId } from "@/lib/types";

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

/** Sync with SiruseriOffice / office-layout HQ_BOUNDS */
export const OFFICE_BOUNDS = {
  halfW: HQ_BOUNDS.halfW,
  backZ: HQ_BOUNDS.backZ,
  openZ: HQ_BOUNDS.openZ,
  floorH: HQ_BOUNDS.ceilingY,
  floors: 1,
  get roofY() {
    return this.floorH;
  },
} as const;

/** Portrait — elevated overview of expanded floor. */
export const PORTRAIT_PRESET: CameraPreset = {
  position: [0, 9.5, 17],
  fov: 42,
  target: [0, 1.4, -0.5],
  minDistance: 10,
  maxDistance: 28,
  minPolarAngle: 0.45,
  maxPolarAngle: Math.PI / 2.15,
  minAzimuthAngle: -1.1,
  maxAzimuthAngle: 1.1,
};

export const PORTRAIT_COMPACT_PRESET: CameraPreset = {
  position: [0, 10.2, 18.5],
  fov: 46,
  target: [0, 1.5, -0.2],
  minDistance: 11,
  maxDistance: 30,
  minPolarAngle: 0.48,
  maxPolarAngle: Math.PI / 2.18,
  minAzimuthAngle: -1.0,
  maxAzimuthAngle: 1.0,
};

export const LANDSCAPE_PRESET: CameraPreset = {
  position: [0, 8.5, 15],
  fov: 40,
  target: [0, 1.3, -0.6],
  minDistance: 9,
  maxDistance: 26,
  minPolarAngle: 0.42,
  maxPolarAngle: Math.PI / 2.12,
  minAzimuthAngle: -1.15,
  maxAzimuthAngle: 1.15,
};

export const LANDSCAPE_COMPACT_PRESET: CameraPreset = {
  position: [0, 9.2, 16.5],
  fov: 44,
  target: [0, 1.4, -0.3],
  minDistance: 10,
  maxDistance: 28,
  minPolarAngle: 0.45,
  maxPolarAngle: Math.PI / 2.15,
  minAzimuthAngle: -1.05,
  maxAzimuthAngle: 1.05,
};

export const ZONE_PRESETS: Record<OfficeZoneId, CameraPreset> = {
  overview: PORTRAIT_PRESET,
  "central-hall": {
    position: [0, 9.5, 16],
    fov: 40,
    target: [0, 1.4, 0],
    minDistance: 10,
    maxDistance: 28,
    minPolarAngle: 0.45,
    maxPolarAngle: Math.PI / 2.2,
    minAzimuthAngle: -1.1,
    maxAzimuthAngle: 1.1,
  },
  "team-wing-l": {
    position: [-8, 8.5, 14],
    fov: 42,
    target: [-12.5, 1.2, 0],
    minDistance: 8,
    maxDistance: 24,
    minPolarAngle: 0.45,
    maxPolarAngle: Math.PI / 2.2,
    minAzimuthAngle: -1.4,
    maxAzimuthAngle: 0.3,
  },
  "team-wing-r": {
    position: [8, 8.5, 14],
    fov: 42,
    target: [12.5, 1.2, 0],
    minDistance: 8,
    maxDistance: 24,
    minPolarAngle: 0.45,
    maxPolarAngle: Math.PI / 2.2,
    minAzimuthAngle: -0.3,
    maxAzimuthAngle: 1.4,
  },
  "glass-cube": {
    position: [0, 7.5, 11],
    fov: 40,
    target: [0, 1.6, 1],
    minDistance: 6,
    maxDistance: 18,
    minPolarAngle: 0.4,
    maxPolarAngle: Math.PI / 2.15,
    minAzimuthAngle: -0.7,
    maxAzimuthAngle: 0.7,
  },
  "side-conference": {
    position: [0, 8, -2],
    fov: 40,
    target: [0, 1.3, -13],
    minDistance: 7,
    maxDistance: 20,
    minPolarAngle: 0.4,
    maxPolarAngle: Math.PI / 2.2,
    minAzimuthAngle: -0.85,
    maxAzimuthAngle: 0.85,
  },
  "elevator-l": {
    position: [-6, 6, 4],
    fov: 42,
    target: [-4.2, 1.5, -2],
    minDistance: 5,
    maxDistance: 16,
    minPolarAngle: 0.4,
    maxPolarAngle: Math.PI / 2.2,
    minAzimuthAngle: -1.2,
    maxAzimuthAngle: 0.4,
  },
  "elevator-r": {
    position: [6, 6, 4],
    fov: 42,
    target: [4.2, 1.5, -2],
    minDistance: 5,
    maxDistance: 16,
    minPolarAngle: 0.4,
    maxPolarAngle: Math.PI / 2.2,
    minAzimuthAngle: -0.4,
    maxAzimuthAngle: 1.2,
  },
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
