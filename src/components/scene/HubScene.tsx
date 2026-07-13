"use client";

import {
  ContactShadows,
  Environment,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  isPortraitView,
  presetForView,
  resolveViewMode,
  type ViewMode,
} from "@/lib/camera-framing";
import {
  ANCHORS,
  TEAM_ZONES,
  type OfficeLod,
  type TeamZone,
} from "@/lib/office-layout";
import { personas } from "@/lib/orchestrator";
import { useVerseStore } from "@/lib/store";
import { AmbientWalkers } from "./AmbientWalkers";
import { CentralConference } from "./CentralConference";
import { DataOrbs } from "./DataOrbs";
import { ProjectCluster } from "./DeskCluster";
import { FramingControls } from "./FramingControls";
import { GlassCube } from "./GlassCube";
import { OfficeLighting, OfficeBackdrop } from "./OfficeEnvironment";
import { PersonaAvatar } from "./PersonaAvatar";
import { PlayerAvatar } from "./PlayerAvatar";
import { SideConferenceBlock } from "./SideConferenceBlock";
import { SiruseriOffice } from "./SiruseriOffice";
import { TeamCluster } from "./TeamCluster";

const NEAR = 14;
const MAX_FULL = 6;

function TeamClustersLayer({
  baseLod,
  showLabels,
}: {
  baseLod: OfficeLod;
  showLabels: boolean;
}) {
  const { camera } = useThree();
  const ranksRef = useRef<Map<string, OfficeLod>>(new Map());
  const [tick, setTick] = useState(0);
  const zones: TeamZone[] = useMemo(() => TEAM_ZONES, []);

  useFrame(() => {
    if (baseLod === "simple") return;
    const scored = TEAM_ZONES.map((z) => {
      const dx = camera.position.x - z.origin[0];
      const dz = camera.position.z - z.origin[2];
      return { id: z.id, dist: Math.hypot(dx, dz) };
    }).sort((a, b) => a.dist - b.dist);

    let changed = false;
    const next = new Map<string, OfficeLod>();
    scored.forEach((s, i) => {
      const lod: OfficeLod = i < MAX_FULL && s.dist < NEAR ? "full" : "simple";
      next.set(s.id, lod);
      if (ranksRef.current.get(s.id) !== lod) changed = true;
    });
    if (changed) {
      ranksRef.current = next;
      setTick((t) => t + 1);
    }
  });

  void tick;

  return (
    <>
      {zones.map((zone) => {
        const clusterLod: OfficeLod =
          baseLod === "simple"
            ? "simple"
            : ranksRef.current.get(zone.id) ?? "simple";
        return (
          <TeamCluster
            key={zone.id}
            zone={zone}
            lod={clusterLod}
            showLabels={showLabels && clusterLod === "full"}
          />
        );
      })}
    </>
  );
}

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
        args={portrait ? ["#0a1218", 28, 65] : ["#0a1218", 32, 70]}
      />
      <OfficeLighting reducedMotion={reducedMotion} narrow={narrow} />
      <OfficeBackdrop lod={lod} />
      <Environment preset="city" />
      <SiruseriOffice lod={lod} reducedMotion={reducedMotion} showMandala={false} />
      <CentralConference lod={lod} showLabels={showLabels} reducedMotion={reducedMotion} />
      <GlassCube
        position={ANCHORS.glassCube.position}
        size={ANCHORS.glassCube.size}
        lod={lod}
        reducedMotion={reducedMotion}
      />
      <SideConferenceBlock
        position={ANCHORS.sideConference.position}
        yaw={ANCHORS.sideConference.yaw}
        lod={lod}
      />
      <TeamClustersLayer baseLod={lod} showLabels={showLabels} />
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
        scale={42}
        blur={2.4}
        far={14}
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
          far: 120,
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
