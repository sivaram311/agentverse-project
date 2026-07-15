"use client";

import { Billboard, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Group } from "three";
import * as THREE from "three";
import { PLAYER_AVATAR, AVATAR_SCALE } from "@/lib/avatar-catalog";
import { setPlayerPose } from "@/lib/player-pose";
import { useVerseStore } from "@/lib/store";
import { RpmAvatar } from "./RpmAvatar";

const MOVE_SPEED = 3.2;
const FLOOR_HALF = 9.2;
const KEYS = new Set(["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"]);

/**
 * Logged-in visitor — WASD / touch joystick free roam on the office floor.
 * Tap an agent to talk; proximity alone does not open chat.
 */
export function PlayerAvatar({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const group = useRef<Group>(null);
  const keys = useRef<Record<string, boolean>>({});
  const [walking, setWalking] = useState(false);

  const moveInput = useVerseStore((s) => s.playerMoveInput);
  const setPlayerPos = useVerseStore((s) => s.setPlayerPosition);
  const username = useVerseStore((s) => s.username);
  const authenticated = useVerseStore((s) => s.authenticated);
  const lastStorePos = useRef({ x: 0, z: 5.2 });

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
        -FLOOR_HALF,
        FLOOR_HALF,
      );
      g.position.z = THREE.MathUtils.clamp(
        g.position.z + wish.z * MOVE_SPEED * clamped,
        -FLOOR_HALF,
        FLOOR_HALF,
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
    <group ref={group} position={[0, 0, 5.2]}>
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
      <Billboard position={[0, 1.55, 0]} follow>
        <Html center distanceFactor={10} style={{ pointerEvents: "none" }} zIndexRange={[14, 0]}>
          <div className="persona-tag active player-tag">
            <strong>{label}</strong>
            <span>Logged in · You</span>
          </div>
        </Html>
      </Billboard>
    </group>
  );
}
