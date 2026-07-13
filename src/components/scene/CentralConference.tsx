"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import * as THREE from "three";
import { CONFERENCE, GLASS, type OfficeLod } from "@/lib/office-layout";
import { MandalaPulse } from "./SiruseriOffice";

const CHAIR_CLEAR = CONFERENCE.chairClear;
const STICKY_COLORS = ["#FF6200", "#3DDC97", "#E8A838", "#4DA3FF"] as const;

type Props = {
  lod?: OfficeLod;
  position?: [number, number, number];
  yaw?: number;
  showLabels?: boolean;
  reducedMotion?: boolean;
};

/** Ergonomic chair copied from AgentDesk (DeskCluster) — not HubChair. */
function ConferenceChair({
  position,
  yaw = 0,
}: {
  position: [number, number, number];
  yaw?: number;
}) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[0.34, 0.05, 0.32]} />
        <meshStandardMaterial color="#1a2430" roughness={0.5} metalness={0.15} />
      </mesh>
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
  );
}

function buildChairLayout(tableW: number, tableD: number) {
  const hx = tableW / 2;
  const hz = tableD / 2;
  const sideZ = hz + CHAIR_CLEAR;
  const seats: { position: [number, number, number]; yaw: number }[] = [];

  for (let i = 0; i < 7; i++) {
    const x = -hx + 0.35 + (i / 6) * (tableW - 0.7);
    seats.push({ position: [x, 0, sideZ], yaw: Math.PI });
    seats.push({ position: [x, 0, -sideZ], yaw: 0 });
  }
  seats.push({ position: [-(hx + CHAIR_CLEAR), 0, 0], yaw: -Math.PI / 2 });
  return seats;
}

const STICKY_LAYOUT = [
  [-0.55, 0.45],
  [-0.15, 0.55],
  [0.3, 0.4],
  [0.65, 0.5],
  [-0.7, 0.05],
  [-0.25, -0.05],
  [0.2, 0.1],
  [0.55, 0.0],
  [-0.45, -0.4],
  [0.0, -0.35],
  [0.4, -0.45],
  [0.75, -0.3],
] as const;

/**
 * Central conference hall — long table, 15 chairs, TV wall, ideas board,
 * HexCollab pendants, and scaled MandalaPulse under the table.
 */
