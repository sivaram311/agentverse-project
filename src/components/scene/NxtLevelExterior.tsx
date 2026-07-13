"use client";

import { Html, Text } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { HQ_BOUNDS, type OfficeLod } from "@/lib/office-layout";

/** Intellect photo palette — beige panels + blue glass + corporate blue logo. */
const PALETTE = {
  panel: "#C8C0B4",
  panelDark: "#A8A098",
  plinth: "#8C8C8C",
  glass: "#7BA9C9",
  glassLite: "#A5C4D8",
  mullion: "#D0D4D8",
  logo: "#00AEEF",
  paver: "#A8A39A",
  grass: "#4A8C4A",
  shrub: "#2A6A3A",
} as const;

function IntellectRoofLogo({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[7.2, 0.9, 0.35]} />
        <meshStandardMaterial color="#1a222c" metalness={0.4} roughness={0.4} />
      </mesh>
      <Text
        position={[0, 0.38, 0.2]}
        fontSize={0.55}
        color={PALETTE.logo}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        Intellect
      </Text>
      <pointLight position={[0, 0.5, 0.6]} intensity={0.35} distance={6} color={PALETTE.logo} />
    </group>
  );
}

/** Photo-faithful Nxt Level / Intellect tower shell. */
function NxtLevelTowerShell({ lod }: { lod: OfficeLod }) {
  const { halfW, backZ, openZ, ceilingY } = HQ_BOUNDS;
  const depth = openZ - backZ;
  const midZ = (openZ + backZ) / 2;
  const floorCount = lod === "simple" ? 4 : 7;
  const floorH = 3.05;
  const roofY = ceilingY + 0.15 + floorCount * floorH;

  const bayXs = useMemo(() => {
    const xs: number[] = [];
    for (let x = -halfW + 1.2; x <= halfW - 1.2; x += 2.4) xs.push(x);
    return xs;
  }, [halfW]);

  return (
    <group>
      {/* Ground plinth */}
      <mesh position={[0, 0.35, midZ]} castShadow receiveShadow>
        <boxGeometry args={[halfW * 2.15, 0.7, depth + 1.2]} />
        <meshStandardMaterial color={PALETTE.plinth} roughness={0.75} metalness={0.08} />
      </mesh>

      {Array.from({ length: floorCount }, (_, fi) => {
        const y = ceilingY + 0.25 + fi * floorH;
        return (
          <group key={fi}>
            {/* Beige floor slab / banding */}
            <mesh position={[0, y, midZ]}>
              <boxGeometry args={[halfW * 2.08, 0.22, depth + 0.7]} />
              <meshStandardMaterial
                color={fi % 2 === 0 ? PALETTE.panel : PALETTE.panelDark}
                roughness={0.72}
                metalness={0.05}
              />
            </mesh>
            {/* South (entry) curtain wall */}
            <mesh position={[0, y - floorH * 0.42, openZ + 0.25]}>
              <boxGeometry args={[halfW * 1.95, floorH * 0.78, 0.08]} />
              <meshPhysicalMaterial
                color={PALETTE.glass}
                metalness={0.25}
                roughness={0.08}
                transparent
                opacity={0.55}
                transmission={lod === "full" ? 0.25 : 0}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Side curtain */}
            {([-halfW - 0.12, halfW + 0.12] as const).map((x) => (
              <mesh key={x} position={[x, y - floorH * 0.42, midZ]}>
                <boxGeometry args={[0.1, floorH * 0.78, depth]} />
                <meshPhysicalMaterial
                  color={PALETTE.glassLite}
                  metalness={0.22}
                  roughness={0.1}
                  transparent
                  opacity={0.5}
                  transmission={lod === "full" ? 0.22 : 0}
                  side={THREE.DoubleSide}
                />
              </mesh>
            ))}
            {/* Vertical beige mullions */}
            {bayXs.map((x) => (
              <mesh key={`m-${fi}-${x}`} position={[x, y - floorH * 0.42, openZ + 0.3]}>
                <boxGeometry args={[0.12, floorH * 0.78, 0.14]} />
                <meshStandardMaterial color={PALETTE.panel} roughness={0.65} metalness={0.15} />
              </mesh>
            ))}
            {/* Warm interior bleed through glass */}
            {lod === "full" && fi % 2 === 0 ? (
              <pointLight
                position={[0, y - 1.2, openZ - 0.8]}
                intensity={0.08}
                distance={5}
                color="#ffe8c8"
              />
            ) : null}
          </group>
        );
      })}

      {/* Roof parapet */}
      <mesh position={[0, roofY, midZ]}>
        <boxGeometry args={[halfW * 2.12, 0.45, depth + 0.9]} />
        <meshStandardMaterial color={PALETTE.panelDark} roughness={0.6} metalness={0.1} />
      </mesh>
      <IntellectRoofLogo position={[0, roofY + 0.7, openZ + 0.4]} scale={1.15} />

      <Html position={[0, roofY + 2.2, openZ + 1]} center distanceFactor={32}>
        <div className="plaza-brand">
          <strong>Intellect Design Arena</strong>
          <span>Nxt Level · Plot 3/G3 · SIPCOT Siruseri</span>
        </div>
      </Html>
    </group>
  );
}

