"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import type { Group } from "three";
import * as THREE from "three";
import type { PersonaId } from "@/lib/types";
import { useVerseStore, type InteractionMode } from "@/lib/store";

const APPROACH_SPOT = new THREE.Vector3(0, 0, 4.8);
const ARRIVE_EPS = 0.12;
const WALK_SPEED = 3.4;
const RETURN_SPEED = 2.9;
const HOME_AFTER_MS = 14000;

type Args = {
  personaId: PersonaId;
  home: [number, number, number];
  groupRef: RefObject<Group | null>;
  reducedMotion: boolean;
  onArrivedGreet: () => void;
  onPoseChange?: (pose: "sitting" | "standing" | "walking") => void;
};

function moveToward(
  current: THREE.Vector3,
  target: THREE.Vector3,
  step: number,
): THREE.Vector3 {
  const delta = target.clone().sub(current);
  delta.y = 0;
  const dist = delta.length();
  if (dist <= step || dist < 1e-4) {
    return new THREE.Vector3(target.x, 0, target.z);
  }
  return current.clone().add(delta.multiplyScalar(step / dist));
}

/** Yaw-only facing — never pitch the body into the floor. */
function faceYaw(g: Group, lookX: number, lookZ: number, t: number) {
  const dx = lookX - g.position.x;
  const dz = lookZ - g.position.z;
  if (dx * dx + dz * dz < 1e-6) return;
  const targetYaw = Math.atan2(dx, dz);
  const cur = g.rotation.y;
  let diff = targetYaw - cur;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  g.rotation.y = cur + diff * Math.min(1, t * 5);
  g.rotation.x = 0;
  g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, t * 6);
}

/**
 * Sit → stand → walk to user → greet/talk → return → sit at desk.
 * Keeps Y locked to the floor (no swimming).
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
    homeVec.current.set(home[0], 0, home[2]);
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

  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g) return;
    const clampedDt = Math.min(dt, 0.05);

    const store = useVerseStore.getState();
    const active = store.interaction.focusId === personaId;
    const m = active ? store.interaction.mode : "idle";

    if (m === "approaching" && standPhase.current < 0.3 && !reducedMotion) {
      standPhase.current += clampedDt;
      g.position.x = THREE.MathUtils.lerp(g.position.x, homeVec.current.x, clampedDt * 4);
      g.position.z = THREE.MathUtils.lerp(g.position.z, homeVec.current.z, clampedDt * 4);
      g.position.y = 0;
      g.rotation.x = 0;
      g.rotation.z = 0;
      return;
    }

    const target =
      m === "approaching" || m === "greeting" || m === "talking"
        ? APPROACH_SPOT
        : homeVec.current;

    if (reducedMotion && m === "approaching") {
      g.position.set(APPROACH_SPOT.x, 0, APPROACH_SPOT.z);
      faceYaw(g, 0, 10, 10);
      if (!greetedRef.current) {
        greetedRef.current = true;
        onArrivedGreet();
      }
      return;
    }

    if (m === "idle" && !active) {
      g.position.x = THREE.MathUtils.lerp(g.position.x, homeVec.current.x, Math.min(1, clampedDt * 1.5));
      g.position.z = THREE.MathUtils.lerp(g.position.z, homeVec.current.z, Math.min(1, clampedDt * 1.5));
      g.position.y = 0;
      g.rotation.x = 0;
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, clampedDt * 6);
      return;
    }

    if (m === "approaching" || m === "returning") {
      onPoseChange?.("walking");
    }

    const speed = m === "returning" ? RETURN_SPEED : WALK_SPEED;
    const next = moveToward(g.position, target, speed * clampedDt);
    next.y = 0;
    g.position.copy(next);
    g.rotation.x = 0;
    g.rotation.z = 0;

    if (m === "approaching" || m === "greeting" || m === "talking") {
      faceYaw(g, 0, 10, clampedDt);
    } else if (m === "returning") {
      faceYaw(g, homeVec.current.x, homeVec.current.z, clampedDt);
    }

    if (m === "approaching" && g.position.distanceTo(APPROACH_SPOT) < ARRIVE_EPS) {
      if (!greetedRef.current) {
        greetedRef.current = true;
        onPoseChange?.("standing");
        onArrivedGreet();
      }
    }

    if (m === "returning" && g.position.distanceTo(homeVec.current) < ARRIVE_EPS) {
      g.position.set(homeVec.current.x, 0, homeVec.current.z);
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
