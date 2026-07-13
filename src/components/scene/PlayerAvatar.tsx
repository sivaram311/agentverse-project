"use client";

import { useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Group } from "three";
import * as THREE from "three";
import { PLAYER_AVATAR, AVATAR_SCALE } from "@/lib/avatar-catalog";
import { OFFICE_BOUNDS } from "@/lib/camera-framing";
import { setPlayerPose } from "@/lib/player-pose";
import { useVerseStore } from "@/lib/store";
import { DistanceLabel } from "./DistanceLabel";
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
 * Tap an agent (or team bar) to summon — proximity does not auto-greet or open chat.
 */
export function PlayerAvatar({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const group = useRef<Group>(null);
  const keys = useRef<Record<string, boolean>>({});
  const [walking, setWalking] = useState(false);

  const setPlayerPos = useVerseStore((s) => s.setPlayerPosition);
  const username = useVerseStore((s) => s.username);
  const authenticated = useVerseStore((s) => s.authenticated);
  const cameraMode = useVerseStore((s) => s.cameraMode);
  const lastStorePos = useRef({ x: 0, z: 5.2 });
  const hideBody = authenticated && cameraMode === "firstPerson";

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!KEYS.has(e.key.toLowerCase())) return;
      keys.current[e.key.toLowerCase()] = true;
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

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;

    // Read stick each frame — avoid React re-renders on every touch sample (mobile).
    const moveInput = useVerseStore.getState().playerMoveInput;

    const wish = new THREE.Vector3();
    if (keys.current.w || keys.current.arrowup) wish.z -= 1;
    if (keys.current.s || keys.current.arrowdown) wish.z += 1;
    if (keys.current.a || keys.current.arrowleft) wish.x -= 1;
    if (keys.current.d || keys.current.arrowright) wish.x += 1;
    wish.x += moveInput.x;
    wish.z += moveInput.z;

    const len = wish.length();
    const moving = len > 0.05;
    if (walking !== moving) setWalking(moving);

    if (moving) {
      wish.multiplyScalar(1 / len);
      const clamped = Math.min(1, len);
      g.position.x = THREE.MathUtils.clamp(
        g.position.x + wish.x * MOVE_SPEED * clamped * dt,
        X_MIN,
        X_MAX,
      );
      g.position.z = THREE.MathUtils.clamp(
        g.position.z + wish.z * MOVE_SPEED * clamped * dt,
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
        <DistanceLabel
          position={[0, 1.55, 0]}
          distanceFactor={14}
          zIndexRange={[14, 0]}
          className="persona-tag active player-tag"
          idealDistance={5.5}
          minScale={0.28}
          maxScale={1.0}
        >
          <strong>{label}</strong>
          <span>Logged in · You</span>
        </DistanceLabel>
      ) : null}
    </group>
  );
}
