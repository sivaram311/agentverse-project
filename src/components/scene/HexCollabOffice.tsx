"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";
import * as THREE from "three";
import { HEX_DESK_RADIUS } from "@/lib/hex-office";

/** Floating holographic orb above the hex collab table. */
function HoloOrb({ y, lod }: { y: number; lod: "full" | "simple" }) {
  const core = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (core.current) {
      core.current.position.y = y + Math.sin(t * 1.4) * 0.08;
      core.current.rotation.y = t * 0.7;
      const mat = core.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.75 + Math.sin(t * 2.2) * 0.15;
    }
    if (ring.current) {
      ring.current.rotation.x = t * 0.55;
      ring.current.rotation.z = t * 0.35;
    }
  });

  return (
    <group>
      <mesh ref={core} position={[0, y, 0]}>
        <icosahedronGeometry args={[0.28, lod === "full" ? 1 : 0]} />
        <meshStandardMaterial
          color="#4DA3FF"
          emissive="#4DA3FF"
          emissiveIntensity={0.8}
          metalness={0.35}
          roughness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh ref={ring} position={[0, y, 0]}>
        <torusGeometry args={[0.42, 0.018, 8, 36]} />
        <meshStandardMaterial
          color="#E8A838"
          emissive="#E8A838"
          emissiveIntensity={0.7}
          transparent
          opacity={0.75}
        />
      </mesh>
      {lod === "full" ? (
        <mesh position={[0, y, 0]} rotation={[Math.PI / 2.4, 0.3, 0]}>
          <torusGeometry args={[0.52, 0.012, 6, 32]} />
          <meshStandardMaterial
            color="#3DDC97"
            emissive="#3DDC97"
            emissiveIntensity={0.55}
            transparent
            opacity={0.55}
          />
        </mesh>
      ) : null}
      <pointLight position={[0, y, 0]} intensity={0.45} distance={4.5} color="#6ab0ff" />
    </group>
  );
}

/**
 * Real collab HQ: hexagonal meeting table, carpet, hub well for Rajesh,
 * pendant lights, plants, and soft glass partitions at the vertices.
 */
