"use client";

import { useMemo } from "react";
import * as THREE from "three";

/** Kolam / mandala-inspired floor with golden neon rings. */
export function MandalaFloor() {
  const rings = useMemo(
    () =>
      [2.2, 4.0, 6.2, 8.8, 11.5].map((r, i) => ({
        r,
        w: 0.08 + (i % 2) * 0.04,
        opacity: 0.55 - i * 0.06,
      })),
    [],
  );

  const petals = useMemo(() => {
    const items: { angle: number; radius: number }[] = [];
    for (let i = 0; i < 12; i++) {
      items.push({ angle: (i / 12) * Math.PI * 2, radius: 5.1 });
    }
    for (let i = 0; i < 8; i++) {
      items.push({ angle: (i / 8) * Math.PI * 2 + 0.2, radius: 7.4 });
    }
    return items;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <circleGeometry args={[16, 64]} />
        <meshStandardMaterial
          color="#0c1420"
          metalness={0.35}
          roughness={0.72}
        />
      </mesh>
      {/* Soft Tamil Nadu warm wash */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[9.5, 48]} />
        <meshStandardMaterial
          color="#1a1520"
          emissive="#3a2810"
          emissiveIntensity={0.15}
          transparent
          opacity={0.55}
        />
      </mesh>
      {rings.map((ring) => (
        <mesh
          key={ring.r}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.012, 0]}
        >
          <ringGeometry args={[ring.r, ring.r + ring.w, 72]} />
          <meshStandardMaterial
            color="#E8A838"
            emissive="#E8A838"
            emissiveIntensity={0.55}
            transparent
            opacity={ring.opacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {petals.map((p, i) => (
        <mesh
          key={`petal-${i}`}
          rotation={[-Math.PI / 2, 0, p.angle]}
          position={[
            Math.cos(p.angle) * p.radius,
            0.015,
            Math.sin(p.angle) * p.radius,
          ]}
        >
          <circleGeometry args={[0.35, 3]} />
          <meshStandardMaterial
            color="#C4A35A"
            emissive="#C4A35A"
            emissiveIntensity={0.35}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}
      {/* Hub podium */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.35, 1.55, 0.08, 32]} />
        <meshStandardMaterial color="#162030" metalness={0.55} roughness={0.35} />
      </mesh>
    </group>
  );
}

export function OfficeLighting({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <ambientLight intensity={0.32} />
      <directionalLight
        castShadow={!reducedMotion}
        position={[7, 12, 5]}
        intensity={1.05}
        color="#fff4e6"
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 5, 0]} intensity={0.55} color="#E8A838" distance={18} />
      <pointLight position={[-6, 3.5, -3]} intensity={0.4} color="#4DA3FF" distance={14} />
      <pointLight position={[6, 3.2, 3]} intensity={0.35} color="#FF6BCB" distance={14} />
      <pointLight position={[0, 2.5, -7]} intensity={0.3} color="#5EEAD4" distance={12} />
    </>
  );
}
