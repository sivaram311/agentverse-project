"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";
import * as THREE from "three";
import { ANCHORS, GLASS } from "@/lib/office-layout";
import { OfficePlant } from "./OfficeDetails";

type Lod = "full" | "simple";

type Props = {
  position?: [number, number, number];
  yaw?: number;
  lod?: Lod;
};

const WALL = "#161c24";
const MULLION = "#0e141c";
const FLOOR = "#0c1016";
const ACCENTS = ["#4DA3FF", "#E8A838", "#3DDC97"] as const;
const ROOM_LABELS = [
  { en: "Conf A", ta: "அறை ஏ" },
  { en: "Conf B", ta: "அறை பி" },
  { en: "Conf C", ta: "அறை சி" },
] as const;

function GlassPane({
  width,
  height,
  frosted,
  lod,
}: {
  width: number;
  height: number;
  frosted: boolean;
  lod: Lod;
}) {
  const g = frosted ? GLASS.frosted : GLASS.clear;
  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshPhysicalMaterial
        color={g.color}
        transparent
        opacity={g.opacity}
        transmission={lod === "full" ? g.transmission : 0}
        roughness={g.roughness}
        metalness={g.metalness}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Front/back/divider split: lower frosted band, upper clear. */
function SplitGlassWall({
  width,
  height,
  frostRatio,
  lod,
  z = 0,
}: {
  width: number;
  height: number;
  frostRatio: number;
  lod: Lod;
  z?: number;
}) {
  const frostH = height * frostRatio;
  const clearH = height - frostH;
  return (
    <group position={[0, 0, z]}>
      <group position={[0, frostH / 2, 0]}>
        <GlassPane width={width} height={frostH} frosted lod={lod} />
      </group>
      <group position={[0, frostH + clearH / 2, 0]}>
        <GlassPane width={width} height={clearH} frosted={false} lod={lod} />
      </group>
      {/* Mullion rail at frost split */}
      <mesh position={[0, frostH, 0.01]}>
        <boxGeometry args={[width, 0.05, 0.04]} />
        <meshStandardMaterial color={MULLION} metalness={0.5} roughness={0.35} />
      </mesh>
    </group>
  );
}

function RoomInterior({
  accent,
  label,
  lod,
  roomW,
  roomD,
  h,
  plantVariant,
}: {
  accent: string;
  label: { en: string; ta: string };
  lod: Lod;
  roomW: number;
  roomD: number;
  h: number;
  plantVariant: number;
}) {
  const screen = useRef<Mesh>(null);
  useFrame((state) => {
    if (!screen.current) return;
    const mat = screen.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 1.25) * 0.1;
  });

  const tableW = Math.min(1.35, roomW * 0.55);
  const tableD = Math.min(0.7, roomD * 0.35);
  const chairOffsets: [number, number, number][] = [
    [0, 0.28, tableD * 0.55 + 0.18],
    [0, 0.28, -(tableD * 0.55 + 0.18)],
    [-(tableW * 0.4), 0.28, 0],
    [tableW * 0.4, 0.28, 0],
  ];

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[roomW - 0.08, roomD - 0.08]} />
        <meshStandardMaterial color={FLOOR} roughness={0.8} metalness={0.12} />
      </mesh>

      {/* Table */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[tableW, 0.05, tableD]} />
        <meshStandardMaterial color="#1a222c" metalness={0.35} roughness={0.4} />
      </mesh>
      {(
        [
          [-tableW * 0.4, 0.26, -tableD * 0.35],
          [tableW * 0.4, 0.26, -tableD * 0.35],
          [-tableW * 0.4, 0.26, tableD * 0.35],
          [tableW * 0.4, 0.26, tableD * 0.35],
        ] as [number, number, number][]
      ).map((p, i) => (
        <mesh key={`tleg-${i}`} position={p}>
          <boxGeometry args={[0.05, 0.52, 0.05]} />
          <meshStandardMaterial color={MULLION} />
        </mesh>
      ))}

      {/* 4 simple chairs */}
      {chairOffsets.map((p, i) => (
        <group key={`chair-${i}`} position={p}>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.06, 0.28]} />
            <meshStandardMaterial color="#172030" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.22, -0.1]} castShadow>
            <boxGeometry args={[0.28, 0.38, 0.05]} />
            <meshStandardMaterial color="#121820" roughness={0.55} />
          </mesh>
        </group>
      ))}

      {/* Wall screen — back wall of room (−Z local) */}
      <mesh ref={screen} position={[0, 1.25, -(roomD / 2) + 0.06]} castShadow>
        <boxGeometry args={[Math.min(1.5, roomW * 0.7), 0.75, 0.04]} />
        <meshStandardMaterial
          color="#152030"
          emissive={accent}
          emissiveIntensity={0.45}
        />
      </mesh>

      {lod === "full" ? (
        <>
          <OfficePlant
            position={[roomW * 0.32, 0, roomD * 0.28]}
            scale={0.65}
            variant={plantVariant}
          />
          <Html position={[0, h + 0.2, 0]} center distanceFactor={14}>
            <div className="zone-badge">
              {label.en} · {label.ta}
            </div>
          </Html>
        </>
      ) : null}
    </group>
  );
}

