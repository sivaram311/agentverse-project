"use client";

import { useCallback, useEffect, useRef } from "react";
import { useVerseStore } from "@/lib/store";

/**
 * Mobile / touch virtual stick — writes into store.playerMoveInput.
 * Hidden on wide pointers that prefer WASD (CSS), but still usable.
 */
export function TouchJoystick() {
  const enabled = useVerseStore((s) => s.joystickEnabled);
  const setMove = useVerseStore((s) => s.setPlayerMoveInput);
  const active = useRef(false);
  const origin = useRef({ x: 0, y: 0 });
  const knob = useRef<HTMLDivElement>(null);

  const apply = useCallback(
    (clientX: number, clientY: number) => {
      const dx = clientX - origin.current.x;
      const dy = clientY - origin.current.y;
      const max = 46;
      const len = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(len, max);
      const nx = (dx / len) * clamped;
      const ny = (dy / len) * clamped;
      if (knob.current) {
        knob.current.style.transform = `translate(${nx}px, ${ny}px)`;
      }
      setMove({ x: nx / max, z: ny / max });
    },
    [setMove],
  );

  const end = useCallback(() => {
    active.current = false;
    if (knob.current) knob.current.style.transform = "translate(0px, 0px)";
    setMove({ x: 0, z: 0 });
  }, [setMove]);

  useEffect(() => {
    if (!enabled) {
      active.current = false;
      setMove({ x: 0, z: 0 });
    }
  }, [enabled, setMove]);

  if (!enabled) return null;

  return (
    <div
      className="touch-joystick"
      aria-label="Move around the office"
      onPointerDown={(e) => {
        active.current = true;
        origin.current = { x: e.clientX, y: e.clientY };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        apply(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!active.current) return;
        apply(e.clientX, e.clientY);
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="touch-joystick-base" aria-hidden>
        <div ref={knob} className="touch-joystick-knob" />
      </div>
      <small>Drag to walk · WASD on desktop</small>
    </div>
  );
}
