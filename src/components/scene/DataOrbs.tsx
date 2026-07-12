"use client";

import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";
import { useVerseStore } from "@/lib/store";

/** Floating data orbs — one per open workspace / project directory. */
export function DataOrbs({ showLabels }: { showLabels: boolean }) {
  const workspacePath = useVerseStore(
    (s) => s.session?.workspacePath || s.workspacePath,
  );
  const projects = useVerseStore((s) => s.projects);
  const recent = useVerseStore((s) => s.recentWorkspaces);
  const a = useRef<Mesh>(null);
  const b = useRef<Mesh>(null);
  const c = useRef<Mesh>(null);

  const label = useMemo(() => {
    if (!workspacePath) return null;
    const parts = workspacePath.replace(/\\/g, "/").split("/");
    return parts[parts.length - 1] || workspacePath;
  }, [workspacePath]);

  const satellite = useMemo(
    () => projects.filter((p) => p.id !== "hub").slice(0, 4),
    [projects],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (a.current) {
      a.current.position.y = 1.6 + Math.sin(t * 1.3) * 0.15;
      a.current.rotation.y = t * 0.6;
    }
    if (b.current) {
      b.current.position.y = 1.8 + Math.sin(t * 1.1 + 1) * 0.12;
      b.current.rotation.y = -t * 0.5;
    }
    if (c.current) {
      c.current.position.y = 1.5 + Math.sin(t * 1.5 + 2) * 0.18;
      c.current.rotation.y = t * 0.7;
    }
  });

  return (
    <group>
      <group position={[0, 0, -3.2]}>
        <mesh
          ref={a}
          position={[-1.1, 1.6, 0]}
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
        <mesh ref={b} position={[0, 1.8, 0.3]} castShadow>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial
            color="#4DA3FF"
            emissive="#4DA3FF"
            emissiveIntensity={0.4}
            metalness={0.55}
            roughness={0.3}
          />
        </mesh>
        <mesh ref={c} position={[1.1, 1.5, -0.2]} castShadow>
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
          <Html position={[0, 2.6, 0]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
            <div className="workspace-orb-label" title={workspacePath}>
              <span>Directory</span>
              <strong>{label}</strong>
              {recent.length > 1 ? <em>{recent.length} paths</em> : null}
            </div>
          </Html>
        ) : null}
      </group>
      {satellite.map((p) => (
        <mesh
          key={p.id}
          position={[
            p.clusterOffset[0],
            2.2,
            p.clusterOffset[2],
          ]}
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            useVerseStore.getState().setActiveProject(p.id);
          }}
        >
          <icosahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={0.5}
            metalness={0.55}
            roughness={0.28}
          />
        </mesh>
      ))}
    </group>
  );
}
