"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";
import {
  ORCH_OFFSET,
  TEAM_SEATS,
  type OfficeLod,
  type TeamZone,
} from "@/lib/office-layout";
import { AgentDesk } from "./DeskCluster";
import { OrchestratorDesk } from "./OrchestratorDesk";

type TeamClusterProps = {
  zone: TeamZone;
  lod: OfficeLod;
  showLabels?: boolean;
  furnitureScale?: number;
};

/**
 * One team pod: 5 inward-facing AgentDesks + aisle OrchestratorDesk + accent floor ring.
 */
export function TeamCluster({
  zone,
  lod,
  showLabels = false,
  furnitureScale = 0.9,
}: TeamClusterProps) {
  const ringRef = useRef<Mesh>(null);

  const maxSeatZ = useMemo(
    () => Math.max(...TEAM_SEATS.map((s) => s[2])),
    [],
  );
  const orchPos: [number, number, number] = [0, 0, maxSeatZ + ORCH_OFFSET];

  useFrame((state) => {
    if (lod !== "full" || !ringRef.current) return;
    const mat = ringRef.current.material as { emissiveIntensity?: number };
    if (mat.emissiveIntensity != null) {
      mat.emissiveIntensity =
        0.32 + Math.sin(state.clock.elapsedTime * 1.15 + zone.origin[2]) * 0.1;
    }
  });

  return (
    <group position={zone.origin} rotation={[0, zone.yaw, 0]}>
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.035, 0.2]}
      >
        <ringGeometry args={[2.35, 2.52, 48]} />
        <meshStandardMaterial
          color={zone.accentColor}
          emissive={zone.accentColor}
          emissiveIntensity={lod === "full" ? 0.38 : 0.18}
          transparent
          opacity={lod === "full" ? 0.48 : 0.32}
        />
      </mesh>

      <group scale={furnitureScale}>
        {TEAM_SEATS.map((seat, i) => (
          <group key={`${zone.id}-desk-${i}`} position={seat} rotation={[0, Math.PI, 0]}>
            <AgentDesk
              position={[0, 0, 0]}
              color={zone.accentColor}
              lod={lod}
              faceCenter={false}
            />
          </group>
        ))}

        <OrchestratorDesk
          position={orchPos}
          color={zone.accentColor}
          name={zone.name}
          lod={lod}
          showLabel={showLabels}
        />
      </group>
    </group>
  );
}
