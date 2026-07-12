"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";
import * as THREE from "three";
import { HumanoidFigure } from "./HumanoidFigure";
import {
  CorridorPlanters,
  EntrancePlaza,
  FilterCoffeePantry,
  FocusPod,
  HuddleRoom,
  OfficePlant,
} from "./OfficeDetails";

type Lod = "full" | "simple";

/** Shared tower metrics — keep camera-framing OFFICE_BOUNDS in sync. */
export const TOWER = {
  halfW: 9.0,
  backZ: -8.4,
  openZ: 6.2,
  floorH: 3.05,
  floors: 3,
  wallT: 0.2,
} as const;

export function towerHeight() {
  return TOWER.floorH * TOWER.floors;
}

function WallPanel({
  position,
  size,
  color = "#181c24",
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={0.22} roughness={0.72} />
    </mesh>
  );
}

function FloorSlab({
  y,
  en,
  ta,
}: {
  y: number;
  en: string;
  ta: string;
}) {
  const { halfW, backZ, openZ } = TOWER;
  const depth = openZ - backZ;
  const midZ = (openZ + backZ) / 2;
  return (
    <group>
      <mesh position={[0, y, midZ]} receiveShadow>
        <boxGeometry args={[halfW * 2 - 0.15, 0.12, depth]} />
        <meshStandardMaterial color="#141820" roughness={0.82} metalness={0.12} />
      </mesh>
      <mesh position={[0, y + 0.08, openZ - 0.05]}>
        <boxGeometry args={[halfW * 2 - 0.4, 0.06, 0.08]} />
        <meshStandardMaterial
          color="#E8A838"
          emissive="#E8A838"
          emissiveIntensity={0.45}
        />
      </mesh>
      <Html position={[-halfW + 1.1, y + 0.55, openZ - 0.3]} center distanceFactor={14}>
        <div className="floor-badge">
          <strong>{en}</strong>
          <span>{ta}</span>
        </div>
      </Html>
    </group>
  );
}

function WindowRow({
  floorY,
  lod,
}: {
  floorY: number;
  lod: Lod;
}) {
  const { halfW, backZ, floorH } = TOWER;
  const cy = floorY + floorH * 0.55;
  const h = floorH * 0.55;

  return (
    <group>
      <group position={[0, cy, backZ + 0.12]}>
        <WindowPane width={5.2} height={h} lod={lod} />
      </group>
      <group position={[-halfW + 0.12, cy, -2]} rotation={[0, Math.PI / 2, 0]}>
        <WindowPane width={3.0} height={h} lod={lod} />
      </group>
      <group position={[halfW - 0.12, cy, -2]} rotation={[0, -Math.PI / 2, 0]}>
        <WindowPane width={3.0} height={h} lod={lod} />
      </group>
      <group position={[-halfW + 0.12, cy, 2.5]} rotation={[0, Math.PI / 2, 0]}>
        <WindowPane width={2.4} height={h * 0.85} lod={lod} />
      </group>
      <group position={[halfW - 0.12, cy, 2.5]} rotation={[0, -Math.PI / 2, 0]}>
        <WindowPane width={2.4} height={h * 0.85} lod={lod} />
      </group>
    </group>
  );
}

function WindowPane({
  width,
  height,
  lod,
}: {
  width: number;
  height: number;
  lod: Lod;
}) {
  const glow = useRef<Mesh>(null);
  useFrame((state) => {
    if (!glow.current || lod === "simple") return;
    const mat = glow.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.32 + Math.sin(state.clock.elapsedTime * 0.55) * 0.05;
  });
  return (
    <group>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[width + 0.1, height + 0.1, 0.06]} />
        <meshStandardMaterial color="#0c1016" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh ref={glow} position={[0, 0, 0.05]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#1a2840"
          emissive="#3a6a9a"
          emissiveIntensity={0.38}
          transparent
          opacity={0.9}
        />
      </mesh>
      <pointLight position={[0, 0, 0.35]} intensity={0.15} distance={4} color="#7eb0ff" />
    </group>
  );
}

/** Decorative mini worker — sits and types, not interactive. */
function AmbientWorker({
  position,
  color,
  skin,
  hair,
  gender,
  phase,
  lod,
  yaw = Math.PI,
}: {
  position: [number, number, number];
  color: string;
  skin: string;
  hair: string;
  gender: "male" | "female";
  phase: number;
  lod: Lod;
  /** Face the desk (default toward −Z) */
  yaw?: number;
}) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <HumanoidFigure
        look={{ accent: color, skin, hair, gender, lod }}
        sitting
        active={false}
        wavePhase={0}
        phase={phase}
        working
        scale={0.62}
      />
    </group>
  );
}

