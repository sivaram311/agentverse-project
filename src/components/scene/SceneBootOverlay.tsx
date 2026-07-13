"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

/**
 * Overlay until THREE DefaultLoadingManager finishes (avatars, env, textures).
 * Stays up through the first idle frame after 100% so the canvas can paint.
 */
export function SceneBootOverlay() {
  const { active, progress, loaded, total } = useProgress();
  const [visible, setVisible] = useState(true);
  const pct = Math.min(100, Math.round(progress));

  useEffect(() => {
    if (active || pct < 100) {
      setVisible(true);
      return;
    }
    const t = window.setTimeout(() => setVisible(false), 280);
    return () => window.clearTimeout(t);
  }, [active, pct]);

  if (!visible) return null;

  return (
    <div className="scene-boot" role="status" aria-live="polite" aria-busy={pct < 100}>
      <div className="scene-boot-card">
        <p className="scene-boot-eyebrow">AgentVerse</p>
        <strong className="scene-boot-title">Loading Siruseri HQ</strong>
        <p className="scene-boot-copy">
          Building the full office{total > 0 ? ` · ${loaded}/${total}` : "…"}
        </p>
        <div className="scene-boot-track" aria-hidden>
          <i style={{ width: `${pct}%` }} />
        </div>
        <span className="scene-boot-pct">{pct}%</span>
      </div>
    </div>
  );
}
