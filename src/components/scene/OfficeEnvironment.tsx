"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useVerseStore, type OfficeMood } from "@/lib/store";

/** Soft gold guides under the hex collab carpet (indoor tower L1). */
export function MandalaFloor({ lod = "full" }: { lod?: "full" | "simple" }) {
  const spin = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (spin.current && lod === "full") {
      spin.current.rotation.y += dt * 0.02;
    }
  });

  return (
    <group>
      {/* Deep void plate beyond the cutaway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.02, 0]}>
        <circleGeometry args={[18, lod === "simple" ? 32 : 64]} />
        <meshStandardMaterial color="#060a10" metalness={0.4} roughness={0.85} />
      </mesh>

      {/* Soft perimeter ring — hex office sits on carpet above */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[7.4, 7.7, 0.08, lod === "simple" ? 32 : 64]} />
        <meshStandardMaterial color="#121018" metalness={0.35} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.065, 0]} receiveShadow>
        <cylinderGeometry args={[7.1, 7.1, 0.02, lod === "simple" ? 32 : 64]} />
        <meshStandardMaterial
          color="#16141c"
          emissive="#2a1c08"
          emissiveIntensity={0.12}
          metalness={0.25}
          roughness={0.7}
        />
      </mesh>

      {/* Subtle gold guide rings under carpet */}
      <group ref={spin}>
        {[2.2, 3.65, 5.2].map((r, i) => (
          <mesh key={r} rotation={[-Math.PI / 2, 0, Math.PI / 6]} position={[0, 0.07, 0]}>
            <ringGeometry args={[r, r + (i === 1 ? 0.08 : 0.045), i === 1 ? 6 : 64]} />
            <meshStandardMaterial
              color="#E8A838"
              emissive="#E8A838"
              emissiveIntensity={0.45}
              transparent
              opacity={0.35 - i * 0.06}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* Soft perimeter pillars aligned to hex vertices */}
      {lod === "full"
        ? [0, 1, 2, 3, 4, 5].map((i) => {
            const a = -Math.PI / 2 + (i / 6) * Math.PI * 2;
            const x = Math.cos(a) * 8.4;
            const z = Math.sin(a) * 8.4;
            return (
              <group key={`pillar-${i}`} position={[x, 0, z]}>
                <mesh position={[0, 1.2, 0]} castShadow>
                  <cylinderGeometry args={[0.12, 0.16, 2.4, 8]} />
                  <meshStandardMaterial color="#101820" metalness={0.55} roughness={0.4} />
                </mesh>
                <mesh position={[0, 2.45, 0]}>
                  <sphereGeometry args={[0.14, 8, 8]} />
                  <meshStandardMaterial
                    color="#E8A838"
                    emissive="#E8A838"
                    emissiveIntensity={0.9}
                  />
                </mesh>
                <pointLight position={[0, 2.4, 0]} intensity={0.3} distance={6} color="#E8A838" />
              </group>
            );
          })
        : null}
    </group>
  );
}

type MoodPalette = {
  ambient: number;
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  key: string;
  keyI: number;
  fill: string;
  fillI: number;
  left: string;
  leftI: number;
  right: string;
  rightI: number;
  hub: string;
  hubI: number;
  spot: string;
  spotI: number;
};

