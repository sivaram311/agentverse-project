"use client";

import { useFrame } from "@react-three/fiber";
import { useCallback, useLayoutEffect, useMemo, useRef, useState, Suspense } from "react";
import type { Group } from "three";
import * as THREE from "three";
import { greetingFor, type PersonaDef } from "@/lib/orchestrator";
import { speakPersona, stopSpeaking, type VoicePrefs } from "@/lib/speech";
import { useVerseStore } from "@/lib/store";
import type { AgentPose, PersonaId } from "@/lib/types";
import { isHubSeat } from "@/lib/hex-office";
import { AVATAR_SCALE } from "@/lib/avatar-catalog";
import { DistanceLabel } from "./DistanceLabel";
import { RpmAvatar } from "./RpmAvatar";
import { HumanoidFigure } from "./HumanoidFigure";
import { useApproachBehavior } from "./useApproachBehavior";

type Props = {
  persona: PersonaDef & {
    greetings?: Partial<Record<"ta" | "hi" | "en", string>>;
    greeting?: string;
    voice?: VoicePrefs;
    gender?: "male" | "female";
    skin?: string;
    hair?: string;
  };
  reducedMotion: boolean;
  showLabels: boolean;
  lod: "full" | "simple";
};

/** Yaw-only so characters never pitch into the floor. */
function setYawToward(
  g: Group,
  from: THREE.Vector3,
  toX: number,
  toZ: number,
  blend = 1,
) {
  const dx = toX - from.x;
  const dz = toZ - from.z;
  if (dx * dx + dz * dz < 1e-8) return;
  const target = Math.atan2(dx, dz);
  if (blend >= 1) {
    g.rotation.set(0, target, 0);
    return;
  }
  let diff = target - g.rotation.y;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  g.rotation.y += diff * blend;
  g.rotation.x = 0;
  g.rotation.z = 0;
}

