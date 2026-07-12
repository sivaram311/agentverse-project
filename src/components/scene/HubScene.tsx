"use client";

import { ContactShadows, Environment, OrbitControls, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { personas } from "@/lib/orchestrator";
import { useVerseStore } from "@/lib/store";
import { DataOrbs } from "./DataOrbs";
import { ProjectCluster } from "./DeskCluster";
import { MandalaFloor, OfficeLighting } from "./OfficeEnvironment";
import { PersonaAvatar } from "./PersonaAvatar";

function SceneInner({
  reducedMotion,
  showLabels,
  starCount,
  lod,
}: {
  reducedMotion: boolean;
  showLabels: boolean;
  starCount: number;
  lod: "full" | "simple";
}) {
  const orbitLocked = useVerseStore((s) => s.orbitLocked);
  const projects = useVerseStore((s) => s.projects);

  return (
    <>
      <color attach="background" args={["#070B10"]} />
      <fog attach="fog" args={["#070B10", 14, 36]} />
      <OfficeLighting reducedMotion={reducedMotion} />
      {!reducedMotion && starCount > 0 ? (
        <Stars radius={70} depth={45} count={starCount} factor={3} fade speed={0.5} />
      ) : null}
      <Environment preset="night" />
      <MandalaFloor />
      <DataOrbs showLabels={showLabels} />
      {projects
        .filter((p) => p.id !== "hub")
        .map((p) => (
          <ProjectCluster
            key={p.id}
            project={p}
            showLabels={showLabels}
            lod={lod}
            satellite
          />
        ))}
      {personas.map((p) => (
        <PersonaAvatar
          key={p.id}
          persona={p}
          reducedMotion={reducedMotion}
          showLabels={showLabels}
          lod={lod}
        />
      ))}
      <ContactShadows opacity={0.4} scale={24} blur={2.6} far={10} />
      <OrbitControls
        enabled={!orbitLocked}
        enablePan={false}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={22}
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
  const starCount = narrow ? 280 : reducedMotion ? 0 : 900;
  const lod: "full" | "simple" = narrow ? "simple" : "full";

  return (
    <div className="hub-canvas">
      <Canvas
        shadows={!narrow}
        dpr={dpr}
        camera={{ position: [0, 5.2, 11], fov: 42, near: 0.1, far: 90 }}
        gl={{ antialias: !narrow, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <SceneInner
            reducedMotion={reducedMotion}
            showLabels={!narrow}
            starCount={starCount}
            lod={lod}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
