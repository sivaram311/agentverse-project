"use client";

import { useFrame } from "@react-three/fiber";
import { Html, Float } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";
import type { PersonaDef } from "@/lib/orchestrator";
import { useVerseStore } from "@/lib/store";

type Props = {
  persona: PersonaDef;
};

export function PersonaAvatar({ persona }: Props) {
  const group = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const selected = useVerseStore((s) => s.selectedPersona);
  const activeQuest = useVerseStore((s) =>
    s.quests.find((q) => q.status === "active" && q.assignee === persona.id),
  );
  const isSelected = selected === persona.id;
  const pos = useMemo(
    () => persona.position as [number, number, number],
    [persona.position],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.position.y = pos[1] + Math.sin(t * 1.4 + pos[0]) * 0.08;
      if (activeQuest) {
        group.current.rotation.y = t * 1.2;
      }
    }
    if (body.current && isSelected) {
      const s = 1 + Math.sin(t * 3) * 0.04;
      body.current.scale.setScalar(s);
    }
  });

  return (
    <Float speed={isSelected ? 2.2 : 1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group
        ref={group}
        position={pos}
        onClick={(e) => {
          e.stopPropagation();
          useVerseStore.getState().selectPersona(persona.id as never);
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        {/* Low-poly stylized figure */}
        <mesh ref={body} position={[0, 1.1, 0]} castShadow>
          <capsuleGeometry args={[0.35, 0.7, 4, 8]} />
          <meshStandardMaterial
            color={persona.color}
            emissive={persona.color}
            emissiveIntensity={isSelected ? 0.35 : 0.12}
            roughness={0.45}
            metalness={0.2}
          />
        </mesh>
        <mesh position={[0, 2.05, 0]} castShadow>
          <sphereGeometry args={[0.32, 12, 12]} />
          <meshStandardMaterial color="#F5E6D3" roughness={0.55} />
        </mesh>
        {/* LOD-ish distant marker (always cheap) */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.55, 16]} />
          <meshStandardMaterial
            color={persona.color}
            transparent
            opacity={isSelected ? 0.55 : 0.25}
          />
        </mesh>
        <Html
          position={[0, 2.7, 0]}
          center
          distanceFactor={8}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div className={`persona-tag${isSelected ? " active" : ""}`}>
            <strong>{persona.name}</strong>
            <span>{persona.role}</span>
            {activeQuest ? <em>On mission</em> : null}
          </div>
        </Html>
      </group>
    </Float>
  );
}
