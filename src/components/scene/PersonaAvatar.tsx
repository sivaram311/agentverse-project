"use client";

import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";
import { greetingFor, type PersonaDef } from "@/lib/orchestrator";
import { speakPersona, stopSpeaking, type VoicePrefs } from "@/lib/speech";
import { useVerseStore } from "@/lib/store";
import type { AgentPose, PersonaId } from "@/lib/types";
import { AgentDesk } from "./DeskCluster";
import { useApproachBehavior } from "./useApproachBehavior";

type Props = {
  persona: PersonaDef & {
    greetings?: Partial<Record<"ta" | "hi" | "en", string>>;
    greeting?: string;
    voice?: VoicePrefs;
  };
  reducedMotion: boolean;
  showLabels: boolean;
  lod: "full" | "simple";
};

export function PersonaAvatar({ persona, reducedMotion, showLabels, lod }: Props) {
  const group = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const armL = useRef<Mesh>(null);
  const armR = useRef<Mesh>(null);
  const [wavePhase, setWavePhase] = useState(0);
  const [localPose, setLocalPose] = useState<AgentPose>("sitting");

  const selected = useVerseStore((s) => s.selectedPersona);
  const focusId = useVerseStore((s) => s.interaction.focusId);
  const subtitle = useVerseStore((s) => s.subtitle);
  const agentState = useVerseStore((s) => s.agentStates[persona.id as PersonaId]);
  const activeQuest = useVerseStore((s) =>
    s.quests.find((q) => q.status === "active" && q.assignee === persona.id),
  );

  const isSelected = selected === persona.id;
  const isFocus = focusId === persona.id;
  const pose = isFocus ? localPose : agentState?.pose ?? "sitting";
  const sitting = pose === "sitting" && !isFocus;

  const pos = useMemo(
    () => persona.position as [number, number, number],
    [persona.position],
  );

  useLayoutEffect(() => {
    if (group.current) {
      group.current.position.set(...pos);
    }
  }, [pos]);

  const onPoseChange = useCallback((p: AgentPose) => {
    setLocalPose(p);
  }, []);

  const onArrivedGreet = useCallback(() => {
    const store = useVerseStore.getState();
    const lang = store.language;
    const line = greetingFor(persona, lang);
    store.setInteraction({ mode: "greeting", focusId: persona.id as PersonaId });
    store.setSubtitle(line);
    store.markGreeted(persona.id as PersonaId);
    store.bumpChatFocus();
    store.setAgentState(persona.id as PersonaId, {
      pose: "standing",
      status: "Greeting",
      working: false,
    });
    setLocalPose("standing");
    if (!reducedMotion) {
      speakPersona(persona.id as PersonaId, line, persona.voice, lang);
    }
    setWavePhase(1);
    window.setTimeout(() => {
      const s = useVerseStore.getState();
      if (s.interaction.focusId === persona.id) {
        s.setInteraction({ mode: "talking" });
        s.setAgentState(persona.id as PersonaId, { status: "In conversation" });
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
    onPoseChange,
  });

  useLayoutEffect(() => {
    if (!isFocus) return;
    const mode = useVerseStore.getState().interaction.mode;
    if (mode !== "approaching") return;
    const t = window.setTimeout(() => {
      const s = useVerseStore.getState();
      if (s.interaction.focusId === persona.id && s.interaction.mode === "approaching") {
        onArrivedGreet();
      }
    }, 3200);
    return () => window.clearTimeout(t);
  }, [isFocus, persona.id, onArrivedGreet]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (body.current && isSelected && !isFocus) {
      const s = 1 + Math.sin(t * 3) * 0.03;
      body.current.scale.setScalar(s);
    }
    // Typing / work loop while seated
    if (sitting && armR.current) {
      armR.current.rotation.x =
        Math.sin(t * 6 + (persona.deskIndex ?? 0)) * 0.35 - 0.55;
      armR.current.rotation.z = 0.15;
    } else if (armR.current && wavePhase > 0) {
      armR.current.rotation.z = Math.sin(t * 10) * 0.7 - 0.4;
      armR.current.rotation.x = 0;
    } else if (armR.current) {
      armR.current.rotation.z = 0;
      armR.current.rotation.x = 0;
    }
    if (sitting && armL.current) {
      armL.current.rotation.x = Math.sin(t * 5.5 + 1) * 0.25 - 0.45;
    } else if (armL.current) {
      armL.current.rotation.x = 0;
    }
  });

  const bodyY = sitting ? 0.78 : 1.1;
  const headY = sitting ? 1.55 : 2.05;
  const progress = agentState?.progress ?? (activeQuest ? 40 : 0);

  return (
    <group>
      <AgentDesk
        position={[pos[0], 0, pos[2]]}
        color={persona.color}
        progress={sitting ? progress : 0}
        lod={lod}
      />
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
        {/* Torso */}
        <mesh ref={body} position={[0, bodyY, sitting ? -0.08 : 0]} castShadow>
          <capsuleGeometry args={[0.32, sitting ? 0.45 : 0.7, 4, 8]} />
          <meshStandardMaterial
            color={persona.color}
            emissive={persona.color}
            emissiveIntensity={isSelected || isFocus ? 0.35 : 0.12}
            roughness={0.45}
            metalness={0.2}
          />
        </mesh>
        {/* Head */}
        <mesh position={[0, headY, sitting ? -0.05 : 0]} castShadow>
          <sphereGeometry args={[0.28, lod === "simple" ? 8 : 12, lod === "simple" ? 8 : 12]} />
          <meshStandardMaterial color="#F5E6D3" roughness={0.55} />
        </mesh>
        {/* Arms */}
        <mesh ref={armL} position={[-0.42, sitting ? 0.95 : 1.35, sitting ? 0.15 : 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.32, 3, 6]} />
          <meshStandardMaterial color={persona.color} roughness={0.5} />
        </mesh>
        <mesh ref={armR} position={[0.42, sitting ? 0.95 : 1.35, sitting ? 0.15 : 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.32, 3, 6]} />
          <meshStandardMaterial color={persona.color} roughness={0.5} />
        </mesh>
        {/* Legs / seated thighs */}
        {sitting ? (
          <>
            <mesh position={[-0.14, 0.48, 0.18]} rotation={[1.1, 0, 0]} castShadow>
              <capsuleGeometry args={[0.09, 0.28, 3, 6]} />
              <meshStandardMaterial color="#1a2433" roughness={0.6} />
            </mesh>
            <mesh position={[0.14, 0.48, 0.18]} rotation={[1.1, 0, 0]} castShadow>
              <capsuleGeometry args={[0.09, 0.28, 3, 6]} />
              <meshStandardMaterial color="#1a2433" roughness={0.6} />
            </mesh>
          </>
        ) : (
          <>
            <mesh position={[-0.14, 0.4, 0]} castShadow>
              <capsuleGeometry args={[0.09, 0.4, 3, 6]} />
              <meshStandardMaterial color="#1a2433" roughness={0.6} />
            </mesh>
            <mesh position={[0.14, 0.4, 0]} castShadow>
              <capsuleGeometry args={[0.09, 0.4, 3, 6]} />
              <meshStandardMaterial color="#1a2433" roughness={0.6} />
            </mesh>
          </>
        )}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 16]} />
          <meshStandardMaterial
            color={persona.color}
            transparent
            opacity={isSelected || isFocus ? 0.55 : 0.2}
          />
        </mesh>
        {showLabels || isFocus ? (
          <Html
            position={[0, sitting ? 2.15 : 2.7, 0]}
            center
            distanceFactor={8}
            style={{ pointerEvents: "none", userSelect: "none" }}
            zIndexRange={[10, 0]}
          >
            <div className={`persona-tag${isSelected || isFocus ? " active" : ""}`}>
              <strong>{persona.name}</strong>
              <span>{persona.role}</span>
              {agentState?.working || activeQuest ? (
                <em>{agentState?.status || "On mission"}</em>
              ) : null}
              {progress > 0 && sitting ? (
                <div className="persona-progress" aria-hidden>
                  <i style={{ width: `${Math.min(100, progress)}%`, background: persona.color }} />
                </div>
              ) : null}
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
    </group>
  );
}
