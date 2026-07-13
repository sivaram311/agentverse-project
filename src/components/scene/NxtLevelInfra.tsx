"use client";

import { Html } from "@react-three/drei";
import { HQ_BOUNDS, type OfficeLod } from "@/lib/office-layout";
import { CentralConference } from "./CentralConference";
import { ElevatorShaft } from "./ElevatorShaft";
import { GlassCube } from "./GlassCube";
import { SideConferenceBlock } from "./SideConferenceBlock";

/** Soft lounge seats for breakout / design-thinking zone. */
function BreakoutLounge({
  position,
  yaw = 0,
}: {
  position: [number, number, number];
  yaw?: number;
}) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[1.8, 28]} />
        <meshStandardMaterial color="#1a1512" roughness={0.9} />
      </mesh>
      {([-0.7, 0.7] as const).map((x) => (
        <group key={x} position={[x, 0, 0.35]}>
          <mesh position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[0.7, 0.28, 0.55]} />
            <meshStandardMaterial color="#2a3240" roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.48, -0.2]} castShadow>
            <boxGeometry args={[0.7, 0.35, 0.12]} />
            <meshStandardMaterial color="#243040" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Low table */}
      <mesh position={[0, 0.32, -0.35]} castShadow>
        <cylinderGeometry args={[0.45, 0.48, 0.06, 16]} />
        <meshStandardMaterial color="#a86a38" roughness={0.45} />
      </mesh>
      {/* Ideas whiteboard */}
      <mesh position={[0, 1.2, -1.55]} castShadow>
        <boxGeometry args={[1.6, 1.1, 0.06]} />
        <meshStandardMaterial color="#e8eef4" roughness={0.55} />
      </mesh>
      <Html position={[0, 1.95, -1.4]} center distanceFactor={14}>
        <div className="zone-badge">Breakout · Design thinking</div>
      </Html>
    </group>
  );
}

/** Entry reception + biometric / visitor desk vibe. */
function ReceptionDesk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[2.8, 1.05, 0.85]} />
        <meshStandardMaterial color="#161c24" metalness={0.25} roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[2.9, 0.06, 0.9]} />
        <meshStandardMaterial color="#1a222c" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0.9, 1.35, 0.1]} castShadow>
        <boxGeometry args={[0.35, 0.4, 0.05]} />
        <meshStandardMaterial
          color="#0c1016"
          emissive="#4DA3FF"
          emissiveIntensity={0.35}
        />
      </mesh>
      <Html position={[0, 1.85, 0]} center distanceFactor={14}>
        <div className="zone-badge">Reception · Nxt Level</div>
      </Html>
    </group>
  );
}

/**
 * Nxt Level (Navalur / Siruseri SIPCOT) — Intellect Design Arena floor infrastructure:
 * elevators, glass huddles, boardroom, innovation glass cube, breakout, reception.
 * Dark PROD materials; sits around the open-plan benches.
 */
export function NxtLevelInfra({
  lod = "full",
  reducedMotion = false,
  showLabels = true,
}: {
  lod?: OfficeLod;
  reducedMotion?: boolean;
  showLabels?: boolean;
}) {
  const { openZ, backZ } = HQ_BOUNDS;

  return (
    <group>
      {/* Entry elevators — high-speed lift bank */}
      <ElevatorShaft
        position={[-9.0, 0, openZ - 1.6]}
        side="left"
        yaw={Math.PI / 2}
        reducedMotion={reducedMotion}
        lod={lod}
      />
      <ElevatorShaft
        position={[9.0, 0, openZ - 1.6]}
        side="right"
        yaw={-Math.PI / 2}
        reducedMotion={reducedMotion}
        lod={lod}
      />

      <ReceptionDesk position={[0, 0, openZ - 1.35]} />

      {/* Glass huddle / meeting strip — left & right wings */}
      <SideConferenceBlock
        position={[-8.5, 0, -5.8]}
        yaw={Math.PI / 2}
        lod={lod}
      />
      <SideConferenceBlock
        position={[8.5, 0, -5.8]}
        yaw={-Math.PI / 2}
        lod={lod}
      />

      {/* Client boardroom / design conference — toward park glass */}
      <CentralConference
        lod={lod}
        position={[0, 0, backZ + 2.6]}
        showLabels={showLabels}
        reducedMotion={reducedMotion}
        occupied={lod === "full"}
      />

      {/* Innovation / demo glass cube */}
      <GlassCube
        position={[-4.2, 0, backZ + 3.4]}
        size={1.85}
        lod={lod}
        reducedMotion={reducedMotion}
      />

      {/* Collaborative breakout near pantry wing */}
      <BreakoutLounge position={[5.2, 0, openZ - 3.8]} yaw={-0.25} />

      {/* Floor branding rail near entry */}
      <mesh position={[0, 2.85, openZ - 0.55]}>
        <boxGeometry args={[6.4, 0.28, 0.08]} />
        <meshStandardMaterial color="#0c1016" metalness={0.45} roughness={0.4} />
      </mesh>
      <Html position={[0, 2.85, openZ - 0.4]} center distanceFactor={18}>
        <div className="plaza-brand">
          <strong>Intellect Design Arena</strong>
          <span>Nxt Level · Navalur / Siruseri · SIPCOT OMR</span>
        </div>
      </Html>
    </group>
  );
}
