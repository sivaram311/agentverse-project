"use client";

import { INDUSTRIAL_BOUNDS, PALETTE } from "@/lib/office-palette";

type Lod = "full" | "simple";

const LOCKER_COLORS = [
  PALETTE.lockerBlue,
  PALETTE.lockerGreen,
  PALETTE.lockerYellow,
  PALETTE.lockerWhite,
] as const;

/** Typical Track-A pillar stations — storage sits in the bays between them. */
const PILLAR_XS = [-7, -3.5, 0, 3.5, 7] as const;
const PILLAR_ZS = [-6.5, -2.5, 1.5, 5] as const;

function bayCenters(stations: readonly number[]): number[] {
  return stations.slice(0, -1).map((a, i) => (a + stations[i + 1]) / 2);
}

function MetalLockerBank({
  position,
  yaw = 0,
  units = 4,
  height = 1.85,
}: {
  position: [number, number, number];
  yaw?: number;
  units?: number;
  height?: number;
}) {
  const unitW = 0.38;
  const depth = 0.42;
  const totalW = units * unitW;
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Back shell */}
      <mesh position={[0, height / 2, -depth / 2 + 0.02]} castShadow receiveShadow>
        <boxGeometry args={[totalW + 0.04, height, 0.04]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.55} roughness={0.35} />
      </mesh>
      {Array.from({ length: units }, (_, i) => {
        const x = -totalW / 2 + unitW / 2 + i * unitW;
        const color = LOCKER_COLORS[i % LOCKER_COLORS.length];
        return (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[unitW - 0.02, height - 0.04, depth]} />
              <meshStandardMaterial
                color={color}
                metalness={0.45}
                roughness={0.32}
              />
            </mesh>
            {/* Door seam */}
            <mesh position={[0, height / 2, depth / 2 + 0.005]}>
              <boxGeometry args={[0.01, height - 0.12, 0.01]} />
              <meshStandardMaterial color="#64748B" metalness={0.6} roughness={0.4} />
            </mesh>
            {/* Handle */}
            <mesh position={[unitW * 0.28, height * 0.55, depth / 2 + 0.02]} castShadow>
              <boxGeometry args={[0.04, 0.1, 0.025]} />
              <meshStandardMaterial color="#CBD5E1" metalness={0.75} roughness={0.25} />
            </mesh>
            {/* Vent slots (top) */}
            <mesh position={[0, height - 0.12, depth / 2 + 0.008]}>
              <boxGeometry args={[unitW * 0.55, 0.04, 0.01]} />
              <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.5} />
            </mesh>
          </group>
        );
      })}
      {/* Plinth */}
      <mesh position={[0, 0.04, 0]} castShadow>
        <boxGeometry args={[totalW + 0.06, 0.08, depth + 0.04]} />
        <meshStandardMaterial color="#64748B" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

