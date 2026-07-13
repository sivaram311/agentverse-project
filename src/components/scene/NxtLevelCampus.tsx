"use client";

import { Html } from "@react-three/drei";
import { HQ_BOUNDS, type OfficeLod } from "@/lib/office-layout";
import * as THREE from "three";

function TurnstileLane({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.35, 1.1, 0.35]} />
        <meshStandardMaterial color="#121820" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.05, 0.15]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.55, 0.08, 0.12]} />
        <meshStandardMaterial color="#1a222c" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.85, -0.05]}>
        <boxGeometry args={[0.12, 0.12, 0.06]} />
        <meshStandardMaterial
          color="#0c1016"
          emissive="#3DDC97"
          emissiveIntensity={0.7}
        />
      </mesh>
    </group>
  );
}

/** Secure lobby gate — visitor + employee lanes. */
function SecurityTurnstiles({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, -0.55]} castShadow>
        <boxGeometry args={[5.2, 1.1, 0.28]} />
        <meshStandardMaterial color="#161c24" metalness={0.3} roughness={0.5} />
      </mesh>
      {[-1.6, -0.55, 0.55, 1.6].map((x) => (
        <TurnstileLane key={x} x={x} />
      ))}
      <Html position={[0, 1.85, 0]} center distanceFactor={15}>
        <div className="zone-badge">Access · Turnstiles / biometric</div>
      </Html>
    </group>
  );
}

/** Tall glazed atrium at Nxt Level entry. */
function AtriumLobby({ lod }: { lod: OfficeLod }) {
  const { halfW, openZ, ceilingY } = HQ_BOUNDS;
  const atrDepth = 7.2;
  const midZ = openZ + atrDepth / 2;
  const atrH = ceilingY + 1.4;

  return (
    <group>
      {/* Polished atrium floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.012, midZ]}
        receiveShadow
      >
        <planeGeometry args={[halfW * 1.85, atrDepth]} />
        <meshStandardMaterial color="#0c1016" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Tall side glass */}
      {(
        [
          [-halfW * 0.92, Math.PI / 2],
          [halfW * 0.92, -Math.PI / 2],
        ] as [number, number][]
      ).map(([x, yaw], i) => (
        <group key={i} position={[x, atrH / 2, midZ]} rotation={[0, yaw, 0]}>
          <mesh>
            <planeGeometry args={[atrDepth * 0.92, atrH]} />
            <meshPhysicalMaterial
              color="#9ec8dc"
              transparent
              opacity={0.14}
              transmission={lod === "full" ? 0.5 : 0}
              roughness={0.08}
              metalness={0.05}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
      {/* Outer facade glass */}
      <mesh position={[0, atrH / 2, openZ + atrDepth - 0.1]}>
        <planeGeometry args={[halfW * 1.7, atrH]} />
        <meshPhysicalMaterial
          color="#9ec8dc"
          transparent
          opacity={0.16}
          transmission={lod === "full" ? 0.45 : 0}
          roughness={0.1}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Mullion grid */}
      {lod === "full"
        ? [-4, -1.3, 1.3, 4].map((x) => (
            <mesh key={x} position={[x, atrH / 2, openZ + atrDepth - 0.08]}>
              <boxGeometry args={[0.08, atrH, 0.06]} />
              <meshStandardMaterial color="#121820" metalness={0.5} />
            </mesh>
          ))
        : null}
      {/* Atrium ceiling slab */}
      <mesh position={[0, atrH, midZ]}>
        <boxGeometry args={[halfW * 1.8, 0.12, atrDepth]} />
        <meshStandardMaterial color="#10141a" metalness={0.25} roughness={0.75} />
      </mesh>
      {lod === "full"
        ? [-3, 0, 3].map((x) => (
            <pointLight
              key={x}
              position={[x, atrH - 0.4, midZ]}
              intensity={0.22}
              distance={8}
              color="#ffe8c8"
            />
          ))
        : null}
      <Html position={[0, atrH - 0.7, openZ + atrDepth - 0.5]} center distanceFactor={20}>
        <div className="plaza-brand">
          <strong>Nxt Level</strong>
          <span>Atrium lobby · Visitor management</span>
        </div>
      </Html>
    </group>
  );
}

/** SIPCOT-style cafeteria / food court wing. */
function CafeteriaWing({
  position,
  lod,
}: {
  position: [number, number, number];
  lod: OfficeLod;
}) {
  const tables =
    lod === "simple"
      ? [
          [0, 0],
          [1.8, 1.2],
        ]
      : [
          [-1.6, 0.2],
          [0.2, 0.2],
          [2.0, 0.2],
          [-0.8, 1.6],
          [1.2, 1.6],
        ];

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, 0.02, 0.8]} receiveShadow>
        <planeGeometry args={[6.2, 4.2]} />
        <meshStandardMaterial color="#141018" roughness={0.85} />
      </mesh>
      {/* Serving counter */}
      <mesh position={[-2.4, 0.55, -0.6]} castShadow>
        <boxGeometry args={[1.2, 1.05, 3.6]} />
        <meshStandardMaterial color="#1a1512" roughness={0.6} />
      </mesh>
      <mesh position={[-2.4, 1.1, -0.6]} castShadow>
        <boxGeometry args={[1.3, 0.06, 3.7]} />
        <meshStandardMaterial color="#2a2118" metalness={0.2} roughness={0.4} />
      </mesh>
      {tables.map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, 0.42, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.58, 0.06, 12]} />
            <meshStandardMaterial color="#a86a38" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.4, 8]} />
            <meshStandardMaterial color="#121820" metalness={0.4} />
          </mesh>
          {([-0.45, 0.45] as const).map((sx) => (
            <mesh key={sx} position={[sx, 0.28, 0.35]} castShadow>
              <boxGeometry args={[0.32, 0.08, 0.32]} />
              <meshStandardMaterial color="#243040" roughness={0.65} />
            </mesh>
          ))}
        </group>
      ))}
      <Html position={[0.2, 2.1, -0.4]} center distanceFactor={16}>
        <div className="zone-badge">Cafeteria · Food court</div>
      </Html>
      <pointLight position={[0, 2.4, 0.5]} intensity={0.28} distance={7} color="#ffd8a8" />
    </group>
  );
}