export function HexCollabOffice({ lod = "full" }: { lod?: "full" | "simple" }) {
  const pendant = useRef<Group>(null);
  const segs = lod === "simple" ? 6 : 6;

  useFrame((state) => {
    if (pendant.current && lod === "full") {
      const t = state.clock.elapsedTime;
      pendant.current.children.forEach((child, i) => {
        const light = child.children.find((c) => c.type === "PointLight") as
          | THREE.PointLight
          | undefined;
        if (light) {
          light.intensity = 0.28 + Math.sin(t * 1.4 + i) * 0.04;
        }
      });
    }
  });

  const tableRadius = 1.75;
  const carpetR = 4.6;
  const tableY = 0.52;

  const vertexAngles = useMemo(
    () => Array.from({ length: 6 }, (_, i) => -Math.PI / 2 + i * (Math.PI / 3)),
    [],
  );

  return (
    <group>
      {/* Warm office carpet under the benzene table */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <circleGeometry args={[carpetR, lod === "simple" ? 24 : 48]} />
        <meshStandardMaterial color="#1a1512" roughness={0.92} metalness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 6]} position={[0, 0.035, 0]} receiveShadow>
        <circleGeometry args={[carpetR * 0.72, 6]} />
        <meshStandardMaterial
          color="#241c16"
          roughness={0.88}
          metalness={0.08}
          emissive="#3a2810"
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* Hex collaboration tabletop — miniature scale */}
      <mesh
        position={[0, tableY, 0]}
        rotation={[0, Math.PI / 6, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[tableRadius, tableRadius, 0.05, segs]} />
        <meshStandardMaterial
          color="#2a2118"
          roughness={0.35}
          metalness={0.25}
        />
      </mesh>
      <mesh position={[0, tableY + 0.03, 0]} rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[tableRadius * 0.92, tableRadius * 0.92, 0.015, segs]} />
        <meshPhysicalMaterial
          color="#3d4a58"
          metalness={0.4}
          roughness={0.12}
          transmission={lod === "full" ? 0.12 : 0}
          thickness={0.25}
          transparent
          opacity={0.88}
        />
      </mesh>

      <mesh position={[0, tableY - 0.02, 0]} rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[tableRadius + 0.03, tableRadius + 0.03, 0.04, segs]} />
        <meshStandardMaterial color="#0e1218" metalness={0.55} roughness={0.4} />
      </mesh>

      {/* Center hub well */}
      <mesh position={[0, tableY + 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.6, 0.045, 20]} />
        <meshStandardMaterial color="#141a22" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, tableY + 0.07, 0]}>
        <torusGeometry args={[0.52, 0.025, 8, 32]} />
        <meshStandardMaterial
          color="#FF6200"
          emissive="#FF6200"
          emissiveIntensity={0.5}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, tableY + 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.17, 0.05, 14]} />
        <meshStandardMaterial color="#0c1016" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, tableY + 0.13, 0]}>
        <cylinderGeometry args={[0.05, 0.065, 0.03, 10]} />
        <meshStandardMaterial
          color="#E8A838"
          emissive="#E8A838"
          emissiveIntensity={0.65}
        />
      </mesh>

      {/* Holographic collab orb — Intellect-style centerpiece */}
      <HoloOrb y={tableY + 0.95} lod={lod} />

      {/* Table legs */}
      {vertexAngles.map((a, i) => {
        const r = tableRadius * 0.78;
        return (
          <mesh
            key={`leg-${i}`}
            position={[Math.cos(a) * r, tableY / 2, Math.sin(a) * r]}
            castShadow
          >
            <cylinderGeometry args={[0.04, 0.055, tableY, 8]} />
            <meshStandardMaterial color="#0c1016" metalness={0.65} roughness={0.35} />
          </mesh>
        );
      })}

      {/* Mini laptops on table rim */}
      {lod === "full"
        ? vertexAngles.map((a, i) => {
            const r = tableRadius * 0.58;
            const x = Math.cos(a) * r;
            const z = Math.sin(a) * r;
            const yaw = a + Math.PI;
            return (
              <group key={`prop-${i}`} position={[x, tableY + 0.04, z]} rotation={[0, yaw, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.26, 0.015, 0.18]} />
                  <meshStandardMaterial color="#121820" metalness={0.5} roughness={0.35} />
                </mesh>
                <mesh position={[0, 0.06, -0.05]} rotation={[-0.4, 0, 0]}>
                  <boxGeometry args={[0.24, 0.15, 0.01]} />
                  <meshStandardMaterial
                    color={i % 2 === 0 ? "#4DA3FF" : "#3DDC97"}
                    emissive={i % 2 === 0 ? "#4DA3FF" : "#3DDC97"}
                    emissiveIntensity={0.3}
                    transparent
                    opacity={0.75}
                  />
                </mesh>
              </group>
            );
          })
        : null}

      {/* Pendant lights */}
      <group ref={pendant}>
        {vertexAngles.map((a, i) => {
          const r = 1.25;
          const x = Math.cos(a) * r;
          const z = Math.sin(a) * r;
          return (
            <group key={`pend-${i}`} position={[x, 3.15, z]}>
              <mesh>
                <cylinderGeometry args={[0.015, 0.015, 0.9, 6]} />
                <meshStandardMaterial color="#1a2030" metalness={0.5} />
              </mesh>
              <mesh position={[0, -0.55, 0]}>
                <cylinderGeometry args={[0.12, 0.09, 0.08, 12]} />
                <meshStandardMaterial
                  color="#fff0d0"
                  emissive="#ffe0a8"
                  emissiveIntensity={0.85}
                />
              </mesh>
              <pointLight
                position={[0, -0.6, 0]}
                intensity={0.22}
                distance={3.8}
                color="#ffe6c0"
              />
            </group>
          );
        })}
      </group>

      {/* Corner plants inside carpet */}
      {lod === "full"
        ? vertexAngles.map((a, i) => {
            const r = carpetR * 0.72;
            const x = Math.cos(a + Math.PI / 6) * r;
            const z = Math.sin(a + Math.PI / 6) * r;
            return (
              <group key={`plant-${i}`} position={[x, 0, z]}>
                <mesh position={[0, 0.18, 0]} castShadow>
                  <cylinderGeometry args={[0.16, 0.2, 0.36, 8]} />
                  <meshStandardMaterial color="#2a1810" roughness={0.8} />
                </mesh>
                <mesh position={[0, 0.55, 0]} castShadow>
                  <sphereGeometry args={[0.28, 8, 8]} />
                  <meshStandardMaterial color="#1f4d38" roughness={0.7} />
                </mesh>
              </group>
            );
          })
        : null}

      {/* Floor hex guide ring (benzene bond) */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 6]} position={[0, 0.045, 0]}>
        <ringGeometry args={[HEX_DESK_RADIUS - 0.15, HEX_DESK_RADIUS + 0.05, 6]} />
        <meshStandardMaterial
          color="#FF6200"
          emissive="#FF6200"
          emissiveIntensity={0.35}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/** Hub chair — Rajesh sits at z≈0.42 facing the collab orb (toward −Z). */
export function HubChair({ color }: { color: string }) {
  const glow = useRef<Mesh>(null);
  useFrame((state) => {
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={[0, 0, 0.42]}>
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.24, 0.05, 14]} />
        <meshStandardMaterial color="#1a2030" metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.58, 0.14]} castShadow>
        <boxGeometry args={[0.3, 0.4, 0.05]} />
        <meshStandardMaterial color="#1a2030" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.038, 0.32, 6]} />
        <meshStandardMaterial color="#0c121a" metalness={0.5} />
      </mesh>
      <mesh ref={glow} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.3}
        />
      </mesh>
      {/* Laptop on table well in front (−Z) */}
      <mesh position={[0, 0.58, -0.35]} castShadow>
        <boxGeometry args={[0.3, 0.015, 0.2]} />
        <meshStandardMaterial color="#101820" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.7, -0.42]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.28, 0.17, 0.012]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.88}
        />
      </mesh>
    </group>
  );
}
