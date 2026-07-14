"use client";

import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";
import type { OfficeProject } from "@/lib/types";
import { PALETTE } from "@/lib/office-palette";
import { DeskClutter, OfficePlant } from "./OfficeDetails";

/** Match persona scale (~0.82). */
export const MINI_FURNITURE = 0.8;

type DeskProps = {
  position: [number, number, number];
  color: string;
  label?: string;
  showLabel?: boolean;
  progress?: number;
  status?: string;
  lod?: "full" | "simple";
  faceCenter?: boolean;
};

type OfficeChairProps = {
  position?: [number, number, number];
  scale?: number;
};

/** Black ergonomic mesh chair — 5-star base + casters. Reusable (e.g. HexCollab). */
export function OfficeChair({
  position = [0, 0, 0],
  scale = 1,
}: OfficeChairProps) {
  return (
    <group position={position} scale={scale}>
      {/* Seat cushion */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[0.34, 0.05, 0.32]} />
        <meshStandardMaterial
          color={PALETTE.chair}
          roughness={0.55}
          metalness={0.08}
        />
      </mesh>
      {/* Mesh seat inset */}
      <mesh position={[0, 0.41, 0.01]}>
        <boxGeometry args={[0.28, 0.012, 0.26]} />
        <meshStandardMaterial
          color={PALETTE.chairMesh}
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>
      {/* Mesh backrest */}
      <mesh position={[0, 0.58, -0.12]} castShadow>
        <boxGeometry args={[0.32, 0.42, 0.04]} />
        <meshStandardMaterial
          color={PALETTE.chairMesh}
          roughness={0.72}
          metalness={0.05}
        />
      </mesh>
      {/* Back support frame */}
      <mesh position={[0, 0.52, -0.145]} castShadow>
        <boxGeometry args={[0.28, 0.28, 0.02]} />
        <meshStandardMaterial
          color={PALETTE.chair}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      {/* Lumbar / headrest bar */}
      <mesh position={[0, 0.74, -0.12]} castShadow>
        <boxGeometry args={[0.22, 0.06, 0.045]} />
        <meshStandardMaterial
          color={PALETTE.chairAccent}
          roughness={0.5}
        />
      </mesh>
      {/* Armrests */}
      {([-1, 1] as const).map((side) => (
        <group key={side} position={[side * 0.2, 0.45, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.035, 0.14, 0.04]} />
            <meshStandardMaterial color={PALETTE.chair} metalness={0.35} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.08, 0.02]} castShadow>
            <boxGeometry args={[0.045, 0.025, 0.16]} />
            <meshStandardMaterial color={PALETTE.chairAccent} roughness={0.55} />
          </mesh>
        </group>
      ))}
      {/* Gas cylinder / stem */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.035, 0.34, 8]} />
        <meshStandardMaterial
          color={PALETTE.chair}
          metalness={0.65}
          roughness={0.3}
        />
      </mesh>
      {/* Hub of 5-star base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.04, 10]} />
        <meshStandardMaterial
          color={PALETTE.chair}
          metalness={0.7}
          roughness={0.28}
        />
      </mesh>
      {/* 5-star legs + casters */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        const lx = Math.cos(a) * 0.18;
        const lz = Math.sin(a) * 0.18;
        return (
          <group key={i}>
            <mesh
              position={[lx * 0.55, 0.04, lz * 0.55]}
              rotation={[0, a, 0]}
              castShadow
            >
              <boxGeometry args={[0.22, 0.028, 0.038]} />
              <meshStandardMaterial
                color={PALETTE.chair}
                metalness={0.6}
                roughness={0.32}
              />
            </mesh>
            {/* Caster wheel */}
            <mesh position={[lx, 0.025, lz]} castShadow>
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshStandardMaterial
                color={PALETTE.chairAccent}
                metalness={0.45}
                roughness={0.4}
              />
            </mesh>
            <mesh position={[lx, 0.012, lz]} rotation={[Math.PI / 2, 0, a]}>
              <cylinderGeometry args={[0.022, 0.022, 0.02, 8]} />
              <meshStandardMaterial
                color="#0a0a0a"
                metalness={0.2}
                roughness={0.6}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Sit-stand desk + dual monitors + ergonomic chair — bright industrial. */
export function AgentDesk({
  position,
  color,
  label,
  showLabel,
  progress = 0,
  status,
  lod = "full",
  faceCenter = true,
}: DeskProps) {
  const screenL = useRef<Mesh>(null);
  const screenR = useRef<Mesh>(null);
  const edge = useRef<Mesh>(null);
  const lamp = useRef<Mesh>(null);
  const column = useRef<Mesh>(null);

  const yaw = useMemo(() => {
    if (!faceCenter) return 0;
    return Math.atan2(-position[0], -position[2]);
  }, [faceCenter, position]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = 0.55 + Math.sin(t * 2.5 + position[0] * 2) * 0.12;
    for (const ref of [screenL, screenR]) {
      if (ref.current) {
        const mat = ref.current.material as { emissiveIntensity?: number };
        if (mat.emissiveIntensity != null) mat.emissiveIntensity = pulse;
      }
    }
    if (edge.current) {
      const mat = edge.current.material as { emissiveIntensity?: number };
      if (mat.emissiveIntensity != null) {
        mat.emissiveIntensity = 0.15 + Math.sin(t * 1.4) * 0.05;
      }
    }
    if (lamp.current) {
      lamp.current.rotation.z = Math.sin(t * 0.8) * 0.05;
    }
    if (column.current && lod === "full") {
      column.current.scale.y = 1 + Math.sin(t * 0.15 + position[2]) * 0.012;
    }
  });

  const s = MINI_FURNITURE;
  const deskW = (lod === "simple" ? 1.15 : 1.35) * s;
  const deskD = (lod === "simple" ? 0.68 : 0.78) * s;
  /** Desk surface height — matches seated hand reach */
  const topY = 0.58;
  const legH = topY - 0.04;
  const topColor = lod === "full" ? PALETTE.deskTop : PALETTE.deskTopAlt;

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Persona color as subtle floor underglow only */}
      <mesh position={[0, 0.015, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.58, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.08}
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* White sit-stand center column */}
      <mesh ref={column} position={[0, legH / 2, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, legH, 10]} />
        <meshStandardMaterial
          color={PALETTE.deskFrame}
          metalness={0.15}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.04, 12]} />
        <meshStandardMaterial
          color={PALETTE.deskFrame}
          metalness={0.12}
          roughness={0.4}
        />
      </mesh>

      {/* White feet */}
      {(
        [
          [-0.28, 0.03, 0],
          [0.28, 0.03, 0],
          [0, 0.03, -0.22],
          [0, 0.03, 0.22],
        ] as [number, number, number][]
      ).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[i < 2 ? 0.34 : 0.06, 0.035, i < 2 ? 0.06 : 0.34]} />
          <meshStandardMaterial
            color={PALETTE.deskFrame}
            metalness={0.12}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* White corner legs (frame) */}
      {(
        [
          [-deskW / 2 + 0.04, legH / 2, -deskD / 2 + 0.04],
          [deskW / 2 - 0.04, legH / 2, -deskD / 2 + 0.04],
          [-deskW / 2 + 0.04, legH / 2, deskD / 2 - 0.04],
          [deskW / 2 - 0.04, legH / 2, deskD / 2 - 0.04],
        ] as [number, number, number][]
      ).map((p, i) => (
        <mesh key={`leg-${i}`} position={p} castShadow>
          <boxGeometry args={[0.045, legH, 0.045]} />
          <meshStandardMaterial
            color={PALETTE.deskFrame}
            metalness={0.1}
            roughness={0.38}
          />
        </mesh>
      ))}

      {/* White modesty panel */}
      <mesh position={[0, legH * 0.42, deskD / 2 - 0.02]} castShadow>
        <boxGeometry args={[deskW * 0.88, legH * 0.55, 0.018]} />
        <meshStandardMaterial
          color={PALETTE.deskFrame}
          metalness={0.08}
          roughness={0.42}
        />
      </mesh>

      {/* Teal desktop (prototype fidelity — ignore persona color) */}
      <mesh position={[0, topY, 0]} castShadow receiveShadow>
        <boxGeometry args={[deskW, 0.035, deskD]} />
        <meshStandardMaterial
          color={topColor}
          metalness={0.25}
          roughness={0.35}
        />
      </mesh>
      {/* Slightly lighter teal inset surface */}
      <mesh position={[0, topY + 0.018, 0]}>
        <boxGeometry args={[deskW * 0.96, 0.006, deskD * 0.94]} />
        <meshStandardMaterial
          color={PALETTE.deskTopAlt}
          metalness={0.2}
          roughness={0.28}
        />
      </mesh>
      {/* Thin white front lip */}
      <mesh position={[0, topY - 0.01, -deskD / 2 + 0.012]}>
        <boxGeometry args={[deskW * 0.98, 0.02, 0.016]} />
        <meshStandardMaterial
          color={PALETTE.deskFrame}
          metalness={0.1}
          roughness={0.4}
        />
      </mesh>
      {/* Optional subtle persona underglow along rear edge */}
      <mesh ref={edge} position={[0, topY - 0.018, deskD / 2 - 0.02]}>
        <boxGeometry args={[deskW * 0.7, 0.01, 0.012]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.18}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Ergonomic chair — outside of hex (local −Z) */}
      <OfficeChair position={[0, 0, -deskD * 0.62]} />

      {lod === "full" ? (
        <>
          {/* Keyboard */}
          <mesh position={[0, topY + 0.025, -deskD * 0.12]} castShadow>
            <boxGeometry args={[0.38, 0.018, 0.14]} />
            <meshStandardMaterial
              color={PALETTE.cable}
              metalness={0.25}
              roughness={0.5}
            />
          </mesh>
          {/* Mouse */}
          <mesh position={[0.24, topY + 0.022, -deskD * 0.05]} castShadow>
            <boxGeometry args={[0.055, 0.014, 0.09]} />
            <meshStandardMaterial
              color="#1a1a1a"
              metalness={0.2}
              roughness={0.45}
            />
          </mesh>
          {/* Silver/black laptop */}
          <group position={[deskW * 0.28, topY + 0.02, -deskD * 0.08]}>
            <mesh castShadow>
              <boxGeometry args={[0.28, 0.012, 0.2]} />
              <meshStandardMaterial
                color={PALETTE.laptopSilver}
                metalness={0.55}
                roughness={0.28}
              />
            </mesh>
            <mesh position={[0, 0.1, -0.09]} rotation={[0.35, 0, 0]} castShadow>
              <boxGeometry args={[0.28, 0.18, 0.01]} />
              <meshStandardMaterial
                color="#2a2a2a"
                metalness={0.4}
                roughness={0.35}
              />
            </mesh>
            <mesh position={[0, 0.1, -0.084]} rotation={[0.35, 0, 0]}>
              <planeGeometry args={[0.25, 0.15]} />
              <meshStandardMaterial
                color="#1a3040"
                emissive={PALETTE.tealAccent}
                emissiveIntensity={0.25}
                roughness={0.2}
              />
            </mesh>
          </group>
          {/* Power strip under rear edge */}
          <mesh position={[0.05, 0.06, deskD / 2 - 0.08]} castShadow>
            <boxGeometry args={[0.32, 0.035, 0.06]} />
            <meshStandardMaterial
              color="#1a1a1a"
              metalness={0.3}
              roughness={0.5}
            />
          </mesh>
          {/* Thin black cables */}
          <mesh
            position={[-0.18, topY - 0.08, deskD / 2 - 0.12]}
            rotation={[0.4, 0, 0.05]}
          >
            <cylinderGeometry args={[0.006, 0.006, 0.28, 5]} />
            <meshStandardMaterial color={PALETTE.cable} roughness={0.8} />
          </mesh>
          <mesh
            position={[0.2, topY - 0.1, deskD / 2 - 0.1]}
            rotation={[0.55, 0, -0.08]}
          >
            <cylinderGeometry args={[0.005, 0.005, 0.32, 5]} />
            <meshStandardMaterial color={PALETTE.cable} roughness={0.8} />
          </mesh>
          <mesh
            position={[0.08, 0.2, deskD / 2 - 0.09]}
            rotation={[1.1, 0, 0.15]}
          >
            <cylinderGeometry args={[0.005, 0.005, 0.36, 5]} />
            <meshStandardMaterial color={PALETTE.cable} roughness={0.8} />
          </mesh>
          <DeskClutter topY={topY} deskW={deskW} color={PALETTE.tealAccent} />
          <OfficePlant
            position={[-deskW * 0.4, topY, deskD * 0.15]}
            scale={0.55}
            variant={Math.abs(Math.round(position[0] * 3))}
          />
        </>
      ) : null}

      {/* Dual monitors — dark bezels, teal screens */}
      <mesh position={[-0.18, topY + 0.1, deskD / 2 - 0.14]} castShadow>
        <cylinderGeometry args={[0.02, 0.028, 0.18, 8]} />
        <meshStandardMaterial
          color={PALETTE.monitorBezel}
          metalness={0.55}
          roughness={0.35}
        />
      </mesh>
      {/* Left monitor bezel */}
      <mesh
        position={[-0.18, topY + 0.36, deskD / 2 - 0.08]}
        rotation={[0, -0.18, 0]}
        castShadow
      >
        <boxGeometry args={[0.44, 0.32, 0.028]} />
        <meshStandardMaterial
          color={PALETTE.monitorBezel}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>
      <mesh
        ref={screenL}
        position={[-0.18, topY + 0.36, deskD / 2 - 0.09]}
        rotation={[0, -0.18, 0]}
      >
        <boxGeometry args={[0.4, 0.28, 0.008]} />
        <meshStandardMaterial
          color="#0d2a32"
          emissive={PALETTE.tealAccent}
          emissiveIntensity={0.55}
          metalness={0.05}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[-0.18, topY + 0.36, deskD / 2 - 0.1]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.38, 0.26]} />
        <meshBasicMaterial color={PALETTE.tealAccent} transparent opacity={0.12} />
      </mesh>

      <mesh position={[0.2, topY + 0.1, deskD / 2 - 0.14]} castShadow>
        <cylinderGeometry args={[0.02, 0.028, 0.18, 8]} />
        <meshStandardMaterial
          color={PALETTE.monitorBezel}
          metalness={0.55}
          roughness={0.35}
        />
      </mesh>
      <mesh
        position={[0.2, topY + 0.34, deskD / 2 - 0.07]}
        rotation={[0, 0.22, 0]}
        castShadow
      >
        <boxGeometry args={[0.38, 0.28, 0.026]} />
        <meshStandardMaterial
          color={PALETTE.monitorBezel}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>
      <mesh
        ref={screenR}
        position={[0.2, topY + 0.34, deskD / 2 - 0.08]}
        rotation={[0, 0.22, 0]}
      >
        <boxGeometry args={[0.34, 0.24, 0.008]} />
        <meshStandardMaterial
          color="#0d2a32"
          emissive={PALETTE.tealAccent}
          emissiveIntensity={0.5}
          metalness={0.05}
          roughness={0.22}
        />
      </mesh>
      <mesh position={[0.2, topY + 0.34, deskD / 2 - 0.09]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.32, 0.22]} />
        <meshBasicMaterial color={PALETTE.tealAccent} transparent opacity={0.1} />
      </mesh>

      {lod === "full" ? (
        <group ref={lamp} position={[deskW / 2 - 0.1, topY + 0.02, 0.05]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.015, 0.02, 0.24, 6]} />
            <meshStandardMaterial
              color={PALETTE.deskFrame}
              metalness={0.2}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, 0.26, -0.03]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial
              color="#ffe6b0"
              emissive="#ffe6b0"
              emissiveIntensity={0.75}
            />
          </mesh>
          <pointLight
            position={[0, 0.24, -0.06]}
            intensity={0.2}
            distance={1.7}
            color="#ffe6b0"
          />
        </group>
      ) : null}

      {progress > 0 ? (
        <group position={[0, topY + 0.04, deskD / 2 - 0.04]}>
          <mesh>
            <boxGeometry args={[0.55, 0.03, 0.03]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh
            position={[-0.275 * (1 - progress / 100), 0.008, 0.008]}
            scale={[Math.max(0.02, progress / 100), 1, 1]}
          >
            <boxGeometry args={[0.55, 0.022, 0.022]} />
            <meshStandardMaterial
              color={PALETTE.tealAccent}
              emissive={PALETTE.tealAccent}
              emissiveIntensity={0.7}
            />
          </mesh>
        </group>
      ) : null}

      {showLabel && label ? (
        <Html
          position={[0, topY + 0.95, 0]}
          center
          distanceFactor={11}
          style={{ pointerEvents: "none" }}
        >
          <div className="desk-tag">
            <strong>{label}</strong>
            {status ? <span>{status}</span> : null}
          </div>
        </Html>
      ) : null}
    </group>
  );
}

