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

/** Double-height reception / atrium — polished stone, branding, visitor lounge. */
function AtriumLobby({ lod }: { lod: OfficeLod }) {
  const { halfW, openZ, ceilingY } = HQ_BOUNDS;
  const atrDepth = 7.2;
  const midZ = openZ + atrDepth / 2;
  const atrH = ceilingY + 2.4;

  return (
    <group>
      {/* Polished stone / tile floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.012, midZ]}
        receiveShadow
      >
        <planeGeometry args={[halfW * 1.85, atrDepth]} />
        <meshStandardMaterial color="#C8C4BC" metalness={0.35} roughness={0.18} />
      </mesh>
      {lod === "full"
        ? [-4, 0, 4].map((x) => (
            <mesh
              key={x}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[x, 0.02, midZ]}
            >
              <planeGeometry args={[0.035, atrDepth * 0.9]} />
              <meshStandardMaterial color="#A8A49C" transparent opacity={0.5} />
            </mesh>
          ))
        : null}

      {/* Extra-clear side glass */}
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
              color="#A5C4D8"
              transparent
              opacity={0.12}
              transmission={lod === "full" ? 0.62 : 0}
              roughness={0.05}
              metalness={0.05}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
      <mesh position={[0, atrH / 2, openZ + atrDepth - 0.1]}>
        <planeGeometry args={[halfW * 1.7, atrH]} />
        <meshPhysicalMaterial
          color="#7BA9C9"
          transparent
          opacity={0.18}
          transmission={lod === "full" ? 0.4 : 0}
          roughness={0.08}
          metalness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
      {lod === "full"
        ? [-4, -1.3, 1.3, 4].map((x) => (
            <mesh key={x} position={[x, atrH / 2, openZ + atrDepth - 0.08]}>
              <boxGeometry args={[0.1, atrH, 0.08]} />
              <meshStandardMaterial color="#D0D4D8" metalness={0.55} roughness={0.3} />
            </mesh>
          ))
        : null}

      <mesh position={[0, atrH, midZ]}>
        <boxGeometry args={[halfW * 1.8, 0.14, atrDepth]} />
        <meshStandardMaterial color="#E8E4DC" roughness={0.65} metalness={0.08} />
      </mesh>

      {/* Intellect wall brand */}
      <mesh position={[0, 3.4, midZ - atrDepth * 0.35]} castShadow>
        <boxGeometry args={[4.2, 1.1, 0.08]} />
        <meshStandardMaterial color="#0c1830" metalness={0.2} />
      </mesh>
      <mesh position={[0, 3.4, midZ - atrDepth * 0.34]}>
        <boxGeometry args={[3.6, 0.55, 0.04]} />
        <meshStandardMaterial
          color="#00AEEF"
          emissive="#00AEEF"
          emissiveIntensity={0.45}
        />
      </mesh>

      {/* Digital directory displays */}
      {([-5.5, 5.5] as const).map((x) => (
        <group key={x} position={[x, 1.6, midZ - 1.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 1.6, 0.12]} />
            <meshStandardMaterial color="#1a222c" metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.1, 0.07]}>
            <planeGeometry args={[0.72, 1.25]} />
            <meshStandardMaterial
              color="#0a1520"
              emissive="#4DA3FF"
              emissiveIntensity={0.35}
            />
          </mesh>
        </group>
      ))}

      {/* CCTV domes */}
      {([-4, 0, 4] as const).map((x) => (
        <mesh key={x} position={[x, atrH - 0.35, midZ]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#1a1c1e" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      {/* Visitor seating */}
      {([-3.2, 3.2] as const).map((x) => (
        <group key={x} position={[x, 0, midZ + 1.4]}>
          <mesh position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[1.6, 0.28, 0.55]} />
            <meshStandardMaterial color="#2a3240" roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.52, -0.2]} castShadow>
            <boxGeometry args={[1.6, 0.4, 0.12]} />
            <meshStandardMaterial color="#243040" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Lobby plants */}
      {([-6.5, 6.5] as const).map((x) => (
        <group key={x} position={[x, 0, midZ + 0.4]}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.28, 0.32, 0.5, 10]} />
            <meshStandardMaterial color="#f0f0ee" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <sphereGeometry args={[0.45, 8, 8]} />
            <meshStandardMaterial color="#2A6A3A" roughness={0.85} />
          </mesh>
        </group>
      ))}

      {lod === "full"
        ? [-3, 0, 3].map((x) => (
            <pointLight
              key={x}
              position={[x, atrH - 0.5, midZ]}
              intensity={0.28}
              distance={9}
              color="#fff4e0"
            />
          ))
        : null}

      <Html position={[0, atrH - 0.85, openZ + atrDepth - 0.55]} center distanceFactor={20}>
        <div className="plaza-brand">
          <strong>Intellect</strong>
          <span>Double-height reception · Visitor lounge</span>
        </div>
      </Html>
    </group>
  );
}

/** Glass corridor connector with clear partitions. */
function GlassCorridor({
  position,
  length = 6,
  yaw = 0,
}: {
  position: [number, number, number];
  length?: number;
  yaw?: number;
}) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[2.4, length]} />
        <meshStandardMaterial color="#3a3530" roughness={0.85} />
      </mesh>
      {([-1.15, 1.15] as const).map((x) => (
        <mesh key={x} position={[x, 1.35, 0]}>
          <boxGeometry args={[0.06, 2.6, length]} />
          <meshPhysicalMaterial
            color="#A5C4D8"
            transparent
            opacity={0.14}
            transmission={0.55}
            roughness={0.06}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <Html position={[0, 2.8, 0]} center distanceFactor={14}>
        <div className="zone-badge">Corridor · Clear glass</div>
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
      <GlassCorridor position={[-5.5, 0, 2.2]} length={7.5} yaw={0.05} />
      <GlassCorridor position={[5.5, 0, 0.8]} length={6.5} yaw={-0.08} />
      <CafeteriaWing position={[-halfW + 3.4, 0, openZ + 3.6]} lod={lod} />
      <CampusParking lod={lod} />
      <FocusGlassPod position={[halfW - 2.8, 0, openZ + 2.4]} yaw={-0.2} />
      <FocusGlassPod position={[halfW - 4.6, 0, openZ + 4.2]} yaw={0.15} />
    </group>
  );
}
