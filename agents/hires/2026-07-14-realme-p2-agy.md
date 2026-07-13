# Hire — Realme P2 Pro mobile perf + joystick (AGY consult)

**Session:** `agentverse-realme-p2-agy-2026-07-14`  
**Date:** 2026-07-14  
**Provider:** antigravity (`agy`)  
**From:** Cursor lead (handoff after 0.2.10 always-full HQ)

## Symptom (user device)

- Device: **Realme P2 Pro**
- URL: staging AgentVerse `https://agentverse-staging.delena.buzz` (live **0.2.10**)
- Feels **slow** after always-full office (no team cull / proxy; full LOD everywhere)
- **Joystick stuck**

## Ask for AGY

Recommend-only (no code changes unless Cursor lead says GO later):

1. Likely causes of slowdown on mid Android phones after 0.2.10
2. Likely causes of touch joystick stuck / stuck input
3. Ranked recommendations (keep HQ visually full like PROD where possible)
4. What to try first with least visual compromise

## Code soaps (read)

- `src/lib/perf-profile.ts`
- `src/components/scene/HubScene.tsx`
- `src/components/hud/TouchJoystick.tsx`
- `src/components/scene/FirstPersonControls.tsx`
- `src/components/scene/PlayerAvatar.tsx`
- `src/lib/store.ts` (`playerMoveInput`)

## Out of scope for this consult

Implementing fixes, PREPROD deploy, PROD promote.