function WhiteCabinet({
  position,
  yaw = 0,
  width = 1.6,
  height = 0.95,
  depth = 0.48,
}: {
  position: [number, number, number];
  yaw?: number;
  width?: number;
  height?: number;
  depth?: number;
}) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={PALETTE.wallPure} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Counter top */}
      <mesh position={[0, height + 0.025, 0]} castShadow>
        <boxGeometry args={[width + 0.04, 0.05, depth + 0.04]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.4} metalness={0.08} />
      </mesh>
      {/* Door gaps */}
      {[-width * 0.25, width * 0.25].map((x, i) => (
        <mesh key={i} position={[x, height * 0.48, depth / 2 + 0.005]}>
          <boxGeometry args={[width * 0.42, height * 0.72, 0.015]} />
          <meshStandardMaterial color="#EEF2F7" roughness={0.5} />
        </mesh>
      ))}
      {/* Handles */}
      {[-width * 0.08, width * 0.08].map((x, i) => (
        <mesh key={i} position={[x, height * 0.5, depth / 2 + 0.02]}>
          <boxGeometry args={[0.03, 0.12, 0.02]} />
          <meshStandardMaterial color={PALETTE.tealAccent} metalness={0.35} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function BlueFrameWhiteboard({
  position,
  yaw = 0,
  width = 2.4,
  height = 1.35,
}: {
  position: [number, number, number];
  yaw?: number;
  width?: number;
  height?: number;
}) {
  const frame = 0.06;
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Bright blue frame */}
      <mesh castShadow>
        <boxGeometry args={[width + frame * 2, height + frame * 2, 0.05]} />
        <meshStandardMaterial
          color={PALETTE.whiteboardFrame}
          metalness={0.25}
          roughness={0.4}
        />
      </mesh>
      {/* Board surface */}
      <mesh position={[0, 0, 0.028]}>
        <boxGeometry args={[width, height, 0.02]} />
        <meshStandardMaterial color={PALETTE.whiteboard} roughness={0.35} metalness={0.02} />
      </mesh>
      {/* Marker tray */}
      <mesh position={[0, -height / 2 - 0.04, 0.06]} castShadow>
        <boxGeometry args={[width * 0.55, 0.04, 0.08]} />
        <meshStandardMaterial color={PALETTE.whiteboardFrame} metalness={0.2} roughness={0.45} />
      </mesh>
    </group>
  );
}

/**
 * Perimeter storage + whiteboards for the bright industrial plate.
 * Mount from HubScene (Track Hub); do not self-wire.
 */
export function OfficeStorage({ lod = "full" }: { lod?: Lod }) {
  const { halfW, backZ, openZ, wallT } = INDUSTRIAL_BOUNDS;
  const wallInset = wallT / 2 + 0.28;
  const leftX = -halfW + wallInset;
  const rightX = halfW - wallInset;
  const backZPos = backZ + wallInset + 0.15;
  const backBoardZ = backZ + wallT / 2 + 0.06;
  const midZ = (openZ + backZ) / 2;
  const sideBaysZ = bayCenters(PILLAR_ZS);
  const backBaysX = bayCenters(PILLAR_XS).filter((x) => Math.abs(x) > 0.5);

  return (
    <group name="office-storage">
      {/* Multicolor lockers — left wall bays (skip near mid for walkways) */}
      {sideBaysZ
        .filter((z) => Math.abs(z - midZ) > 1.0)
        .map((z, i) => (
          <MetalLockerBank
            key={`lock-L-${i}`}
            position={[leftX, 0, z]}
            yaw={Math.PI / 2}
            units={lod === "simple" ? 3 : 4}
          />
        ))}

      {/* Multicolor lockers — right wall, rear half only */}
      {sideBaysZ
        .filter((z) => z < midZ - 0.5)
        .map((z, i) => (
          <MetalLockerBank
            key={`lock-R-${i}`}
            position={[rightX, 0, z]}
            yaw={-Math.PI / 2}
            units={lod === "simple" ? 3 : 4}
          />
        ))}

      {/* White low cabinets along back wall (between pillars) */}
      {backBaysX.map((x, i) => (
        <WhiteCabinet
          key={`cab-back-${i}`}
          position={[x, 0, backZPos]}
          yaw={0}
          width={lod === "simple" ? 1.35 : 1.55}
        />
      ))}

      {/* Side-wall cabinet near open end */}
      <WhiteCabinet
        position={[leftX, 0, openZ - 2.8]}
        yaw={Math.PI / 2}
        width={1.4}
        height={0.9}
      />
      {lod === "full" ? (
        <WhiteCabinet
          position={[rightX, 0, openZ - 3.2]}
          yaw={-Math.PI / 2}
          width={1.4}
          height={0.9}
        />
      ) : null}

      {/* Large blue-frame whiteboards — lod simple keeps only the primary pair */}
      <BlueFrameWhiteboard
        position={[0, 1.65, backBoardZ]}
        width={2.8}
        height={1.45}
      />
      <BlueFrameWhiteboard
        position={[leftX + 0.05, 1.7, -2.2]}
        yaw={Math.PI / 2}
        width={2.2}
        height={1.3}
      />
      {lod === "full" ? (
        <>
          <BlueFrameWhiteboard
            position={[rightX - 0.05, 1.7, -1.5]}
            yaw={-Math.PI / 2}
            width={2.0}
            height={1.25}
          />
          <BlueFrameWhiteboard
            position={[-4.2, 1.6, backBoardZ]}
            width={1.8}
            height={1.15}
          />
          <BlueFrameWhiteboard
            position={[4.2, 1.6, backBoardZ]}
            width={1.8}
            height={1.15}
          />
        </>
      ) : null}
    </group>
  );
}
