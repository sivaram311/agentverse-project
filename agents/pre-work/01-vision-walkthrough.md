# 01 - Vision Walkthrough

**Project:** AgentVerse  
**Date:** 2026-07-12  
**Crew Lead:** Cursor CLI  
**Sources:** User requirements markdown; agent-portal migration; `E:\machine-docs\personas`

## End-to-End Overview

AgentVerse is the **Next.js + R3F/Three.js** successor shell that **migrates Agent Portal capabilities** (`https://github.com/sivaram311/agent-portal.git` — local SoT `E:\MyWorkspace\agent-portal`, mirror `agent-portal-ref`) into a **3D gaming hub**: lobby, quests/missions, animated Indian personas, PWA on Realme P2 Pro / Pad 2 / desktop.

**Orchestrator:** Rajveer routes tasks to Aarav (Research), Priya (Creative), Arjun (Coder), Meera (Companion) using `personas.json` prompts (aligned with `E:\machine-docs\personas` + app prompts).

Machine gates remain: CSS auth, port registry, schema-per-env, promote evidence.

## User Journeys / Flows

1. **Enter the verse** — `npm run dev` / PWA → CSS login → 3D hub lobby.
2. **Meet personas** — Rajveer / Aarav / Priya / Arjun / Meera (low-poly + LOD); tap/click → chat / mission assign.
3. **Quest / orchestrated task** — User goal → Rajveer routes to sub-agent(s) via prompts → progress as missions in HUD + avatar animation.
4. **Migrated portal flows** — Sessions, streaming, sub-agents, permissions, history/changes — gamified in 3D (API reuse vs reimplement TBD).
5. **Multi-device** — Touch orbit on phone/tablet; mouse on desktop; low-poly + LOD.
6. **Edge cases:** WebGL fail → 2D roster; auth fail; offline PWA shell.

## Success Metrics

- `npm install && npm run dev` boots the 3D lobby.
- Five named personas interactive; Rajveer routes to others.
- Usable on Realme P2 Pro, Pad 2, desktop (PWA).
- Core agent-portal capabilities reachable or clearly phased with migration map.
- Production-ready: SemVer, health, CSS, reserved port, structured logs, Playwright smoke.

## Non-Functional Requirements

- **Stack:** Next.js + React Three Fiber / Three.js (locked).
- **Auth:** CSS (`:9000` DEV) — CONSCIOUS #8.
- **Ports:** Reserve before bind (`E:\MyAgent\workflow\ports\REGISTRY.md`).
- **DB:** Prefer reuse/adapt agent-portal persistence where practical.
- **Perf:** Low-poly models, LOD, touch/mouse controls.
- **Mobile QA:** Realme frames + `web-playwright-checklist.md`.
- **Drive:** DEV on E: only.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Large agent-portal surface | Phased migration map in `02-architecture.md` |
| Empty `public/models/` | Procedural/low-poly placeholders first |
| Angular → Next rewrite | New UI; reuse Spring API where possible |
| 3D perf on phone | LOD, reduced draw calls, fallback 2D |

## Open questions (narrow — for GO)

1. **API strategy:** Call existing agent-portal backend `:8080` from Next.js, or reimplement API inside Next in phases?
2. Explicit **GO** to scaffold after you confirm #1 (or accept default: **proxy/reuse `:8080` first**).

**Mental Walkthrough:** Phone PWA → CSS → 3D lobby → talk to Rajveer → mission card → Arjun animates while coding stream fills HUD (portal session semantics under the hood).
