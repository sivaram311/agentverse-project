"use client";

import { ContactShadows, Environment, OrbitControls, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { personas } from "@/lib/orchestrator";
import { useVerseStore } from "@/lib/store";
import { DataOrbs } from "./DataOrbs";
import { PersonaAvatar } from "./PersonaAvatar";

function LobbyFloor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <circleGeometry args={[12, 48]} />
        <meshStandardMaterial color="#101820" metalness={0.4} roughness={0.65} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[3.8, 4.1, 64]} />
        <meshStandardMaterial
          color="#E8A838"
          emissive="#E8A838"
          emissiveIntensity={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[1.2, 1.4, 0.08, 32]} />
        <meshStandardMaterial color="#1B2838" metalness={0.5} roughness={0.4} />
      </mesh>
    </>
  );
}

function SceneInner({
  reducedMotion,
  showLabels,
  starCount,
}: {
  reducedMotion: boolean;
  showLabels: boolean;
  starCount: number;
}) {
  const orbitLocked = useVerseStore((s) => s.orbitLocked);

  return (
    <>
      <color attach="background" args={["#070B10"]} />
      <fog attach="fog" args={["#070B10", 10, 28]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        position={[6, 10, 4]}
        intensity={1.15}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-4, 4, -2]} intensity={0.6} color="#4DA3FF" />
      <pointLight position={[4, 3, 3]} intensity={0.45} color="#FF6BCB" />
      {!reducedMotion && starCount > 0 ? (
        <Stars radius={60} depth={40} count={starCount} factor={3} fade speed={0.6} />
      ) : null}
      <Environment preset="night" />
      <LobbyFloor />
      <DataOrbs showLabels={showLabels} />
      {personas.map((p) => (
        <PersonaAvatar
          key={p.id}
          persona={p}
          reducedMotion={reducedMotion}
          showLabels={showLabels}
        />
      ))}
      <ContactShadows opacity={0.45} scale={18} blur={2.4} far={8} />
      <OrbitControls
        enabled={!orbitLocked}
        enablePan={false}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.15}
        minDistance={4}
        maxDistance={16}
        enableDamping
        dampingFactor={0.08}
        makeDefault
      />
    </>
  );
}

export function HubScene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const sync = () => setNarrow(window.innerWidth <= 360);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const dpr: [number, number] = narrow ? [1, 1] : [1, 1.75];
  const starCount = narrow ? 400 : reducedMotion ? 0 : 1200;

  return (
    <div className="hub-canvas">
      <Canvas
        shadows={!narrow}
        dpr={dpr}
        camera={{ position: [0, 4.5, 9], fov: 45, near: 0.1, far: 80 }}
        gl={{ antialias: !narrow, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <SceneInner
            reducedMotion={reducedMotion}
            showLabels={!narrow}
            starCount={starCount}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
