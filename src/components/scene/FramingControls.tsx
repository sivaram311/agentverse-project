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

/** Head-shoulders follow OR first-person walk. */
export function FramingControls({ viewMode }: { viewMode: ViewMode }) {
  const orbitLocked = useVerseStore((s) => s.orbitLocked);
  const cameraMode = useVerseStore((s) => s.cameraMode);
  const orbitShot = useVerseStore((s) => s.orbitShot);
  const authenticated = useVerseStore((s) => s.authenticated);
  const firstPerson = authenticated && cameraMode === "firstPerson";
  const shot = ORBIT_SHOTS[orbitShot];

  const { camera } = useThree();
  const controls = useRef<ControlsApi | null>(null);
  const follow = useRef(new THREE.Vector3());
  const pos = useRef(new THREE.Vector3());
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
      c.minDistance = shot.minDistance;
      c.maxDistance = shot.maxDistance;
      c.minPolarAngle = shot.minPolarAngle;
      c.maxPolarAngle = shot.maxPolarAngle;
      c.minAzimuthAngle = -Infinity;
      c.maxAzimuthAngle = Infinity;
      c.update();
    }
  }, [camera, shot, firstPerson]);

  useFrame((_, dt) => {
    if (firstPerson) return;
    const c = controls.current;
    if (!c) return;
    const desiredTarget = follow.current;
    const desiredPos = pos.current;

    if (shot.world) {
      const [wx, wy, wz] = shot.world.position;
      const [tx, ty, tz] = shot.world.target;
      desiredTarget.set(tx, ty, tz);
      desiredPos.set(wx, wy, wz);
    } else {
      const [px, , pz] = useVerseStore.getState().playerPosition;
      desiredTarget.set(px, shot.lookY, pz);
      desiredPos.set(px + shot.offset[0], shot.offset[1], pz + shot.offset[2]);
    }

    const k = snap.current ? 1 : Math.min(1, dt * 4.5);
    c.target.lerp(desiredTarget, k);
    camera.position.lerp(desiredPos, k);
    if (snap.current) snap.current = false;
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
      minPolarAngle={shot.minPolarAngle}
      maxPolarAngle={shot.maxPolarAngle}
      minDistance={shot.minDistance}
      maxDistance={shot.maxDistance}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={isPortraitView(viewMode) ? 0.55 : 0.5}
      zoomSpeed={0.7}
      makeDefault
    />
  );
}
