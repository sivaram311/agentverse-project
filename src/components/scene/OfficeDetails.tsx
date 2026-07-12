"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";
import * as THREE from "three";

type Lod = "full" | "simple";

/** Desk / corridor plant — biophilic MNC feel. */
export function OfficePlant({
  position,
  scale = 1,
  variant = 0,
}: {
  position: [number, number, number];
  scale?: number;
  variant?: number;
}) {
  const leaf = variant % 2 === 0 ? "#1f4d38" : "#2d6b4a";
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.16, 8]} />
        <meshStandardMaterial color="#2a1810" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color={leaf} roughness={0.7} />
      </mesh>
      <mesh position={[0.08, 0.38, 0.04]}>
        <sphereGeometry args={[0.09, 6, 6]} />
        <meshStandardMaterial color="#2d6b4a" roughness={0.65} />
      </mesh>
    </group>
  );
}

/** Photo frame, headphones, coffee mug, second monitor — lived-in desk. */
export function DeskClutter({
  topY,
  deskW,
  color,
}: {
  topY: number;
  deskW: number;
  color: string;
}) {
  return (
    <group>
      {/* Dual monitor hint — smaller side screen */}
      <mesh position={[-deskW * 0.28, topY + 0.28, -0.12]} rotation={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.28, 0.2, 0.02]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Photo frame */}
      <mesh position={[deskW * 0.32, topY + 0.06, 0.02]} castShadow>
        <boxGeometry args={[0.08, 0.1, 0.015]} />
        <meshStandardMaterial color="#d8c8a8" roughness={0.55} />
      </mesh>
      <mesh position={[deskW * 0.32, topY + 0.06, 0.025]}>
        <planeGeometry args={[0.06, 0.07]} />
        <meshStandardMaterial color="#4a6080" emissive="#2a4060" emissiveIntensity={0.15} />
      </mesh>
      {/* Headphones on stand */}
      <mesh position={[-deskW * 0.32, topY + 0.05, 0.1]} castShadow>
        <torusGeometry args={[0.05, 0.012, 6, 12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Coffee / filter coffee tumbler */}
      <mesh position={[deskW * 0.2, topY + 0.05, 0.14]} castShadow>
        <cylinderGeometry args={[0.025, 0.028, 0.08, 8]} />
        <meshStandardMaterial color="#f2ece0" roughness={0.5} />
      </mesh>
      <mesh position={[deskW * 0.2, topY + 0.1, 0.14]}>
        <cylinderGeometry args={[0.03, 0.03, 0.015, 8]} />
        <meshStandardMaterial color="#c45c26" roughness={0.45} />
      </mesh>
      {/* Mouse pad */}
      <mesh position={[0.2, topY + 0.012, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, 0.1]} />
        <meshStandardMaterial color="#1a1010" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Soundproof focus pod. */
export function FocusPod({
  position,
  yaw = 0,
}: {
  position: [number, number, number];
  yaw?: number;
}) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.58, 1.9, 16]} />
        <meshPhysicalMaterial
          color="#2a3544"
          metalness={0.2}
          roughness={0.35}
          transparent
          opacity={0.55}
          transmission={0.15}
        />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.58, 16]} />
        <meshStandardMaterial color="#121820" />
      </mesh>
      <mesh position={[0, 0.42, 0.15]} castShadow>
        <boxGeometry args={[0.35, 0.08, 0.3]} />
        <meshStandardMaterial color="#1a2430" />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <torusGeometry args={[0.5, 0.03, 6, 16]} />
        <meshStandardMaterial color="#E8A838" emissive="#E8A838" emissiveIntensity={0.35} />
      </mesh>
      <Html position={[0, 2.05, 0]} center distanceFactor={16}>
        <div className="zone-badge">Focus · கவனம்</div>
      </Html>
    </group>
  );
}

