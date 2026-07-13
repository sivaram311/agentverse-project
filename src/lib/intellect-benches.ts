/**
 * Intellect Design Arena — bench-style open-plan seating SoT.
 * Desks face the glass (−Z); sitters face north toward monitors (away from south entry).
 */

import type { PersonaId } from "@/lib/types";

export type BenchSeat = {
  id: string;
  x: number;
  z: number;
  /** World yaw — Math.PI faces −Z (toward glass / monitors). */
  yaw: number;
  dualMonitors: boolean;
  yellowAccent?: boolean;
  drawerOpen?: boolean;
  laptop?: "closed" | "open" | null;
  personaId?: PersonaId | null;
  /** Static NPC when no persona */
  npc?: {
    gender: "male" | "female";
    skin: string;
    hair: string;
    accent: string;
    standing?: boolean;
  } | null;
};

/** Spacing ~1.3m along benches; wood tops face −Z. */
export const BENCH_SEATS: BenchSeat[] = [
  // —— Foreground row (most visible from Front / PROD south cam) ——
  {
    id: "fg-l",
    x: -1.55,
    z: 3.55,
    yaw: Math.PI,
    dualMonitors: false,
    drawerOpen: true,
    laptop: "open",
    personaId: "aravind",
  },
  {
    id: "fg-c",
    x: 0,
    z: 3.55,
    yaw: Math.PI,
    dualMonitors: true,
    laptop: "closed",
    personaId: "rajesh",
  },
  {
    id: "fg-r",
    x: 1.7,
    z: 3.55,
    yaw: Math.PI,
    dualMonitors: true,
    yellowAccent: true,
    personaId: "lavanya",
  },
  // —— Mid row ——
  {
    id: "m0",
    x: -4.0,
    z: 1.2,
    yaw: Math.PI,
    dualMonitors: true,
    personaId: "karthik",
  },
  {
    id: "m1",
    x: -2.6,
    z: 1.2,
    yaw: Math.PI,
    dualMonitors: false,
    personaId: "muthu",
  },
  {
    id: "m2",
    x: -1.2,
    z: 1.2,
    yaw: Math.PI,
    dualMonitors: true,
    personaId: "kabilan",
  },
  {
    id: "m3",
    x: 0.3,
    z: 1.2,
    yaw: Math.PI,
    dualMonitors: true,
    personaId: "mathura",
  },
  {
    id: "m4",
    x: 1.7,
    z: 1.2,
    yaw: Math.PI,
    dualMonitors: false,
    yellowAccent: true,
    npc: {
      gender: "male",
      skin: "#D4A574",
      hair: "#1A120C",
      accent: "#6B8CAE",
    },
  },
  {
    id: "m5",
    x: 3.2,
    z: 1.2,
    yaw: Math.PI,
    dualMonitors: true,
    npc: {
      gender: "female",
      skin: "#F0D5C0",
      hair: "#3D2314",
      accent: "#C4A35A",
    },
  },
  // —— Back cluster (toward glass) ——
  {
    id: "b0",
    x: -5.2,
    z: -1.6,
    yaw: Math.PI,
    dualMonitors: true,
    npc: {
      gender: "male",
      skin: "#E0C4A8",
      hair: "#2A1F14",
      accent: "#4A6A8A",
    },
  },
  {
    id: "b1",
    x: -3.7,
    z: -1.6,
    yaw: Math.PI,
    dualMonitors: false,
    npc: {
      gender: "male",
      skin: "#C9956C",
      hair: "#241810",
      accent: "#5A7A6A",
    },
  },
  {
    id: "b2",
    x: -2.2,
    z: -1.6,
    yaw: Math.PI,
    dualMonitors: true,
    npc: {
      gender: "female",
      skin: "#E8B896",
      hair: "#4A2C1A",
      accent: "#8B6B8A",
    },
  },
  {
    id: "b3",
    x: -0.6,
    z: -1.6,
    yaw: Math.PI,
    dualMonitors: true,
    npc: {
      gender: "male",
      skin: "#E8C4A8",
      hair: "#2A1F14",
      accent: "#A67C52",
      standing: true,
    },
  },
  {
    id: "b4",
    x: 1.0,
    z: -1.6,
    yaw: Math.PI,
    dualMonitors: false,
    yellowAccent: true,
    npc: {
      gender: "male",
      skin: "#D4A574",
      hair: "#1A120C",
      accent: "#6B8CAE",
    },
  },
  {
    id: "b5",
    x: 2.6,
    z: -1.6,
    yaw: Math.PI,
    dualMonitors: true,
    npc: {
      gender: "male",
      skin: "#E0C4A8",
      hair: "#241810",
      accent: "#4DA3FF",
    },
  },
  {
    id: "b6",
    x: 4.2,
    z: -1.6,
    yaw: Math.PI,
    dualMonitors: true,
    npc: {
      gender: "female",
      skin: "#F0D5C0",
      hair: "#2A1F14",
      accent: "#E8A838",
    },
  },
  // —— Side wing L-pod ——
  {
    id: "l0",
    x: -7.2,
    z: 2.4,
    yaw: Math.PI / 2,
    dualMonitors: true,
    npc: {
      gender: "male",
      skin: "#C9956C",
      hair: "#2A1F14",
      accent: "#5A7A6A",
    },
  },
  {
    id: "l1",
    x: -7.2,
    z: 1.0,
    yaw: Math.PI / 2,
    dualMonitors: false,
    npc: {
      gender: "male",
      skin: "#E0C4A8",
      hair: "#1A120C",
      accent: "#6B8CAE",
    },
  },
  // —— Side wing R-pod ——
  {
    id: "r0",
    x: 7.2,
    z: 2.4,
    yaw: -Math.PI / 2,
    dualMonitors: true,
    yellowAccent: true,
    npc: {
      gender: "female",
      skin: "#E8B896",
      hair: "#3D2314",
      accent: "#C4A35A",
    },
  },
  {
    id: "r1",
    x: 7.2,
    z: 1.0,
    yaw: -Math.PI / 2,
    dualMonitors: true,
    npc: {
      gender: "male",
      skin: "#D4A574",
      hair: "#241810",
      accent: "#4A6A8A",
    },
  },
];

export function seatForPersona(personaId: string): BenchSeat | undefined {
  return BENCH_SEATS.find((s) => s.personaId === personaId);
}

export function personaHome(
  personaId: string,
  fallback: [number, number, number],
): { home: [number, number, number]; yaw: number } {
  const seat = seatForPersona(personaId);
  if (!seat) return { home: fallback, yaw: 0 };
  // Sit slightly south of desk edge when facing −Z; offset in local +Z of seat yaw
  const back = 0.52;
  const hx = seat.x + Math.sin(seat.yaw) * back;
  const hz = seat.z + Math.cos(seat.yaw) * back;
  return { home: [hx, 0, hz], yaw: seat.yaw };
}
