"use client";

import { useMemo } from "react";
import { INDUSTRIAL_BOUNDS, PALETTE } from "@/lib/office-palette";

function IBeam({
  length,
  position,
  rotationY = 0,
}: {
  length: number;
  position: [number, number, number];
  rotationY?: number;
}) {
  const flangeW = 0.28;
  const webH = 0.22;
  const t = 0.04;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow>
        <boxGeometry args={[length, t, flangeW]} />
        <meshStandardMaterial
          color={PALETTE.ceilingBeamDark}
          metalness={0.65}
          roughness={0.45}
        />
      </mesh>
      <mesh position={[0, -webH / 2, 0]} castShadow>
        <boxGeometry args={[length, webH, t]} />
        <meshStandardMaterial
          color={PALETTE.ceilingBeam}
          metalness={0.6}
          roughness={0.5}
        />
      </mesh>
      <mesh position={[0, -webH, 0]} castShadow>
        <boxGeometry args={[length, t, flangeW]} />
        <meshStandardMaterial
          color={PALETTE.ceilingBeamDark}
          metalness={0.65}
          roughness={0.45}
        />
      </mesh>
    </group>
  );
}

/**
 * Exposed industrial ceiling: I-beams/trusses + diagonal bracing,
 * HVAC pipes/ducts, sprinklers/smoke detectors, surface LED panels,
 * linear LED tubes + a few pendant point lights.
 */
