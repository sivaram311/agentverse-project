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
} from "@/lib/office-layout";
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
import { SideConferenceBlock } from "./SideConferenceBlock";
import { SiruseriOffice } from "./SiruseriOffice";
import { TeamCluster } from "./TeamCluster";

type ClusterVis = { id: string; lod: OfficeLod; proxy: boolean };

function TeamClustersLayer({
  baseLod,
  showLabels,
  profile,
}: {
  baseLod: OfficeLod;
  showLabels: boolean;
  profile: PerfProfile;
}) {
  const { camera } = useThree();
  const lastKey = useRef("");
  const [vis, setVis] = useState<ClusterVis[]>([]);
  const accum = useRef(0);

  useFrame((_, dt) => {
    accum.current += dt;
    // Throttle React updates — remounting 20×6 desks every frame freezes mobile.
    if (accum.current < 0.2) return;
    accum.current = 0;

    const scored = TEAM_ZONES.map((z) => {
      const dx = camera.position.x - z.origin[0];
      const dz = camera.position.z - z.origin[2];
      return { id: z.id, dist: Math.hypot(dx, dz), zone: z };
    }).sort((a, b) => a.dist - b.dist);

    const next: ClusterVis[] = [];
    let desksLeft = profile.maxFullClusters;
    for (let i = 0; i < scored.length && next.length < profile.maxTeamClusters; i++) {
      const s = scored[i]!;
      if (s.dist > profile.teamCullDist) continue;
      const withDesks = desksLeft > 0 && s.dist <= profile.teamNearDist;
      if (withDesks) desksLeft -= 1;
      next.push({
        id: s.id,
        lod: withDesks && baseLod === "full" ? "full" : "simple",
        proxy: !withDesks,
      });
    }

    const key = next.map((n) => `${n.id}:${n.lod}:${n.proxy ? 1 : 0}`).join("|");
    if (key !== lastKey.current) {
      lastKey.current = key;
      setVis(next);
    }
  });

  const byId = useMemo(() => {
    const m = new Map(TEAM_ZONES.map((z) => [z.id, z]));
    return m;
  }, []);

  return (
    <>
      {vis.map((v) => {
        const zone = byId.get(v.id);
        if (!zone) return null;
        return (
          <TeamCluster
            key={v.id}
            zone={zone}
            lod={v.lod}
            proxy={v.proxy}
            showLabels={showLabels && v.lod === "full" && !v.proxy}
          />
        );
      })}
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
  const narrow = profile.tier !== "high";

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
        showLabels={showLabels && profile.tier !== "low"}
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
      <TeamClustersLayer
        baseLod={lod}
        showLabels={showLabels && profile.tier !== "low"}
        profile={profile}
      />
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
          reducedMotion={reducedMotion || narrow}
          showLabels={showLabels && profile.tier !== "low"}
          lod={lod}
        />
      ))}
      <PlayerAvatar reducedMotion={reducedMotion} />
      {profile.ambientWalkers ? (
        <AmbientWalkers lod={lod === "full" ? "full" : "simple"} reducedMotion={reducedMotion} />
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
      <Canvas
        shadows={profile.shadows && viewMode === "portrait"}
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
          toneMappingExposure: 1.28,
          stencil: false,
          depth: true,
        }}
        performance={{ min: profile.tier === "low" ? 0.4 : 0.5 }}
      >
        <Suspense fallback={null}>
          <SceneInner
            reducedMotion={reducedMotion}
            showLabels={profile.tier !== "low"}
            viewMode={viewMode}
            profile={profile}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
