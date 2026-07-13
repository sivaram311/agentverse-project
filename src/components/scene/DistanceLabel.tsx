"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import * as THREE from "three";

type DistanceLabelProps = {
  children: ReactNode;
  /** World-space height above the parent origin. */
  position?: [number, number, number];
  /** drei Html base — higher = smaller at same distance. */
  distanceFactor?: number;
  zIndexRange?: [number, number];
  className?: string;
  style?: CSSProperties;
  /**
   * Camera distance (m) at which CSS scale ≈ 1 after Html’s own sizing.
   * Closer → scale down; farther → mild scale up (clamped).
   */
  idealDistance?: number;
  minScale?: number;
  maxScale?: number;
};

/**
 * Billboard HTML that stays roughly constant on-screen size in FP
 * (Html alone blows up when the camera is near Mathura / hub seats).
 */
export function DistanceLabel({
  children,
  position = [0, 0, 0],
  distanceFactor = 14,
  zIndexRange = [12, 0],
  className,
  style,
  idealDistance = 5.5,
  minScale = 0.28,
  maxScale = 1.05,
}: DistanceLabelProps) {
  const anchor = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(1);
  const scratch = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    if (!anchor.current) return;
    anchor.current.getWorldPosition(scratch.current);
    const d = camera.position.distanceTo(scratch.current);
    const next = THREE.MathUtils.clamp(d / idealDistance, minScale, maxScale);
    if (Math.abs(next - scale) > 0.02) setScale(next);
  });

  return (
    <group ref={anchor} position={position}>
      <Html
        center
        distanceFactor={distanceFactor}
        style={{ pointerEvents: "none", userSelect: "none", ...style }}
        zIndexRange={zIndexRange}
      >
        <div
          className={className}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center bottom",
          }}
        >
          {children}
        </div>
      </Html>
    </group>
  );
}
