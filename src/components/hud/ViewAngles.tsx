"use client";

import {
  ORBIT_SHOT_ORDER,
  ORBIT_SHOTS,
  type OrbitShot,
} from "@/lib/camera-framing";
import { useVerseStore } from "@/lib/store";

/**
 * Quick view picker — floor sides (all 8) + body shots + Walk.
 */
export function ViewAngles() {
  const cameraMode = useVerseStore((s) => s.cameraMode);
  const orbitShot = useVerseStore((s) => s.orbitShot);
  const pickCameraView = useVerseStore((s) => s.pickCameraView);
  const walk = cameraMode === "firstPerson";

  return (
    <div className="view-angles" role="toolbar" aria-label="Camera views">
      {ORBIT_SHOT_ORDER.map((id: OrbitShot) => {
        const active = !walk && orbitShot === id;
        return (
          <button
            key={id}
            type="button"
            className={`view-angle-btn${active ? " active" : ""}`}
            aria-pressed={active}
            onClick={() => pickCameraView(id)}
          >
            {ORBIT_SHOTS[id].label}
          </button>
        );
      })}
      <button
        type="button"
        className={`view-angle-btn walk${walk ? " active" : ""}`}
        aria-pressed={walk}
        onClick={() => pickCameraView("walk")}
      >
        Walk
      </button>
    </div>
  );
}
