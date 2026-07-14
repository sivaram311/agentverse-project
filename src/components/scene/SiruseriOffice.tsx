"use client";

import { INDUSTRIAL_BOUNDS, PALETTE } from "@/lib/office-palette";

/** Alias for importers — syncs with INDUSTRIAL_BOUNDS / OFFICE_BOUNDS. */
export const SIRUSERI = INDUSTRIAL_BOUNDS;

function WindowWall({
  position,
  size,
  yaw = 0,
  lod,
}: {
  position: [number, number, number];
  size: [number, number];
  yaw?: number;
  lod: "full" | "simple";
}) {
  const [w, h] = size;
  const panes = lod === "simple" ? 3 : 5;
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial
          color={PALETTE.glass}
          transparent
          opacity={0.22}
          transmission={lod === "full" ? 0.65 : 0}
          roughness={0.06}
          metalness={0.02}
          side={2}
        />
      </mesh>
      {Array.from({ length: panes }, (_, i) => {
        const t = -0.5 + (i + 0.5) / panes;
        return (
          <mesh key={i} position={[t * w, 0, 0.02]}>
            <boxGeometry args={[0.06, h, 0.05]} />
            <meshStandardMaterial color={PALETTE.wallPure} metalness={0.15} roughness={0.55} />
          </mesh>
        );
      })}
      <mesh position={[0, h / 2 - 0.05, 0.02]}>
        <boxGeometry args={[w, 0.1, 0.06]} />
        <meshStandardMaterial color={PALETTE.wallPure} roughness={0.5} />
      </mesh>
      <mesh position={[0, -h / 2 + 0.05, 0.02]}>
        <boxGeometry args={[w, 0.1, 0.06]} />
        <meshStandardMaterial color={PALETTE.wallPure} roughness={0.5} />
      </mesh>
      {/* White roller blinds — partially down from each pane top */}
      {Array.from({ length: panes }, (_, i) => {
        const t = -0.5 + (i + 0.5) / panes;
        const paneW = w / panes;
        const drop = h * 0.36;
        return (
          <mesh key={`blind-${i}`} position={[t * w, h / 2 - drop / 2 - 0.06, 0.045]}>
            <boxGeometry args={[paneW * 0.86, drop, 0.022]} />
            <meshStandardMaterial color={PALETTE.wallPure} roughness={0.88} />
          </mesh>
        );
      })}
      {/* Soft exterior sky wash */}
      <mesh position={[0, 0.2, -0.4]}>
        <planeGeometry args={[w * 1.15, h * 1.2]} />
        <meshBasicMaterial color={PALETTE.skylight} />
      </mesh>
    </group>
  );
}

