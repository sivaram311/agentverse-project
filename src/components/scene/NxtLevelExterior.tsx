"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { HQ_BOUNDS, type OfficeLod } from "@/lib/office-layout";

/** Glass-and-steel floors above/around the cutaway Intellect plate. */
function NxtLevelTowerShell({ lod }: { lod: OfficeLod }) {
  const { halfW, backZ, openZ, ceilingY } = HQ_BOUNDS;
  const depth = openZ - backZ;
  const midZ = (openZ + backZ) / 2;
  const floors = lod === "simple" ? [1, 2] : [1, 2, 3, 4];

  return (
    <group>
      {floors.map((f) => {
        const y = ceilingY + 0.2 + f * 3.05;
        return (
          <group key={f}>
            {/* Floor plate */}
            <mesh position={[0, y, midZ]}>
              <boxGeometry args={[halfW * 2.05, 0.18, depth + 0.6]} />
              <meshStandardMaterial color="#121820" metalness={0.4} roughness={0.45} />
            </mesh>
            {/* Curtain wall bands */}
            {(
              [
                [-halfW - 0.15, 0],
                [halfW + 0.15, 0],
              ] as [number, number][]
            ).map(([x], i) => (
              <mesh key={i} position={[x, y - 1.35, midZ]}>
                <boxGeometry args={[0.12, 2.6, depth]} />
                <meshPhysicalMaterial
                  color="#8eb8d0"
                  transparent
                  opacity={0.28}
                  transmission={lod === "full" ? 0.35 : 0}
                  roughness={0.12}
                  metalness={0.15}
                  side={THREE.DoubleSide}
                />
              </mesh>
            ))}
            <mesh position={[0, y - 1.35, backZ - 0.2]}>
              <boxGeometry args={[halfW * 2, 2.6, 0.12]} />
              <meshPhysicalMaterial
                color="#8eb8d0"
                transparent
                opacity={0.26}
                transmission={lod === "full" ? 0.32 : 0}
                roughness={0.12}
                metalness={0.12}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      {/* Roof parapet */}
      <mesh position={[0, ceilingY + 0.2 + floors.length * 3.05 + 0.4, midZ]}>
        <boxGeometry args={[halfW * 2.1, 0.35, depth + 0.8]} />
        <meshStandardMaterial color="#0e141c" metalness={0.45} roughness={0.4} />
      </mesh>
      <Html
        position={[0, ceilingY + floors.length * 2.2, openZ + 0.5]}
        center
        distanceFactor={28}
      >
        <div className="plaza-brand">
          <strong>Nxt Level</strong>
          <span>Plot 3/G3 · SIPCOT Siruseri · FT8012 Design Center</span>
        </div>
      </Html>
    </group>
  );
}

function CompoundFence({ lod }: { lod: OfficeLod }) {
  const { openZ, halfW } = HQ_BOUNDS;
  const z0 = openZ + 0.4;
  const z1 = openZ + 16.5;
  const xL = -halfW - 4.5;
  const xR = halfW + 4.5;
  const posts =
    lod === "simple"
      ? [z0, (z0 + z1) / 2, z1]
      : Array.from({ length: 9 }, (_, i) => z0 + (i / 8) * (z1 - z0));

  return (
    <group>
      {/* Left / right fence runs */}
      {([xL, xR] as const).map((x) =>
        posts.map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 1.1, z]}>
            <boxGeometry args={[0.08, 2.2, 0.08]} />
            <meshStandardMaterial color="#1a222c" metalness={0.55} roughness={0.35} />
          </mesh>
        )),
      )}
      {/* Far gate line */}
      {[-6, -2, 2, 6].map((x) => (
        <mesh key={`g-${x}`} position={[x, 1.1, z1]}>
          <boxGeometry args={[0.08, 2.2, 0.08]} />
          <meshStandardMaterial color="#1a222c" metalness={0.55} roughness={0.35} />
        </mesh>
      ))}
      {/* Sliding gate arms */}
      <mesh position={[-2.4, 1.05, z1]} castShadow>
        <boxGeometry args={[3.2, 1.8, 0.1]} />
        <meshStandardMaterial color="#161c24" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[2.4, 1.05, z1]} castShadow>
        <boxGeometry args={[3.2, 1.8, 0.1]} />
        <meshStandardMaterial color="#161c24" metalness={0.4} roughness={0.4} />
      </mesh>
      <Html position={[0, 2.6, z1]} center distanceFactor={20}>
        <div className="zone-badge">Secure compound · SIPCOT gate</div>
      </Html>
    </group>
  );
}

function DropOffCanopy({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[8.5, 0.12, 4.2]} />
        <meshStandardMaterial color="#121820" metalness={0.5} roughness={0.35} />
      </mesh>
      {([-3.6, 3.6] as const).map((x) => (
        <mesh key={x} position={[x, 1.55, 1.4]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 3.1, 8]} />
          <meshStandardMaterial color="#1a222c" metalness={0.55} />
        </mesh>
      ))}
      <Html position={[0, 3.7, 0]} center distanceFactor={18}>
        <div className="zone-badge">Drop-off · Visitor bay</div>
      </Html>
    </group>
  );
}

