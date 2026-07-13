"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { isPortraitView, presetForView, type ViewMode } from "@/lib/camera-framing";
import { useVerseStore } from "@/lib/store";
import { FirstPersonControls } from "./FirstPersonControls";

type ControlsApi = {
  target: THREE.Vector3;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
  update: () => void;
};

/** Orbit overview OR first-person eye-level (after login). */
export function FramingControls({ viewMode }: { viewMode: ViewMode }) {
  const orbitLocked = useVerseStore((s) => s.orbitLocked);
  const cameraMode = useVerseStore((s) => s.cameraMode);
  const authenticated = useVerseStore((s) => s.authenticated);
  const firstPerson = authenticated && cameraMode === "firstPerson";

  const { camera } = useThree();
  const controls = useRef<ControlsApi | null>(null);
  const preset = presetForView(viewMode);
  const follow = useRef(new THREE.Vector3(...preset.target));

  useEffect(() => {
    if (firstPerson) return;
    camera.position.set(...preset.position);
    if ("fov" in camera) {
      (camera as typeof camera & { fov: number }).fov = preset.fov;
      camera.updateProjectionMatrix();
    }
    const c = controls.current;
    follow.current.set(...preset.target);
    if (c) {
      c.target.set(...preset.target);
      c.minDistance = preset.minDistance;
      c.maxDistance = preset.maxDistance;
      c.minPolarAngle = preset.minPolarAngle;
      c.maxPolarAngle = preset.maxPolarAngle;
      c.minAzimuthAngle = preset.minAzimuthAngle ?? -Infinity;
      c.maxAzimuthAngle = preset.maxAzimuthAngle ?? Infinity;
      c.update();
    }
  }, [camera, viewMode, preset, firstPerson]);

  useFrame((_, dt) => {
    if (firstPerson) return;
    const c = controls.current;
    if (!c) return;
    const playerPosition = useVerseStore.getState().playerPosition;
    const desired = new THREE.Vector3(
      playerPosition[0] * 0.55,
      1.1,
      playerPosition[2] * 0.55,
    );
    follow.current.lerp(desired, Math.min(1, dt * 1.8));
    c.target.lerp(follow.current, Math.min(1, dt * 2.2));
    c.update();
  });

  if (firstPerson) {
    return <FirstPersonControls />;
  }

  return (
    <OrbitControls
      ref={controls as never}
      enabled={!orbitLocked}
      enablePan={false}
      minPolarAngle={preset.minPolarAngle}
      maxPolarAngle={preset.maxPolarAngle}
      minAzimuthAngle={preset.minAzimuthAngle}
      maxAzimuthAngle={preset.maxAzimuthAngle}
      minDistance={preset.minDistance}
      maxDistance={preset.maxDistance}
      target={preset.target}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={isPortraitView(viewMode) ? 0.55 : 0.5}
      zoomSpeed={0.65}
      makeDefault
    />
  );
}
