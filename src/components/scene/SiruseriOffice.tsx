"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";
import * as THREE from "three";
import { FilterCoffeePantry } from "./OfficeDetails";

export const SIRUSERI = {
  halfW: 10.5,
  backZ: -9.2,
  openZ: 7.4,
  ceilingY: 4.35,
  wallT: 0.18,
} as const;

/** Kept for CentralConference / legacy scenes — not used on empty floor. */
export function MandalaPulse({ lod }: { lod: "full" | "simple" }) {
  const spin = useRef<THREE.Group>(null);
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
      </group>
    </group>
  );
}

/** Daylit park wash beyond the glass (Intellect open-plan natural light). */
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
      <mesh position={[0, 3.2, -6]}>
        <planeGeometry args={[36, 14]} />
        <meshBasicMaterial color="#6a9ab8" />
      </mesh>
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

function WindowGodRays({ reducedMotion }: { reducedMotion: boolean }) {
  const shafts = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!shafts.current || reducedMotion) return;
    const t = state.clock.elapsedTime;
    shafts.current.children.forEach((child, i) => {
      const m = (child as Mesh).material as THREE.MeshBasicMaterial;
      if (m) m.opacity = 0.05 + Math.sin(t * 0.4 + i) * 0.018;
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
            color="#fff8e8"
            transparent
            opacity={0.06}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Intellect Design Arena · Siruseri — empty open plan:
 * bright epoxy floor, white pillars / glass, dark exposed ceiling + LEDs, pantry only.
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
    for (let x = -8.5; x <= 8.5; x += 2.1) {
      for (let z = -7; z <= 5.5; z += 2.2) {
        pts.push([x, ceilingY - 0.12, z]);
      }
    }
    return pts;
  }, [ceilingY]);

  const beams = useMemo(() => {
    const xs: number[] = [];
    for (let x = -9; x <= 9; x += 3) xs.push(x);
    return xs;
  }, []);

  const pillars = useMemo(
    () =>
      [
        [-5.5, -4.2],
        [5.5, -4.2],
        [-5.5, 1.8],
        [5.5, 1.8],
        [-2.2, -6.8],
        [2.2, -6.8],
        [0, 4.2],
      ] as [number, number][],
    [],
  );

  return (
    <group>
      {/* Polished dark slab — same coloring as pre-empty shell */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, midZ]} receiveShadow>
        <planeGeometry args={[halfW * 2.1, depth + 1.5]} />
        <meshStandardMaterial
          color="#0c1016"
          metalness={0.72}
          roughness={0.22}
        />
      </mesh>
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

      {/* Side walls — PROD dark shell */}
      <mesh position={[-halfW, ceilingY / 2, midZ]} castShadow receiveShadow>
        <boxGeometry args={[SIRUSERI.wallT, ceilingY, depth]} />
        <meshStandardMaterial color="#161c24" metalness={0.25} roughness={0.7} />
      </mesh>
      <mesh position={[halfW, ceilingY / 2, midZ]} castShadow receiveShadow>
        <boxGeometry args={[SIRUSERI.wallT, ceilingY, depth]} />
        <meshStandardMaterial color="#161c24" metalness={0.25} roughness={0.7} />
      </mesh>
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

      {/* Interior glass partition strips */}
      {lod === "full" ? (
        <>
          <GlassCurtain
            position={[-3.2, 1.55, -1.2]}
            size={[4.2, 2.6]}
            yaw={0.08}
            lod={lod}
          />
          <GlassCurtain
            position={[3.4, 1.55, 0.8]}
            size={[3.6, 2.6]}
            yaw={-0.12}
            lod={lod}
          />
        </>
      ) : null}

      <ParkView lod={lod} />
      {lod === "full" && !reducedMotion ? (
        <WindowGodRays reducedMotion={reducedMotion} />
      ) : null}

      {/* Structural pillars — PROD dark charcoal (not bright white) */}
      {pillars.map(([x, z], i) => (
        <mesh key={`p-${i}`} position={[x, ceilingY / 2, z]} castShadow receiveShadow>
          <boxGeometry args={[0.42, ceilingY - 0.08, 0.42]} />
          <meshStandardMaterial color="#161c24" metalness={0.3} roughness={0.65} />
        </mesh>
      ))}

      {/* Ceiling slab — PROD */}
      <mesh position={[0, ceilingY + 0.08, midZ]} receiveShadow>
        <boxGeometry args={[halfW * 2 - 0.15, 0.22, depth]} />
        <meshStandardMaterial color="#10141a" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Black beams */}
      {beams.map((x) => (
        <mesh key={`beam-${x}`} position={[x, ceilingY - 0.28, midZ]} castShadow>
          <boxGeometry args={[0.16, 0.28, depth - 0.4]} />
          <meshStandardMaterial color="#0a0e14" metalness={0.55} roughness={0.4} />
        </mesh>
      ))}

      {/* Duct runs */}
      {lod === "full"
        ? [-3, 3].map((x) => (
            <mesh
              key={`duct-${x}`}
              position={[x, ceilingY - 0.55, midZ]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.18, 0.18, depth * 0.72, 10]} />
              <meshStandardMaterial color="#2a2e32" metalness={0.65} roughness={0.35} />
            </mesh>
          ))
        : null}

      {/* Dense circular recessed / pendant LEDs */}
      {cans.map((p, i) => (
        <group key={`can-${i}`} position={p}>
          <mesh>
            <cylinderGeometry args={[0.14, 0.16, 0.06, 12]} />
            <meshStandardMaterial color="#0e1012" metalness={0.4} />
          </mesh>
          <mesh position={[0, -0.035, 0]}>
            <circleGeometry args={[0.11, 12]} />
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

      {/* Pantry only — keep crew staging / café corner */}
      <FilterCoffeePantry position={[halfW - 2.6, 0, openZ - 2.2]} lod={lod} />

      <mesh position={[0, ceilingY - 0.55, backZ + 0.35]}>
        <boxGeometry args={[5.2, 0.35, 0.08]} />
        <meshStandardMaterial color="#0c1016" metalness={0.45} />
      </mesh>
      <Html position={[0, ceilingY - 0.55, backZ + 0.5]} center distanceFactor={16}>
        <div className="plaza-brand">
          <strong>Intellect Design Arena</strong>
          <span>Siruseri · சிறுசேரி · Digital Office</span>
        </div>
      </Html>

      {/* Soft fill — PROD levels */}
      <pointLight position={[0, 3.2, 0]} intensity={0.4} distance={14} color="#ffe6c8" />
      <pointLight position={[-6, 2.8, -4]} intensity={0.28} distance={10} color="#c8e0ff" />
      <pointLight position={[6, 2.8, 3]} intensity={0.25} distance={10} color="#ffd0a0" />
      <directionalLight
        position={[0, 3.5, backZ - 2]}
        intensity={0.55}
        color="#d8ecff"
      />
    </group>
  );
}