export function CentralConference({
  lod = "full",
  position = CONFERENCE.origin,
  yaw = 0,
  showLabels = false,
  reducedMotion = false,
}: Props) {
  const pendant = useRef<Group>(null);
  const [tableW, tableH, tableD] = CONFERENCE.table.size;
  const topY = CONFERENCE.table.topY;
  const pulseLights = lod === "full" && !reducedMotion;

  const chairs = useMemo(() => buildChairLayout(tableW, tableD), [tableW, tableD]);

  const pendantXs = useMemo(
    () => Array.from({ length: 5 }, (_, i) => -1.8 + (i / 4) * 3.6),
    [],
  );

  useFrame((state) => {
    if (!pulseLights || !pendant.current) return;
    const t = state.clock.elapsedTime;
    pendant.current.children.forEach((child, i) => {
      const light = child.children.find((c) => c.type === "PointLight") as
        | THREE.PointLight
        | undefined;
      if (light) {
        light.intensity = 0.28 + Math.sin(t * 1.4 + i) * 0.04;
      }
    });
  });

  const glassTx = lod === "full" ? GLASS.clear.transmission : 0;
  const stickyCount = lod === "full" ? STICKY_LAYOUT.length : 0;

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Scaled kolam / mandala under table */}
      <group scale={CONFERENCE.mandalaScale}>
        <MandalaPulse lod={lod} />
      </group>

      {/* Dark wood / metal conference table */}
      <mesh position={[0, topY, 0]} castShadow receiveShadow>
        <boxGeometry args={[tableW, tableH, tableD]} />
        <meshStandardMaterial color="#2a2118" roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[0, topY + 0.03, 0]}>
        <boxGeometry args={[tableW * 0.94, 0.015, tableD * 0.9]} />
        <meshPhysicalMaterial
          color={GLASS.clear.color}
          metalness={GLASS.clear.metalness}
          roughness={GLASS.clear.roughness}
          transmission={glassTx}
          thickness={0.25}
          transparent
          opacity={0.88}
        />
      </mesh>
      <mesh position={[0, topY - 0.03, 0]}>
        <boxGeometry args={[tableW + 0.06, 0.04, tableD + 0.06]} />
        <meshStandardMaterial color="#0e1218" metalness={0.55} roughness={0.4} />
      </mesh>

      {/* Legs */}
      {(
        [
          [-tableW * 0.42, -tableD * 0.35],
          [tableW * 0.42, -tableD * 0.35],
          [-tableW * 0.42, tableD * 0.35],
          [tableW * 0.42, tableD * 0.35],
        ] as [number, number][]
      ).map(([lx, lz], i) => (
        <mesh key={`leg-${i}`} position={[lx, topY / 2, lz]} castShadow>
          <cylinderGeometry args={[0.04, 0.055, topY, 8]} />
          <meshStandardMaterial color="#0c1016" metalness={0.65} roughness={0.35} />
        </mesh>
      ))}

      {chairs.map((c, i) => (
        <ConferenceChair key={`chair-${i}`} position={c.position} yaw={c.yaw} />
      ))}

      {/* HexCollab-style pendants along table X */}
      <group ref={pendant}>
        {pendantXs.map((x, i) => (
          <group key={`pend-${i}`} position={[x, CONFERENCE.pendantY, 0]}>
            <mesh>
              <cylinderGeometry args={[0.015, 0.015, 0.9, 6]} />
              <meshStandardMaterial color="#1a2030" metalness={0.5} />
            </mesh>
            <mesh position={[0, -0.55, 0]}>
              <cylinderGeometry args={[0.12, 0.09, 0.08, 12]} />
              <meshStandardMaterial
                color="#fff0d0"
                emissive="#ffe0a8"
                emissiveIntensity={0.85}
              />
            </mesh>
            {lod === "full" ? (
              <pointLight
                position={[0, -0.6, 0]}
                intensity={0.22}
                distance={3.8}
                color="#ffe6c0"
              />
            ) : null}
          </group>
        ))}
      </group>

      {/* TV wall */}
      <group position={CONFERENCE.tvWall}>
        <mesh castShadow>
          <boxGeometry args={[4.8, 2.4, 0.12]} />
          <meshStandardMaterial color="#0c1016" metalness={0.45} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.07]}>
          <boxGeometry args={[4.5, 2.15, 0.04]} />
          <meshStandardMaterial
            color="#4DA3FF"
            emissive="#4DA3FF"
            emissiveIntensity={0.55}
            metalness={0.1}
            roughness={0.2}
          />
        </mesh>
        {showLabels ? (
          <Html position={[0, 1.45, 0.1]} center distanceFactor={14} style={{ pointerEvents: "none" }}>
            <div
              style={{
                color: "#e8f4ff",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 0.04,
                textShadow: "0 1px 6px rgba(0,0,0,0.7)",
                whiteSpace: "nowrap",
              }}
            >
              All-Hands · கூட்டம்
            </div>
          </Html>
        ) : null}
      </group>

      {/* Ideas board */}
      <group position={CONFERENCE.ideasBoard} rotation={[0, -Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.4, 1.8, 0.08]} />
          <meshStandardMaterial color="#161c24" roughness={0.55} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[2.2, 1.6, 0.02]} />
          <meshStandardMaterial color="#1e2630" roughness={0.7} />
        </mesh>
        {showLabels ? (
          <Html position={[0, 1.05, 0.08]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
            <div
              style={{
                color: "#f0e6d2",
                fontSize: 12,
                fontWeight: 600,
                textShadow: "0 1px 5px rgba(0,0,0,0.65)",
                whiteSpace: "nowrap",
              }}
            >
              Ideas · யோசனைகள்
            </div>
          </Html>
        ) : null}
        {Array.from({ length: stickyCount }, (_, i) => {
          const [sx, sy] = STICKY_LAYOUT[i]!;
          const color = STICKY_COLORS[i % STICKY_COLORS.length]!;
          return (
            <mesh key={`sticky-${i}`} position={[sx, sy, 0.07]} castShadow>
              <boxGeometry args={[0.28, 0.28, 0.02]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.25}
                roughness={0.55}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
