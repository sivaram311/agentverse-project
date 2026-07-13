"use client";

import * as THREE from "three";
import { ANCHORS, GLASS } from "@/lib/office-layout";
import { HumanoidFigure } from "./HumanoidFigure";

type Lod = "full" | "simple";

type Props = {
  position?: [number, number, number];
  yaw?: number;
  size?: number;
  lod?: Lod;
  reducedMotion?: boolean;
};

const MULLION_A = "#0e141c";
const MULLION_B = "#161c24";
const FLOOR = "#0c1016";

const LOWER_FIGURES: {
  pos: [number, number, number];
  yaw: number;
  accent: string;
  skin: string;
  hair: string;
  gender: "male" | "female";
  sitting: boolean;
}[] = [
  {
    pos: [-0.55, 0, 0.2],
    yaw: Math.PI * 0.15,
    accent: "#4DA3FF",
    skin: "#E0C4A8",
    hair: "#2A1F14",
    gender: "male",
    sitting: false,
  },
  {
    pos: [0.45, 0, -0.35],
    yaw: -Math.PI * 0.4,
    accent: "#E8A838",
    skin: "#F0D5C0",
    hair: "#3D2314",
    gender: "female",
    sitting: true,
  },
  {
    pos: [0.1, 0, 0.55],
    yaw: Math.PI * 0.85,
    accent: "#3DDC97",
    skin: "#D4A574",
    hair: "#1A120C",
    gender: "male",
    sitting: false,
  },
];

function ClearGlass({ lod }: { lod: Lod }) {
  return (
    <meshPhysicalMaterial
      color={GLASS.clear.color}
      transparent
      opacity={GLASS.clear.opacity}
      transmission={lod === "full" ? GLASS.clear.transmission : 0}
      roughness={GLASS.clear.roughness}
      metalness={GLASS.clear.metalness}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

/** Mid-floor glass cube with lower-level depth illusion. */
export function GlassCube({
  position = ANCHORS.glassCube.position,
  yaw = ANCHORS.glassCube.yaw,
  size = ANCHORS.glassCube.size,
  lod = "full",
  reducedMotion = false,
}: Props) {
  const half = size / 2;
  const h = size;
  const frameT = 0.06;
  const midRailY = h * 0.45;

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Clear glass shell */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[size, h, size]} />
        <ClearGlass lod={lod} />
      </mesh>

      {/* Corner vertical mullions */}
      {(
        [
          [-half, half],
          [half, half],
          [-half, -half],
          [half, -half],
        ] as [number, number][]
      ).map(([x, z], i) => (
        <mesh key={`cv-${i}`} position={[x, h / 2, z]}>
          <boxGeometry args={[frameT, h, frameT]} />
          <meshStandardMaterial color={MULLION_A} metalness={0.55} roughness={0.35} />
        </mesh>
      ))}

      {/* Mid-face vertical mullions */}
      {(
        [
          [0, half],
          [0, -half],
          [-half, 0],
          [half, 0],
        ] as [number, number][]
      ).map(([x, z], i) => (
        <mesh key={`mv-${i}`} position={[x, h / 2, z]}>
          <boxGeometry args={[frameT * 0.85, h, frameT * 0.85]} />
          <meshStandardMaterial color={MULLION_B} metalness={0.5} roughness={0.4} />
        </mesh>
      ))}

      {/* Horizontal rails — base, mid, head */}
      {[0.04, midRailY, h - 0.04].map((y, yi) =>
        (
          [
            [0, y, half],
            [0, y, -half],
            [half, y, 0],
            [-half, y, 0],
          ] as [number, number, number][]
        ).map((p, i) => {
          const alongX = i < 2;
          return (
            <mesh key={`hr-${yi}-${i}`} position={p}>
              <boxGeometry
                args={alongX ? [size, frameT, frameT] : [frameT, frameT, size]}
              />
              <meshStandardMaterial
                color={yi === 1 ? MULLION_B : MULLION_A}
                metalness={0.5}
                roughness={0.35}
              />
            </mesh>
          );
        }),
      )}

      {/* Interior floor plate */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size - 0.08, size - 0.08]} />
        <meshStandardMaterial color={FLOOR} roughness={0.75} metalness={0.15} />
      </mesh>

      {/* Minimal bench */}
      <mesh position={[0, 0.28, 0.15]} castShadow>
        <boxGeometry args={[1.4, 0.06, 0.42]} />
        <meshStandardMaterial color="#1a222c" metalness={0.35} roughness={0.45} />
      </mesh>
      {(
        [
          [-0.55, 0.14, 0.15],
          [0.55, 0.14, 0.15],
        ] as [number, number, number][]
      ).map((p, i) => (
        <mesh key={`leg-${i}`} position={p}>
          <boxGeometry args={[0.06, 0.28, 0.06]} />
          <meshStandardMaterial color={MULLION_A} metalness={0.4} roughness={0.5} />
        </mesh>
      ))}

      {lod === "full" ? (
        <pointLight
          position={[0, h * 0.85, 0]}
          intensity={0.35}
          distance={size * 1.6}
          color="#c8e4f4"
        />
      ) : null}

      {/* Lower-floor depth illusion — omit on simple */}
      {lod !== "simple" ? (
        <group position={[0, -3, 0]}>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[size * 0.95, size * 0.95]} />
            <meshStandardMaterial color={FLOOR} roughness={0.85} metalness={0.1} />
          </mesh>
          {LOWER_FIGURES.map((f, i) => (
            <group key={i} position={f.pos} rotation={[0, f.yaw, 0]}>
              <HumanoidFigure
                look={{
                  accent: f.accent,
                  skin: f.skin,
                  hair: f.hair,
                  gender: f.gender,
                  lod: "simple",
                }}
                sitting={f.sitting}
                active={false}
                wavePhase={0}
                phase={i * 1.7}
                working={f.sitting}
                walking={!reducedMotion && !f.sitting}
                scale={0.4}
                showRing={false}
              />
            </group>
          ))}
        </group>
      ) : null}
    </group>
  );
}
