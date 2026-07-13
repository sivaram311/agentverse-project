"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { HQ_BOUNDS } from "@/lib/office-layout";

export type ElevatorShaftProps = {
  position: [number, number, number];
  size?: [number, number, number];
  yaw?: number;
  side: "left" | "right";
  doorProgress?: number;
  autoCycle?: boolean;
  reducedMotion?: boolean;
  lod?: "full" | "simple";
};

/** Modern glass/metal elevator shaft with animated doors. */
export function ElevatorShaft({
  position,
  size = [2.4, HQ_BOUNDS.ceilingY, 2.2],
  yaw = 0,
  side,
  doorProgress,
  autoCycle = true,
  reducedMotion = false,
  lod = "full",
}: ElevatorShaftProps) {
  const [w, h, d] = size;
  const doors = useRef<Group>(null);
  const open = useRef(doorProgress ?? 0.15);

  useFrame((state) => {
    if (doorProgress !== undefined) {
      open.current = doorProgress;
    } else if (autoCycle && !reducedMotion) {
      const t = state.clock.elapsedTime;
      open.current = 0.08 + (Math.sin(t * 0.35 + (side === "left" ? 0 : 1.7)) * 0.5 + 0.5) * 0.85;
    } else if (reducedMotion) {
      open.current = 0.15;
    }
    if (doors.current) {
      const leaf = (w * 0.45) * open.current;
      const left = doors.current.children[0];
      const right = doors.current.children[1];
      if (left) left.position.x = -w * 0.22 - leaf * 0.5;
      if (right) right.position.x = w * 0.22 + leaf * 0.5;
    }
  });

  const sign = side === "left" ? 1 : -1;

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Frame */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w + 0.12, h, d + 0.12]} />
        <meshStandardMaterial color="#121820" metalness={0.45} roughness={0.4} />
      </mesh>
      {/* Interior void (darker) */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w * 0.88, h * 0.92, d * 0.88]} />
        <meshStandardMaterial color="#0a0e14" metalness={0.2} roughness={0.8} />
      </mesh>
      {/* Glass side panels */}
      {lod === "full" ? (
        <>
          <mesh position={[0, h / 2, d / 2 + 0.01]}>
            <planeGeometry args={[w * 0.85, h * 0.85]} />
            <meshPhysicalMaterial
              color="#9ec8dc"
              transparent
              opacity={0.16}
              transmission={0.4}
              roughness={0.08}
              metalness={0.05}
            />
          </mesh>
          <mesh position={[0, h / 2, -d / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[w * 0.85, h * 0.85]} />
            <meshPhysicalMaterial
              color="#9ec8dc"
              transparent
              opacity={0.16}
              transmission={0.4}
              roughness={0.08}
              metalness={0.05}
            />
          </mesh>
        </>
      ) : null}
      {/* Doors (front) */}
      <group ref={doors} position={[0, h * 0.45, d / 2 + 0.02]}>
        <mesh position={[-w * 0.22, 0, 0]}>
          <boxGeometry args={[w * 0.42, h * 0.82, 0.04]} />
          <meshStandardMaterial color="#1a222c" metalness={0.55} roughness={0.35} />
        </mesh>
        <mesh position={[w * 0.22, 0, 0]}>
          <boxGeometry args={[w * 0.42, h * 0.82, 0.04]} />
          <meshStandardMaterial color="#1a222c" metalness={0.55} roughness={0.35} />
        </mesh>
      </group>
      {/* Call button */}
      {lod === "full" ? (
        <mesh position={[sign * (w / 2 + 0.08), 1.1, d / 2 + 0.06]}>
          <boxGeometry args={[0.08, 0.18, 0.04]} />
          <meshStandardMaterial
            color="#E8A838"
            emissive="#E8A838"
            emissiveIntensity={0.65}
          />
        </mesh>
      ) : null}
      {/* Floor plate */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.9, d * 0.9]} />
        <meshStandardMaterial color="#121018" metalness={0.5} roughness={0.35} />
      </mesh>
    </group>
  );
}
