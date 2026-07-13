"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import * as THREE from "three";
import { HumanoidFigure } from "./HumanoidFigure";

type Lod = "full" | "simple";

type WalkerDef = {
  id: string;
  path: [number, number][];
  speed: number;
  offset: number;
  color: string;
  skin: string;
  hair: string;
  gender: "male" | "female";
};

function buildWalkers(lod: Lod): WalkerDef[] {
  const n = lod === "simple" ? 3 : 5;
  const palette: Omit<WalkerDef, "id" | "path" | "speed" | "offset">[] = [
    { color: "#6B8CAE", skin: "#E0C4A8", hair: "#2A1F14", gender: "male" },
    { color: "#8B6B8A", skin: "#F0D5C0", hair: "#3D2314", gender: "female" },
    { color: "#5A7A6A", skin: "#D4A574", hair: "#1A120C", gender: "male" },
    { color: "#A67C52", skin: "#E8B896", hair: "#4A2C1A", gender: "female" },
    { color: "#4A6A8A", skin: "#C9956C", hair: "#241810", gender: "male" },
  ];

  /** Aisle loops inside Siruseri open plan — clear of benches. */
  const loops: [number, number][][] = [
    [
      [-8.5, 5.5],
      [-8.5, -6.5],
      [8.5, -6.5],
      [8.5, 5.5],
    ],
    [
      [-6.5, 5.0],
      [6.5, 5.0],
      [6.5, -5.5],
      [-6.5, -5.5],
    ],
    [
      [-9.2, 0.5],
      [-9.2, -4],
      [9.2, -4],
      [9.2, 0.5],
    ],
  ];

  return Array.from({ length: n }, (_, i) => {
    const look = palette[i % palette.length];
    return {
      id: `walker-${i}`,
      path: loops[i % loops.length],
      speed: 0.32 + (i % 4) * 0.07,
      offset: i * 0.19,
      ...look,
    };
  });
}

function pathLength(path: [number, number][]) {
  let len = 0;
  for (let i = 0; i < path.length; i++) {
    const a = path[i];
    const b = path[(i + 1) % path.length];
    len += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  return len;
}

function samplePath(
  path: [number, number][],
  dist: number,
): { x: number; z: number; yaw: number } {
  const total = pathLength(path);
  let d = ((dist % total) + total) % total;
  for (let i = 0; i < path.length; i++) {
    const a = path[i];
    const b = path[(i + 1) % path.length];
    const seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (d <= seg) {
      const t = seg < 1e-6 ? 0 : d / seg;
      const x = a[0] + (b[0] - a[0]) * t;
      const z = a[1] + (b[1] - a[1]) * t;
      const yaw = Math.atan2(b[0] - a[0], b[1] - a[1]);
      return { x, z, yaw };
    }
    d -= seg;
  }
  const last = path[0];
  return { x: last[0], z: last[1], yaw: 0 };
}

function Walker({
  def,
  lod,
  reducedMotion,
}: {
  def: WalkerDef;
  lod: Lod;
  reducedMotion: boolean;
}) {
  const group = useRef<Group>(null);
  const total = useMemo(() => pathLength(def.path), [def.path]);

  useFrame((state) => {
    if (!group.current) return;
    if (reducedMotion) {
      const p = samplePath(def.path, def.offset * total);
      group.current.position.set(p.x, 0, p.z);
      group.current.rotation.y = p.yaw;
      return;
    }
    const dist = state.clock.elapsedTime * def.speed + def.offset * total;
    const p = samplePath(def.path, dist);
    group.current.position.set(p.x, 0, p.z);
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      p.yaw,
      0.15,
    );
  });

  return (
    <group ref={group}>
      <HumanoidFigure
        look={{
          accent: def.color,
          skin: def.skin,
          hair: def.hair,
          gender: def.gender,
          lod,
        }}
        sitting={false}
        active={false}
        wavePhase={0}
        phase={def.offset * 10}
        working={false}
        walking={!reducedMotion}
        scale={0.62}
        showRing={false}
      />
    </group>
  );
}

/**
 * Ambient Siruseri crowd on the open floor perimeter.
 * No labels / no click — only real agents are labeled & interactive.
 */
export function AmbientWalkers({
  lod = "full",
  reducedMotion = false,
}: {
  lod?: Lod;
  reducedMotion?: boolean;
}) {
  const walkers = useMemo(() => buildWalkers(lod), [lod]);

  return (
    <group>
      {walkers.map((w) => (
        <Walker key={w.id} def={w} lod={lod} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}