function BoomBarrier({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.35, 1.1, 0.35]} />
        <meshStandardMaterial color="#1a222c" metalness={0.45} />
      </mesh>
      <mesh position={[1.6, 1.05, 0]} rotation={[0, 0, -0.12]} castShadow>
        <boxGeometry args={[3.2, 0.08, 0.12]} />
        <meshStandardMaterial
          color="#E8A838"
          emissive="#E8A838"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0, 1.35, 0.2]}>
        <boxGeometry args={[0.2, 0.2, 0.08]} />
        <meshStandardMaterial color="#0c1016" emissive="#FF6200" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function EvCharger({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.35, 1.4, 0.25]} />
        <meshStandardMaterial color="#161c24" metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.05, 0.14]}>
        <boxGeometry args={[0.22, 0.35, 0.04]} />
        <meshStandardMaterial
          color="#0c1016"
          emissive="#3DDC97"
          emissiveIntensity={0.55}
        />
      </mesh>
    </group>
  );
}

function PlazaAndLandscaping({ lod }: { lod: OfficeLod }) {
  const { openZ, halfW } = HQ_BOUNDS;
  const plazaZ = openZ + 8.5;

  const trees = useMemo(() => {
    const n = lod === "simple" ? 5 : 10;
    return Array.from({ length: n }, (_, i) => ({
      x: -halfW + 1.5 + i * 2.1 + (i % 2) * 0.3,
      z: plazaZ + (i % 3) * 1.4 - 1.2,
      palm: i % 3 === 0,
    }));
  }, [lod, halfW, plazaZ]);

  return (
    <group>
      {/* Interlocking paver forecourt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, plazaZ]} receiveShadow>
        <planeGeometry args={[halfW * 2.2, 9]} />
        <meshStandardMaterial color={PALETTE.paver} roughness={0.82} metalness={0.05} />
      </mesh>
      {/* Paver grout grid hint */}
      {lod === "full"
        ? [-6, -3, 0, 3, 6].map((x) => (
            <mesh
              key={`gx-${x}`}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[x, 0.02, plazaZ]}
            >
              <planeGeometry args={[0.04, 8]} />
              <meshStandardMaterial color="#8a8580" transparent opacity={0.35} />
            </mesh>
          ))
        : null}

      {/* White planters + hedges */}
      {([-7, -3.5, 3.5, 7] as const).map((x) => (
        <group key={x} position={[x, 0, plazaZ - 2.5]}>
          <mesh position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[2.2, 0.55, 0.85]} />
            <meshStandardMaterial color="#f2f2f0" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[2.0, 0.35, 0.65]} />
            <meshStandardMaterial color={PALETTE.shrub} roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Grass patches */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-halfW - 2.8, 0.02, plazaZ]}>
        <planeGeometry args={[4.5, 10]} />
        <meshStandardMaterial color={PALETTE.grass} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[halfW + 2.8, 0.02, plazaZ]}>
        <planeGeometry args={[4.5, 10]} />
        <meshStandardMaterial color={PALETTE.grass} roughness={0.95} />
      </mesh>

      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          {t.palm ? (
            <>
              <mesh position={[0, 1.1, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.12, 2.2, 8]} />
                <meshStandardMaterial color="#6a5a3a" roughness={0.85} />
              </mesh>
              {[0, 1, 2, 3, 4].map((j) => (
                <mesh
                  key={j}
                  position={[
                    Math.cos((j / 5) * Math.PI * 2) * 0.5,
                    2.3,
                    Math.sin((j / 5) * Math.PI * 2) * 0.5,
                  ]}
                  rotation={[0.6, (j / 5) * Math.PI * 2, 0]}
                  castShadow
                >
                  <boxGeometry args={[0.15, 0.9, 0.35]} />
                  <meshStandardMaterial color={PALETTE.grass} roughness={0.85} />
                </mesh>
              ))}
            </>
          ) : (
            <>
              <mesh position={[0, 0.9, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.1, 1.8, 6]} />
                <meshStandardMaterial color="#4a3828" roughness={0.85} />
              </mesh>
              <mesh position={[0, 2.0, 0]} castShadow>
                <sphereGeometry args={[0.65, 8, 8]} />
                <meshStandardMaterial color={PALETTE.shrub} roughness={0.8} />
              </mesh>
            </>
          )}
        </group>
      ))}

      {/* Outdoor seating under trees */}
      {lod === "full" ? (
        <group position={[halfW + 1.5, 0, plazaZ + 1.5]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.55, 0.08, 12]} />
            <meshStandardMaterial color="#a86a38" roughness={0.55} />
          </mesh>
          {([-0.5, 0.5] as const).map((x) => (
            <mesh key={x} position={[x, 0.28, 0.45]} castShadow>
              <boxGeometry args={[0.35, 0.08, 0.35]} />
              <meshStandardMaterial color="#2a3240" roughness={0.7} />
            </mesh>
          ))}
        </group>
      ) : null}

      {/* Modern lamp posts */}
      {([-8, -2.5, 2.5, 8] as const).map((x) => (
        <group key={x} position={[x, 0, plazaZ + 3.2]}>
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 3.6, 8]} />
            <meshStandardMaterial color="#d8d8d8" metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh position={[0, 3.55, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.22, 10]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#fff8e8"
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CompoundGate({ lod }: { lod: OfficeLod }) {
  const { openZ, halfW } = HQ_BOUNDS;
  const z1 = openZ + 16.5;
  return (
    <group>
      {([-halfW - 4.2, halfW + 4.2] as const).map((x) => (
        <mesh key={x} position={[x, 1.2, openZ + 8]} castShadow>
          <boxGeometry args={[0.12, 2.4, 14]} />
          <meshStandardMaterial color="#2a3038" metalness={0.4} roughness={0.45} />
        </mesh>
      ))}
      <BoomBarrier position={[-3.2, 0, z1]} />
      <BoomBarrier position={[3.2, 0, z1]} />
      <mesh position={[0, 2.4, z1]} castShadow>
        <boxGeometry args={[4.5, 0.35, 0.25]} />
        <meshStandardMaterial color="#161c24" metalness={0.4} />
      </mesh>
      <Text
        position={[0, 2.4, z1 + 0.2]}
        fontSize={0.28}
        color={PALETTE.logo}
        anchorX="center"
        anchorY="middle"
      >
        Intellect · Visitors
      </Text>
      {lod === "full" ? (
        <>
          <EvCharger position={[-6.5, 0, openZ + 12]} />
          <EvCharger position={[-5.5, 0, openZ + 12]} />
        </>
      ) : null}
      <Html position={[0, 3.2, z1]} center distanceFactor={22}>
        <div className="zone-badge">Gated compound · Boom barrier · EV</div>
      </Html>
    </group>
  );
}

function DropOffCanopy({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 3.35, 0]} castShadow>
        <boxGeometry args={[9, 0.14, 4.5]} />
        <meshStandardMaterial color={PALETTE.panelDark} metalness={0.35} roughness={0.4} />
      </mesh>
      {([-3.8, 3.8] as const).map((x) => (
        <mesh key={x} position={[x, 1.65, 1.5]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 3.3, 8]} />
          <meshStandardMaterial color={PALETTE.mullion} metalness={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function WaterBody({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[6.5, 36]} />
        <meshStandardMaterial
          color="#4A7A9A"
          metalness={0.5}
          roughness={0.15}
          emissive="#2a4a60"
          emissiveIntensity={0.12}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[5.2, 6.5, 36]} />
        <meshStandardMaterial color={PALETTE.grass} roughness={0.9} />
      </mesh>
    </group>
  );
}

function DistantCampusLandmark({ lod }: { lod: OfficeLod }) {
  return (
    <group position={[28, 0, 22]}>
      <mesh position={[0, 18, 0]} castShadow>
        <boxGeometry args={[4.2, 36, 4.2]} />
        <meshStandardMaterial color="#3a4858" metalness={0.3} roughness={0.5} />
      </mesh>
      {lod === "full" ? (
        <>
          <mesh position={[-7, 6, 4]} rotation={[0, 0.4, 0]}>
            <boxGeometry args={[10, 12, 3.5]} />
            <meshStandardMaterial color="#4a5868" metalness={0.25} roughness={0.55} />
          </mesh>
          <mesh position={[7, 6, 4]} rotation={[0, -0.4, 0]}>
            <boxGeometry args={[10, 12, 3.5]} />
            <meshStandardMaterial color="#4a5868" metalness={0.25} roughness={0.55} />
          </mesh>
        </>
      ) : null}
      <Html position={[0, 40, 0]} center distanceFactor={48}>
        <div className="zone-badge">Nearby · TCS Siruseri</div>
      </Html>
    </group>
  );
}

function OmroadStrip() {
  const { openZ } = HQ_BOUNDS;
  const z = openZ + 20;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, z]} receiveShadow>
        <planeGeometry args={[70, 6]} />
        <meshStandardMaterial color="#4a4e54" roughness={0.88} />
      </mesh>
      <Html position={[0, 1.5, z]} center distanceFactor={32}>
        <div className="zone-badge">OMR corridor</div>
      </Html>
    </group>
  );
}

/**
 * Photo-reference Intellect / Nxt Level exterior + SIPCOT compound.
 */
export function NxtLevelExterior({ lod = "full" }: { lod?: OfficeLod }) {
  const { openZ, halfW } = HQ_BOUNDS;

  return (
    <group>
      <NxtLevelTowerShell lod={lod} />
      <PlazaAndLandscaping lod={lod} />
      <CompoundGate lod={lod} />
      <DropOffCanopy position={[0, 0, openZ + 7.4]} />
      <WaterBody position={[halfW + 12, 0, openZ + 6]} />
      <OmroadStrip />
      <DistantCampusLandmark lod={lod} />
      <Html position={[0, 1.3, openZ + 16]} center distanceFactor={22}>
        <div className="plaza-brand">
          <strong>Plot No. 3/G3</strong>
          <span>SIPCOT IT Park · Siruseri / Navalur · 600130</span>
        </div>
      </Html>
    </group>
  );
}