export function IndustrialCeiling({ lod = "full" }: { lod?: "full" | "simple" }) {
  const { halfW, backZ, openZ, ceilingY } = INDUSTRIAL_BOUNDS;
  const depth = openZ - backZ;
  const midZ = (openZ + backZ) / 2;
  const y = ceilingY;
  const simple = lod === "simple";

  const mainBeamsX = useMemo(() => {
    const step = simple ? 5.25 : 3.5;
    const xs: number[] = [];
    for (let x = -halfW + 1.2; x <= halfW - 1.2; x += step) xs.push(x);
    return xs;
  }, [halfW, simple]);

  const crossBeamsZ = useMemo(() => {
    const step = simple ? 5.5 : 4.15;
    const zs: number[] = [];
    for (let z = backZ + 1.4; z <= openZ - 1.4; z += step) zs.push(z);
    return zs;
  }, [backZ, openZ, simple]);

  const ledRows = useMemo(() => {
    const step = simple ? 4.2 : 2.8;
    const rows: number[] = [];
    for (let z = backZ + 1.8; z <= openZ - 1.6; z += step) rows.push(z);
    return rows;
  }, [backZ, openZ, simple]);

  const pendants = useMemo(() => {
    if (simple) {
      return [
        [0, midZ] as const,
        [-5.5, midZ - 2] as const,
        [5.5, midZ + 2] as const,
      ];
    }
    return [
      [-6.5, backZ + 3] as const,
      [0, midZ] as const,
      [6.5, backZ + 3] as const,
      [-4, openZ - 2.5] as const,
      [4, openZ - 2.5] as const,
    ];
  }, [backZ, midZ, openZ, simple]);

  const sprinklers = useMemo(() => {
    const pts: [number, number][] = [];
    const xStep = simple ? 5 : 3.2;
    const zStep = simple ? 5 : 3.5;
    for (let x = -halfW + 2; x <= halfW - 2; x += xStep) {
      for (let z = backZ + 2; z <= openZ - 2; z += zStep) {
        pts.push([x, z]);
      }
    }
    return pts;
  }, [backZ, halfW, openZ, simple]);

  /** Diagonal cross-bracing in I-beam bays (X pattern); sparser when lod=simple */
  const braces = useMemo(() => {
    type Brace = {
      key: string;
      position: [number, number, number];
      length: number;
      rotationY: number;
    };
    const items: Brace[] = [];
    const skip = simple ? 2 : 1;
    for (let i = 0; i < mainBeamsX.length - 1; i += skip) {
      for (let j = 0; j < crossBeamsZ.length - 1; j += skip) {
        if (simple && (i + j) % 2 !== 0) continue;
        const x0 = mainBeamsX[i];
        const x1 = mainBeamsX[i + 1];
        const z0 = crossBeamsZ[j];
        const z1 = crossBeamsZ[j + 1];
        const cx = (x0 + x1) / 2;
        const cz = (z0 + z1) / 2;
        const dx = x1 - x0;
        const dz = z1 - z0;
        const len = Math.hypot(dx, dz) - 0.12;
        const by = y - 0.2;
        items.push({
          key: `br-a-${i}-${j}`,
          position: [cx, by, cz],
          length: len,
          rotationY: Math.atan2(dz, dx),
        });
        items.push({
          key: `br-b-${i}-${j}`,
          position: [cx, by, cz],
          length: len,
          rotationY: Math.atan2(-dz, dx),
        });
      }
    }
    return items;
  }, [crossBeamsZ, mainBeamsX, simple, y]);

  /** Sparse surface-mounted circular LED panels on/near ceiling plane */
  const ledPanels = useMemo(() => {
    const pts: [number, number][] = [];
    const xStep = simple ? 6.5 : 4.8;
    const zStep = simple ? 6.2 : 4.5;
    for (let x = -halfW + 2.8; x <= halfW - 2.8; x += xStep) {
      for (let z = backZ + 2.5; z <= openZ - 2.2; z += zStep) {
        pts.push([x, z]);
      }
    }
    return pts;
  }, [backZ, halfW, openZ, simple]);

  /** Smoke detectors next to a subset of sprinklers */
  const smokeDetectors = useMemo(() => {
    const stride = simple ? 4 : 3;
    return sprinklers
      .filter((_, i) => i % stride === 0)
      .map(([x, z]) => [x + 0.22, z + 0.18] as const);
  }, [simple, sprinklers]);

  const tubeLen = halfW * 1.55;

  return (
    <group>
      {/* Primary I-beams spanning depth (X spacing) */}
      {mainBeamsX.map((x) => (
        <IBeam
          key={`beam-x-${x.toFixed(2)}`}
          length={depth - 0.6}
          position={[x, y - 0.12, midZ]}
          rotationY={Math.PI / 2}
        />
      ))}

      {/* Cross trusses spanning width */}
      {crossBeamsZ.map((z) => (
        <IBeam
          key={`beam-z-${z.toFixed(2)}`}
          length={halfW * 2 - 1.2}
          position={[0, y - 0.18, z]}
        />
      ))}

      {/* Diagonal cross-bracing between I-beams */}
      {braces.map((b) => (
        <mesh
          key={b.key}
          position={b.position}
          rotation={[0, b.rotationY, 0]}
          castShadow
        >
          <boxGeometry args={[b.length, 0.025, 0.04]} />
          <meshStandardMaterial
            color={PALETTE.ceilingBeamDark}
            metalness={0.7}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* Black main HVAC run + red fire pipe (along depth / Z) */}
      <mesh
        position={[-halfW * 0.55, y - 0.42, midZ]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.09, 0.09, depth - 1.2, 8]} />
        <meshStandardMaterial color={PALETTE.ductBlack} metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh
        position={[halfW * 0.4, y - 0.38, midZ]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.06, 0.06, depth - 1.5, 8]} />
        <meshStandardMaterial color={PALETTE.ductRed} metalness={0.45} roughness={0.45} />
      </mesh>
      {/* Red cross runs (along width / X) */}
      {(!simple ? [midZ - 3, midZ + 3] : [midZ]).map((z) => (
        <mesh key={`red-x-${z}`} position={[0, y - 0.4, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, halfW * 1.7, 8]} />
          <meshStandardMaterial color={PALETTE.ductRed} metalness={0.45} roughness={0.45} />
        </mesh>
      ))}

      {/* Light gray rectangular ducts */}
      <mesh position={[halfW * 0.15, y - 0.55, midZ - 1]} castShadow>
        <boxGeometry args={[1.1, 0.35, depth * 0.55]} />
        <meshStandardMaterial color={PALETTE.ductGray} metalness={0.35} roughness={0.55} />
      </mesh>
      {!simple ? (
        <mesh position={[-halfW * 0.25, y - 0.52, midZ + 2.2]} castShadow>
          <boxGeometry args={[0.9, 0.28, depth * 0.35]} />
          <meshStandardMaterial color={PALETTE.ductGray} metalness={0.35} roughness={0.55} />
        </mesh>
      ) : null}

      {/* Sprinkler heads */}
      {sprinklers.map(([x, z], i) => (
        <mesh key={`sp-${i}`} position={[x, y - 0.28, z]}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshStandardMaterial color={PALETTE.ductRed} metalness={0.5} roughness={0.4} />
        </mesh>
      ))}

      {/* Smoke detectors (white disc + dark center) next to some sprinklers */}
      {smokeDetectors.map(([x, z], i) => (
        <group key={`sd-${i}`} position={[x, y - 0.02, z]}>
          <mesh>
            <cylinderGeometry args={[0.07, 0.07, 0.02, 12]} />
            <meshStandardMaterial color="#F1F5F9" metalness={0.15} roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.012, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.012, 10]} />
            <meshStandardMaterial color={PALETTE.ceilingBeamDark} metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Surface-mounted circular LED panels (flat emissive discs) */}
      {ledPanels.map(([x, z], i) => (
        <mesh key={`led-panel-${i}`} position={[x, y - 0.04, z]}>
          <cylinderGeometry args={[0.38, 0.38, 0.018, 20]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.9}
            roughness={0.3}
            metalness={0.05}
          />
        </mesh>
      ))}

      {/* Linear white LED tube fixtures (along width / X) */}
      {ledRows.map((z, ri) => {
        const yTube = y - 0.32;
        return (
          <group key={`led-row-${ri}`}>
            <mesh position={[0, yTube, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.035, 0.035, tubeLen, 8]} />
              <meshStandardMaterial
                color="#FFFFFF"
                emissive="#FFFFFF"
                emissiveIntensity={0.95}
                roughness={0.25}
                metalness={0.1}
              />
            </mesh>
            {/* End caps / mount bars */}
            {[-tubeLen / 2, tubeLen / 2].map((x) => (
              <mesh key={`cap-${x}`} position={[x, yTube + 0.06, z]}>
                <boxGeometry args={[0.08, 0.06, 0.12]} />
                <meshStandardMaterial color={PALETTE.ceilingBeam} metalness={0.5} roughness={0.5} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Circular white pendants + point lights */}
      {pendants.map(([x, z], i) => {
        const py = y - 0.85;
        return (
          <group key={`pendant-${i}`} position={[x, py, z]}>
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.7, 6]} />
              <meshStandardMaterial color={PALETTE.ceilingBeamDark} metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.28, 0.32, 0.08, 16]} />
              <meshStandardMaterial
                color="#FFFFFF"
                emissive="#FFFFFF"
                emissiveIntensity={0.85}
                roughness={0.3}
                metalness={0.05}
              />
            </mesh>
            <mesh position={[0, -0.02, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
              <meshStandardMaterial
                color="#F8FAFC"
                emissive="#E8F4FC"
                emissiveIntensity={1.1}
                roughness={0.2}
              />
            </mesh>
            <pointLight
              position={[0, -0.15, 0]}
              intensity={simple ? 0.55 : 0.7}
              distance={9}
              color="#FFFFFF"
            />
          </group>
        );
      })}
    </group>
  );
}
