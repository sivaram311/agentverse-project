"use client";

import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";
import type { PersonaDef } from "@/lib/orchestrator";
import { speakPersona, stopSpeaking, type VoicePrefs } from "@/lib/speech";
import { useVerseStore } from "@/lib/store";
import type { PersonaId } from "@/lib/types";
import { useApproachBehavior } from "./useApproachBehavior";

type Props = {
  persona: PersonaDef & {
    greeting?: string;
    voice?: VoicePrefs;
  };
  reducedMotion: boolean;
  showLabels: boolean;
};

export function PersonaAvatar({ persona, reducedMotion, showLabels }: Props) {
  const group = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const arm = useRef<Mesh>(null);
  const [wavePhase, setWavePhase] = useState(0);

  const selected = useVerseStore((s) => s.selectedPersona);
  const focusId = useVerseStore((s) => s.interaction.focusId);
  const subtitle = useVerseStore((s) => s.subtitle);
  const activeQuest = useVerseStore((s) =>
    s.quests.find((q) => q.status === "active" && q.assignee === persona.id),
  );

  const isSelected = selected === persona.id;
  const isFocus = focusId === persona.id;

  const pos = useMemo(
    () => persona.position as [number, number, number],
    [persona.position],
  );

  // Seed home once — do not bind position as a React prop (fights walk lerp).
  useLayoutEffect(() => {
    if (group.current) {
      group.current.position.set(...pos);
    }
  }, [pos]);

  const onArrivedGreet = useCallback(() => {
    const store = useVerseStore.getState();
    const line =
      persona.greeting ??
      `Namaste! Main ${persona.name} hoon. How can I help?`;
    store.setInteraction({ mode: "greeting", focusId: persona.id as PersonaId });
    store.setSubtitle(line);
    store.markGreeted(persona.id as PersonaId);
    store.bumpChatFocus();
    if (!reducedMotion) {
      speakPersona(persona.id as PersonaId, line, persona.voice);
    }
    setWavePhase(1);
    window.setTimeout(() => {
      const s = useVerseStore.getState();
      if (s.interaction.focusId === persona.id) {
        s.setInteraction({ mode: "talking" });
      }
      setWavePhase(0);
    }, 2200);
  }, [persona, reducedMotion]);

  useApproachBehavior({
    personaId: persona.id as PersonaId,
    home: pos,
    groupRef: group,
    reducedMotion,
    onArrivedGreet,
  });

  // Safety: if walk never reports arrival (tab throttle / headless), still greet.
  useLayoutEffect(() => {
    if (!isFocus) return;
    const mode = useVerseStore.getState().interaction.mode;
    if (mode !== "approaching") return;
    const t = window.setTimeout(() => {
      const s = useVerseStore.getState();
      if (s.interaction.focusId === persona.id && s.interaction.mode === "approaching") {
        onArrivedGreet();
      }
    }, 2800);
    return () => window.clearTimeout(t);
  }, [isFocus, persona.id, onArrivedGreet]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (body.current && isSelected && !isFocus) {
      const s = 1 + Math.sin(t * 3) * 0.04;
      body.current.scale.setScalar(s);
    }
    if (arm.current && wavePhase > 0) {
      arm.current.rotation.z = Math.sin(t * 10) * 0.7 - 0.4;
    } else if (arm.current) {
      arm.current.rotation.z = 0;
    }
  });

  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        stopSpeaking();
        useVerseStore.getState().summonPersona(persona.id as PersonaId);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <mesh ref={body} position={[0, 1.1, 0]} castShadow>
        <capsuleGeometry args={[0.35, 0.7, 4, 8]} />
        <meshStandardMaterial
          color={persona.color}
          emissive={persona.color}
          emissiveIntensity={isSelected || isFocus ? 0.35 : 0.12}
          roughness={0.45}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0, 2.05, 0]} castShadow>
        <sphereGeometry args={[0.32, 12, 12]} />
        <meshStandardMaterial color="#F5E6D3" roughness={0.55} />
      </mesh>
      <mesh ref={arm} position={[0.45, 1.35, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.35, 3, 6]} />
        <meshStandardMaterial color={persona.color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 16]} />
        <meshStandardMaterial
          color={persona.color}
          transparent
          opacity={isSelected || isFocus ? 0.55 : 0.25}
        />
      </mesh>
      {showLabels || isFocus ? (
        <Html
          position={[0, 2.7, 0]}
          center
          distanceFactor={8}
          style={{ pointerEvents: "none", userSelect: "none" }}
          zIndexRange={[10, 0]}
        >
          <div className={`persona-tag${isSelected || isFocus ? " active" : ""}`}>
            <strong>{persona.name}</strong>
            <span>{persona.role}</span>
            {activeQuest ? <em>On mission</em> : null}
          </div>
        </Html>
      ) : null}
      {isFocus && subtitle ? (
        <Html
          position={[0, 3.35, 0]}
          center
          distanceFactor={10}
          style={{ pointerEvents: "none", userSelect: "none" }}
          zIndexRange={[20, 0]}
        >
          <div className="persona-subtitle" role="status">
            {subtitle}
          </div>
        </Html>
      ) : null}
    </group>
  );
}
