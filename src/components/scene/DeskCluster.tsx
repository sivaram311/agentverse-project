"use client";

import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";
import type { OfficeProject } from "@/lib/types";

type DeskProps = {
  position: [number, number, number];
  color: string;
  label?: string;
  showLabel?: boolean;
  progress?: number;
  status?: string;
  lod?: "full" | "simple";
};

/** Modern desk with holographic monitor — used at each agent seat. */
export function AgentDesk({
  position,
  color,
  label,
  showLabel,
  progress = 0,
  status,
  lod = "full",
}: DeskProps) {
  const screen = useRef<Mesh>(null);
  const glow = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (screen.current) {
      const mat = screen.current.material as { emissiveIntensity?: number };
      if (mat.emissiveIntensity != null) {
        mat.emissiveIntensity = 0.45 + Math.sin(t * 2.4 + position[0]) * 0.12;
      }
    }
    if (glow.current) {
      glow.current.scale.setScalar(1 + Math.sin(t * 1.8) * 0.04);
    }
  });

  const deskW = lod === "simple" ? 1.1 : 1.35;
  const deskD = lod === "simple" ? 0.7 : 0.85;

  return (
    <group position={position}>
      {/* Desktop */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[deskW, 0.06, deskD]} />
        <meshStandardMaterial color="#1a2433" metalness={0.45} roughness={0.4} />
      </mesh>
      {/* Legs */}
      {(
        [
          [-deskW / 2 + 0.08, 0.36, -deskD / 2 + 0.08],
          [deskW / 2 - 0.08, 0.36, -deskD / 2 + 0.08],
          [-deskW / 2 + 0.08, 0.36, deskD / 2 - 0.08],
          [deskW / 2 - 0.08, 0.36, deskD / 2 - 0.08],
        ] as [number, number, number][]
      ).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <meshStandardMaterial color="#121820" metalness={0.5} roughness={0.45} />
        </mesh>
      ))}
      {/* Chair */}
      <mesh position={[0, 0.42, 0.55]} castShadow>
        <boxGeometry args={[0.42, 0.08, 0.4]} />
        <meshStandardMaterial color="#15202c" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.72, 0.72]} castShadow>
        <boxGeometry args={[0.42, 0.55, 0.06]} />
        <meshStandardMaterial color="#15202c" roughness={0.55} />
      </mesh>
      {/* Holo monitor */}
      <mesh position={[0, 1.15, -deskD / 2 + 0.12]} castShadow>
        <boxGeometry args={[0.08, 0.55, 0.08]} />
        <meshStandardMaterial color="#0e141c" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh
        ref={screen}
        position={[0, 1.35, -deskD / 2 + 0.05]}
        castShadow
      >
        <boxGeometry args={[0.85, 0.52, 0.03]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.2}
          roughness={0.25}
          transparent
          opacity={0.85}
        />
      </mesh>
      {lod === "full" ? (
        <mesh ref={glow} position={[0, 1.35, -deskD / 2 - 0.02]}>
          <planeGeometry args={[0.95, 0.6]} />
          <meshBasicMaterial color={color} transparent opacity={0.12} />
        </mesh>
      ) : null}
      {/* Progress bar on desk edge */}
      {progress > 0 ? (
        <group position={[0, 0.78, deskD / 2 - 0.05]}>
          <mesh>
            <boxGeometry args={[0.9, 0.04, 0.04]} />
            <meshStandardMaterial color="#0a1018" />
          </mesh>
          <mesh
            position={[-0.45 * (1 - progress / 100), 0.01, 0.01]}
            scale={[Math.max(0.02, progress / 100), 1, 1]}
          >
            <boxGeometry args={[0.9, 0.03, 0.03]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>
      ) : null}
      {showLabel && label ? (
        <Html position={[0, 1.85, 0]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
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
  /** Hub crew desks are placed by persona home; satellite clusters get local seats */
  satellite?: boolean;
};

const SATELLITE_SEATS: [number, number, number][] = [
  [0, 0, 0],
  [-2.2, 0, 1.4],
  [2.2, 0, 1.4],
  [0, 0, 2.6],
];

/** Desk cluster for a project (satellite rings around the office hub). */
export function ProjectCluster({ project, showLabels, lod, satellite }: ClusterProps) {
  const offset = project.clusterOffset;
  const seats = useMemo(() => {
    if (!satellite) return [] as [number, number, number][];
    return SATELLITE_SEATS;
  }, [satellite]);

  if (!satellite) return null;

  return (
    <group position={offset}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.8]}>
        <ringGeometry args={[2.4, 2.55, 48]} />
        <meshStandardMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={0.4}
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
        />
      ))}
    </group>
  );
}
