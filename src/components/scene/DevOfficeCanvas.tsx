"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, type ReactNode } from "react";
import { OfficeLighting } from "./OfficeEnvironment";
import { HQ_BOUNDS } from "@/lib/office-layout";

/** Minimal Canvas for /dev/office-* isolation mounts. */
export function DevOfficeCanvas({
  children,
  camPosition = [0, 10, 18],
}: {
  children: ReactNode;
  camPosition?: [number, number, number];
}) {
  const { halfW, backZ, openZ } = HQ_BOUNDS;
  const depth = openZ - backZ;
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a1218" }}>
      <Canvas
        camera={{ position: camPosition, fov: 42, near: 0.1, far: 120 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#0a1218"]} />
        <fog attach="fog" args={["#0a1218", 28, 70]} />
        <Suspense fallback={null}>
          <OfficeLighting reducedMotion={false} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, (backZ + openZ) / 2]}>
            <planeGeometry args={[halfW * 2, depth]} />
            <meshStandardMaterial color="#0c1016" metalness={0.72} roughness={0.22} />
          </mesh>
          {children}
        </Suspense>
        <OrbitControls makeDefault target={[0, 1.2, 0]} maxPolarAngle={1.35} />
      </Canvas>
    </div>
  );
}
