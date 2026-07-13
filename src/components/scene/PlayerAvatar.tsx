"use client";

import { Billboard, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "three";
import * as THREE from "three";
import { PLAYER_AVATAR, PLAYER_GREET_RADIUS, AVATAR_SCALE } from "@/lib/avatar-catalog";
import { OFFICE_BOUNDS } from "@/lib/camera-framing";
import { hexSeatPosition, seatWorldPosition } from "@/lib/hex-office";
import { personas } from "@/lib/orchestrator";
import { setPlayerPose } from "@/lib/player-pose";
import { useVerseStore } from "@/lib/store";
import type { PersonaId } from "@/lib/types";
import { RpmAvatar } from "./RpmAvatar";

const MOVE_SPEED = 3.2;
const MARGIN = 0.8;
const X_MIN = -OFFICE_BOUNDS.halfW + MARGIN;
const X_MAX = OFFICE_BOUNDS.halfW - MARGIN;
const Z_MIN = OFFICE_BOUNDS.backZ + MARGIN;
const Z_MAX = OFFICE_BOUNDS.openZ - MARGIN;
const KEYS = new Set(["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"]);

/**
 * Logged-in visitor — WASD / touch joystick free roam on the office floor.
 * Walking near an agent triggers summon → greet → chat.
 */
export function PlayerAvatar({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const group = useRef<Group>(null);
  const keys = useRef<Record<string, boolean>>({});
  const lastGreet = useRef<PersonaId | null>(null);
  const greetCooldown = useRef(0);
  const [walking, setWalking] = useState(false);

  const moveInput = useVerseStore((s) => s.playerMoveInput);
  const setPlayerPos = useVerseStore((s) => s.setPlayerPosition);
  const username = useVerseStore((s) => s.username);
  const authenticated = useVerseStore((s) => s.authenticated);
  const cameraMode = useVerseStore((s) => s.cameraMode);
  const focusId = useVerseStore((s) => s.interaction.focusId);
  const interactionMode = useVerseStore((s) => s.interaction.mode);
  const lastStorePos = useRef({ x: 0, z: 5.2 });
  const hideBody = authenticated && cameraMode === "firstPerson";

  const seats = useMemo(
    () =>
      personas.map((p) => ({
        id: p.id as PersonaId,
        seat: seatWorldPosition(hexSeatPosition(p.deskIndex ?? 0)),
      })),
    [],
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (!KEYS.has(k)) return;
      keys.current[k] = true;
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const clamped = Math.min(dt, 0.05);
    greetCooldown.current = Math.max(0, greetCooldown.current - clamped);

    let ix = moveInput.x;
    let iz = moveInput.z;
    if (keys.current.w || keys.current.arrowup) iz -= 1;
    if (keys.current.s || keys.current.arrowdown) iz += 1;
    if (keys.current.a || keys.current.arrowleft) ix -= 1;
    if (keys.current.d || keys.current.arrowright) ix += 1;

    const len = Math.hypot(ix, iz);
    const moving = len > 0.08;
    if (moving !== walking) setWalking(moving);

    if (moving) {
      const nx = ix / len;
      const nz = iz / len;
      // Camera-relative movement on XZ
      const cam = state.camera;
      const forward = new THREE.Vector3();
      cam.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
      // W = toward -Z on stick maps to camera forward
      const wish = new THREE.Vector3()
        .addScaledVector(right, nx)
        .addScaledVector(forward, -nz)
        .normalize();

      g.position.x = THREE.MathUtils.clamp(
        g.position.x + wish.x * MOVE_SPEED * clamped,
        X_MIN,
        X_MAX,
      );
      g.position.z = THREE.MathUtils.clamp(
        g.position.z + wish.z * MOVE_SPEED * clamped,
        Z_MIN,
        Z_MAX,
      );
      g.position.y = 0;
      g.rotation.x = 0;
      g.rotation.z = 0;
      const yaw = Math.atan2(wish.x, wish.z);
      let diff = yaw - g.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      g.rotation.y += diff * Math.min(1, clamped * 10);
    }

    setPlayerPose(g.position.x, 0, g.position.z);
    if (
      Math.hypot(
        g.position.x - lastStorePos.current.x,
        g.position.z - lastStorePos.current.z,
      ) > 0.08
    ) {
      lastStorePos.current = { x: g.position.x, z: g.position.z };
      setPlayerPos([g.position.x, 0, g.position.z]);
    }

    // Proximity greet — only when idle / not already in a focused walk cycle
    if (
      greetCooldown.current <= 0 &&
      (!focusId || interactionMode === "idle" || interactionMode === "talking")
    ) {
      let nearest: { id: PersonaId; d: number } | null = null;
      for (const s of seats) {
        const d = Math.hypot(g.position.x - s.seat[0], g.position.z - s.seat[2]);
        if (d < PLAYER_GREET_RADIUS && (!nearest || d < nearest.d)) {
          nearest = { id: s.id, d };
        }
      }
      if (nearest && nearest.id !== lastGreet.current) {
        lastGreet.current = nearest.id;
        greetCooldown.current = 4.5;
        useVerseStore.getState().summonPersona(nearest.id);
      } else if (!nearest) {
        lastGreet.current = null;
      }
    }
  });

  const label = authenticated
    ? username || "You"
    : "Guest";

  return (
    <group ref={group} position={[0, 0, 5.2]} visible={!hideBody}>
      <Suspense fallback={null}>
        <RpmAvatar
          url={PLAYER_AVATAR.url}
          sitting={false}
          walking={walking && !reducedMotion}
          waving={false}
          working={false}
          active
          reducedMotion={reducedMotion}
          scale={AVATAR_SCALE}
          accent="#FF6200"
        />
      </Suspense>
      {!hideBody ? (
        <Billboard position={[0, 1.55, 0]} follow>
          <Html center distanceFactor={100} style={{ pointerEvents: "none" }} zIndexRange={[14, 0]}>
            <div className="persona-tag active player-tag">
              <strong>{label}</strong>
              <span>Logged in · You</span>
            </div>
          </Html>
        </Billboard>
      ) : null}
    </group>
  );
}
