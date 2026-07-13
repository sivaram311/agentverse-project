# Hire — First-person walk mode

**Session:** `agentverse-first-person-walk-2026-07-13`  
**Date:** 2026-07-13  
**Scope:** Docs contract for auth → eye-level look+walk; Overview toggle (no scene/store edits in this hire)

## Behavior

| When | Mode | Meaning |
|------|------|---------|
| Login / authenticated | `cameraMode: firstPerson` | Eye-level look + WASD/joystick walk on the floor |
| Logged out / default | `cameraMode: overview` | Orbit HQ framing |
| User toggle | `toggleCameraMode` | Switch firstPerson ↔ overview (HUD Overview / Orbit control) |

## Store contract (already present)

- `cameraMode: "firstPerson" | "overview"`
- `setAuthenticated(true)` → `firstPerson`; logout → `overview`
- `setCameraMode` / `toggleCameraMode`

## Docs updated this hire

- `docs/IMPLEMENTATION-GUIDE.md` — Office behavior bullet
- `.cursor/skills/agentverse-office/SKILL.md` — behavior contract line

## Out of scope

Scene `.tsx` / store code changes (docs-only hire unless empty hire requires code).
