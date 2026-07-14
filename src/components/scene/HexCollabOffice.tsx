"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";
import * as THREE from "three";
import { HEX_DESK_RADIUS } from "@/lib/hex-office";
import { PALETTE } from "@/lib/office-palette";

/** Soft blue collab marker above the hex table — no gold rings. */
function HoloOrb({ y, lod }: { y: number; lod: "full" | "simple" }) {
  const core = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (core.current) {
      core.current.position.y = y + Math.sin(t * 1.4) * 0.08;
      core.current.rotation.y = t * 0.7;
      const mat = core.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.55 + Math.sin(t * 2.2) * 0.12;
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
          color={PALETTE.whiteboardFrame}
          emissive={PALETTE.whiteboardFrame}
          emissiveIntensity={0.65}
          metalness={0.35}
          roughness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh ref={ring} position={[0, y, 0]}>
        <torusGeometry args={[0.42, 0.014, 8, 36]} />
        <meshStandardMaterial
          color={PALETTE.tealAccent}
          emissive={PALETTE.tealAccent}
          emissiveIntensity={0.45}
          transparent
          opacity={0.65}
        />
      </mesh>
      {lod === "full" ? (
        <mesh position={[0, y, 0]} rotation={[Math.PI / 2.4, 0.3, 0]}>
          <torusGeometry args={[0.52, 0.01, 6, 32]} />
          <meshStandardMaterial
            color={PALETTE.glassEdge}
            emissive={PALETTE.glassEdge}
            emissiveIntensity={0.35}
            transparent
            opacity={0.45}
          />
        </mesh>
      ) : null}
      <pointLight
        position={[0, y, 0]}
        intensity={0.35}
        distance={4.5}
        color={PALETTE.skylight}
      />
    </group>
  );
}

/** Simple industrial guest seat — white seat, black base. */
function CollabChair({
  position,
  yaw,
}: {
  position: [number, number, number];
  yaw: number;
}) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[0.32, 0.04, 0.3]} />
        <meshStandardMaterial color={PALETTE.wallPure} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.58, -0.11]} castShadow>
        <boxGeometry args={[0.3, 0.36, 0.04]} />
        <meshStandardMaterial color={PALETTE.chairMesh} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.032, 0.32, 6]} />
        <meshStandardMaterial color={PALETTE.chair} metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.03, 10]} />
        <meshStandardMaterial color={PALETTE.chair} metalness={0.45} roughness={0.4} />
      </mesh>
    </group>
  );
}

/**
 * Industrial collab HQ: white carpet, teal/white hex table, mesh chairs,
 * cool downlights, and soft glass partitions at the vertices.
 */