type ClusterProps = {
  project: OfficeProject;
  showLabels: boolean;
  lod: "full" | "simple";
  satellite?: boolean;
};

const SATELLITE_SEATS: [number, number, number][] = [
  [0, 0, 0],
  [-1.6, 0, 1.0],
  [1.6, 0, 1.0],
  [0, 0, 1.9],
];

export function ProjectCluster({ project, showLabels, lod, satellite }: ClusterProps) {
  const offset = project.clusterOffset;
  const seats = useMemo(() => {
    if (!satellite) return [] as [number, number, number][];
    return SATELLITE_SEATS;
  }, [satellite]);

  if (!satellite) return null;

  return (
    <group position={offset}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0.55]}>
        <ringGeometry args={[1.8, 1.95, 40]} />
        <meshStandardMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={0.45}
          transparent
          opacity={0.5}
        />
      </mesh>
      {seats.map((seat, i) => (
        <AgentDesk
          key={`${project.id}-desk-${i}`}
          position={seat}
          color={project.color}
          label={i === 0 ? project.name : undefined}
          showLabel={showLabels && i === 0}
          status={i === 0 ? "Cluster online" : undefined}
          progress={i === 0 ? 35 : 0}
          lod={lod}
          faceCenter={false}
        />
      ))}
    </group>
  );
}
