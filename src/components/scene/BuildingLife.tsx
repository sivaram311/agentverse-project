"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import { AVATAR_SCALE } from "@/lib/avatar-catalog";
import { HQ_BOUNDS, type OfficeLod } from "@/lib/office-layout";
import { HumanoidFigure } from "./HumanoidFigure";

const FLOOR_H = 3.05;

/** Walkable Y for tower floor index 0..6 (matches NxtLevelExterior slabs). */
export function towerFloorY(fi: number) {
  return HQ_BOUNDS.ceilingY + 0.25 + fi * FLOOR_H + 0.12;
}

const SKINS = ["#E0C4A8", "#F0D5C0", "#D4A574", "#E8B896", "#C9956C", "#E8C4A8"];
const HAIRS = ["#2A1F14", "#1A120C", "#3D2314", "#241810", "#4A2C1A"];
const ACCENTS = ["#4DA3FF", "#E8A838", "#3DDC97", "#FF6BCB", "#A67C52", "#6B8CAE", "#C4A35A"];

type Worker = {
  x: number;
  z: number;
  yaw: number;
  sitting: boolean;
  working: boolean;
  walking?: boolean;
  gender: "male" | "female";
  skin: string;
  hair: string;
  accent: string;
  phase: number;
};

/** Per-floor flavor — density + accent bias. */
function workersForFloor(fi: number, lod: OfficeLod): Worker[] {
  const dens = lod === "simple" ? 0.45 : 1;
  const base =
    fi === 0
      ? 10
      : fi === 1
        ? 9
        : fi === 2
          ? 8
          : fi === 3
            ? 8
            : fi === 4
              ? 7
              : fi === 5
                ? 5
                : 4;
  const n = Math.max(3, Math.round(base * dens));
  const accentBias =
    fi === 3 ? ["#FF6BCB", "#E8A838", "#C4A35A"] : fi === 5 ? ["#E8A838", "#4DA3FF"] : ACCENTS;
  const moreStanding = fi === 1 || fi === 4 || fi === 6;
  const moreWalking = fi === 4;

  const out: Worker[] = [];
  for (let i = 0; i < n; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = -7.5 + col * 4.2 + (fi % 2) * 0.6 + (i % 3) * 0.25;
    const z = -5.5 + row * 3.2 + (fi % 3) * 0.4;
    const standing = moreStanding ? i % 3 !== 0 : i % 5 === 0;
    const walking = moreWalking && i % 4 === 1;
    out.push({
      x: Math.max(-9.2, Math.min(9.2, x)),
      z: Math.max(-8.2, Math.min(5.5, z)),
      yaw: standing ? Math.PI * (0.2 + (i % 5) * 0.15) : Math.PI,
      sitting: !standing && !walking,
      working: !standing && fi !== 6,
      walking,
      gender: i % 3 === 1 ? "female" : "male",
      skin: SKINS[(i + fi) % SKINS.length],
      hair: HAIRS[(i + fi * 2) % HAIRS.length],
      accent: accentBias[(i + fi) % accentBias.length],
      phase: i * 0.37 + fi * 0.2,
    });
  }
  return out;
}

function MiniDesk({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.7, -0.35]} castShadow>
        <boxGeometry args={[1.05, 0.04, 0.55]} />
        <meshStandardMaterial color="#a86a38" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.35, -0.35]}>
        <boxGeometry args={[0.95, 0.65, 0.5]} />
        <meshStandardMaterial color="#e8eaec" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.95, -0.5]}>
        <boxGeometry args={[0.35, 0.28, 0.04]} />
        <meshStandardMaterial
          color="#1a2838"
          emissive={color}
          emissiveIntensity={0.25}
        />
      </mesh>
    </group>
  );
}