/** Glass huddle / meeting room with Teams-style screen + booking pad. */
export function HuddleRoom({
  position,
  yaw = 0,
  title = "Huddle",
  titleTa = "கூட்டம்",
  accent = "#4DA3FF",
  lod = "full",
}: {
  position: [number, number, number];
  yaw?: number;
  title?: string;
  titleTa?: string;
  accent?: string;
  lod?: Lod;
}) {
  const screen = useRef<Mesh>(null);
  useFrame((state) => {
    if (!screen.current) return;
    const mat = screen.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 1.3) * 0.1;
  });

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Glass box */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[2.4, 2.2, 2.0]} />
        <meshPhysicalMaterial
          color="#9ec4d8"
          transparent
          opacity={0.14}
          transmission={lod === "full" ? 0.45 : 0}
          roughness={0.08}
          metalness={0.05}
        />
      </mesh>
      {/* Frame edges */}
      {[
        [-1.15, 1.1, -0.95],
        [1.15, 1.1, -0.95],
        [-1.15, 1.1, 0.95],
        [1.15, 1.1, 0.95],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <boxGeometry args={[0.06, 2.2, 0.06]} />
          <meshStandardMaterial color="#0e141c" metalness={0.5} />
        </mesh>
      ))}
      {/* Wall display */}
      <mesh ref={screen} position={[0, 1.35, -0.92]} castShadow>
        <boxGeometry args={[1.6, 0.9, 0.04]} />
        <meshStandardMaterial
          color="#152030"
          emissive={accent}
          emissiveIntensity={0.45}
        />
      </mesh>
      {/* Table + seats */}
      <mesh position={[0, 0.55, 0.15]} castShadow>
        <boxGeometry args={[1.4, 0.05, 0.8]} />
        <meshStandardMaterial color="#1a222c" metalness={0.35} />
      </mesh>
      {/* Booking pad outside */}
      <mesh position={[1.3, 1.2, 1.05]}>
        <boxGeometry args={[0.18, 0.28, 0.04]} />
        <meshStandardMaterial
          color="#0c1016"
          emissive="#3DDC97"
          emissiveIntensity={0.55}
        />
      </mesh>
      <Html position={[0, 2.35, 0]} center distanceFactor={15}>
        <div className="zone-badge">
          {title} · {titleTa}
        </div>
      </Html>
    </group>
  );
}

/** South-Indian pantry — filter coffee + snacks vibe. */
export function FilterCoffeePantry({
  position,
  lod = "full",
}: {
  position: [number, number, number];
  lod?: Lod;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[2.2, 1.1, 0.7]} />
        <meshStandardMaterial color="#1a1512" roughness={0.7} />
      </mesh>
      {/* Counter top */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <boxGeometry args={[2.25, 0.06, 0.75]} />
        <meshStandardMaterial color="#2a2118" metalness={0.25} roughness={0.4} />
      </mesh>
      {/* Filter coffee decocter */}
      <mesh position={[-0.55, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.35, 10]} />
        <meshStandardMaterial color="#c0c8d0" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[-0.55, 1.55, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.08, 10]} />
        <meshStandardMaterial color="#8a9098" metalness={0.6} />
      </mesh>
      {/* Cups */}
      {[-0.15, 0.1, 0.35].map((x, i) => (
        <mesh key={i} position={[x, 1.2, 0.15]} castShadow>
          <cylinderGeometry args={[0.04, 0.045, 0.08, 8]} />
          <meshStandardMaterial color="#f5f0e6" roughness={0.5} />
        </mesh>
      ))}
      {/* Snack tray */}
      <mesh position={[0.7, 1.18, 0.1]} castShadow>
        <boxGeometry args={[0.35, 0.04, 0.25]} />
        <meshStandardMaterial color="#E8A838" roughness={0.55} />
      </mesh>
      {lod === "full" ? (
        <pointLight position={[0, 1.8, 0.3]} intensity={0.25} distance={3.5} color="#ffd8a8" />
      ) : null}
      <Html position={[0, 1.95, 0]} center distanceFactor={15}>
        <div className="zone-badge">Pantry · பேன்ட்ரி · Filter coffee</div>
      </Html>
      <OfficePlant position={[1.0, 1.15, -0.2]} scale={0.7} variant={1} />
    </group>
  );
}

