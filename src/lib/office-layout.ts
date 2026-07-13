/**
 * AgentVerse 0.3.0 — PROD Siruseri office layout SoT.
 * Tracks MUST import anchors from here; do not hardcode world positions.
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
  halfW: 10.5,
  backZ: -9.2,
  openZ: 7.4,
  ceilingY: 4.35,
  wallT: 0.18,
} as const;

export const CONFERENCE = {
  origin: [0, 0, -6.5] as [number, number, number],
  bounds: { xMin: -2.5, xMax: 2.5, zMin: -8.5, zMax: -4.5 },
  table: { size: [4.0, 0.05, 1.3] as [number, number, number], topY: 0.55 },
  /** Local to origin group — world TV wall ≈ [0, 1.55, -8.0] */
  tvWall: [0, 1.55, -1.5] as [number, number, number],
  ideasBoard: [2.2, 1.4, 0] as [number, number, number],
  pendantY: 2.9,
  mandalaScale: 0.4,
  chairClear: 0.5,
} as const;

/** Minimal stubs for legacy GlassCube / SideConferenceBlock (off-scene in PROD 0.3.0). */
export const ANCHORS = {
  glassCube: {
    position: [0, 0, 8.5] as [number, number, number],
    size: 2.0,
    yaw: 0,
  },
  sideConference: {
    position: [0, 0, -11] as [number, number, number],
    yaw: 0,
    outer: { w: 4.0, d: 2.4, h: 2.4 },
    frostFrontRatio: 0.45 as const,
    roomCount: 1 as const,
  },
} as const;

/** Local seats for a TeamCluster (arc; +Z = aisle). */
export const TEAM_SEATS: [number, number, number][] = [
  [-1.95, 0, 0.12],
  [-0.95, 0, -0.2],
  [0, 0, -0.32],
  [0.95, 0, -0.2],
  [1.95, 0, 0.12],
];

/** Orchestrator desk local +Z toward aisle */
export const ORCH_OFFSET = 1.0;

export type TeamZone = {
  id: string;
  name: string;
  origin: [number, number, number];
  yaw: number;
  accentColor: string;
  wing: "left" | "right";
};

function buildTeamZones(): TeamZone[] {
  return [
    {
      id: "team-alpha",
      name: "Team Alpha",
      origin: [-7.0, 0, 2.8],
      yaw: Math.PI / 2,
      accentColor: "#E8A838",
      wing: "left",
    },
    {
      id: "team-beta",
      name: "Team Beta",
      origin: [7.0, 0, 2.8],
      yaw: -Math.PI / 2,
      accentColor: "#4DA3FF",
      wing: "right",
    },
  ];
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
