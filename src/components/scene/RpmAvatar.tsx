"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import type { Group } from "three";
import * as THREE from "three";
import {
  AVATAR_BY_PERSONA,
  AVATAR_SCALE,
  type AvatarClipName,
} from "@/lib/avatar-catalog";
import type { PersonaId } from "@/lib/types";

type Props = {
  personaId: PersonaId;
  sitting: boolean;
  walking: boolean;
  waving: boolean;
  working?: boolean;
  active?: boolean;
  reducedMotion?: boolean;
  /** Override uniform scale (desk-fit default). */
  scale?: number;
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
 * Ready Player Me–style office avatar loaded via useGLTF + useAnimations.
 * Floor-anchored (group y=0); sit/walk/greet clips baked into each GLB.
 */
export function RpmAvatar({
  personaId,
  sitting,
  walking,
  waving,
  working = true,
  active = false,
  reducedMotion = false,
  scale = AVATAR_SCALE,
}: Props) {
  const def = AVATAR_BY_PERSONA[personaId];
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(def.url);
  const clone = useMemo(() => {
    const c = skeletonSafeClone(scene);
    c.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
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
            std.envMapIntensity = 0.65;
            std.roughness = Math.min(0.85, (std.roughness ?? 0.5) + 0.05);
          }
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
    const prevName = current.current;
    const prev = prevName ? actions[prevName] : null;

    if (next) {
      next.reset();
      if (reducedMotion) {
        next.setLoop(THREE.LoopOnce, 1);
        next.clampWhenFinished = true;
        next.time = 0;
        next.play();
        next.paused = true;
      } else {
        next.setLoop(name === "Greet" ? THREE.LoopOnce : THREE.LoopRepeat, name === "Greet" ? 1 : Infinity);
        next.clampWhenFinished = name === "Greet";
        next.fadeIn(0.25).play();
      }
    }
    if (prev && prev !== next && !reducedMotion) {
      prev.fadeOut(0.25);
    }
    current.current = name;

    return () => {
      if (!reducedMotion) next?.fadeOut(0.1);
    };
  }, [actions, mixer, sitting, walking, waving, working, reducedMotion]);

  // Soft accent ring under feet for selection
  return (
    <group ref={group} scale={scale} position={[0, 0, 0]}>
      <primitive object={clone} />
      {active ? (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.28, 0.4, 28]} />
          <meshStandardMaterial
            color="#E8A838"
            emissive="#E8A838"
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

/** Clone hierarchy without sharing skeletons incorrectly. */
function skeletonSafeClone(source: THREE.Object3D) {
  return source.clone(true);
}

useGLTF.preload("/avatars/rajesh.glb");
useGLTF.preload("/avatars/karthik.glb");
useGLTF.preload("/avatars/lavanya.glb");
useGLTF.preload("/avatars/aravind.glb");
useGLTF.preload("/avatars/meenakshi.glb");
useGLTF.preload("/avatars/muthu.glb");
useGLTF.preload("/avatars/kabilan.glb");