/** Entrance plaza south of the cutaway — flags, water, branding. */
export function EntrancePlaza({ lod = "full" }: { lod?: Lod }) {
  const logo = useRef<Mesh>(null);
  useFrame((state) => {
    if (!logo.current) return;
    const mat = logo.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.55 + Math.sin(state.clock.elapsedTime * 1.2) * 0.1;
  });

  return (
    <group position={[0, 0, 9.5]}>
      {/* Plaza paving */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial color="#1a1e24" roughness={0.85} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[1.8, 2.1, 48]} />
        <meshStandardMaterial
          color="#E8A838"
          emissive="#E8A838"
          emissiveIntensity={0.25}
          transparent
          opacity={0.4}
        />
      </mesh>
      {/* Water feature */}
      <mesh position={[0, 0.12, 1.5]} castShadow>
        <cylinderGeometry args={[1.1, 1.2, 0.2, 24]} />
        <meshStandardMaterial color="#152030" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.24, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 24]} />
        <meshStandardMaterial
          color="#2a6090"
          emissive="#1a4068"
          emissiveIntensity={0.35}
          metalness={0.3}
          roughness={0.15}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Brand totem */}
      <mesh position={[0, 1.4, -2.2]} castShadow>
        <boxGeometry args={[0.35, 2.8, 0.2]} />
        <meshStandardMaterial color="#101820" metalness={0.45} />
      </mesh>
      <mesh ref={logo} position={[0, 2.4, -2.05]}>
        <planeGeometry args={[1.4, 0.45]} />
        <meshStandardMaterial
          color="#FF6200"
          emissive="#FF6200"
          emissiveIntensity={0.6}
        />
      </mesh>
      <Html position={[0, 2.4, -1.9]} center distanceFactor={14}>
        <div className="plaza-brand">
          <strong>AV AgentVerse</strong>
          <span>Digital Office · டிஜிட்டல் அலுவலகம்</span>
        </div>
      </Html>
      {/* Flag poles */}
      {[-3.5, 3.5].map((x, i) => (
        <group key={i} position={[x, 0, -1.5]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 3, 8]} />
            <meshStandardMaterial color="#c8c8c8" metalness={0.7} />
          </mesh>
          <mesh position={[0.35, 2.7, 0]}>
            <boxGeometry args={[0.7, 0.4, 0.02]} />
            <meshStandardMaterial
              color={i === 0 ? "#FF6200" : "#3DDC97"}
              emissive={i === 0 ? "#FF6200" : "#3DDC97"}
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      ))}
      {/* Planters */}
      {lod === "full"
        ? [-5, -2.5, 2.5, 5].map((x, i) => (
            <OfficePlant key={i} position={[x, 0, 2.5]} scale={1.3} variant={i} />
          ))
        : null}
      {/* Turnstile hint */}
      <mesh position={[-1.2, 0.45, -3.2]} castShadow>
        <boxGeometry args={[0.8, 0.9, 0.35]} />
        <meshStandardMaterial color="#1a2030" metalness={0.4} />
      </mesh>
      <mesh position={[1.2, 0.45, -3.2]} castShadow>
        <boxGeometry args={[0.8, 0.9, 0.35]} />
        <meshStandardMaterial color="#1a2030" metalness={0.4} />
      </mesh>
      {lod === "full" ? (
        <pointLight position={[0, 3, 0]} intensity={0.35} distance={10} color="#ffe6c0" />
      ) : null}
    </group>
  );
}

/** Corridor planter row. */
export function CorridorPlanters({
  floorY,
  z = 4.5,
}: {
  floorY: number;
  z?: number;
}) {
  return (
    <group position={[0, floorY, z]}>
      {[-7, -4, 4, 7].map((x, i) => (
        <OfficePlant key={i} position={[x, 0, 0]} scale={1.1} variant={i} />
      ))}
    </group>
  );
}