function Landscaping({ lod }: { lod: OfficeLod }) {
  const { openZ, halfW } = HQ_BOUNDS;
  const trees = useMemo(() => {
    const n = lod === "simple" ? 6 : 14;
    return Array.from({ length: n }, (_, i) => ({
      x: -halfW - 2.5 + (i % 7) * 3.2 + (i % 2) * 0.4,
      z: openZ + 8.5 + Math.floor(i / 7) * 4.5 + (i % 3) * 0.6,
      h: 1.8 + (i % 4) * 0.35,
    }));
  }, [lod, halfW, openZ]);

  return (
    <group>
      {/* Lawn buffers */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-halfW - 3.2, 0.02, openZ + 8]}>
        <planeGeometry args={[5, 14]} />
        <meshStandardMaterial color="#1a3a28" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[halfW + 3.2, 0.02, openZ + 8]}>
        <planeGeometry args={[5, 14]} />
        <meshStandardMaterial color="#1a3a28" roughness={0.95} />
      </mesh>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          <mesh position={[0, t.h * 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.11, t.h * 0.7, 6]} />
            <meshStandardMaterial color="#3a2818" roughness={0.85} />
          </mesh>
          <mesh position={[0, t.h * 0.85, 0]} castShadow>
            <sphereGeometry args={[0.55 + (i % 3) * 0.1, 7, 7]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#1f5a38" : "#2a7048"}
              roughness={0.75}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Redeveloped lake / water body — Siruseri green buffer vibe. */
function WaterBody({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[6.5, 36]} />
        <meshStandardMaterial
          color="#1a4060"
          metalness={0.55}
          roughness={0.18}
          emissive="#0a2038"
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[5.2, 6.5, 36]} />
        <meshStandardMaterial color="#1a3a28" roughness={0.9} />
      </mesh>
      <Html position={[0, 1.2, 0]} center distanceFactor={26}>
        <div className="zone-badge">Lake buffer · Siruseri</div>
      </Html>
    </group>
  );
}

/** Distant TCS-like Signature Tower silhouette (landmark, not to scale). */
function DistantCampusLandmark({ lod }: { lod: OfficeLod }) {
  return (
    <group position={[28, 0, 22]}>
      {/* Tall tower */}
      <mesh position={[0, 18, 0]} castShadow>
        <boxGeometry args={[4.2, 36, 4.2]} />
        <meshStandardMaterial color="#2a3848" metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, 36.5, 0]}>
        <boxGeometry args={[5, 1.2, 5]} />
        <meshStandardMaterial
          color="#4DA3FF"
          emissive="#4DA3FF"
          emissiveIntensity={0.25}
        />
      </mesh>
      {/* Butterfly / curved wing blocks */}
      {lod === "full" ? (
        <>
          <mesh position={[-7, 6, 4]} rotation={[0, 0.4, 0]}>
            <boxGeometry args={[10, 12, 3.5]} />
            <meshStandardMaterial color="#243040" metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[7, 6, 4]} rotation={[0, -0.4, 0]}>
            <boxGeometry args={[10, 12, 3.5]} />
            <meshStandardMaterial color="#243040" metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 2]}>
            <circleGeometry args={[12, 28]} />
            <meshStandardMaterial color="#1a3a28" roughness={0.95} />
          </mesh>
        </>
      ) : null}
      <Html position={[0, 40, 0]} center distanceFactor={48}>
        <div className="zone-badge">Nearby · TCS Siruseri campus</div>
      </Html>
    </group>
  );
}

function ResidentialBlocks({ lod }: { lod: OfficeLod }) {
  const blocks =
    lod === "simple"
      ? [{ x: -26, z: 18, h: 14, w: 5 }]
      : [
          { x: -26, z: 16, h: 14, w: 5 },
          { x: -22, z: 28, h: 18, w: 4.5 },
          { x: 24, z: 32, h: 12, w: 6 },
          { x: -30, z: 8, h: 10, w: 4 },
        ];
  return (
    <group>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]} castShadow>
          <boxGeometry args={[b.w, b.h, b.w * 0.85]} />
          <meshStandardMaterial color="#2a3038" metalness={0.2} roughness={0.65} />
        </mesh>
      ))}
    </group>
  );
}

/** OMR corridor strip beyond the compound. */
function OmroadStrip() {
  const { openZ } = HQ_BOUNDS;
  const z = openZ + 20;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, z]} receiveShadow>
        <planeGeometry args={[70, 6]} />
        <meshStandardMaterial color="#1a1e24" roughness={0.88} />
      </mesh>
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, z]}>
          <planeGeometry args={[0.12, 5.2]} />
          <meshStandardMaterial color="#E8A838" transparent opacity={0.45} />
        </mesh>
      ))}
      <Html position={[0, 1.5, z]} center distanceFactor={32}>
        <div className="zone-badge">OMR · Old Mahabalipuram Road</div>
      </Html>
    </group>
  );
}

/**
 * SIPCOT Siruseri exteriors — Nxt Level tower shell, compound, landscaping,
 * lake buffer, OMR road, and distant IT/residential context.
 */
export function NxtLevelExterior({ lod = "full" }: { lod?: OfficeLod }) {
  const { openZ, halfW } = HQ_BOUNDS;

  return (
    <group>
      <NxtLevelTowerShell lod={lod} />
      <CompoundFence lod={lod} />
      <DropOffCanopy position={[0, 0, openZ + 7.4]} />
      <Landscaping lod={lod} />
      <WaterBody position={[halfW + 12, 0, openZ + 6]} />
      <OmroadStrip />
      <DistantCampusLandmark lod={lod} />
      <ResidentialBlocks lod={lod} />
      {/* Address plaque vibe */}
      <Html position={[0, 1.4, openZ + 16.2]} center distanceFactor={22}>
        <div className="plaza-brand">
          <strong>Plot No. 3/G3</strong>
          <span>SIPCOT IT Park · Siruseri / Navalur · 600130</span>
        </div>
      </Html>
    </group>
  );
}
