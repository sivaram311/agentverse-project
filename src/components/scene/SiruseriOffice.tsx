"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";
import * as THREE from "three";
import {
  FilterCoffeePantry,
  FocusPod,
  OfficePlant,
} from "./OfficeDetails";

export const SIRUSERI = {
  halfW: 10.5,
  backZ: -9.2,
  openZ: 7.4,
  ceilingY: 4.35,
  wallT: 0.18,
} as const;

export function MandalaPulse({ lod }: { lod: "full" | "simple" }) {
  const spin = useRef<Group>(null);
  const glow = useRef<Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (spin.current) spin.current.rotation.y = t * 0.06;
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.22 + Math.sin(t * 1.4) * 0.08;
    }
  });

  return (
    <group position={[0, 0.025, 0]}>
      <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.55, lod === "simple" ? 32 : 64]} />
        <meshStandardMaterial
          color="#141018"
          metalness={0.55}
          roughness={0.32}
          emissive="#5a3a12"
          emissiveIntensity={0.25}
        />
      </mesh>
      <group ref={spin}>
        {[1.05, 1.75, 2.45, 3.15].map((r, i) => (
          <mesh key={r} rotation={[-Math.PI / 2, 0, Math.PI / 12]}>
            <ringGeometry args={[r, r + (i === 2 ? 0.11 : 0.055), i === 1 ? 6 : 72]} />
            <meshStandardMaterial
              color="#E8A838"
              emissive="#E8A838"
              emissiveIntensity={0.75 - i * 0.08}
              transparent
              opacity={0.75 - i * 0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        {lod === "full"
          ? Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <mesh
                  key={`petal-${i}`}
                  rotation={[-Math.PI / 2, 0, a]}
                  position={[Math.cos(a) * 2.05, 0.012, Math.sin(a) * 2.05]}
                >
                  <circleGeometry args={[0.24, 3]} />
                  <meshStandardMaterial
                    color="#C4A35A"
                    emissive="#E8A838"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.5}
                  />
                </mesh>
              );
            })
          : null}
      </group>
    </group>
  );
}

