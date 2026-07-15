"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { Group } from "three";
import * as THREE from "three";
import {
  AVATAR_BY_PERSONA,
  AVATAR_SCALE,
  PLAYER_AVATAR,
  type AvatarClipName,
} from "@/lib/avatar-catalog";
import type { PersonaId } from "@/lib/types";

type Props = {
  /** Agent persona — ignored when `url` is set. */
  personaId?: PersonaId;
  /** Direct GLB url (player avatar). */
  url?: string;
  sitting: boolean;
  walking: boolean;
  waving?: boolean;
  working?: boolean;
  active?: boolean;
  reducedMotion?: boolean;
  scale?: number;
  accent?: string;
};

function pickClip(
  sitting: boolean,
  walking: boolean,
  waving: boolean,
  working: boolean,
): AvatarClipName {
  if (waving) return "Greet";
  if (walking) return "Walk";
  if (sitting && working) return "Typing";
  if (sitting) return "SitIdle";
  return "StandIdle";
}

/**
 * Ready Player Me–style avatar via useGLTF + useAnimations.
 * Re-clamps feet to y=0 whenever the clip/pose changes (no sink/swim).
 */
export function RpmAvatar({
  personaId,
  url,
  sitting,
  walking,
  waving = false,
  working = true,
  active = false,
  reducedMotion = false,
  scale = AVATAR_SCALE,
  accent = "#E8A838",
}: Props) {
  const resolvedUrl =
    url ?? (personaId ? AVATAR_BY_PERSONA[personaId].url : PLAYER_AVATAR.url);
  const group = useRef<Group>(null);
  const model = useRef<Group>(null);
  const needsClamp = useRef(true);
  const { scene, animations } = useGLTF(resolvedUrl);
  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : mesh.material
          ? [mesh.material]
          : [];
      for (const m of mats) {
        const std = m as THREE.MeshStandardMaterial;
        if (std.isMeshStandardMaterial) {
          std.envMapIntensity = 0.7;
          std.roughness = Math.min(0.82, (std.roughness ?? 0.5) + 0.04);
        }
      }
    });
    return c;
  }, [scene]);

  const { actions, mixer } = useAnimations(animations, group);
  const current = useRef<string | null>(null);

  useEffect(() => {
    if (!mixer) return;
    const name = pickClip(sitting, walking, waving, working);
    if (current.current === name) return;

    const next = actions[name];
    const prev = current.current ? actions[current.current] : null;

    if (next) {
      next.reset();
      if (reducedMotion) {
        next.setLoop(THREE.LoopOnce, 1);
        next.clampWhenFinished = true;
        next.time = 0;
        next.play();
        next.paused = true;
      } else {
        next.setLoop(
          name === "Greet" ? THREE.LoopOnce : THREE.LoopRepeat,
          name === "Greet" ? 1 : Infinity,
        );
        next.clampWhenFinished = name === "Greet";
        next.fadeIn(0.2).play();
      }
    }
    if (prev && prev !== next && !reducedMotion) prev.fadeOut(0.2);
    current.current = name;
    needsClamp.current = true;

    return () => {
      if (!reducedMotion) next?.fadeOut(0.08);
    };
  }, [actions, mixer, sitting, walking, waving, working, reducedMotion]);

  useLayoutEffect(() => {
    needsClamp.current = true;
  }, [scale, sitting, walking]);

  useFrame(() => {
    if (!group.current || !model.current) return;
    const targetMin = sitting ? 0.012 : 0.0;
    if (needsClamp.current) {
      // Hard re-baseline after clip / scale change
      model.current.position.y = 0;
      group.current.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model.current);
      if (!Number.isFinite(box.min.y)) return;
      model.current.position.y = targetMin - box.min.y;
      needsClamp.current = false;
      return;
    }
    // Soft correct walk bob / sit drift so soles stay planted
    group.current.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model.current);
    if (!Number.isFinite(box.min.y)) return;
    const err = targetMin - box.min.y;
    if (Math.abs(err) > 0.005) {
      model.current.position.y += err * 0.65;
    }
  });

  return (
    <group ref={group} scale={scale}>
      <group ref={model}>
        <primitive object={clone} />
      </group>
      {active ? (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.42, 28]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.55}
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}
    </group>
  );
}

useGLTF.preload("/avatars/rajesh.glb");
useGLTF.preload("/avatars/karthik.glb");
useGLTF.preload("/avatars/lavanya.glb");
useGLTF.preload("/avatars/aravind.glb");
useGLTF.preload("/avatars/meenakshi.glb");
useGLTF.preload("/avatars/muthu.glb");
useGLTF.preload("/avatars/kabilan.glb");
useGLTF.preload("/avatars/helpdesk.glb");
useGLTF.preload("/avatars/player.glb");