function FloorWorkers({
  fi,
  lod,
}: {
  fi: number;
  lod: OfficeLod;
}) {
  const workers = useMemo(() => workersForFloor(fi, lod), [fi, lod]);
  const y = towerFloorY(fi);
  const label =
    fi === 0
      ? "L1 · Delivery"
      : fi === 1
        ? "L2 · Collaboration"
        : fi === 2
          ? "L3 · Product"
          : fi === 3
            ? "L4 · Design"
            : fi === 4
              ? "L5 · Platform"
              : fi === 5
                ? "L6 · Leadership"
                : "L7 · Labs";

  return (
    <group position={[0, y, 0]}>
      {workers.map((w, i) => (
        <group key={i} position={[w.x, 0, w.z]} rotation={[0, w.yaw, 0]}>
          {w.sitting ? <MiniDesk color={w.accent} /> : null}
          <HumanoidFigure
            look={{
              accent: w.accent,
              skin: w.skin,
              hair: w.hair,
              gender: w.gender,
              lod: lod === "simple" ? "simple" : "full",
            }}
            sitting={w.sitting}
            walking={!!w.walking}
            working={w.working}
            wavePhase={0}
            phase={w.phase}
            active={false}
            scale={AVATAR_SCALE}
            showRing={false}
          />
        </group>
      ))}
      <Html position={[0, 2.2, 6.5]} center distanceFactor={28}>
        <div className="zone-badge">{label}</div>
      </Html>
    </group>
  );
}

function CanteenPatron({
  position,
  yaw,
  gender,
  skin,
  hair,
  accent,
  phase,
  mode,
  lod,
}: {
  position: [number, number, number];
  yaw: number;
  gender: "male" | "female";
  skin: string;
  hair: string;
  accent: string;
  phase: number;
  mode: "eat" | "drink" | "chat";
  lod: OfficeLod;
}) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <HumanoidFigure
        look={{
          accent,
          skin,
          hair,
          gender,
          lod: lod === "simple" ? "simple" : "full",
        }}
        sitting
        working={false}
        eating={mode !== "chat"}
        walking={false}
        wavePhase={mode === "chat" ? 0.4 : 0}
        phase={phase}
        active={false}
        scale={AVATAR_SCALE}
        showRing={false}
      />
      {/* Plate / cup props */}
      {mode === "eat" ? (
        <mesh position={[0.15, 0.72, -0.25]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.03, 10]} />
          <meshStandardMaterial color="#f5f0e6" roughness={0.55} />
        </mesh>
      ) : null}
      {mode === "drink" ? (
        <mesh position={[0.22, 0.78, -0.1]} castShadow>
          <cylinderGeometry args={[0.04, 0.045, 0.12, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      ) : (
        <mesh position={[-0.15, 0.74, -0.22]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.1, 8]} />
          <meshStandardMaterial color="#E8A838" roughness={0.45} />
        </mesh>
      )}
    </group>
  );
}

function CanteenCrowd({ lod }: { lod: OfficeLod }) {
  const { openZ, halfW } = HQ_BOUNDS;
  const origin: [number, number, number] = [-halfW + 3.4, 0, openZ + 3.6];
  const patrons = useMemo(() => {
    const seats = [
      { x: -1.5, z: 0.3, mode: "eat" as const },
      { x: 0.3, z: 0.3, mode: "drink" as const },
      { x: 2.0, z: 0.3, mode: "eat" as const },
      { x: -0.7, z: 1.7, mode: "chat" as const },
      { x: 1.3, z: 1.7, mode: "drink" as const },
      { x: -1.8, z: 1.5, mode: "eat" as const },
      { x: 2.2, z: 1.4, mode: "drink" as const },
    ];
    return (lod === "simple" ? seats.slice(0, 4) : seats).map((s, i) => ({
      ...s,
      gender: (i % 3 === 0 ? "female" : "male") as "male" | "female",
      skin: SKINS[i % SKINS.length],
      hair: HAIRS[i % HAIRS.length],
      accent: ACCENTS[i % ACCENTS.length],
      phase: i * 0.5,
      yaw: Math.PI + (i % 2) * 0.1,
    }));
  }, [lod]);

  // Queue at serving counter
  const queue = lod === "full" ? [0, 1] : [0];

  return (
    <group position={origin}>
      {patrons.map((p, i) => (
        <CanteenPatron
          key={i}
          position={[p.x, 0, p.z]}
          yaw={p.yaw}
          gender={p.gender}
          skin={p.skin}
          hair={p.hair}
          accent={p.accent}
          phase={p.phase}
          mode={p.mode}
          lod={lod}
        />
      ))}
      {queue.map((i) => (
        <group key={`q-${i}`} position={[-2.1, 0, -0.2 - i * 0.7]} rotation={[0, Math.PI / 2, 0]}>
          <HumanoidFigure
            look={{
              accent: ACCENTS[i + 2],
              skin: SKINS[i + 1],
              hair: HAIRS[i],
              gender: "male",
              lod: lod === "simple" ? "simple" : "full",
            }}
            sitting={false}
            walking={false}
            working={false}
            wavePhase={0}
            phase={i}
            active={false}
            scale={AVATAR_SCALE}
            showRing={false}
          />
        </group>
      ))}
      <Html position={[0.2, 2.4, 0.8]} center distanceFactor={16}>
        <div className="zone-badge">Canteen · Eating / coffee</div>
      </Html>
    </group>
  );
}

