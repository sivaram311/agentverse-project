"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";
import * as THREE from "three";

export type HumanoidLook = {
  accent: string;
  skin: string;
  hair: string;
  gender: "male" | "female";
  lod: "full" | "simple";
};

type Props = {
  look: HumanoidLook;
  sitting: boolean;
  active: boolean;
  wavePhase: number;
  phase?: number;
  working?: boolean;
  walking?: boolean;
  /** Uniform scale — calibrated so feet stay on the floor */
  scale?: number;
  showRing?: boolean;
};

/**
 * Office worker humanoid — floor-anchored sit/stand.
 * Local +Z is “forward” (toward desk when seated).
 * Root must stay at y=0; only yaw is applied by the parent.
 */
export function HumanoidFigure({
  look,
  sitting,
  active,
  wavePhase,
  phase = 0,
  working = true,
  walking = false,
  scale = 0.85,
  showRing = true,
}: Props) {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  const torso = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const glow = useRef<Mesh>(null);

  const segs = look.lod === "simple" ? 6 : 10;
  const shirt = useMemo(
    () => new THREE.Color(look.accent).lerp(new THREE.Color("#1a2433"), 0.55).getStyle(),
    [look.accent],
  );
  const pants = look.gender === "female" ? "#2a2430" : "#1a2030";

  useFrame((state) => {
    const t = state.clock.elapsedTime + phase;
    if (root.current) {
      root.current.scale.setScalar(scale);
    }

    const typing = sitting && working && !walking;
    const idleSit = sitting && !walking;

    // Soft torso sway / breath — body group only, not root (avoids “swimming”)
    if (body.current) {
      if (idleSit) {
        body.current.position.y = Math.sin(t * 1.1) * 0.008;
        body.current.rotation.y = Math.sin(t * 0.55) * 0.03;
      } else if (walking) {
        body.current.position.y = Math.abs(Math.sin(t * 6)) * 0.02;
        body.current.rotation.y = 0;
      } else {
        body.current.position.y = THREE.MathUtils.lerp(body.current.position.y, 0, 0.12);
        body.current.rotation.y = THREE.MathUtils.lerp(body.current.rotation.y, 0, 0.12);
      }
    }

    if (head.current) {
      if (walking) {
        head.current.rotation.x = 0.04;
        head.current.rotation.y = Math.sin(t * 2.2) * 0.06;
      } else if (typing) {
        head.current.rotation.x = 0.22 + Math.sin(t * 0.5) * 0.04;
        head.current.rotation.y = Math.sin(t * 0.4) * 0.14;
      } else if (sitting) {
        head.current.rotation.x = 0.1 + Math.sin(t * 0.35) * 0.035;
        head.current.rotation.y = Math.sin(t * 0.45) * 0.1;
      } else {
        head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, 0.02, 0.1);
        head.current.rotation.y = Math.sin(t * 0.5) * 0.05;
      }
    }

    if (torso.current) {
      if (walking) {
        torso.current.rotation.x = Math.sin(t * 6) * 0.04;
      } else if (typing) {
        torso.current.rotation.x = 0.28 + Math.sin(t * 0.85) * 0.02;
      } else if (sitting) {
        torso.current.rotation.x = 0.16 + Math.sin(t * 1.1) * 0.012;
      } else {
        torso.current.rotation.x = THREE.MathUtils.lerp(torso.current.rotation.x, 0.02, 0.12);
      }
    }

    if (armR.current) {
      if (walking) {
        armR.current.rotation.x = Math.sin(t * 6) * 0.55;
        armR.current.rotation.z = 0.08;
        armR.current.rotation.y = 0;
      } else if (typing) {
        armR.current.rotation.x = -1.05 + Math.sin(t * 9) * 0.22;
        armR.current.rotation.z = 0.18;
        armR.current.rotation.y = 0.28;
      } else if (wavePhase > 0) {
        armR.current.rotation.z = -0.2 + Math.sin(t * 11) * 0.85;
        armR.current.rotation.x = -0.4;
        armR.current.rotation.y = 0;
      } else if (sitting) {
        armR.current.rotation.x = -0.65 + Math.sin(t * 0.7) * 0.04;
        armR.current.rotation.z = 0.1;
        armR.current.rotation.y = 0.12;
      } else {
        armR.current.rotation.x = THREE.MathUtils.lerp(armR.current.rotation.x, -0.15, 0.1);
        armR.current.rotation.z = THREE.MathUtils.lerp(armR.current.rotation.z, 0.1, 0.1);
        armR.current.rotation.y = THREE.MathUtils.lerp(armR.current.rotation.y, 0, 0.1);
      }
    }

    if (armL.current) {
      if (walking) {
        armL.current.rotation.x = Math.sin(t * 6 + Math.PI) * 0.55;
        armL.current.rotation.z = -0.08;
        armL.current.rotation.y = 0;
      } else if (typing) {
        armL.current.rotation.x = -0.95 + Math.sin(t * 8.2 + 1.1) * 0.2;
        armL.current.rotation.z = -0.16;
        armL.current.rotation.y = -0.25;
      } else if (sitting) {
        armL.current.rotation.x = -0.6 + Math.sin(t * 0.65 + 1) * 0.04;
        armL.current.rotation.z = -0.08;
        armL.current.rotation.y = -0.1;
      } else {
        armL.current.rotation.x = THREE.MathUtils.lerp(armL.current.rotation.x, -0.12, 0.1);
        armL.current.rotation.z = THREE.MathUtils.lerp(armL.current.rotation.z, -0.08, 0.1);
        armL.current.rotation.y = THREE.MathUtils.lerp(armL.current.rotation.y, 0, 0.1);
      }
    }

    if (legL.current && legR.current) {
      if (walking) {
        legL.current.rotation.x = Math.sin(t * 6) * 0.65;
        legR.current.rotation.x = Math.sin(t * 6 + Math.PI) * 0.65;
      } else if (sitting) {
        legL.current.rotation.x = 1.45;
        legR.current.rotation.x = 1.45;
      } else {
        legL.current.rotation.x = THREE.MathUtils.lerp(legL.current.rotation.x, 0, 0.14);
        legR.current.rotation.x = THREE.MathUtils.lerp(legR.current.rotation.x, 0, 0.14);
      }
    }

    if (glow.current) {
      const mat = glow.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (active ? 0.45 : 0.18) + Math.sin(t * 1.8) * 0.06;
    }
  });

  /**
   * Unscaled local units. After `scale`, hips sit ~chair height (~0.34–0.38)
   * and standing shoes rest near y=0.
   */
  const hipY = sitting ? 0.48 : 0.92;
  const sitZ = sitting ? 0.04 : 0;
  const thighLen = sitting ? 0.22 : 0.36;
  const shoeY = sitting ? -0.28 : -0.5;
  const shoeZ = sitting ? 0.12 : 0.02;

  return (
    <group ref={root}>
      {showRing ? (
        <mesh ref={glow} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.24, 0.36, 28]} />
          <meshStandardMaterial
            color={look.accent}
            emissive={look.accent}
            emissiveIntensity={0.3}
            transparent
            opacity={active ? 0.55 : 0.28}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}

      <group ref={body}>
        {/* Hips / seat */}
        <mesh position={[0, hipY - 0.04, sitZ]} castShadow>
          <sphereGeometry args={[0.13, segs, segs]} />
          <meshStandardMaterial color={pants} roughness={0.7} />
        </mesh>

        <group ref={torso} position={[0, hipY, sitZ]}>
          <mesh position={[0, 0.26, sitting ? 0.05 : 0]} castShadow>
            <capsuleGeometry args={[0.17, 0.3, 4, segs]} />
            <meshStandardMaterial color={shirt} roughness={0.55} metalness={0.08} />
          </mesh>

          {/* Front accent */}
          <mesh position={[0, 0.28, 0.14]} castShadow>
            <boxGeometry args={[0.22, 0.36, 0.03]} />
            <meshStandardMaterial
              color={look.accent}
              emissive={look.accent}
              emissiveIntensity={active ? 0.22 : 0.07}
              roughness={0.55}
            />
          </mesh>

          {/* Back silhouette */}
          <mesh position={[0, 0.26, -0.15]} castShadow>
            <boxGeometry args={[0.32, 0.44, 0.055]} />
            <meshStandardMaterial color={shirt} roughness={0.58} />
          </mesh>
          <mesh position={[0, 0.2, -0.19]} castShadow>
            <boxGeometry args={[0.2, 0.26, 0.03]} />
            <meshStandardMaterial
              color={look.accent}
              emissive={look.accent}
              emissiveIntensity={active ? 0.25 : 0.1}
              roughness={0.5}
            />
          </mesh>

          <mesh position={[-0.2, 0.4, 0]} castShadow>
            <sphereGeometry args={[0.075, segs, segs]} />
            <meshStandardMaterial color={shirt} roughness={0.55} />
          </mesh>
          <mesh position={[0.2, 0.4, 0]} castShadow>
            <sphereGeometry args={[0.075, segs, segs]} />
            <meshStandardMaterial color={shirt} roughness={0.55} />
          </mesh>

          <mesh position={[0, 0.42, 0.07]} rotation={[0.35, 0, 0]} castShadow>
            <torusGeometry args={[0.11, 0.02, 6, 14]} />
            <meshStandardMaterial color="#e8e4dc" roughness={0.6} />
          </mesh>

          {look.lod === "full" ? (
            <mesh position={[0.11, 0.26, 0.15]} castShadow>
              <boxGeometry args={[0.055, 0.07, 0.012]} />
              <meshStandardMaterial
                color={look.accent}
                emissive={look.accent}
                emissiveIntensity={0.25}
              />
            </mesh>
          ) : null}

          <mesh position={[0, 0.48, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 0.07, segs]} />
            <meshStandardMaterial color={look.skin} roughness={0.55} />
          </mesh>

          <group ref={head} position={[0, 0.64, sitting ? 0.03 : 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.15, segs + 2, segs + 2]} />
              <meshStandardMaterial color={look.skin} roughness={0.52} />
            </mesh>
            <mesh position={[-0.135, 0, 0]} castShadow>
              <sphereGeometry args={[0.032, 6, 6]} />
              <meshStandardMaterial color={look.skin} roughness={0.55} />
            </mesh>
            <mesh position={[0.135, 0, 0]} castShadow>
              <sphereGeometry args={[0.032, 6, 6]} />
              <meshStandardMaterial color={look.skin} roughness={0.55} />
            </mesh>
            <mesh position={[0, -0.01, 0.135]}>
              <sphereGeometry args={[0.02, 6, 6]} />
              <meshStandardMaterial color={look.skin} roughness={0.55} />
            </mesh>
            <mesh position={[-0.048, 0.022, 0.125]}>
              <sphereGeometry args={[0.026, 6, 6]} />
              <meshStandardMaterial color="#f8f6f2" roughness={0.3} />
            </mesh>
            <mesh position={[0.048, 0.022, 0.125]}>
              <sphereGeometry args={[0.026, 6, 6]} />
              <meshStandardMaterial color="#f8f6f2" roughness={0.3} />
            </mesh>
            <mesh position={[-0.048, 0.022, 0.145]}>
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshStandardMaterial color="#2a1a10" roughness={0.25} />
            </mesh>
            <mesh position={[0.048, 0.022, 0.145]}>
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshStandardMaterial color="#2a1a10" roughness={0.25} />
            </mesh>

            {look.gender === "female" ? (
              <>
                <mesh position={[0, 0.05, -0.02]} castShadow>
                  <sphereGeometry args={[0.158, segs, segs]} />
                  <meshStandardMaterial color={look.hair} roughness={0.75} />
                </mesh>
                <mesh position={[0, -0.02, -0.13]} castShadow>
                  <capsuleGeometry args={[0.085, 0.26, 3, 6]} />
                  <meshStandardMaterial color={look.hair} roughness={0.75} />
                </mesh>
                <mesh position={[0, 0.02, -0.17]} castShadow>
                  <sphereGeometry args={[0.11, segs, segs]} />
                  <meshStandardMaterial color={look.hair} roughness={0.78} />
                </mesh>
              </>
            ) : (
              <>
                <mesh position={[0, 0.06, -0.03]} scale={[1.05, 0.62, 1.08]} castShadow>
                  <sphereGeometry args={[0.155, segs, segs]} />
                  <meshStandardMaterial color={look.hair} roughness={0.78} />
                </mesh>
                <mesh position={[0, 0.03, -0.13]} scale={[1, 0.5, 0.65]} castShadow>
                  <sphereGeometry args={[0.13, segs, segs]} />
                  <meshStandardMaterial color={look.hair} roughness={0.8} />
                </mesh>
              </>
            )}
            <mesh position={[-0.11, 0.02, -0.05]} castShadow>
              <sphereGeometry args={[0.045, 6, 6]} />
              <meshStandardMaterial color={look.hair} roughness={0.78} />
            </mesh>
            <mesh position={[0.11, 0.02, -0.05]} castShadow>
              <sphereGeometry args={[0.045, 6, 6]} />
              <meshStandardMaterial color={look.hair} roughness={0.78} />
            </mesh>
          </group>

          <group ref={armL} position={[-0.23, 0.36, 0.04]}>
            <mesh position={[0, -0.15, 0]} castShadow>
              <capsuleGeometry args={[0.042, 0.22, 3, 6]} />
              <meshStandardMaterial color={shirt} roughness={0.55} />
            </mesh>
            <mesh position={[0, -0.34, sitting ? 0.06 : 0.02]} castShadow>
              <sphereGeometry args={[0.038, 6, 6]} />
              <meshStandardMaterial color={look.skin} roughness={0.55} />
            </mesh>
          </group>
          <group ref={armR} position={[0.23, 0.36, 0.04]}>
            <mesh position={[0, -0.15, 0]} castShadow>
              <capsuleGeometry args={[0.042, 0.22, 3, 6]} />
              <meshStandardMaterial color={shirt} roughness={0.55} />
            </mesh>
            <mesh position={[0, -0.34, sitting ? 0.06 : 0.02]} castShadow>
              <sphereGeometry args={[0.038, 6, 6]} />
              <meshStandardMaterial color={look.skin} roughness={0.55} />
            </mesh>
          </group>
        </group>

        {/* Legs — pivot at hip; sitting folds so feet reach the floor */}
        <group
          ref={legL}
          position={[-0.085, hipY - 0.06, sitZ]}
          rotation={[sitting ? 1.45 : 0, 0, 0.04]}
        >
          <mesh position={[0, -thighLen * 0.55, 0]} castShadow>
            <capsuleGeometry args={[0.052, thighLen, 3, 6]} />
            <meshStandardMaterial color={pants} roughness={0.65} />
          </mesh>
          <mesh position={[0, shoeY, shoeZ]} castShadow>
            <boxGeometry args={[0.095, 0.045, 0.15]} />
            <meshStandardMaterial color="#1a1410" roughness={0.5} />
          </mesh>
        </group>
        <group
          ref={legR}
          position={[0.085, hipY - 0.06, sitZ]}
          rotation={[sitting ? 1.45 : 0, 0, -0.04]}
        >
          <mesh position={[0, -thighLen * 0.55, 0]} castShadow>
            <capsuleGeometry args={[0.052, thighLen, 3, 6]} />
            <meshStandardMaterial color={pants} roughness={0.65} />
          </mesh>
          <mesh position={[0, shoeY, shoeZ]} castShadow>
            <boxGeometry args={[0.095, 0.045, 0.15]} />
            <meshStandardMaterial color="#1a1410" roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