function MiniDesk({
  position,
  color,
  yaw = 0,
}: {
  position: [number, number, number];
  color: string;
  yaw?: number;
}) {
  const screen = useRef<Mesh>(null);
  useFrame((state) => {
    if (!screen.current) return;
    const mat = screen.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 2.2 + position[0]) * 0.12;
  });
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[0.85, 0.03, 0.5]} />
        <meshStandardMaterial color="#101820" metalness={0.5} roughness={0.3} />
      </mesh>
      {(
        [
          [-0.35, 0.24, -0.18],
          [0.35, 0.24, -0.18],
          [-0.35, 0.24, 0.18],
          [0.35, 0.24, 0.18],
        ] as [number, number, number][]
      ).map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.04, 0.48, 0.04]} />
          <meshStandardMaterial color="#0c121a" />
        </mesh>
      ))}
      <mesh position={[0, 0.26, 0.32]} castShadow>
        <boxGeometry args={[0.26, 0.04, 0.24]} />
        <meshStandardMaterial color="#172030" />
      </mesh>
      <mesh ref={screen} position={[0, 0.78, -0.18]} castShadow>
        <boxGeometry args={[0.48, 0.3, 0.025]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.45}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh position={[0, 0.51, 0.05]}>
        <boxGeometry args={[0.3, 0.015, 0.12]} />
        <meshStandardMaterial color="#0a1018" />
      </mesh>
    </group>
  );
}

function GlassCabinBay({
  floorY,
  lod,
}: {
  floorY: number;
  lod: Lod;
}) {
  const cabins = useMemo(
    () =>
      [
        { x: -5.0, color: "#4DA3FF", skin: "#D4A574", hair: "#1A120C", gender: "male" as const },
        { x: 0, color: "#C4A35A", skin: "#D2A07A", hair: "#1C1410", gender: "male" as const },
        { x: 5.0, color: "#FF6BCB", skin: "#F0D5C0", hair: "#3D2314", gender: "female" as const },
      ] as const,
    [],
  );

  return (
    <group position={[0, floorY, TOWER.backZ + 1.5]}>
      {cabins.map((c, i) => (
        <group key={i} position={[c.x, 0, 0]}>
          {/* Frosted cabin shell */}
          <mesh position={[0, 1.2, -0.85]}>
            <boxGeometry args={[2.1, 2.35, 0.04]} />
            <meshPhysicalMaterial
              color="#9ec4d8"
              transparent
              opacity={0.22}
              transmission={lod === "full" ? 0.4 : 0}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[-1.0, 1.2, 0]}>
            <boxGeometry args={[0.04, 2.35, 1.7]} />
            <meshPhysicalMaterial color="#9ec4d8" transparent opacity={0.18} roughness={0.1} />
          </mesh>
          <mesh position={[1.0, 1.2, 0]}>
            <boxGeometry args={[0.04, 2.35, 1.7]} />
            <meshPhysicalMaterial color="#9ec4d8" transparent opacity={0.18} roughness={0.1} />
          </mesh>
          <MiniDesk position={[0, 0, -0.15]} color={c.color} yaw={Math.PI} />
          <AmbientWorker
            position={[0, 0, 0.28]}
            color={c.color}
            skin={c.skin}
            hair={c.hair}
            gender={c.gender}
            phase={i * 2.1}
            lod={lod}
          />
          <mesh position={[0, 2.35, 0.7]}>
            <boxGeometry args={[0.7, 0.12, 0.03]} />
            <meshStandardMaterial color={c.color} emissive={c.color} emissiveIntensity={0.5} />
          </mesh>
          <pointLight position={[0, 1.8, 0]} intensity={0.2} distance={3} color={c.color} />
        </group>
      ))}
      {/* Side wall display */}
      <group position={[TOWER.halfW - 0.35, 1.5, 2.2]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[2.2, 1.2, 0.06]} />
          <meshStandardMaterial color="#0a0e14" metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[2.0, 1.05]} />
          <meshStandardMaterial
            color="#1a3048"
            emissive="#3ddc97"
            emissiveIntensity={0.45}
          />
        </mesh>
      </group>
    </group>
  );
}