function SecurityGuard({
  position,
  yaw,
  walking,
  reducedMotion,
  path,
  phase,
  lod,
}: {
  position?: [number, number, number];
  yaw?: number;
  walking?: boolean;
  reducedMotion?: boolean;
  path?: [number, number][];
  phase?: number;
  lod: OfficeLod;
}) {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    if (!ref.current || !path || path.length < 2 || reducedMotion) return;
    const t = state.clock.elapsedTime * 0.35 + (phase ?? 0);
    const total = path.length;
    const u = ((t % total) + total) % total;
    const i = Math.floor(u);
    const f = u - i;
    const a = path[i];
    const b = path[(i + 1) % path.length];
    const x = a[0] + (b[0] - a[0]) * f;
    const z = a[1] + (b[1] - a[1]) * f;
    ref.current.position.set(x, 0, z);
    ref.current.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]);
  });

  const body = (
    <>
      <HumanoidFigure
        look={{
          accent: "#1a3050",
          skin: "#D4A574",
          hair: "#1A120C",
          gender: "male",
          lod: lod === "simple" ? "simple" : "full",
        }}
        sitting={false}
        walking={!!walking && !reducedMotion}
        working={false}
        uniform
        wavePhase={0}
        phase={phase ?? 0}
        active={false}
        scale={AVATAR_SCALE}
        showRing={false}
      />
      {/* Badge */}
      <mesh position={[0.12, 1.05, 0.12]}>
        <boxGeometry args={[0.08, 0.1, 0.02]} />
        <meshStandardMaterial
          color="#E8A838"
          emissive="#E8A838"
          emissiveIntensity={0.35}
        />
      </mesh>
    </>
  );

  if (path) {
    return <group ref={ref}>{body}</group>;
  }
  return (
    <group position={position} rotation={[0, yaw ?? 0, 0]}>
      {body}
    </group>
  );
}

/**
 * Tower population (7 floors), canteen diners, gate + roaming security.
 */
export function BuildingLife({
  lod = "full",
  reducedMotion = false,
}: {
  lod?: OfficeLod;
  reducedMotion?: boolean;
}) {
  const { openZ, halfW } = HQ_BOUNDS;
  const floors = lod === "simple" ? [0, 2, 4, 6] : [0, 1, 2, 3, 4, 5, 6];
  const patrol = useMemo(
    () =>
      [
        [-halfW - 3.5, openZ + 4],
        [-halfW - 3.5, openZ + 15],
        [halfW + 3.5, openZ + 15],
        [halfW + 3.5, openZ + 4],
      ] as [number, number][],
    [halfW, openZ],
  );

  return (
    <group>
      {floors.map((fi) => (
        <FloorWorkers key={fi} fi={fi} lod={lod} />
      ))}
      <CanteenCrowd lod={lod} />

      {/* Gate posts — standing uniformed security */}
      <SecurityGuard
        position={[-2.6, 0, openZ + 16.2]}
        yaw={Math.PI}
        lod={lod}
      />
      <SecurityGuard
        position={[2.6, 0, openZ + 16.2]}
        yaw={Math.PI}
        lod={lod}
      />
      <SecurityGuard
        position={[0, 0, openZ + 1.5]}
        yaw={0}
        lod={lod}
      />

      {/* Roaming patrol */}
      <SecurityGuard
        path={patrol}
        walking
        reducedMotion={reducedMotion}
        phase={0}
        lod={lod}
      />
      {lod === "full" ? (
        <SecurityGuard
          path={patrol}
          walking
          reducedMotion={reducedMotion}
          phase={2.1}
          lod={lod}
        />
      ) : null}

      <Html position={[0, 2.2, openZ + 16.2]} center distanceFactor={20}>
        <div className="zone-badge">Security · Gate / patrol</div>
      </Html>
    </group>
  );
}
