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
  origin: [0, 0, -6.6] as [number, number, number],
  bounds: { xMin: -2.5, xMax: 2.5, zMin: -8.5, zMax: -4.5 },
  table: { size: [4.0, 0.05, 1.3] as [number, number, number], topY: 0.55 },
  /** Local to origin group — world TV wall ≈ [0, 1.55, -8.0] */
  tvWall: [0, 1.55, -1.5] as [number, number, number],
  ideasBoard: [2.2, 1.4, 0] as [number, number, number],
  pendantY: 2.9,
  mandalaScale: 0.4,
  chairClear: 0.5,
} as const;

/** Nxt Level / Intellect Design Arena — zone anchors (0.3.10+). */
export const ANCHORS = {
  glassCube: {
    position: [-4.2, 0, -5.8] as [number, number, number],
    size: 1.85,
    yaw: 0,
  },
  sideConference: {
    position: [-8.5, 0, -5.8] as [number, number, number],
    yaw: Math.PI / 2,
    outer: { w: 4.2, d: 2.5, h: 2.55 },
    frostFrontRatio: 0.42 as const,
    roomCount: 2 as const,
  },
  elevatorL: {
    position: [-9.0, 0, 5.8] as [number, number, number],
    yaw: Math.PI / 2,
  },
  elevatorR: {
    position: [9.0, 0, 5.8] as [number, number, number],
    yaw: -Math.PI / 2,
  },
  reception: {
    position: [0, 0, 6.05] as [number, number, number],
  },
  breakout: {
    position: [5.2, 0, 3.6] as [number, number, number],
  },
  atrium: {
    depth: 7.2,
  },
  cafeteria: {
    position: [-7.1, 0, 11.0] as [number, number, number],
  },
  parking: {
    padZ: 18.9,
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
