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
      {/* Soft exterior sky wash */}
      <mesh position={[0, 0.2, -0.4]}>
        <planeGeometry args={[w * 1.15, h * 1.2]} />
        <meshBasicMaterial color={PALETTE.skylight} />
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
 * Bright industrial open-plan shell — white walls, polished floor, pillars, windows.
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

      {/* Cool window fill */}
      <directionalLight position={[0, 3.2, backZ - 3]} intensity={0.45} color={PALETTE.skylight} />
      <pointLight position={[0, 3.0, midZ]} intensity={0.2} distance={16} color="#ffffff" />
    </group>
  );
}