export function PersonaAvatar({ persona, reducedMotion, showLabels, lod }: Props) {
  const group = useRef<Group>(null);
  const [wavePhase, setWavePhase] = useState(0);
  const [localPose, setLocalPose] = useState<AgentPose>("standing");

  const selected = useVerseStore((s) => s.selectedPersona);
  const focusId = useVerseStore((s) => s.interaction.focusId);
  const interactionMode = useVerseStore((s) => s.interaction.mode);
  const subtitle = useVerseStore((s) => s.subtitle);
  const agentState = useVerseStore((s) => s.agentStates[persona.id as PersonaId]);
  const activeQuest = useVerseStore((s) =>
    s.quests.find((q) => q.status === "active" && q.assignee === persona.id),
  );

  const isSelected = selected === persona.id;
  const isFocus = focusId === persona.id;
  // Empty floor: stand at station (no chairs/desks)
  const pose = isFocus ? localPose : agentState?.pose === "walking" ? "walking" : "standing";
  const walking = pose === "walking";
  const sitting = false;

  const deskPos = useMemo(
    () => persona.position as [number, number, number],
    [persona.position],
  );
  const home = useMemo(
    () => [deskPos[0], 0, deskPos[2]] as [number, number, number],
    [deskPos],
  );
  const hub = isHubSeat(deskPos);

  useLayoutEffect(() => {
    if (!group.current) return;
    group.current.position.set(home[0], 0, home[2]);
    const faceX = hub ? 0 : deskPos[0] * 0.35;
    const faceZ = hub ? -0.15 : deskPos[2] * 0.35;
    setYawToward(group.current, group.current.position, faceX, faceZ, 1);
  }, [home, deskPos, hub]);

  const onPoseChange = useCallback((p: AgentPose) => {
    setLocalPose(p === "sitting" ? "standing" : p);
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
      speakPersona(
        persona.id as PersonaId,
        line,
        persona.voice,
        lang,
        store.voiceGender,
        persona.gender ?? "male",
      );
    }
    setWavePhase(1);
    window.setTimeout(() => {
      const s = useVerseStore.getState();
      if (s.interaction.focusId === persona.id) {
        s.setInteraction({ mode: "talking" });
        s.setAgentState(persona.id as PersonaId, { status: "In conversation" });
      }
      setWavePhase(0);
    }, 2400);
  }, [persona, reducedMotion]);

  useApproachBehavior({
    personaId: persona.id as PersonaId,
    home,
    groupRef: group,
    reducedMotion,
    onArrivedGreet,
    onPoseChange,
  });

  useLayoutEffect(() => {
    if (!isFocus) return;
    if (interactionMode !== "approaching") return;
    const t = window.setTimeout(() => {
      const s = useVerseStore.getState();
      if (s.interaction.focusId === persona.id && s.interaction.mode === "approaching") {
        onArrivedGreet();
      }
    }, 3400);
    return () => window.clearTimeout(t);
  }, [isFocus, interactionMode, persona.id, onArrivedGreet]);

  useFrame((_, dt) => {
    if (!group.current || isFocus) return;
    if (walking) return;
    group.current.position.y = 0;
    const faceX = hub ? 0 : deskPos[0] * 0.35;
    const faceZ = hub ? -0.15 : deskPos[2] * 0.35;
    setYawToward(group.current, group.current.position, faceX, faceZ, Math.min(1, dt * 4));
  });

  const progress = agentState?.progress ?? (activeQuest ? 40 : 0);
  const labelY = 1.55;
  const prominent = isSelected || isFocus;
  const showAgentLabel = showLabels || prominent;

  function summon(e: { stopPropagation: () => void }) {
    e.stopPropagation();
    stopSpeaking();
    useVerseStore.getState().summonPersona(persona.id as PersonaId);
  }

  return (
    <group>
      <mesh
        position={[home[0], 0.75, home[2]]}
        onClick={summon}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.9, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group
        ref={group}
        onClick={summon}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <Suspense
          fallback={
            <HumanoidFigure
              look={{
                accent: persona.color,
                skin: persona.skin || "#E0C4A8",
                hair: persona.hair || "#2A1F14",
                gender: persona.gender || "male",
                lod,
              }}
              sitting={sitting}
              walking={walking}
              wavePhase={wavePhase}
              working={agentState?.working ?? true}
              active={prominent}
              scale={AVATAR_SCALE}
            />
          }
        >
          <RpmAvatar
            personaId={persona.id as PersonaId}
            sitting={sitting}
            walking={walking}
            waving={wavePhase > 0}
            working={agentState?.working ?? true}
            active={prominent}
            reducedMotion={reducedMotion}
            scale={AVATAR_SCALE}
          />
        </Suspense>

        <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.26, 0.36, 24]} />
          <meshStandardMaterial
            color={persona.color}
            emissive={persona.color}
            emissiveIntensity={prominent ? 0.55 : 0.22}
            transparent
            opacity={prominent ? 0.55 : 0.28}
          />
        </mesh>

        {showAgentLabel ? (
          <DistanceLabel
            position={[0, labelY, 0]}
            distanceFactor={280}
            zIndexRange={[12, 0]}
            className={`persona-tag${prominent ? " active" : ""}`}
            idealDistance={5.5}
            minScale={0.014}
            maxScale={0.05}
          >
            <strong>{persona.name}</strong>
            <span>{persona.role}</span>
            {agentState?.working || activeQuest ? (
              <em>{agentState?.status || "Working"}</em>
            ) : null}
            {progress > 0 ? (
              <div className="persona-progress" aria-hidden>
                <i
                  style={{
                    width: `${Math.min(100, progress)}%`,
                    background: persona.color,
                  }}
                />
              </div>
            ) : null}
          </DistanceLabel>
        ) : null}

        {isFocus && subtitle ? (
          <DistanceLabel
            position={[0, labelY + 0.35, 0]}
            distanceFactor={300}
            zIndexRange={[22, 0]}
            className="persona-subtitle"
            idealDistance={5.5}
            minScale={0.015}
            maxScale={0.05}
          >
            <span role="status">{subtitle}</span>
          </DistanceLabel>
        ) : null}
      </group>
    </group>
  );
}
