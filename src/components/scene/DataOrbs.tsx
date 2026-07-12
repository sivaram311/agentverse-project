"use client";

import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";
import { useVerseStore } from "@/lib/store";

/** Floating data orbs representing the active session workspace path. */
export function DataOrbs({ showLabels }: { showLabels: boolean }) {
  const workspacePath = useVerseStore(
    (s) => s.session?.workspacePath || s.workspacePath,
  );
  const session = useVerseStore((s) => s.session);
  const a = useRef<Mesh>(null);
  const b = useRef<Mesh>(null);
  const c = useRef<Mesh>(null);

  const label = useMemo(() => {
    if (!workspacePath) return null;
    const parts = workspacePath.replace(/\\/g, "/").split("/");
    return parts[parts.length - 1] || workspacePath;
  }, [workspacePath]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (a.current) {
      a.current.position.y = 1.2 + Math.sin(t * 1.3) * 0.15;
      a.current.rotation.y = t * 0.6;
    }
    if (b.current) {
      b.current.position.y = 1.4 + Math.sin(t * 1.1 + 1) * 0.12;
      b.current.rotation.y = -t * 0.5;
    }
    if (c.current) {
      c.current.position.y = 1.1 + Math.sin(t * 1.5 + 2) * 0.18;
      c.current.rotation.y = t * 0.7;
    }
  });

  if (!session && !workspacePath) return null;

  return (
    <group position={[0, 0, -2.2]}>
      <mesh
        ref={a}
        position={[-1.1, 1.2, 0]}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          useVerseStore.getState().bumpChatFocus();
        }}
      >
        <icosahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial
          color="#E8A838"
          emissive="#E8A838"
          emissiveIntensity={0.45}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
      <mesh ref={b} position={[0, 1.4, 0.3]} castShadow>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial
          color="#4DA3FF"
          emissive="#4DA3FF"
          emissiveIntensity={0.4}
          metalness={0.55}
          roughness={0.3}
        />
      </mesh>
      <mesh ref={c} position={[1.1, 1.1, -0.2]} castShadow>
        <dodecahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial
          color="#3DDC97"
          emissive="#3DDC97"
          emissiveIntensity={0.35}
          metalness={0.5}
          roughness={0.35}
        />
      </mesh>
      {showLabels && label ? (
        <Html position={[0, 2.2, 0]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div className="workspace-orb-label" title={workspacePath}>
            <span>Quest hub</span>
            <strong>{label}</strong>
          </div>
        </Html>
      ) : null}
    </group>
  );
}
