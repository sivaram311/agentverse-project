"use client";

import { Html } from "@react-three/drei";
import { AgentDesk } from "./DeskCluster";
import type { OfficeLod } from "@/lib/office-layout";

type OrchestratorDeskProps = {
  position: [number, number, number];
  color: string;
  name: string;
  lod?: OfficeLod;
  showLabel?: boolean;
};

/**
 * Aisle-facing lead desk: reuses AgentDesk + a small standup board.
 * rotation.y = π so the chair (−Z) sits toward the aisle and the sitter faces the team.
 */
export function OrchestratorDesk({
  position,
  color,
  name,
  lod = "full",
  showLabel = false,
}: OrchestratorDeskProps) {
  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      <AgentDesk
        position={[0, 0, 0]}
        color={color}
        lod={lod}
        faceCenter={false}
      />

      {/* Vertical ideas / standup board beside the desk */}
      <group position={[0.62, 0, 0.05]}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.13, 0.035, 12]} />
          <meshStandardMaterial color="#0a1018" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.42, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.028, 0.8, 8]} />
          <meshStandardMaterial color="#0c121a" metalness={0.55} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.98, 0]} castShadow>
          <boxGeometry args={[0.03, 0.95, 0.7]} />
          <meshStandardMaterial color="#161c24" metalness={0.25} roughness={0.45} />
        </mesh>
        <mesh position={[-0.018, 0.98, 0]}>
          <planeGeometry args={[0.62, 0.86]} />
          <meshStandardMaterial
            color="#e8eef4"
            emissive={color}
            emissiveIntensity={lod === "full" ? 0.14 : 0.06}
            roughness={0.55}
            metalness={0.05}
          />
        </mesh>
        <mesh position={[-0.02, 1.38, 0]}>
          <boxGeometry args={[0.01, 0.04, 0.55]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      </group>

      {showLabel && lod !== "simple" ? (
        <Html
          position={[0, 1.55, 0]}
          center
          distanceFactor={12}
          style={{ pointerEvents: "none" }}
        >
          <div className="desk-tag">
            <strong>{`Orchestrator · ${name}`}</strong>
          </div>
        </Html>
      ) : null}
    </group>
  );
}