/** Green park / IT-park canopy beyond the glass. */
function ParkView({ lod }: { lod: "full" | "simple" }) {
  const trees = useMemo(() => {
    const n = lod === "simple" ? 7 : 14;
    return Array.from({ length: n }, (_, i) => {
      const t = i / Math.max(1, n - 1);
      return {
        x: -12 + t * 24 + (i % 3) * 0.4,
        z: -14 - (i % 4) * 1.2,
        h: 1.6 + (i % 5) * 0.35,
        s: 0.7 + (i % 3) * 0.2,
      };
    });
  }, [lod]);

  return (
    <group position={[0, 0, SIRUSERI.backZ - 0.4]}>
      {/* Sky wash */}
      <mesh position={[0, 3.2, -6]}>
        <planeGeometry args={[36, 14]} />
        <meshBasicMaterial color="#6a9ab8" />
      </mesh>
      {/* Lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -5]}>
        <planeGeometry args={[34, 16]} />
        <meshStandardMaterial color="#1a3a28" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -4]}>
        <planeGeometry args={[28, 10]} />
        <meshStandardMaterial
          color="#2d6b45"
          emissive="#1a4028"
          emissiveIntensity={0.15}
          roughness={0.9}
        />
      </mesh>
      {trees.map((tr, i) => (
        <group key={i} position={[tr.x, 0, tr.z]}>
          <mesh position={[0, tr.h * 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, tr.h * 0.7, 6]} />
            <meshStandardMaterial color="#3a2818" roughness={0.85} />
          </mesh>
          <mesh position={[0, tr.h * 0.85, 0]} castShadow>
            <sphereGeometry args={[tr.s, 7, 7]} />
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

function GlassCurtain({
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
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial
          color="#9ec8dc"
          transparent
          opacity={0.18}
          transmission={lod === "full" ? 0.55 : 0}
          roughness={0.08}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Mullions */}
      {[-0.33, 0, 0.33].map((t, i) => (
        <mesh key={i} position={[t * w, 0, 0.01]}>
          <boxGeometry args={[0.05, h, 0.04]} />
          <meshStandardMaterial color="#1a222c" metalness={0.55} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, h / 2 - 0.04, 0.01]}>
        <boxGeometry args={[w, 0.08, 0.05]} />
        <meshStandardMaterial color="#121820" metalness={0.5} />
      </mesh>
      <mesh position={[0, -h / 2 + 0.04, 0.01]}>
        <boxGeometry args={[w, 0.08, 0.05]} />
        <meshStandardMaterial color="#121820" metalness={0.5} />
      </mesh>
    </group>
  );
}

/** Soft volumetric light shafts from the north glass. */
function WindowGodRays({ reducedMotion }: { reducedMotion: boolean }) {
  const shafts = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!shafts.current || reducedMotion) return;
    const t = state.clock.elapsedTime;
    shafts.current.children.forEach((child, i) => {
      const m = (child as Mesh).material as THREE.MeshBasicMaterial;
      if (m) m.opacity = 0.04 + Math.sin(t * 0.4 + i) * 0.015;
    });
  });

  return (
    <group ref={shafts} position={[0, 2.2, SIRUSERI.backZ + 1.5]}>
      {[-4, -1.5, 1.5, 4].map((x, i) => (
        <mesh
          key={i}
          position={[x, 0, 2.5]}
          rotation={[0.55, 0, (i - 1.5) * 0.04]}
        >
          <coneGeometry args={[0.9, 6.5, 8, 1, true]} />
          <meshBasicMaterial
            color="#fff2d0"
            transparent
            opacity={0.055}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Intellect Design Arena Â· Siruseri â€” open-plan fintech floor:
 * polished dark slab, glass park view, biophilia, pantry, LED canopy.
 */
export function SiruseriOffice({
  lod = "full",
  reducedMotion = false,
}: {
  lod?: "full" | "simple";
  reducedMotion?: boolean;
}) {
  const { halfW, backZ, openZ, ceilingY } = SIRUSERI;
  const depth = openZ - backZ;
  const midZ = (openZ + backZ) / 2;

  const cans = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let x = -8; x <= 8; x += 4) {
      for (let z = -6; z <= 5; z += 3.5) {
        pts.push([x, ceilingY - 0.08, z]);
      }
    }
    return pts;
  }, [ceilingY]);

  return (
    <group>
      {/* Polished dark floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, midZ]} receiveShadow>
        <planeGeometry args={[halfW * 2.1, depth + 1.5]} />
        <meshStandardMaterial
          color="#0c1016"
          metalness={0.72}
          roughness={0.22}
        />
      </mesh>
      {/* Subtle tile grid */}
      {lod === "full"
        ? [-6, -2, 2, 6].map((x) => (
            <mesh key={`gx-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.015, midZ]}>
              <planeGeometry args={[0.02, depth]} />
              <meshStandardMaterial
                color="#1a2430"
                emissive="#E8A838"
                emissiveIntensity={0.08}
                transparent
                opacity={0.35}
              />
            </mesh>
          ))
        : null}

      {/* Central golden mandala */}
      <MandalaPulse lod={lod} />

      {/* Structural walls (sides + back frame) */}
      <mesh position={[-halfW, ceilingY / 2, midZ]} castShadow receiveShadow>
        <boxGeometry args={[SIRUSERI.wallT, ceilingY, depth]} />
        <meshStandardMaterial color="#161c24" metalness={0.25} roughness={0.7} />
      </mesh>
      <mesh position={[halfW, ceilingY / 2, midZ]} castShadow receiveShadow>
        <boxGeometry args={[SIRUSERI.wallT, ceilingY, depth]} />
        <meshStandardMaterial color="#161c24" metalness={0.25} roughness={0.7} />
      </mesh>
      {/* Back wall solid bands + glass */}
      <mesh position={[0, 0.35, backZ]} castShadow>
        <boxGeometry args={[halfW * 2, 0.7, SIRUSERI.wallT]} />
        <meshStandardMaterial color="#121820" metalness={0.3} roughness={0.65} />
      </mesh>
      <mesh position={[0, ceilingY - 0.25, backZ]} castShadow>
        <boxGeometry args={[halfW * 2, 0.5, SIRUSERI.wallT]} />
        <meshStandardMaterial color="#121820" metalness={0.3} roughness={0.65} />
      </mesh>

      <GlassCurtain
        position={[0, 2.15, backZ + 0.05]}
        size={[halfW * 1.85, 2.9]}
        lod={lod}
      />
      <GlassCurtain
        position={[-halfW + 0.08, 2.15, midZ]}
        size={[depth * 0.85, 2.9]}
        yaw={Math.PI / 2}
        lod={lod}
      />
      <GlassCurtain
        position={[halfW - 0.08, 2.15, midZ]}
        size={[depth * 0.85, 2.9]}
        yaw={-Math.PI / 2}
        lod={lod}
      />

      <ParkView lod={lod} />
      {lod === "full" && !reducedMotion ? (
        <WindowGodRays reducedMotion={reducedMotion} />
      ) : null}

      {/* Ceiling slab */}
      <mesh position={[0, ceilingY, midZ]} receiveShadow>
        <boxGeometry args={[halfW * 2 - 0.2, 0.14, depth]} />
        <meshStandardMaterial color="#10141a" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* LED cans */}
      {cans.map((p, i) => (
        <group key={`can-${i}`} position={p}>
          <mesh>
            <cylinderGeometry args={[0.11, 0.13, 0.05, 10]} />
            <meshStandardMaterial color="#0a0e14" />
          </mesh>
          <mesh position={[0, -0.03, 0]}>
            <circleGeometry args={[0.08, 10]} />
            <meshStandardMaterial
              color="#fff2d6"
              emissive="#ffe6b0"
              emissiveIntensity={0.8}
            />
          </mesh>
          {lod === "full" && i % 4 === 0 ? (
            <pointLight
              position={[0, -0.2, 0]}
              intensity={0.14}
              distance={4.5}
              color="#ffe8c8"
            />
          ) : null}
        </group>
      ))}

      {/* Window planters */}
      {[-7, -3.5, 0, 3.5, 7].map((x, i) => (
        <group key={`wp-${i}`} position={[x, 0, backZ + 0.85]}>
          <mesh position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[1.1, 0.55, 0.45]} />
            <meshStandardMaterial color="#1a222c" metalness={0.35} roughness={0.5} />
          </mesh>
          <OfficePlant position={[0, 0.55, 0]} scale={1.15} variant={i} />
        </group>
      ))}

      {/* Extra biophilia along open edge + corners */}
      <OfficePlant position={[-halfW + 1.2, 0, 2]} scale={1.4} variant={1} />
      <OfficePlant position={[halfW - 1.2, 0, 2.4]} scale={1.35} variant={2} />
      <OfficePlant position={[-halfW + 1.4, 0, -3]} scale={1.25} variant={0} />
      <OfficePlant position={[halfW - 1.5, 0, -2.5]} scale={1.3} variant={3} />
      <OfficePlant position={[-4.5, 0, openZ - 1.8]} scale={1.2} variant={2} />
      <OfficePlant position={[4.5, 0, openZ - 1.6]} scale={1.25} variant={0} />
      <OfficePlant position={[-2.2, 0, -6.2]} scale={1.15} variant={1} />
      <OfficePlant position={[2.4, 0, -6.0]} scale={1.2} variant={3} />
      {lod === "full" ? (
        <>
          <OfficePlant position={[-8.2, 0, 0.5]} scale={1.45} variant={0} />
          <OfficePlant position={[8.2, 0, -0.8]} scale={1.4} variant={2} />
        </>
      ) : null}

      {/* Pantry corner â€” Siruseri cafÃ© vibe */}
      <FilterCoffeePantry position={[halfW - 2.6, 0, openZ - 2.2]} lod={lod} />
      <FocusPod position={[-halfW + 2.2, 0, openZ - 2.8]} yaw={0.35} />
      <FocusPod position={[-halfW + 3.6, 0, -5.5]} yaw={-0.2} />

      {/* Branding rail */}
      <mesh position={[0, ceilingY - 0.55, backZ + 0.35]}>
        <boxGeometry args={[5.2, 0.35, 0.08]} />
        <meshStandardMaterial color="#0c1016" metalness={0.45} />
      </mesh>
      <Html position={[0, ceilingY - 0.55, backZ + 0.5]} center distanceFactor={16}>
        <div className="plaza-brand">
          <strong>Intellect Design Arena</strong>
          <span>Siruseri Â· à®šà®¿à®±à¯à®šà¯‡à®°à®¿ Â· Digital Office</span>
        </div>
      </Html>

      {/* Kolam accent near entry */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 8]} position={[0, 0.03, openZ - 1.2]}>
        <ringGeometry args={[0.55, 0.68, 6]} />
        <meshStandardMaterial
          color="#E8A838"
          emissive="#E8A838"
          emissiveIntensity={0.35}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Soft fill for open plan */}
      <pointLight position={[0, 3.2, 0]} intensity={0.4} distance={14} color="#ffe6c8" />
      <pointLight position={[-6, 2.8, -4]} intensity={0.28} distance={10} color="#c8e0ff" />
      <pointLight position={[6, 2.8, 3]} intensity={0.25} distance={10} color="#ffd0a0" />
      {/* Cool window light */}
      <directionalLight
        position={[0, 3.5, backZ - 2]}
        intensity={0.55}
        color="#d8ecff"
      />
    </group>
  );
}
