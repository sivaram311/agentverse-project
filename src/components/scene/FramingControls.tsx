"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  ORBIT_SHOTS,
  isPortraitView,
  type ViewMode,
} from "@/lib/camera-framing";
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

/**
 * Snap once to the chosen angle view, then freestyle orbit + zoom.
 * Walk mode uses FirstPersonControls instead.
 */
export function FramingControls({ viewMode }: { viewMode: ViewMode }) {
  const orbitLocked = useVerseStore((s) => s.orbitLocked);
  const cameraMode = useVerseStore((s) => s.cameraMode);
  const orbitShot = useVerseStore((s) => s.orbitShot);
  const authenticated = useVerseStore((s) => s.authenticated);
  const firstPerson = authenticated && cameraMode === "firstPerson";
  const shot = ORBIT_SHOTS[orbitShot] ?? ORBIT_SHOTS.floorS;

  const { camera } = useThree();
  const controls = useRef<ControlsApi | null>(null);
  const snap = useRef(true);

  useEffect(() => {
    snap.current = true;
  }, [orbitShot, firstPerson]);

  useEffect(() => {
    if (firstPerson) return;
    if ("fov" in camera) {
      (camera as THREE.PerspectiveCamera).fov = shot.fov;
      camera.updateProjectionMatrix();
    }
    const c = controls.current;
    if (c) {
      // Freestyle after snap — wide zoom + full rotate
      c.minDistance = 1.2;
      c.maxDistance = 48;
      c.minPolarAngle = 0.12;
      c.maxPolarAngle = Math.PI / 2 - 0.04;
      c.minAzimuthAngle = -Infinity;
      c.maxAzimuthAngle = Infinity;
      c.update();
    }
  }, [camera, shot, firstPerson]);

  useFrame(() => {
    if (firstPerson) return;
    const c = controls.current;
    if (!c || !snap.current) return;

    if (shot.world) {
      const [wx, wy, wz] = shot.world.position;
      const [tx, ty, tz] = shot.world.target;
      c.target.set(tx, ty, tz);
      camera.position.set(wx, wy, wz);
    } else {
      const [px, , pz] = useVerseStore.getState().playerPosition;
      c.target.set(px, shot.lookY, pz);
      camera.position.set(
        px + shot.offset[0],
        shot.offset[1],
        pz + shot.offset[2],
      );
    }
    snap.current = false;
    c.update();
  });

  if (firstPerson) {
    return <FirstPersonControls />;
  }

  return (
    <OrbitControls
      ref={controls as never}
      enabled={!orbitLocked}
      enablePan
      enableZoom
      enableRotate
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI / 2 - 0.04}
      minDistance={1.2}
      maxDistance={48}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={isPortraitView(viewMode) ? 0.7 : 0.62}
      zoomSpeed={0.95}
      panSpeed={0.65}
      makeDefault
    />
  );
}
