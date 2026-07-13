/**
 * Expanded AgentVerse HQ layout SoT — Bigger Mandala Office.
 * Tracks A–E MUST import anchors from here; do not hardcode world positions.
 */

export type OfficeLod = "full" | "simple";

export enum OfficeZone {
  Overview = "overview",
  CentralHall = "central-hall",
  TeamWingL = "team-wing-l",
  TeamWingR = "team-wing-r",
  GlassCube = "glass-cube",
  SideConference = "side-conference",
  ElevatorL = "elevator-l",
  ElevatorR = "elevator-r",
}

/** Sync with SiruseriOffice SIRUSERI + camera-framing OFFICE_BOUNDS */
export const HQ_BOUNDS = {
  halfW: 18,
  backZ: -16,
  openZ: 12,
  ceilingY: 4.35,
  wallT: 0.18,
} as const;

export const CONFERENCE = {
  origin: [0, 0, 0] as [number, number, number],
  bounds: { xMin: -9, xMax: 9, zMin: -7, zMax: 7 },
  table: { size: [5.0, 0.05, 1.5] as [number, number, number], topY: 0.55 },
  tvWall: [0, 1.6, -6.2] as [number, number, number],
  ideasBoard: [6.2, 1.4, 0] as [number, number, number],
  pendantY: 3.15,
  mandalaScale: 0.55,
  chairClear: 0.55,
} as const;

export const ANCHORS = {
  elevatorL: {
    position: [-4.2, 0, -2] as [number, number, number],
    size: [2.4, 4.35, 2.2] as [number, number, number],
    yaw: Math.PI / 2,
    side: "left" as const,
  },
  elevatorR: {
    position: [4.2, 0, -2] as [number, number, number],
    size: [2.4, 4.35, 2.2] as [number, number, number],
    yaw: -Math.PI / 2,
    side: "right" as const,
  },
  glassCube: {
    position: [0, 0, 1.0] as [number, number, number],
    size: 3.5,
    yaw: 0,
  },
  sideConference: {
    position: [0, 0, -14] as [number, number, number],
    yaw: 0,
    outer: { w: 9.6, d: 3.6, h: 2.4 },
    frostFrontRatio: 0.45 as const,
    roomCount: 3 as const,
  },
} as const;

/** Local seats for a TeamCluster (arc; +Z = aisle). */
export const TEAM_SEATS: [number, number, number][] = [
  [-2.35, 0, 0.15],
  [-1.15, 0, -0.25],
  [0, 0, -0.4],
  [1.15, 0, -0.25],
  [2.35, 0, 0.15],
];

/** Orchestrator desk local +Z toward aisle */
export const ORCH_OFFSET = 1.0;

const TEAM_ACCENTS = ["#E8A838", "#4DA3FF", "#3DDC97", "#FF6BCB", "#C4A35A"];

export type TeamZone = {
  id: string;
  name: string;
  origin: [number, number, number];
  yaw: number;
  accentColor: string;
  wing: "left" | "right";
};

function buildTeamZones(): TeamZone[] {
  const zones: TeamZone[] = [];
  const xL = -13.2;
  const xR = 13.2;
  const z0 = -11.5;
  const z1 = 7.5;
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const z = z0 + t * (z1 - z0);
    const bow = 0.35 * Math.sin(t * Math.PI);
    const accent = TEAM_ACCENTS[i % TEAM_ACCENTS.length]!;
    zones.push({
      id: `team-${String(i).padStart(2, "0")}`,
      name: `Team ${i + 1}`,
      origin: [xL + bow, 0, z],
      yaw: Math.PI / 2,
      accentColor: accent,
      wing: "left",
    });
    zones.push({
      id: `team-${String(i + 10).padStart(2, "0")}`,
      name: `Team ${i + 11}`,
      origin: [xR - bow, 0, z],
      yaw: -Math.PI / 2,
      accentColor: TEAM_ACCENTS[(i + 2) % TEAM_ACCENTS.length]!,
      wing: "right",
    });
  }
  return zones.sort((a, b) => a.id.localeCompare(b.id));
}

export const TEAM_ZONES: TeamZone[] = buildTeamZones();

export const GLASS = {
  clear: {
    color: "#9ec8dc",
    opacity: 0.15,
    transmission: 0.52,
    roughness: 0.08,
    metalness: 0.05,
  },
  frosted: {
    color: "#9ec4d8",
    opacity: 0.4,
    transmission: 0.05,
    roughness: 0.55,
    metalness: 0.05,
  },
} as const;