function LabOpsFloor({ floorY, lod }: { floorY: number; lod: Lod }) {
  const spin = useRef<Group>(null);
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.35;
  });

  return (
    <group position={[0, floorY, 0]}>
      {/* Device rack bay */}
      <group position={[TOWER.halfW - 2.2, 0, 2.5]}>
        <mesh position={[0, 0.7, -0.6]}>
          <boxGeometry args={[2.8, 1.4, 0.1]} />
          <meshStandardMaterial color="#151a22" />
        </mesh>
        {[-0.8, 0, 0.8].map((x, i) => (
          <mesh key={i} position={[x, 0.95, -0.2]} castShadow>
            <boxGeometry args={[0.22, 0.4, 0.03]} />
            <meshStandardMaterial
              color="#5EEAD4"
              emissive="#5EEAD4"
              emissiveIntensity={0.45 + i * 0.05}
            />
          </mesh>
        ))}
        <MiniDesk position={[-0.5, 0, 0.35]} color="#5EEAD4" yaw={Math.PI} />
        <AmbientWorker
          position={[-0.5, 0, 0.72]}
          color="#5EEAD4"
          skin="#C48A62"
          hair="#2B1C12"
          gender="male"
          phase={4.2}
          lod={lod}
        />
        <pointLight position={[0, 2.0, 0]} intensity={0.3} distance={4} color="#5EEAD4" />
      </group>

      {/* Lounge + ops orb */}
      <group position={[-TOWER.halfW + 2.4, 0, 2.8]}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[1.6, 0.35, 0.65]} />
          <meshStandardMaterial color="#2a2018" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.55, -0.22]} castShadow>
          <boxGeometry args={[1.6, 0.4, 0.18]} />
          <meshStandardMaterial color="#32261c" />
        </mesh>
        <AmbientWorker
          position={[0.35, 0, 0.15]}
          color="#FF8F5A"
          skin="#E8B896"
          hair="#4A2C1A"
          gender="female"
          phase={3.3}
          lod={lod}
        />
      </group>

      {/* Floating project orbs */}
      <group ref={spin} position={[0, 1.6, -1.5]}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 1.1, Math.sin(i) * 0.15, Math.sin(a) * 1.1]}
              castShadow
            >
              <icosahedronGeometry args={[0.18, 0]} />
              <meshStandardMaterial
                color={["#E8A838", "#4DA3FF", "#3DDC97"][i]}
                emissive={["#E8A838", "#4DA3FF", "#3DDC97"][i]}
                emissiveIntensity={0.55}
                metalness={0.6}
                roughness={0.2}
              />
            </mesh>
          );
        })}
      </group>

      <MiniDesk position={[1.5, 0, -2.5]} color="#3DDC97" yaw={Math.PI} />
      <AmbientWorker
        position={[1.5, 0, -2.1]}
        color="#3DDC97"
        skin="#C9956C"
        hair="#241810"
        gender="male"
        phase={5.1}
        lod={lod}
      />
    </group>
  );
}

function L1Amenities({ lod }: { lod: Lod }) {
  const { halfW, openZ } = TOWER;
  return (
    <group>
      {/* Entry door on left */}
      <group position={[-halfW + 0.12, 0, 4.2]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 1.15, 0]} castShadow>
          <boxGeometry args={[1.1, 2.3, 0.1]} />
          <meshStandardMaterial color="#10161e" metalness={0.4} />
        </mesh>
        <mesh position={[0, 1.15, 0.04]}>
          <planeGeometry args={[0.85, 1.95]} />
          <meshPhysicalMaterial
            color="#88aabc"
            transparent
            opacity={0.35}
            transmission={0.35}
            roughness={0.1}
          />
        </mesh>
      </group>

      <FilterCoffeePantry position={[halfW - 2.4, 0, 4.0]} lod={lod} />

      <HuddleRoom
        position={[-halfW + 2.6, 0, -4.5]}
        title="Huddle"
        titleTa="கூட்டம்"
        accent="#4DA3FF"
        lod={lod}
      />
      <HuddleRoom
        position={[halfW - 2.6, 0, -4.5]}
        title="War Room"
        titleTa="திட்ட அறை"
        accent="#FF6BCB"
        lod={lod}
      />

      <FocusPod position={[-6.5, 0, 1.5]} yaw={0.4} />
      <FocusPod position={[6.5, 0, 1.2]} yaw={-0.35} />

      {lod === "full" ? (
        <group position={[-halfW + 2.0, 0, 3.2]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[1.4, 0.3, 0.55]} />
            <meshStandardMaterial color="#2a2018" roughness={0.8} />
          </mesh>
          <OfficePlant position={[0.7, 0.4, 0]} scale={0.85} variant={2} />
        </group>
      ) : null}

      <mesh position={[0, 0.08, openZ - 0.2]}>
        <boxGeometry args={[2.2, 0.16, 0.08]} />
        <meshStandardMaterial color="#0c1016" metalness={0.4} />
      </mesh>

      {/* Kolam accent near entry */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 6]} position={[-halfW + 1.8, 0.04, 5.2]}>
        <ringGeometry args={[0.35, 0.42, 6]} />
        <meshStandardMaterial
          color="#E8A838"
          emissive="#E8A838"
          emissiveIntensity={0.3}
          transparent
          opacity={0.45}
        />
      </mesh>
    </group>
  );
}

