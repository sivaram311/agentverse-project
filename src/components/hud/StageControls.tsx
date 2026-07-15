"use client";

import type { ViewMode } from "@/lib/camera-framing";
import { useVerseStore } from "@/lib/store";

const VIEW_LABELS: Record<ViewMode, string> = {
  portrait: "Portrait",
  "portrait-compact": "Portrait S",
  landscape: "Landscape",
  "landscape-compact": "Landscape S",
};

/**
 * Floating keep-mobile chip — joystick + camera toggles for operators.
 * Stays reachable even when the full office chrome is closed.
 */
export function StageControls() {
  const joystickEnabled = useVerseStore((s) => s.joystickEnabled);
  const toggleJoystick = useVerseStore((s) => s.toggleJoystickEnabled);
  const cameraViewOverride = useVerseStore((s) => s.cameraViewOverride);
  const activePackId = useVerseStore((s) => s.activePackId);
  const cycleCamera = useVerseStore((s) => s.cycleCameraView);

  const viewLabel = cameraViewOverride ? VIEW_LABELS[cameraViewOverride] : "Auto";

  return (
    <div className="stage-controls" aria-label="Stage controls">
      <button
        type="button"
        className={`stage-chip${joystickEnabled ? " on" : ""}`}
        aria-pressed={joystickEnabled}
        onClick={toggleJoystick}
        title="Toggle on-screen joystick"
      >
        {joystickEnabled ? "Joystick" : "Joystick off"}
      </button>
      <button
        type="button"
        className="stage-chip"
        onClick={cycleCamera}
        title={`Cycle camera view · pack: ${activePackId}`}
      >
        View: {viewLabel}
      </button>
    </div>
  );
}