/** Short white-framed glass room divider (~2.2m) with teal/white baseboard. */
function GlassPartition({
  position,
  yaw = 0,
  width = 2.2,
  lod,
}: {
  position: [number, number, number];
  yaw?: number;
  width?: number;
  lod: "full" | "simple";
}) {
  const h = 2.2;
  const glassH = h - 0.14;
  const frame = 0.045;
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.07 + glassH / 2, 0]}>
        <boxGeometry args={[width - frame * 2, glassH, 0.028]} />
        <meshPhysicalMaterial
          color={PALETTE.glass}
          transparent
          opacity={0.2}
          transmission={lod === "full" ? 0.55 : 0}
          roughness={0.07}
          metalness={0.04}
        />
      </mesh>
      {/* White frame rails */}
      <mesh position={[0, h - frame / 2, 0]}>
        <boxGeometry args={[width, frame, 0.05]} />
        <meshStandardMaterial color={PALETTE.wallPure} roughness={0.45} metalness={0.12} />
      </mesh>
      <mesh position={[-width / 2 + frame / 2, 0.07 + glassH / 2, 0]}>
        <boxGeometry args={[frame, glassH, 0.05]} />
        <meshStandardMaterial color={PALETTE.wallPure} roughness={0.45} metalness={0.12} />
      </mesh>
      <mesh position={[width / 2 - frame / 2, 0.07 + glassH / 2, 0]}>
        <boxGeometry args={[frame, glassH, 0.05]} />
        <meshStandardMaterial color={PALETTE.wallPure} roughness={0.45} metalness={0.12} />
      </mesh>
      {/* Teal / white baseboard */}
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[width, 0.07, 0.06]} />
        <meshStandardMaterial color={PALETTE.wallPure} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.085, 0.01]}>
        <boxGeometry args={[width * 0.98, 0.03, 0.04]} />
        <meshStandardMaterial color={PALETTE.tealAccent} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Pillar({
  position,
  outlets = false,
}: {
  position: [number, number, number];
  outlets?: boolean;
}) {
  const h = INDUSTRIAL_BOUNDS.ceilingY;
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, h, 0.55]} />
        <meshStandardMaterial color={PALETTE.wallPure} roughness={0.55} metalness={0.05} />
      </mesh>
      {outlets ? (
        <group position={[0.28, 0.55, 0]}>
          <mesh>
            <boxGeometry args={[0.02, 0.22, 0.28]} />
            <meshStandardMaterial color={PALETTE.outlet} roughness={0.7} />
          </mesh>
          <mesh position={[0.02, 0.04, -0.06]}>
            <boxGeometry args={[0.02, 0.06, 0.06]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0.02, 0.04, 0.06]}>
            <boxGeometry args={[0.02, 0.06, 0.06]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}

/**
 * Bright industrial open-plan shell — white walls, polished floor, pillars, windows,
 * roller blinds, short glass dividers, and subtle floor wear.
 * Ceiling structure owned by IndustrialCeiling (Track B).
 */
export function SiruseriOffice({
  lod = "full",
  reducedMotion = false,
}: {
  lod?: "full" | "simple";
  reducedMotion?: boolean;
}) {
  void reducedMotion;
  const { halfW, backZ, openZ, ceilingY, wallT } = INDUSTRIAL_BOUNDS;
  const depth = openZ - backZ;
  const midZ = (openZ + backZ) / 2;

  const pillars: { pos: [number, number, number]; outlets?: boolean }[] = [
    { pos: [-5.2, 0, -3.5] },
    { pos: [5.2, 0, -3.5] },
    { pos: [-5.2, 0, 2.8], outlets: true },
    { pos: [5.2, 0, 2.8] },
    { pos: [0, 0, -6.2] },
    { pos: [-3.2, 0, 5.2] },
  ];

  /** Background short glass dividers (not full walls). */
  const partitions: { pos: [number, number, number]; yaw: number; w: number }[] = [
    { pos: [-4.1, 0, -5.8], yaw: 0.12, w: 2.35 },
    { pos: [4.4, 0, -5.2], yaw: -0.28, w: 2.1 },
    { pos: [0.8, 0, -7.4], yaw: 0.04, w: 1.85 },
  ];

  /** Subtle floor scuffs on open-edge mid + pillar walkways. */
  const scuffs: { pos: [number, number, number]; size: [number, number]; yaw: number }[] = [
    { pos: [0.2, 0.014, openZ - 1.4], size: [2.1, 0.11], yaw: 0.06 },
    { pos: [-1.8, 0.014, openZ - 2.6], size: [1.5, 0.08], yaw: -0.22 },
    { pos: [2.4, 0.014, openZ - 2.1], size: [1.35, 0.07], yaw: 0.35 },
    { pos: [0, 0.014, -0.4], size: [1.9, 0.09], yaw: 0.02 },
    { pos: [-2.6, 0.014, -3.5], size: [2.4, 0.07], yaw: 0.01 },
    { pos: [2.8, 0.014, -3.4], size: [2.2, 0.06], yaw: -0.03 },
    { pos: [-2.4, 0.014, 2.7], size: [1.7, 0.07], yaw: 0.08 },
    { pos: [1.2, 0.014, 1.1], size: [1.1, 0.06], yaw: 0.55 },
  ];

  return (
    <group>
      {/* Polished light floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, midZ]} receiveShadow>
        <planeGeometry args={[halfW * 2.15, depth + 1.6]} />
        <meshStandardMaterial
          color={PALETTE.floor}
          metalness={0.35}
          roughness={0.18}
          envMapIntensity={1.1}
        />
      </mesh>
      {lod === "full"
        ? [-7, -3.5, 0, 3.5, 7].map((x) => (
            <mesh key={`gx-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.012, midZ]}>
              <planeGeometry args={[0.015, depth]} />
              <meshStandardMaterial color={PALETTE.floorTint} transparent opacity={0.5} />
            </mesh>
          ))
        : null}

      {/* Minor floor scuff marks — high-traffic paths */}
      {lod === "full"
        ? scuffs.map((s, i) => (
            <mesh
              key={`scuff-${i}`}
              rotation={[-Math.PI / 2, 0, s.yaw]}
              position={s.pos}
            >
              <planeGeometry args={s.size} />
              <meshStandardMaterial
                color={PALETTE.ceilingBeam}
                transparent
                opacity={0.07}
                depthWrite={false}
              />
            </mesh>
          ))
        : null}

      {/* Side walls */}
      <mesh position={[-halfW, ceilingY / 2, midZ]} castShadow receiveShadow>
        <boxGeometry args={[wallT, ceilingY, depth]} />
        <meshStandardMaterial color={PALETTE.wall} roughness={0.82} metalness={0.02} />
      </mesh>
      <mesh position={[halfW, ceilingY / 2, midZ]} castShadow receiveShadow>
        <boxGeometry args={[wallT, ceilingY, depth]} />
        <meshStandardMaterial color={PALETTE.wall} roughness={0.82} metalness={0.02} />
      </mesh>

      {/* Teal lower accent strips */}
      <mesh position={[-halfW + 0.02, 0.2, midZ]}>
        <boxGeometry args={[0.04, 0.4, depth * 0.75]} />
        <meshStandardMaterial color={PALETTE.tealAccent} roughness={0.45} />
      </mesh>
      <mesh position={[halfW - 0.02, 0.2, midZ]}>
        <boxGeometry args={[0.04, 0.4, depth * 0.55]} />
        <meshStandardMaterial color={PALETTE.tealAccent} roughness={0.45} />
      </mesh>

      {/* Back wall — solid bands + window */}
      <mesh position={[0, 0.35, backZ]} castShadow>
        <boxGeometry args={[halfW * 2, 0.7, wallT]} />
        <meshStandardMaterial color={PALETTE.wall} roughness={0.8} />
      </mesh>
      <mesh position={[0, ceilingY - 0.3, backZ]} castShadow>
        <boxGeometry args={[halfW * 2, 0.55, wallT]} />
        <meshStandardMaterial color={PALETTE.wallPure} roughness={0.75} />
      </mesh>
      <WindowWall
        position={[0, 2.15, backZ + 0.06]}
        size={[halfW * 1.8, 2.85]}
        lod={lod}
      />

      {/* Open-edge low rail (entry) */}
      <mesh position={[0, 0.15, openZ]} castShadow>
        <boxGeometry args={[halfW * 1.6, 0.3, 0.12]} />
        <meshStandardMaterial color={PALETTE.wallPure} roughness={0.6} />
      </mesh>

      {/* Thin soffit edge only — full ceiling is IndustrialCeiling */}
      <mesh position={[0, ceilingY - 0.02, midZ]}>
        <boxGeometry args={[halfW * 2 - 0.4, 0.04, depth - 0.2]} />
        <meshStandardMaterial color={PALETTE.wallPure} roughness={0.9} transparent opacity={0.15} />
      </mesh>

      {pillars.map((p, i) => (
        <Pillar key={`p-${i}`} position={p.pos} outlets={p.outlets} />
      ))}

      {/* Short glass partition planes — background room dividers */}
      {partitions.map((p, i) => (
        <GlassPartition
          key={`gp-${i}`}
          position={p.pos}
          yaw={p.yaw}
          width={p.w}
          lod={lod}
        />
      ))}

      {/* Cool window fill */}
      <directionalLight position={[0, 3.2, backZ - 3]} intensity={0.45} color={PALETTE.skylight} />
      <pointLight position={[0, 3.0, midZ]} intensity={0.2} distance={16} color="#ffffff" />
    </group>
  );
}