const MOOD: Record<OfficeMood, MoodPalette> = {
  morning: {
    ambient: 0.48,
    hemiSky: "#d0e4ff",
    hemiGround: "#1a1810",
    hemi: 0.42,
    key: "#e8f0ff",
    keyI: 1.05,
    fill: "#8eb8ff",
    fillI: 0.55,
    left: "#b8d4ff",
    leftI: 0.32,
    right: "#ffe0b8",
    rightI: 0.16,
    hub: "#a8c8ff",
    hubI: 0.45,
    spot: "#f0f6ff",
    spotI: 0.5,
  },
  day: {
    ambient: 0.48,
    hemiSky: "#d8e8f8",
    hemiGround: "#1a1810",
    hemi: 0.42,
    key: "#fff8ec",
    keyI: 1.05,
    fill: "#9ec4ff",
    fillI: 0.55,
    left: "#b8d8ff",
    leftI: 0.32,
    right: "#ffd0a0",
    rightI: 0.28,
    hub: "#E8A838",
    hubI: 0.62,
    spot: "#ffeac8",
    spotI: 0.58,
  },
  evening: {
    ambient: 0.28,
    hemiSky: "#ffc8a0",
    hemiGround: "#12080a",
    hemi: 0.28,
    key: "#ffd0a0",
    keyI: 0.7,
    fill: "#6080c0",
    fillI: 0.28,
    left: "#8090c8",
    leftI: 0.14,
    right: "#ff9060",
    rightI: 0.38,
    hub: "#FF8A3D",
    hubI: 0.7,
    spot: "#ffc090",
    spotI: 0.55,
  },
};

export function OfficeLighting({
  reducedMotion,
  narrow,
  boost = false,
}: {
  reducedMotion: boolean;
  narrow?: boolean;
  /** Mobile/simple scenes without HDR — lift exposure via brighter lights. */
  boost?: boolean;
}) {
  const mood = useVerseStore((s) => s.officeMood);
  const palette = useMemo(() => MOOD[mood], [mood]);
  const flicker = useRef<THREE.PointLight>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const mul = boost ? 1.55 : 1;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (flicker.current && !reducedMotion) {
      flicker.current.intensity = palette.hubI * mul + Math.sin(t * 1.8) * 0.08;
    }
    if (ambientRef.current) {
      ambientRef.current.intensity =
        palette.ambient * mul + (reducedMotion ? 0 : Math.sin(t * 0.35) * 0.02);
    }
    if (keyRef.current) {
      keyRef.current.intensity =
        palette.keyI * mul + (reducedMotion ? 0 : Math.sin(t * 0.25) * 0.03);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={palette.ambient * mul} />
      <hemisphereLight
        args={[palette.hemiSky, palette.hemiGround, palette.hemi * (boost ? 1.35 : 1)]}
      />
      <directionalLight
        ref={keyRef}
        castShadow={!reducedMotion && !narrow}
        position={[5, 14, 8]}
        intensity={palette.keyI * mul}
        color={palette.key}
        shadow-mapSize={narrow ? [512, 512] : [1024, 1024]}
        shadow-bias={-0.0002}
      />
      <directionalLight
        position={[0, 6, -14]}
        intensity={palette.fillI * mul}
        color={palette.fill}
      />
      <directionalLight
        position={[-10, 8, 2]}
        intensity={palette.leftI * mul}
        color={palette.left}
      />
      <directionalLight
        position={[10, 8, 2]}
        intensity={palette.rightI * mul}
        color={palette.right}
      />
      <pointLight
        ref={flicker}
        position={[0, 5.5, 0]}
        intensity={palette.hubI * mul}
        color={palette.hub}
        distance={boost ? 32 : 22}
      />
      <pointLight
        position={[0, 3.2, 4]}
        intensity={boost ? 0.55 : 0.2}
        color="#ffe6c8"
        distance={boost ? 24 : 12}
      />
      <spotLight
        position={[0, 10, 4]}
        angle={0.7}
        penumbra={0.55}
        intensity={palette.spotI * mul}
        color={palette.spot}
        castShadow={!narrow}
      />
    </>
  );
}

/** Night exterior beyond the glass — subtle city void, not a game void. */
export function OfficeBackdrop({ lod = "full" }: { lod?: "full" | "simple" }) {
  return (
    <group>
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[22, lod === "simple" ? 16 : 32, lod === "simple" ? 12 : 24]} />
        <meshStandardMaterial
          color="#060a12"
          emissive="#0c1828"
          emissiveIntensity={0.35}
          side={THREE.BackSide}
          roughness={1}
          metalness={0}
        />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[16, 21, lod === "simple" ? 24 : 48]} />
        <meshStandardMaterial
          color="#101828"
          emissive="#1a3048"
          emissiveIntensity={0.25}
          side={THREE.DoubleSide}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}
