"use client";

import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";
import type { OfficeProject } from "@/lib/types";
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

/** Sit-stand desk + dual glowing monitors + ergonomic chair. */
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
    const pulse = 0.68 + Math.sin(t * 2.5 + position[0] * 2) * 0.2;
    for (const ref of [screenL, screenR]) {
      if (ref.current) {
        const mat = ref.current.material as { emissiveIntensity?: number };
        if (mat.emissiveIntensity != null) mat.emissiveIntensity = pulse;
      }
    }
    if (edge.current) {
      const mat = edge.current.material as { emissiveIntensity?: number };
      if (mat.emissiveIntensity != null) {
        mat.emissiveIntensity = 0.4 + Math.sin(t * 1.4) * 0.1;
      }
    }
    if (lamp.current) {
      lamp.current.rotation.z = Math.sin(t * 0.8) * 0.05;
    }
    // Subtle sit-stand column breathe
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

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.015, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.58, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.14}
          transparent
          opacity={0.24}
        />
      </mesh>

      {/* Height-adjustable center column */}
      <mesh ref={column} position={[0, legH / 2, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, legH, 10]} />
        <meshStandardMaterial color="#1a222c" metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.04, 12]} />
        <meshStandardMaterial color="#0c121a" metalness={0.55} roughness={0.4} />
      </mesh>

      {/* Feet */}
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
          <meshStandardMaterial color="#0a1018" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}

      {/* Desktop */}
      <mesh position={[0, topY, 0]} castShadow receiveShadow>
        <boxGeometry args={[deskW, 0.035, deskD]} />
        <meshStandardMaterial
          color="#101820"
          metalness={0.55}
          roughness={0.28}
        />
      </mesh>
      <mesh position={[0, topY + 0.02, 0]}>
        <boxGeometry args={[deskW * 0.97, 0.008, deskD * 0.97]} />
        <meshPhysicalMaterial
          color="#1a2838"
          metalness={0.35}
          roughness={0.12}
          transmission={lod === "full" ? 0.1 : 0}
          thickness={0.12}
          transparent
          opacity={0.88}
        />
      </mesh>
      <mesh ref={edge} position={[0, topY - 0.02, -deskD / 2 + 0.015]}>
        <boxGeometry args={[deskW * 0.92, 0.016, 0.02]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>

      {/* Ergonomic chair — outside of hex (local −Z), seat under agent */}
      <group position={[0, 0, -deskD * 0.62]}>
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[0.34, 0.05, 0.32]} />
          <meshStandardMaterial color="#1a2430" roughness={0.5} metalness={0.15} />
        </mesh>
        {/* Backrest further outside */}
        <mesh position={[0, 0.58, -0.12]} castShadow>
          <boxGeometry args={[0.32, 0.4, 0.05]} />
          <meshStandardMaterial color="#1a2430" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.52, -0.08]} castShadow>
          <boxGeometry args={[0.28, 0.12, 0.04]} />
          <meshStandardMaterial color="#243040" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.04, 0.32, 8]} />
          <meshStandardMaterial color="#0c121a" metalness={0.55} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.16, 0.04, Math.sin(a) * 0.16]}
              rotation={[0, a, 0]}
              castShadow
            >
              <boxGeometry args={[0.2, 0.03, 0.04]} />
              <meshStandardMaterial color="#0c121a" metalness={0.5} />
            </mesh>
          );
        })}
      </group>

      {lod === "full" ? (
        <>
          {/* Keyboard toward sitter (−Z) */}
          <mesh position={[0, topY + 0.025, -deskD * 0.12]} castShadow>
            <boxGeometry args={[0.38, 0.018, 0.14]} />
            <meshStandardMaterial color="#0a1018" metalness={0.4} roughness={0.45} />
          </mesh>
          <mesh position={[0.24, topY + 0.022, -deskD * 0.05]} castShadow>
            <boxGeometry args={[0.055, 0.014, 0.09]} />
            <meshStandardMaterial color="#121820" metalness={0.35} roughness={0.4} />
          </mesh>
          <DeskClutter topY={topY} deskW={deskW} color={color} />
          <OfficePlant
            position={[-deskW * 0.4, topY, deskD * 0.15]}
            scale={0.55}
            variant={Math.abs(Math.round(position[0] * 3))}
          />
        </>
      ) : null}

      {/* Dual monitors on far side (+Z / toward center), facing the sitter */}
      <mesh position={[-0.18, topY + 0.1, deskD / 2 - 0.14]} castShadow>
        <cylinderGeometry args={[0.02, 0.028, 0.18, 8]} />
        <meshStandardMaterial color="#0e141c" metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh
        ref={screenL}
        position={[-0.18, topY + 0.36, deskD / 2 - 0.08]}
        rotation={[0, -0.18, 0]}
        castShadow
      >
        <boxGeometry args={[0.42, 0.3, 0.025]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.65}
          metalness={0.12}
          roughness={0.2}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh position={[0.2, topY + 0.1, deskD / 2 - 0.14]} castShadow>
        <cylinderGeometry args={[0.02, 0.028, 0.18, 8]} />
        <meshStandardMaterial color="#0e141c" metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh
        ref={screenR}
        position={[0.2, topY + 0.34, deskD / 2 - 0.07]}
        rotation={[0, 0.22, 0]}
        castShadow
      >
        <boxGeometry args={[0.36, 0.26, 0.022]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.55}
          metalness={0.12}
          roughness={0.22}
          transparent
          opacity={0.88}
        />
      </mesh>

      {lod === "full" ? (
        <group ref={lamp} position={[deskW / 2 - 0.1, topY + 0.02, 0.05]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.015, 0.02, 0.24, 6]} />
            <meshStandardMaterial color="#1a2433" metalness={0.5} />
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
            <meshStandardMaterial color="#070b10" />
          </mesh>
          <mesh
            position={[-0.275 * (1 - progress / 100), 0.008, 0.008]}
            scale={[Math.max(0.02, progress / 100), 1, 1]}
          >
            <boxGeometry args={[0.55, 0.022, 0.022]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
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