/**
 * Triple side-conference block — frosted lower front, clear upper, solid sides.
 */
export function SideConferenceBlock({
  position = ANCHORS.sideConference.position,
  yaw = ANCHORS.sideConference.yaw,
  lod = "full",
}: Props) {
  const { w, d, h } = ANCHORS.sideConference.outer;
  const frostRatio = ANCHORS.sideConference.frostFrontRatio;
  const roomCount = ANCHORS.sideConference.roomCount;
  const roomW = w / roomCount;
  const halfW = w / 2;
  const halfD = d / 2;
  const wallT = 0.08;

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Solid side walls */}
      <mesh position={[-halfW + wallT / 2, h / 2, 0]} castShadow>
        <boxGeometry args={[wallT, h, d]} />
        <meshStandardMaterial color={WALL} roughness={0.65} metalness={0.15} />
      </mesh>
      <mesh position={[halfW - wallT / 2, h / 2, 0]} castShadow>
        <boxGeometry args={[wallT, h, d]} />
        <meshStandardMaterial color={WALL} roughness={0.65} metalness={0.15} />
      </mesh>

      {/* Front glass (+Z) — lower frost / upper clear */}
      <group position={[0, 0, halfD]}>
        <SplitGlassWall width={w} height={h} frostRatio={frostRatio} lod={lod} />
        {/* Frame posts */}
        {Array.from({ length: roomCount + 1 }, (_, i) => {
          const x = -halfW + i * roomW;
          return (
            <mesh key={`fp-${i}`} position={[x, h / 2, 0.02]}>
              <boxGeometry args={[0.06, h, 0.05]} />
              <meshStandardMaterial color={MULLION} metalness={0.5} roughness={0.35} />
            </mesh>
          );
        })}
        <mesh position={[0, h - 0.04, 0.02]}>
          <boxGeometry args={[w, 0.08, 0.05]} />
          <meshStandardMaterial color={MULLION} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.04, 0.02]}>
          <boxGeometry args={[w, 0.08, 0.05]} />
          <meshStandardMaterial color={MULLION} metalness={0.5} />
        </mesh>
      </group>

      {/* Back glass (−Z) — mostly clear */}
      <group position={[0, 0, -halfD]} rotation={[0, Math.PI, 0]}>
        <SplitGlassWall width={w} height={h} frostRatio={0.12} lod={lod} />
        {Array.from({ length: roomCount + 1 }, (_, i) => {
          const x = -halfW + i * roomW;
          return (
            <mesh key={`bp-${i}`} position={[x, h / 2, 0.02]}>
              <boxGeometry args={[0.06, h, 0.05]} />
              <meshStandardMaterial color={MULLION} metalness={0.5} roughness={0.35} />
            </mesh>
          );
        })}
      </group>

      {/* Internal dividers — partial glass with same frost split */}
      {Array.from({ length: roomCount - 1 }, (_, i) => {
        const x = -halfW + (i + 1) * roomW;
        return (
          <group key={`div-${i}`} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <SplitGlassWall
              width={d - 0.1}
              height={h}
              frostRatio={frostRatio}
              lod={lod}
            />
            <mesh position={[0, h / 2, 0.02]}>
              <boxGeometry args={[0.05, h, 0.05]} />
              <meshStandardMaterial color={MULLION} metalness={0.5} />
            </mesh>
            <mesh position={[d / 2 - 0.05, h / 2, 0.02]}>
              <boxGeometry args={[0.05, h, 0.05]} />
              <meshStandardMaterial color={MULLION} metalness={0.5} />
            </mesh>
            <mesh position={[-(d / 2 - 0.05), h / 2, 0.02]}>
              <boxGeometry args={[0.05, h, 0.05]} />
              <meshStandardMaterial color={MULLION} metalness={0.5} />
            </mesh>
          </group>
        );
      })}

      {/* Ceiling strip */}
      <mesh position={[0, h - 0.03, 0]}>
        <boxGeometry args={[w, 0.06, d]} />
        <meshStandardMaterial color="#121820" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Per-room interiors */}
      {Array.from({ length: roomCount }, (_, i) => {
        const x = -halfW + roomW * (i + 0.5);
        return (
          <group key={`room-${i}`} position={[x, 0, 0]}>
            <RoomInterior
              accent={ACCENTS[i % ACCENTS.length]!}
              label={ROOM_LABELS[i]!}
              lod={lod}
              roomW={roomW - 0.12}
              roomD={d - 0.16}
              h={h}
              plantVariant={i % 4}
            />
          </group>
        );
      })}
    </group>
  );
}
