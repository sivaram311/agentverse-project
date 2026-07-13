"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useVerseStore } from "@/lib/store";

const EYE_Y = 1.55;
const LOOK_SENS = 0.0022;
const TOUCH_SENS = 0.0035;
const PITCH_MIN = -1.25;
const PITCH_MAX = 1.35;

/**
 * Eye-level first-person look — pointer-lock (desktop) + right-half touch drag (mobile).
 * Position follows playerPosition from the store each frame.
 */
export function FirstPersonControls() {
  const playerPosition = useVerseStore((s) => s.playerPosition);
  const orbitLocked = useVerseStore((s) => s.orbitLocked);
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const touchId = useRef<number | null>(null);
  const lastTouch = useRef({ x: 0, y: 0 });
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));

  useEffect(() => {
    const el = gl.domElement;

    const onClick = () => {
      if (orbitLocked) return;
      if (document.pointerLockElement !== el) {
        el.requestPointerLock?.();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (orbitLocked) return;
      if (document.pointerLockElement !== el) return;
      yaw.current -= e.movementX * LOOK_SENS;
      pitch.current -= e.movementY * LOOK_SENS;
      pitch.current = THREE.MathUtils.clamp(pitch.current, PITCH_MIN, PITCH_MAX);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (orbitLocked || touchId.current != null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]!;
        // Right half of screen = look (left half often joystick)
        if (t.clientX >= window.innerWidth * 0.42) {
          touchId.current = t.identifier;
          lastTouch.current = { x: t.clientX, y: t.clientY };
          break;
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchId.current == null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]!;
        if (t.identifier !== touchId.current) continue;
        const dx = t.clientX - lastTouch.current.x;
        const dy = t.clientY - lastTouch.current.y;
        lastTouch.current = { x: t.clientX, y: t.clientY };
        yaw.current -= dx * TOUCH_SENS;
        pitch.current -= dy * TOUCH_SENS;
        pitch.current = THREE.MathUtils.clamp(pitch.current, PITCH_MIN, PITCH_MAX);
        e.preventDefault();
        break;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i]!.identifier === touchId.current) {
          touchId.current = null;
          break;
        }
      }
    };

    el.addEventListener("click", onClick);
    window.addEventListener("mousemove", onMouseMove);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);

    return () => {
      el.removeEventListener("click", onClick);
      window.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      if (document.pointerLockElement === el) {
        document.exitPointerLock?.();
      }
    };
  }, [gl, orbitLocked]);

  useFrame(() => {
    const [x, , z] = playerPosition;
    camera.position.set(x, EYE_Y, z);
    euler.current.set(pitch.current, yaw.current, 0);
    camera.quaternion.setFromEuler(euler.current);
    if ("fov" in camera) {
      const persp = camera as THREE.PerspectiveCamera;
      if (Math.abs(persp.fov - 70) > 0.1) {
        persp.fov = 70;
        persp.updateProjectionMatrix();
      }
    }
  });

  return null;
}
