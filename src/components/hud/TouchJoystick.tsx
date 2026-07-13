"use client";

import { useCallback, useEffect, useRef } from "react";
import { useVerseStore } from "@/lib/store";

/**
 * Mobile / touch virtual stick — writes into store.playerMoveInput.
 * Hard-resets on lost capture / window pointerup (Android hang fix).
 */
export function TouchJoystick() {
  const setMove = useVerseStore((s) => s.setPlayerMoveInput);
  const active = useRef(false);
  const origin = useRef({ x: 0, y: 0 });
  const knob = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);

  const end = useCallback(() => {
    active.current = false;
    pointerId.current = null;
    if (knob.current) knob.current.style.transform = "translate(0px, 0px)";
    useVerseStore.getState().setPlayerMoveInput({ x: 0, z: 0 });
  }, []);

  const apply = useCallback((clientX: number, clientY: number) => {
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
    useVerseStore.getState().setPlayerMoveInput({ x: nx / max, z: ny / max });
  }, []);

  useEffect(() => {
    const onWinUp = (e: PointerEvent) => {
      if (!active.current) return;
      if (pointerId.current != null && e.pointerId !== pointerId.current) return;
      end();
    };
    window.addEventListener("pointerup", onWinUp);
    window.addEventListener("pointercancel", onWinUp);
    window.addEventListener("blur", end);
    return () => {
      window.removeEventListener("pointerup", onWinUp);
      window.removeEventListener("pointercancel", onWinUp);
      window.removeEventListener("blur", end);
    };
  }, [end]);

  return (
    <div
      className="touch-joystick"
      aria-label="Move around the office"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        e.preventDefault();
        active.current = true;
        pointerId.current = e.pointerId;
        origin.current = { x: e.clientX, y: e.clientY };
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          /* some Android WebViews reject capture */
        }
        apply(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!active.current) return;
        if (pointerId.current != null && e.pointerId !== pointerId.current) return;
        apply(e.clientX, e.clientY);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
    >
      <div className="touch-joystick-base" aria-hidden>
        <div ref={knob} className="touch-joystick-knob" />
      </div>
      <small>Drag to walk · WASD on desktop</small>
    </div>
  );
}