export function HexCollabOffice({ lod = "full" }: { lod?: "full" | "simple" }) {
  const pendant = useRef<Group>(null);
  const segs = 6;

  useFrame((state) => {
    if (pendant.current && lod === "full") {
      const t = state.clock.elapsedTime;
      pendant.current.children.forEach((child, i) => {
        const light = child.children.find((c) => c.type === "PointLight") as
          | THREE.PointLight
          | undefined;
        if (light) {
          light.intensity = 0.22 + Math.sin(t * 1.4 + i) * 0.03;
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
      {/* White / light floor mat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <circleGeometry args={[carpetR, lod === "simple" ? 24 : 48]} />
        <meshStandardMaterial color={PALETTE.wallPure} roughness={0.92} metalness={0.02} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 6]} position={[0, 0.035, 0]} receiveShadow>
        <circleGeometry args={[carpetR * 0.72, 6]} />
        <meshStandardMaterial
          color={PALETTE.floorTint}
          roughness={0.9}
          metalness={0.03}
        />
      </mesh>

      {/* Hex tabletop — white frame + teal surface */}
      <mesh
        position={[0, tableY, 0]}
        rotation={[0, Math.PI / 6, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[tableRadius, tableRadius, 0.05, segs]} />
        <meshStandardMaterial
          color={PALETTE.deskFrame}
          roughness={0.4}
          metalness={0.15}
        />
      </mesh>
      <mesh position={[0, tableY + 0.03, 0]} rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[tableRadius * 0.92, tableRadius * 0.92, 0.015, segs]} />
        <meshPhysicalMaterial
          color={PALETTE.deskTop}
          metalness={0.25}
          roughness={0.22}
          transmission={lod === "full" ? 0.06 : 0}
          thickness={0.2}
          transparent
          opacity={0.92}
        />
      </mesh>

      <mesh position={[0, tableY - 0.02, 0]} rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[tableRadius + 0.03, tableRadius + 0.03, 0.04, segs]} />
        <meshStandardMaterial color={PALETTE.chair} metalness={0.45} roughness={0.4} />
      </mesh>

      {/* Center hub well */}
      <mesh position={[0, tableY + 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.6, 0.045, 20]} />
        <meshStandardMaterial color={PALETTE.floor} metalness={0.2} roughness={0.45} />
      </mesh>
      <mesh position={[0, tableY + 0.07, 0]}>
        <torusGeometry args={[0.52, 0.022, 8, 32]} />
        <meshStandardMaterial
          color={PALETTE.tealAccent}
          emissive={PALETTE.tealAccent}
          emissiveIntensity={0.35}
          metalness={0.35}
          roughness={0.35}
        />
      </mesh>

      <mesh position={[0, tableY + 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.17, 0.05, 14]} />
        <meshStandardMaterial color={PALETTE.chair} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, tableY + 0.13, 0]}>
        <cylinderGeometry args={[0.05, 0.065, 0.03, 10]} />
        <meshStandardMaterial
          color={PALETTE.whiteboardFrame}
          emissive={PALETTE.whiteboardFrame}
          emissiveIntensity={0.45}
        />
      </mesh>

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
            <meshStandardMaterial color={PALETTE.chair} metalness={0.55} roughness={0.35} />
          </mesh>
        );
      })}

      {/* Guest chairs around the table */}
      {vertexAngles.map((a, i) => {
        const r = tableRadius + 0.55;
        return (
          <CollabChair
            key={`chair-${i}`}
            position={[Math.cos(a) * r, 0, Math.sin(a) * r]}
            yaw={a + Math.PI}
          />
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
                  <meshStandardMaterial
                    color={PALETTE.laptopSilver}
                    metalness={0.55}
                    roughness={0.3}
                  />
                </mesh>
                <mesh position={[0, 0.06, -0.05]} rotation={[-0.4, 0, 0]}>
                  <boxGeometry args={[0.24, 0.15, 0.01]} />
                  <meshStandardMaterial
                    color={i % 2 === 0 ? PALETTE.whiteboardFrame : PALETTE.tealAccent}
                    emissive={i % 2 === 0 ? PALETTE.whiteboardFrame : PALETTE.tealAccent}
                    emissiveIntensity={0.25}
                    transparent
                    opacity={0.75}
                  />
                </mesh>
              </group>
            );
          })
        : null}

      {/* Cool industrial downlights (no gold pendant vibe) */}
      <group ref={pendant}>
        {vertexAngles.map((a, i) => {
          const r = 1.25;
          const x = Math.cos(a) * r;
          const z = Math.sin(a) * r;
          return (
            <group key={`pend-${i}`} position={[x, 3.15, z]}>
              <mesh>
                <cylinderGeometry args={[0.012, 0.012, 0.7, 6]} />
                <meshStandardMaterial color={PALETTE.ceilingBeam} metalness={0.5} />
              </mesh>
              <mesh position={[0, -0.42, 0]}>
                <cylinderGeometry args={[0.1, 0.12, 0.06, 12]} />
                <meshStandardMaterial
                  color={PALETTE.wallPure}
                  emissive={PALETTE.skylight}
                  emissiveIntensity={0.7}
                />
              </mesh>
              <pointLight
                position={[0, -0.5, 0]}
                intensity={0.2}
                distance={3.8}
                color={PALETTE.skylight}
              />
            </group>
          );
        })}
      </group>

      {/* Corner plants — neutral pots */}
      {lod === "full"
        ? vertexAngles.map((a, i) => {
            const r = carpetR * 0.72;
            const x = Math.cos(a + Math.PI / 6) * r;
            const z = Math.sin(a + Math.PI / 6) * r;
            return (
              <group key={`plant-${i}`} position={[x, 0, z]}>
                <mesh position={[0, 0.18, 0]} castShadow>
                  <cylinderGeometry args={[0.16, 0.2, 0.36, 8]} />
                  <meshStandardMaterial color={PALETTE.floor} roughness={0.75} />
                </mesh>
                <mesh position={[0, 0.55, 0]} castShadow>
                  <sphereGeometry args={[0.28, 8, 8]} />
                  <meshStandardMaterial color="#2a5a48" roughness={0.7} />
                </mesh>
              </group>
            );
          })
        : null}

      {/* Soft glass partitions at vertices */}
      {lod === "full"
        ? vertexAngles.map((a, i) => {
            const r = carpetR * 0.88;
            const x = Math.cos(a) * r;
            const z = Math.sin(a) * r;
            return (
              <group key={`glass-${i}`} position={[x, 1.05, z]} rotation={[0, a + Math.PI / 2, 0]}>
                <mesh>
                  <boxGeometry args={[1.1, 1.9, 0.04]} />
                  <meshPhysicalMaterial
                    color={PALETTE.glass}
                    transparent
                    opacity={0.22}
                    transmission={0.35}
                    roughness={0.08}
                    metalness={0.05}
                  />
                </mesh>
                <mesh position={[0, 0, 0.02]}>
                  <boxGeometry args={[1.14, 1.94, 0.02]} />
                  <meshStandardMaterial
                    color={PALETTE.glassEdge}
                    metalness={0.35}
                    roughness={0.4}
                    transparent
                    opacity={0.35}
                  />
                </mesh>
              </group>
            );
          })
        : null}

      {/* Subtle desk-radius guide — teal, not orange mandala */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 6]} position={[0, 0.045, 0]}>
        <ringGeometry args={[HEX_DESK_RADIUS - 0.12, HEX_DESK_RADIUS + 0.03, 6]} />
        <meshStandardMaterial
          color={PALETTE.tealAccent}
          emissive={PALETTE.tealAccent}
          emissiveIntensity={0.12}
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/** Hub chair — black mesh seat / industrial base; Rajesh at z≈0.42 facing −Z. */
export function HubChair({ color }: { color: string }) {
  const glow = useRef<Mesh>(null);
  useFrame((state) => {
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
    }
  });

  return (
    <group position={[0, 0, 0.42]}>
      {/* White seat cushion */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[0.32, 0.045, 0.3]} />
        <meshStandardMaterial color={PALETTE.wallPure} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Black mesh inset */}
      <mesh position={[0, 0.405, 0.01]}>
        <boxGeometry args={[0.26, 0.01, 0.24]} />
        <meshStandardMaterial color={PALETTE.chairMesh} roughness={0.75} />
      </mesh>
      {/* Mesh backrest */}
      <mesh position={[0, 0.58, 0.12]} castShadow>
        <boxGeometry args={[0.3, 0.4, 0.04]} />
        <meshStandardMaterial color={PALETTE.chairMesh} roughness={0.7} />
      </mesh>
      {/* Black stem + base */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.038, 0.32, 6]} />
        <meshStandardMaterial color={PALETTE.chair} metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.16, 0.035, 10]} />
        <meshStandardMaterial color={PALETTE.chair} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh ref={glow} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.36, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.22}
        />
      </mesh>
      {/* Laptop toward −Z */}
      <mesh position={[0, 0.58, -0.35]} castShadow>
        <boxGeometry args={[0.3, 0.015, 0.2]} />
        <meshStandardMaterial
          color={PALETTE.laptopSilver}
          metalness={0.55}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.7, -0.42]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.28, 0.17, 0.012]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.45}
          transparent
          opacity={0.88}
        />
      </mesh>
    </group>
  );
}