/**
 * Cutaway 3-story AgentVerse HQ:
 * L1 collab floor (hex + live personas live here),
 * L2 glass cabins with ambient workers,
 * L3 device lab / ops with ambient activity.
 */
export function OfficeTower({ lod = "full" }: { lod?: Lod }) {
  const { halfW, backZ, openZ, floorH, floors, wallT } = TOWER;
  const depth = openZ - backZ;
  const midZ = (openZ + backZ) / 2;
  const H = floorH * floors;

  const cans = useMemo(() => {
    const list: [number, number, number][] = [];
    for (let f = 0; f < floors; f++) {
      const y = f * floorH + floorH - 0.08;
      for (let x = -5; x <= 5; x += 5) {
        for (let z = -4; z <= 3; z += 3.5) {
          list.push([x, y, z]);
        }
      }
    }
    return list;
  }, [floorH, floors]);

  return (
    <group>
      {/* Structural walls — full tower height, open south */}
      <WallPanel
        position={[0, H / 2, backZ]}
        size={[halfW * 2, H, wallT]}
      />
      <WallPanel
        position={[-halfW, H / 2, midZ]}
        size={[wallT, H, depth]}
      />
      <WallPanel
        position={[halfW, H / 2, midZ]}
        size={[wallT, H, depth]}
      />

      {/* Roof */}
      <mesh position={[0, H + 0.08, midZ]} castShadow receiveShadow>
        <boxGeometry args={[halfW * 2.05, 0.16, depth + 0.3]} />
        <meshStandardMaterial color="#10141c" metalness={0.35} roughness={0.55} />
      </mesh>
      {/* Roof edge glow */}
      <mesh position={[0, H + 0.12, openZ]}>
        <boxGeometry args={[halfW * 2, 0.06, 0.1]} />
        <meshStandardMaterial color="#FF6200" emissive="#FF6200" emissiveIntensity={0.4} />
      </mesh>

      {/* Floor plates + bilingual badges */}
      <FloorSlab y={0.02} en="L1 · Collab" ta="ஒத்துழைப்பு" />
      <FloorSlab y={floorH} en="L2 · Cabins" ta="அறைகள்" />
      <FloorSlab y={floorH * 2} en="L3 · Lab / Ops" ta="ஆய்வகம்" />

      {/* Per-floor windows */}
      {[0, 1, 2].map((f) => (
        <WindowRow key={f} floorY={f * floorH} lod={lod} />
      ))}

      <CorridorPlanters floorY={0} z={4.6} />
      <CorridorPlanters floorY={floorH} z={4.2} />
      <CorridorPlanters floorY={floorH * 2} z={3.8} />

      {/* Cutaway railings on each upper floor edge */}
      {[1, 2].map((f) => (
        <group key={`rail-${f}`} position={[0, f * floorH + 0.55, openZ - 0.08]}>
          <mesh>
            <boxGeometry args={[halfW * 1.7, 0.04, 0.04]} />
            <meshStandardMaterial color="#c8d0d8" metalness={0.6} roughness={0.3} />
          </mesh>
          {[-4, -2, 0, 2, 4].map((x) => (
            <mesh key={x} position={[x, -0.25, 0]}>
              <boxGeometry args={[0.03, 0.5, 0.03]} />
              <meshStandardMaterial color="#a8b0b8" metalness={0.5} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Recessed ceiling cans — color drifts with tunable lighting elsewhere */}
      {cans.map((p, i) => (
        <group key={`can-${i}`} position={p}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.14, 0.05, 10]} />
            <meshStandardMaterial color="#0a0e14" />
          </mesh>
          <mesh position={[0, -0.03, 0]}>
            <circleGeometry args={[0.09, 10]} />
            <meshStandardMaterial
              color="#fff2d6"
              emissive="#ffe6b0"
              emissiveIntensity={0.75}
            />
          </mesh>
          {lod === "full" && i % 3 === 0 ? (
            <pointLight position={[0, -0.15, 0]} intensity={0.12} distance={4} color="#ffe8c8" />
          ) : null}
        </group>
      ))}

      <L1Amenities lod={lod} />
      <GlassCabinBay floorY={floorH} lod={lod} />
      <LabOpsFloor floorY={floorH * 2} lod={lod} />
      <EntrancePlaza lod={lod} />

      {/* Soft tower fill */}
      <pointLight position={[0, floorH * 0.6, 0]} intensity={0.35} distance={12} color="#ffe6c8" />
      <pointLight position={[0, floorH * 1.5, -1]} intensity={0.3} distance={11} color="#c8e0ff" />
      <pointLight position={[0, floorH * 2.4, 1]} intensity={0.28} distance={10} color="#a8ffe0" />
    </group>
  );
}

/** @deprecated alias — HubScene may import either name */
export const OfficeInterior = OfficeTower;
