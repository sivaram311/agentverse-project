/**
 * Bright industrial office palette + shared dims (Track 0 SoT).
 * All shell / desk / lighting tracks MUST import colors from here.
 */

import { OFFICE_BOUNDS } from "@/lib/camera-framing";

/** Sync with camera-framing OFFICE_BOUNDS — geometry SoT for shell. */
export const INDUSTRIAL_BOUNDS = {
  halfW: OFFICE_BOUNDS.halfW,
  backZ: OFFICE_BOUNDS.backZ,
  openZ: OFFICE_BOUNDS.openZ,
  ceilingY: OFFICE_BOUNDS.floorH,
  wallT: 0.18,
} as const;

export const PALETTE = {
  wall: "#F5F7FA",
  wallPure: "#FFFFFF",
  floor: "#E8EAEE",
  floorTint: "#F2F3F5",
  ceilingBeam: "#2A2E33",
  ceilingBeamDark: "#1A1D21",
  ductBlack: "#1C1F24",
  ductRed: "#C43B3B",
  ductGray: "#C8CDD4",
  deskTop: "#1EB6C9",
  deskTopAlt: "#2BB3C0",
  deskFrame: "#FFFFFF",
  chair: "#1A1A1A",
  chairMesh: "#2A2A2A",
  chairAccent: "#3A3A3A",
  tealAccent: "#1EB6C9",
  whiteboard: "#FFFEFA",
  whiteboardFrame: "#1E90FF",
  glass: "#D8ECF8",
  glassEdge: "#9EC8DC",
  outlet: "#F5F0E6",
  skylight: "#E8F4FC",
  fog: "#DDE4EC",
  bg: "#E4E9F0",
  lockerBlue: "#3B82F6",
  lockerGreen: "#22C55E",
  lockerYellow: "#EAB308",
  lockerWhite: "#F8FAFC",
  monitorBezel: "#1F2937",
  laptopSilver: "#C0C5CC",
  cable: "#111111",
} as const;

export type OfficePalette = typeof PALETTE;
