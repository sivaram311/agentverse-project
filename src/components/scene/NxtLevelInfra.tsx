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
        <boxGeometry args={[3.2, 1.05, 0.95]} />
        <meshStandardMaterial color="#C8C0B4" metalness={0.15} roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[3.35, 0.06, 1.0]} />
        <meshStandardMaterial color="#E8E4DC" metalness={0.25} roughness={0.35} />
      </mesh>
      <mesh position={[1.0, 1.4, 0.1]} castShadow>
        <boxGeometry args={[0.45, 0.5, 0.06]} />
        <meshStandardMaterial
          color="#0c1830"
          emissive="#00AEEF"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Biometric reader */}
      <mesh position={[-1.2, 1.25, 0.35]} castShadow>
        <boxGeometry args={[0.25, 0.35, 0.12]} />
        <meshStandardMaterial
          color="#121820"
          emissive="#3DDC97"
          emissiveIntensity={0.45}
        />
      </mesh>
      <Html position={[0, 1.95, 0]} center distanceFactor={14}>
        <div className="zone-badge">Reception · Intellect · Security</div>
      </Html>
    </group>
  );
}

/** Emergency stair core beside lifts. */
function EmergencyStairs({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[1.6, 3.2, 2.4]} />
        <meshStandardMaterial color="#161c24" roughness={0.7} metalness={0.15} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 0.25 + i * 0.55, -0.7 + i * 0.25]} castShadow>
          <boxGeometry args={[1.3, 0.08, 0.45]} />
          <meshStandardMaterial color="#8C8C8C" roughness={0.55} />
        </mesh>
      ))}
      <Html position={[0, 3.5, 0]} center distanceFactor={12}>
        <div className="zone-badge">Stairs · Emergency</div>
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
      <EmergencyStairs position={[-6.6, 0, openZ - 1.5]} />
      <EmergencyStairs position={[6.6, 0, openZ - 1.5]} />

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
