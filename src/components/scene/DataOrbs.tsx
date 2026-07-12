"use client";

import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";
import { useVerseStore } from "@/lib/store";

/** Floating crystalline data orbs for the active directory / projects. */
export function DataOrbs({ showLabels }: { showLabels: boolean }) {
  const workspacePath = useVerseStore(
    (s) => s.session?.workspacePath || s.workspacePath,
  );
  const projects = useVerseStore((s) => s.projects);
  const a = useRef<Mesh>(null);
  const b = useRef<Mesh>(null);
  const c = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);

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
      a.current.position.y = 2.1 + Math.sin(t * 1.2) * 0.18;
      a.current.rotation.y = t * 0.7;
      a.current.rotation.x = t * 0.25;
    }
    if (b.current) {
      b.current.position.y = 2.4 + Math.sin(t * 1.05 + 1) * 0.14;
      b.current.rotation.y = -t * 0.55;
    }
    if (c.current) {
      c.current.position.y = 2.0 + Math.sin(t * 1.4 + 2) * 0.2;
      c.current.rotation.y = t * 0.8;
    }
    if (ring.current) {
      ring.current.rotation.z = t * 0.25;
    }
  });

  return (
    <group>
      {/* Float above the hex table so the collab floor stays clear */}
      <group position={[0, 1.6, 0]}>
        <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]} position={[0, 2.4, 0]}>
          <torusGeometry args={[1.15, 0.02, 8, 48]} />
          <meshStandardMaterial
            color="#E8A838"
            emissive="#E8A838"
            emissiveIntensity={0.5}
            transparent
            opacity={0.45}
          />
        </mesh>
        <mesh
          ref={a}
          position={[-0.85, 2.3, 0.1]}
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            useVerseStore.getState().bumpChatFocus();
          }}
        >
          <icosahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial
            color="#E8A838"
            emissive="#E8A838"
            emissiveIntensity={0.55}
            metalness={0.7}
            roughness={0.18}
          />
        </mesh>
        <mesh ref={b} position={[0, 3.0, 0.25]} castShadow>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial
            color="#4DA3FF"
            emissive="#4DA3FF"
            emissiveIntensity={0.5}
            metalness={0.65}
            roughness={0.22}
          />
        </mesh>
        <mesh ref={c} position={[0.95, 2.65, -0.1]} castShadow>
          <dodecahedronGeometry args={[0.24, 0]} />
          <meshStandardMaterial
            color="#3DDC97"
            emissive="#3DDC97"
            emissiveIntensity={0.45}
            metalness={0.6}
            roughness={0.25}
          />
        </mesh>
        {showLabels && label ? (
          <Html position={[0, 3.7, 0]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
            <div className="workspace-orb-label" title={workspacePath}>
              <span>Directory</span>
              <strong>{label}</strong>
            </div>
          </Html>
        ) : null}
      </group>
      {satellite.map((p, i) => (
        <mesh
          key={p.id}
          position={[
            p.clusterOffset[0],
            2.4 + Math.sin(i) * 0.2,
            p.clusterOffset[2],
          ]}
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            useVerseStore.getState().setActiveProject(p.id);
          }}
        >
          <icosahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={0.55}
            metalness={0.6}
            roughness={0.22}
          />
        </mesh>
      ))}
    </group>
  );
}
