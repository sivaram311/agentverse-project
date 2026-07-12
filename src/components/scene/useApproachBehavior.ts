"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import type { Group } from "three";
import * as THREE from "three";
import type { PersonaId } from "@/lib/types";
import { useVerseStore, type InteractionMode } from "@/lib/store";

const APPROACH_SPOT = new THREE.Vector3(0, 0, 5.2);
const ARRIVE_EPS = 0.12;
const WALK_SPEED = 3.2;
const RETURN_SPEED = 2.8;
const HOME_AFTER_MS = 12000;

type Args = {
  personaId: PersonaId;
  home: [number, number, number];
  groupRef: RefObject<Group | null>;
  reducedMotion: boolean;
  onArrivedGreet: () => void;
  /** Fired when avatar should leave the chair (stand) or sit again */
  onPoseChange?: (pose: "sitting" | "standing" | "walking") => void;
};

function moveToward(
  current: THREE.Vector3,
  target: THREE.Vector3,
  step: number,
): THREE.Vector3 {
  const delta = target.clone().sub(current);
  const dist = delta.length();
  if (dist <= step || dist < 1e-4) return target.clone();
  return current.clone().add(delta.multiplyScalar(step / dist));
}

/**
 * Sit → stand → walk to user → greet/talk → return → sit at desk.
 */
export function useApproachBehavior({
  personaId,
  home,
  groupRef,
  reducedMotion,
  onArrivedGreet,
  onPoseChange,
}: Args) {
  const homeVec = useRef(new THREE.Vector3(...home));
  const greetedRef = useRef(false);
  const returnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const standPhase = useRef(0);
  const mode = useVerseStore((s) =>
    s.interaction.focusId === personaId ? s.interaction.mode : ("idle" as InteractionMode),
  );
  const focusId = useVerseStore((s) => s.interaction.focusId);
  const isFocus = focusId === personaId;

  useEffect(() => {
    homeVec.current.set(...home);
  }, [home]);

  useEffect(() => {
    if (!isFocus) {
      greetedRef.current = false;
      standPhase.current = 0;
      if (returnTimer.current) {
        clearTimeout(returnTimer.current);
        returnTimer.current = null;
      }
    }
  }, [isFocus]);

  useEffect(() => {
    if (mode === "approaching") {
      standPhase.current = 0;
      onPoseChange?.("standing");
      useVerseStore.getState().setAgentState(personaId, {
        pose: "standing",
        working: false,
        status: "Standing up",
      });
    }
  }, [mode, personaId, onPoseChange]);

  useEffect(() => {
    if (mode !== "greeting" && mode !== "talking") return;
    if (returnTimer.current) clearTimeout(returnTimer.current);
    returnTimer.current = setTimeout(() => {
      const s = useVerseStore.getState();
      if (s.interaction.focusId === personaId) {
        s.setInteraction({ mode: "returning" });
        onPoseChange?.("walking");
        s.setAgentState(personaId, { pose: "walking", status: "Returning to desk" });
      }
    }, HOME_AFTER_MS);
    return () => {
      if (returnTimer.current) {
        clearTimeout(returnTimer.current);
        returnTimer.current = null;
      }
    };
  }, [mode, personaId, onPoseChange]);

  useFrame((state, dt) => {
    const g = groupRef.current;
    if (!g) return;
    const clampedDt = Math.min(dt, 0.05);

    const store = useVerseStore.getState();
    const active = store.interaction.focusId === personaId;
    const m = active ? store.interaction.mode : "idle";

    // Brief stand-up delay before walking
    if (m === "approaching" && standPhase.current < 0.35 && !reducedMotion) {
      standPhase.current += clampedDt;
      g.position.lerp(homeVec.current, clampedDt * 4);
      g.position.y = home[1] + standPhase.current * 0.15;
      return;
    }

    const target =
      m === "approaching" || m === "greeting" || m === "talking"
        ? APPROACH_SPOT
        : homeVec.current;

    if (reducedMotion && m === "approaching") {
      g.position.copy(APPROACH_SPOT);
      g.lookAt(0, 1.2, 9);
      if (!greetedRef.current) {
        greetedRef.current = true;
        onArrivedGreet();
      }
      return;
    }

    if (m === "idle" && !active) {
      g.position.lerp(homeVec.current, Math.min(1, clampedDt * 1.5));
      g.position.y = home[1];
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, clampedDt * 6);
      return;
    }

    if (m === "approaching" || m === "returning") {
      onPoseChange?.("walking");
    }

    const speed = m === "returning" ? RETURN_SPEED : WALK_SPEED;
    const next = moveToward(g.position, target, speed * clampedDt);

    if (m === "approaching" || m === "returning") {
      const dist = g.position.distanceTo(target);
      if (dist > ARRIVE_EPS) {
        next.y = home[1] + Math.sin(state.clock.elapsedTime * 8) * 0.06;
        g.rotation.z = Math.sin(state.clock.elapsedTime * 9) * 0.06;
      }
    } else {
      next.y = home[1];
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, clampedDt * 6);
    }

    g.position.copy(next);

    const look =
      m === "approaching" || m === "greeting" || m === "talking"
        ? new THREE.Vector3(0, 1.4, 10)
        : homeVec.current.clone().add(new THREE.Vector3(0, 1.4, 0.8));
    const mat = new THREE.Matrix4().lookAt(g.position, look, new THREE.Vector3(0, 1, 0));
    const quat = new THREE.Quaternion().setFromRotationMatrix(mat);
    g.quaternion.slerp(quat, Math.min(1, clampedDt * 5));

    if (m === "approaching" && g.position.distanceTo(APPROACH_SPOT) < ARRIVE_EPS) {
      if (!greetedRef.current) {
        greetedRef.current = true;
        onPoseChange?.("standing");
        onArrivedGreet();
      }
    }

    if (m === "returning" && g.position.distanceTo(homeVec.current) < ARRIVE_EPS) {
      store.setInteraction({ mode: "idle", focusId: null });
      store.setOrbitLocked(false);
      store.setSubtitle(null);
      store.setAgentState(personaId, {
        pose: "sitting",
        working: true,
        status: "At desk",
      });
      onPoseChange?.("sitting");
      greetedRef.current = false;
      standPhase.current = 0;
    }
  });
}