function ParkedCar({
  position,
  yaw,
  color,
}: {
  position: [number, number, number];
  yaw: number;
  color: string;
}) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.9, 0.45, 0.95]} />
        <meshStandardMaterial color={color} metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.65, -0.05]} castShadow>
        <boxGeometry args={[1.1, 0.35, 0.85]} />
        <meshStandardMaterial color="#1a222c" metalness={0.3} roughness={0.4} />
      </mesh>
      {([-0.55, 0.55] as const).map((z) =>
        ([-0.7, 0.7] as const).map((x) => (
          <mesh key={`${x}${z}`} position={[x, 0.18, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.12, 10]} />
            <meshStandardMaterial color="#0a0e14" />
          </mesh>
        )),
      )}
    </group>
  );
}

/** SIPCOT parking + green strip beyond atrium facade. */
function CampusParking({ lod }: { lod: OfficeLod }) {
  const { openZ, halfW } = HQ_BOUNDS;
  const padZ = openZ + 11.5;
  const cars =
    lod === "simple"
      ? [
          [-4, 0.2, "#2a4060"],
          [2.5, -0.1, "#4a3020"],
        ]
      : [
          [-6.5, 0.4, "#2a4060"],
          [-3.5, 0.1, "#3a2820"],
          [-0.5, 0.35, "#1a3048"],
          [2.8, -0.15, "#404848"],
          [5.8, 0.25, "#2a3830"],
        ];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, padZ]} receiveShadow>
        <planeGeometry args={[halfW * 2.4, 10]} />
        <meshStandardMaterial color="#14181e" roughness={0.9} />
      </mesh>
      {/* Lane stripes */}
      {lod === "full"
        ? [-6, -2, 2, 6].map((x) => (
            <mesh
              key={x}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[x, 0.02, padZ]}
            >
              <planeGeometry args={[0.08, 7]} />
              <meshStandardMaterial color="#E8A838" transparent opacity={0.35} />
            </mesh>
          ))
        : null}
      {/* Green verge */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, openZ + 7.8]}
      >
        <planeGeometry args={[halfW * 2.2, 1.6]} />
        <meshStandardMaterial color="#1a3a28" roughness={0.95} />
      </mesh>
      {cars.map(([x, yaw, color], i) => (
        <ParkedCar
          key={i}
          position={[x as number, 0, padZ + (i % 2) * 2.2 - 1]}
          yaw={yaw as number}
          color={color as string}
        />
      ))}
      {/* Pole lamps */}
      {([-7, 0, 7] as const).map((x) => (
        <group key={x} position={[x, 0, padZ + 3]}>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 3.2, 8]} />
            <meshStandardMaterial color="#121820" metalness={0.5} />
          </mesh>
          <pointLight position={[0, 3.1, 0]} intensity={0.2} distance={8} color="#ffe6c8" />
        </group>
      ))}
      <Html position={[0, 2.2, padZ]} center distanceFactor={22}>
        <div className="zone-badge">SIPCOT · Parking / campus</div>
      </Html>
    </group>
  );
}

/** Quiet focus pod (glass). */
function FocusGlassPod({
  position,
  yaw = 0,
}: {
  position: [number, number, number];
  yaw?: number;
}) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[1.6, 2.3, 1.5]} />
        <meshPhysicalMaterial
          color="#9ec8dc"
          transparent
          opacity={0.12}
          transmission={0.45}
          roughness={0.1}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.7, 0.08, 0.55]} />
        <meshStandardMaterial color="#a86a38" roughness={0.5} />
      </mesh>
      <Html position={[0, 2.5, 0]} center distanceFactor={12}>
        <div className="zone-badge">Focus · Quiet</div>
      </Html>
    </group>
  );
}

/**
 * Campus layer: atrium lobby, turnstiles, cafeteria, parking, focus pods.
 */
export function NxtLevelCampus({ lod = "full" }: { lod?: OfficeLod }) {
  const { openZ, halfW } = HQ_BOUNDS;

  return (
    <group>
      <AtriumLobby lod={lod} />
      <SecurityTurnstiles position={[0, 0, openZ + 1.15]} />
      <CafeteriaWing position={[-halfW + 3.4, 0, openZ + 3.6]} lod={lod} />
      <CampusParking lod={lod} />
      <FocusGlassPod position={[halfW - 2.8, 0, openZ + 2.4]} yaw={-0.2} />
      <FocusGlassPod position={[halfW - 4.6, 0, openZ + 4.2]} yaw={0.15} />
    </group>
  );
}
