"use client";

import {
  ContactShadows,
  Environment,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { isPortraitView, presetForView, resolveViewMode, type ViewMode } from "@/lib/camera-framing";
import { personas } from "@/lib/orchestrator";
import { useVerseStore } from "@/lib/store";
import { AmbientWalkers } from "./AmbientWalkers";
import { DataOrbs } from "./DataOrbs";
import { ProjectCluster } from "./DeskCluster";
import { FramingControls } from "./FramingControls";
import { HexCollabOffice } from "./HexCollabOffice";
import { OfficeLighting, OfficeBackdrop } from "./OfficeEnvironment";
import { PersonaAvatar } from "./PersonaAvatar";
import { PlayerAvatar } from "./PlayerAvatar";
import { SiruseriOffice } from "./SiruseriOffice";

function SceneInner({
  reducedMotion,
  showLabels,
  lod,
  narrow,
  viewMode,
}: {
  reducedMotion: boolean;
  showLabels: boolean;
  lod: "full" | "simple";
  narrow: boolean;
  viewMode: ViewMode;
}) {
  const projects = useVerseStore((s) => s.projects);
  const portrait = isPortraitView(viewMode);

  return (
    <>
      <color attach="background" args={["#0a1218"]} />
      <fog
        attach="fog"
        args={portrait ? ["#0a1218", 16, 36] : ["#0a1218", 18, 40]}
      />
      <OfficeLighting reducedMotion={reducedMotion} narrow={narrow} />
      <OfficeBackdrop lod={lod} />
      <Environment preset="city" />
      <SiruseriOffice lod={lod} reducedMotion={reducedMotion} />
      <HexCollabOffice lod={lod} />
      {/* Soft project orbs above collab */}
      <group position={[0, 3.6, 0]}>
        <DataOrbs showLabels={showLabels && viewMode !== "portrait-compact"} />
      </group>
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
      <PlayerAvatar reducedMotion={reducedMotion} />
      {lod === "full" ? (
        <AmbientWalkers lod={lod} reducedMotion={reducedMotion} />
      ) : null}
      <ContactShadows
        opacity={0.5}
        scale={26}
        blur={2.4}
        far={12}
        color="#000000"
      />
      <FramingControls viewMode={viewMode} />
    </>
  );
}

export function HubScene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("portrait");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const sync = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setNarrow(w <= 360 && h > w);
      const mode = resolveViewMode(w, h);
      setViewMode(mode);
      document.body.dataset.avView = mode;
      document.body.dataset.avLandscape = isPortraitView(mode) ? "0" : "1";
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, []);

  const compact =
    viewMode === "portrait-compact" || viewMode === "landscape-compact";
  const dpr: [number, number] = narrow || compact ? [1, 1] : [1, 1.75];
  const lod: "full" | "simple" = narrow || compact ? "simple" : "full";
  const cam = presetForView(viewMode);

  return (
    <div className="hub-canvas">
      <Canvas
        shadows={!narrow && viewMode === "portrait"}
        dpr={dpr}
        camera={{
          position: cam.position,
          fov: cam.fov,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: !narrow && !compact,
          powerPreference: "high-performance",
          toneMappingExposure: 1.28,
        }}
      >
        <Suspense fallback={null}>
          <SceneInner
            reducedMotion={reducedMotion}
            showLabels
            lod={lod}
            narrow={narrow}
            viewMode={viewMode}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
