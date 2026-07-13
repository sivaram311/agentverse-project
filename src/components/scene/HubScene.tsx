"use client";

import {
  ContactShadows,
  Environment,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import {
  isPortraitView,
  presetForView,
  resolveViewMode,
  type ViewMode,
} from "@/lib/camera-framing";
import { ANCHORS, TEAM_ZONES } from "@/lib/office-layout";
import { resolvePerfProfile, type PerfProfile } from "@/lib/perf-profile";
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
import { SceneBootOverlay } from "./SceneBootOverlay";
import { SideConferenceBlock } from "./SideConferenceBlock";
import { SiruseriOffice } from "./SiruseriOffice";
import { TeamCluster } from "./TeamCluster";

/** Always-full pods — no distance cull / proxy (PROD realism). */
function TeamClustersLayer({ showLabels }: { showLabels: boolean }) {
  return (
    <>
      {TEAM_ZONES.map((zone) => (
        <TeamCluster
          key={zone.id}
          zone={zone}
          lod="full"
          proxy={false}
          showLabels={showLabels}
        />
      ))}
    </>
  );
}

function SceneInner({
  reducedMotion,
  showLabels,
  viewMode,
  profile,
}: {
  reducedMotion: boolean;
  showLabels: boolean;
  viewMode: ViewMode;
  profile: PerfProfile;
}) {
  const projects = useVerseStore((s) => s.projects);
  const lod = profile.lod;
  const narrow = profile.tier === "low";

  return (
    <>
      <color attach="background" args={["#0a1218"]} />
      <fog
        attach="fog"
        args={["#0a1218", profile.fogNear, profile.fogFar]}
      />
      <OfficeLighting
        reducedMotion={reducedMotion}
        narrow={narrow}
        boost={profile.lightBoost}
      />
      <OfficeBackdrop lod={lod} />
      {profile.environment ? <Environment preset="city" /> : null}
      <SiruseriOffice lod={lod} reducedMotion={reducedMotion} showMandala={false} />
      <CentralConference
        lod={lod}
        showLabels={showLabels}
        reducedMotion={reducedMotion}
      />
      {profile.showGlassCube ? (
        <GlassCube
          position={ANCHORS.glassCube.position}
          size={ANCHORS.glassCube.size}
          lod={lod}
          reducedMotion={reducedMotion}
        />
      ) : null}
      {profile.showSideConference ? (
        <SideConferenceBlock
          position={ANCHORS.sideConference.position}
          yaw={ANCHORS.sideConference.yaw}
          lod={lod}
        />
      ) : null}
      <TeamClustersLayer showLabels={showLabels} />
      {profile.dataOrbs ? (
        <group position={[0, 3.6, 0]}>
          <DataOrbs showLabels={showLabels && viewMode !== "portrait-compact"} />
        </group>
      ) : null}
      {profile.showSatelliteProjects
        ? projects
            .filter((p) => p.id !== "hub")
            .map((p) => (
              <ProjectCluster
                key={p.id}
                project={p}
                showLabels={showLabels}
                lod={lod}
                satellite
              />
            ))
        : null}
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
      {profile.ambientWalkers ? (
        <AmbientWalkers lod="full" reducedMotion={reducedMotion} />
      ) : null}
      {profile.contactShadows ? (
        <ContactShadows
          opacity={0.45}
          scale={36}
          blur={2}
          far={12}
          color="#000000"
          frames={1}
        />
      ) : null}
      <FramingControls viewMode={viewMode} />
    </>
  );
}

export function HubScene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("portrait");
  const [profile, setProfile] = useState<PerfProfile>(() =>
    resolvePerfProfile(390, 844, "portrait"),
  );

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
      const mode = resolveViewMode(w, h);
      setViewMode(mode);
      setProfile(resolvePerfProfile(w, h, mode));
      document.body.dataset.avView = mode;
      document.body.dataset.avLandscape = isPortraitView(mode) ? "0" : "1";
      document.body.dataset.avPerf = resolvePerfProfile(w, h, mode).tier;
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, []);

  const cam = presetForView(viewMode);

  return (
    <div className="hub-canvas" data-perf={profile.tier}>
      <SceneBootOverlay />
      <Canvas
        shadows={profile.shadows}
        dpr={profile.dpr}
        camera={{
          position: cam.position,
          fov: cam.fov,
          near: 0.15,
          far: profile.cameraFar,
        }}
        gl={{
          antialias: profile.antialias,
          powerPreference: "high-performance",
          toneMappingExposure: profile.lightBoost ? 1.4 : 1.28,
          stencil: false,
          depth: true,
        }}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <SceneInner
            reducedMotion={reducedMotion}
            showLabels
            viewMode={viewMode}
            profile={profile}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
