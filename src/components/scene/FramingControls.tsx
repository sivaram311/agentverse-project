"use client";

import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { isPortraitView, presetForView, type ViewMode } from "@/lib/camera-framing";
import { useVerseStore } from "@/lib/store";

type ControlsApi = {
  target: { set: (x: number, y: number, z: number) => void };
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
  update: () => void;
};

/** Indoor framing — starts inside the office and keeps orbit within the room. */
export function FramingControls({ viewMode }: { viewMode: ViewMode }) {
  const orbitLocked = useVerseStore((s) => s.orbitLocked);
  const { camera } = useThree();
  const controls = useRef<ControlsApi | null>(null);
  const preset = presetForView(viewMode);

  useEffect(() => {
    camera.position.set(...preset.position);
    if ("fov" in camera) {
      (camera as typeof camera & { fov: number }).fov = preset.fov;
      camera.updateProjectionMatrix();
    }
    const c = controls.current;
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
  }, [camera, viewMode, preset]);

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
