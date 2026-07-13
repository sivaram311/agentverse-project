"use client";

import { useMemo } from "react";
import { BENCH_SEATS, type BenchSeat } from "@/lib/intellect-benches";
import { AVATAR_SCALE } from "@/lib/avatar-catalog";
import { HumanoidFigure } from "./HumanoidFigure";

/** Black mesh ergonomic chair — Intellect office standard. */
function MeshChair({ open = true }: { open?: boolean }) {
  const z = open ? 0 : 0.08;
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.38, 0.05, 0.36]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.72, -0.14]} castShadow>
        <boxGeometry args={[0.36, 0.48, 0.04]} />
        <meshStandardMaterial color="#121416" roughness={0.48} />
      </mesh>
      {/* Mesh lattice hint */}
      <mesh position={[0, 0.72, -0.12]}>
        <boxGeometry args={[0.3, 0.4, 0.01]} />
        <meshStandardMaterial
          color="#2a2e32"
          transparent
          opacity={0.45}
          roughness={0.7}
        />
      </mesh>
      {([-0.2, 0.2] as const).map((x) => (
        <mesh key={x} position={[x, 0.52, 0.02]} castShadow>
          <boxGeometry args={[0.04, 0.04, 0.22]} />
          <meshStandardMaterial color="#0e1012" metalness={0.55} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.04, 0.36, 8]} />
        <meshStandardMaterial color="#0a0c0e" metalness={0.6} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(a) * 0.18, 0.05, Math.sin(a) * 0.18]}>
            <mesh rotation={[0, a, 0]} castShadow>
              <boxGeometry args={[0.22, 0.03, 0.04]} />
              <meshStandardMaterial color="#0a0c0e" metalness={0.55} />
            </mesh>
            <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.035, 0.012, 6, 10]} />
              <meshStandardMaterial color="#1a1c1e" metalness={0.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Monitor({
  x,
  topY,
  bright = true,
}: {
  x: number;
  topY: number;
  bright?: boolean;
}) {
  return (
    <group position={[x, topY, -0.28]}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.12, 0.06, 0.1]} />
        <meshStandardMaterial color="#1a1c1e" metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.42, 0.32, 0.04]} />
        <meshStandardMaterial color="#0c0e10" metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.28, 0.022]}>
        <planeGeometry args={[0.36, 0.26]} />
        <meshStandardMaterial
          color={bright ? "#f4f8ff" : "#1a2838"}
          emissive={bright ? "#d8e8ff" : "#102030"}
          emissiveIntensity={bright ? 0.55 : 0.2}
        />
      </mesh>
    </group>
  );
}

/** One bench station: wood top segment + chair + kit. */
function Workstation({ seat }: { seat: BenchSeat }) {
  const topY = 0.72;
  const topColor = seat.yellowAccent ? "#c4a03a" : "#a86a38";
  const standing = seat.npc?.standing;

  return (
    <group position={[seat.x, 0, seat.z]} rotation={[0, seat.yaw, 0]}>
      {/* Desk segment — white frame + warm wood top */}
      <mesh position={[0, topY / 2 - 0.02, 0]} castShadow>
        <boxGeometry args={[1.15, topY - 0.06, 0.72]} />
        <meshStandardMaterial color="#e8eaec" metalness={0.15} roughness={0.55} />
      </mesh>
      <mesh position={[0, topY, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.04, 0.76]} />
        <meshStandardMaterial color={topColor} roughness={0.48} metalness={0.08} />
      </mesh>
      {/* Legs */}
      {(
        [
          [-0.48, 0.35, -0.28],
          [0.48, 0.35, -0.28],
          [-0.48, 0.35, 0.28],
          [0.48, 0.35, 0.28],
        ] as [number, number, number][]
      ).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.05, 0.7, 0.05]} />
          <meshStandardMaterial color="#f0f2f4" metalness={0.25} roughness={0.45} />
        </mesh>
      ))}

      {seat.drawerOpen ? (
        <mesh position={[-0.25, 0.28, 0.42]} castShadow>
          <boxGeometry args={[0.35, 0.22, 0.28]} />
          <meshStandardMaterial color="#f5f6f8" roughness={0.55} />
        </mesh>
      ) : null}

      {/* Computing kit facing sitter (+local Z toward chair) */}
      {seat.dualMonitors ? (
        <>
          <Monitor x={-0.22} topY={topY} bright />
          <Monitor x={0.22} topY={topY} bright />
        </>
      ) : (
        <Monitor x={0} topY={topY} bright />
      )}
      <mesh position={[0, topY + 0.02, 0.08]} castShadow>
        <boxGeometry args={[0.4, 0.02, 0.14]} />
        <meshStandardMaterial color="#121416" roughness={0.5} />
      </mesh>
      <mesh position={[0.28, topY + 0.02, 0.12]} castShadow>
        <boxGeometry args={[0.06, 0.02, 0.1]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.45} />
      </mesh>
      {/* IP phone */}
      <mesh position={[-0.42, topY + 0.04, 0.05]} castShadow>
        <boxGeometry args={[0.14, 0.06, 0.18]} />
        <meshStandardMaterial color="#0e1012" roughness={0.4} />
      </mesh>
      {seat.laptop === "closed" ? (
        <mesh position={[0.4, topY + 0.015, 0.1]} castShadow>
          <boxGeometry args={[0.28, 0.015, 0.2]} />
          <meshStandardMaterial color="#c0c4c8" metalness={0.55} roughness={0.25} />
        </mesh>
      ) : null}
      {seat.laptop === "open" ? (
        <group position={[0.4, topY, 0.05]}>
          <mesh position={[0, 0.01, 0]} castShadow>
            <boxGeometry args={[0.26, 0.012, 0.18]} />
            <meshStandardMaterial color="#2a2e32" metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.12, -0.08]} rotation={[-0.35, 0, 0]} castShadow>
            <boxGeometry args={[0.26, 0.18, 0.012]} />
            <meshStandardMaterial
              color="#1a2030"
              emissive="#88a0c0"
              emissiveIntensity={0.25}
            />
          </mesh>
        </group>
      ) : null}

      {/* Chair behind desk (+Z local) */}
      {!standing ? (
        <group position={[0, 0, 0.52]}>
          <MeshChair />
        </group>
      ) : (
        <group position={[0, 0, 0.55]}>
          <MeshChair open={false} />
        </group>
      )}

      {/* NPC worker (crew rendered in PersonaAvatar) */}
      {seat.npc && !seat.personaId ? (
        <group position={[0, 0, standing ? 0.35 : 0.52]}>
          <HumanoidFigure
            look={{
              accent: seat.npc.accent,
              skin: seat.npc.skin,
              hair: seat.npc.hair,
              gender: seat.npc.gender,
              lod: "full",
            }}
            sitting={!standing}
            walking={false}
            wavePhase={0}
            working={!standing}
            active={false}
            scale={AVATAR_SCALE}
          />
        </group>
      ) : null}
    </group>
  );
}

/**
 * Continuous-looking bench runs + L-pods filled with Intellect-style stations.
 */
export function IntellectBenches({ lod = "full" }: { lod?: "full" | "simple" }) {
  const seats = useMemo(
    () => (lod === "simple" ? BENCH_SEATS.filter((_, i) => i % 2 === 0) : BENCH_SEATS),
    [lod],
  );

  return (
    <group>
      {seats.map((seat) => (
        <Workstation key={seat.id} seat={seat} />
      ))}
    </group>
  );
}
