# Leftover train — AgentVerse upgrade 0.3.1

**Date:** 2026-07-15  
**Base branch:** `feature/upgradation-functionality` @ live side fleet 0.3.0  
**Fleet:** agentverse-upgrade only (`3312` / `4312` / `5312`) — never touch classic/v2  
**Status:** **GO** (user: proceed planning + parallel agents)

## Goal

Finish thin leftovers from the Stable Functional Upgrade Roadmap using parallel skilled lanes.

## Lanes (parallel)

| Lane | Owner hire | Owns (exclusive) | Deliverable |
|------|------------|------------------|-------------|
| **A Durable** | Muthu + Aravind | `src/lib/project-workspace.ts` (NEW), `store.ts` project fields, `ProjectSwitcher.tsx`, `docs/PROJECT-WORKSPACE.md` | Office project ↔ workspace path convention; persist `workspacePath` on `OfficeProject` |
| **B WebGL fallback** | Aravind + Kabilan | `HubScene.tsx`, NEW `src/components/hud/FlatRoster.tsx`, thin CSS in `globals.css` (webgl-/flat- classes only) | WebGL fail → 2D persona roster + open Session Desk/chat |
| **C Plan UX + PWA** | Aravind (chat) + Docs | `ChatPanel.tsx` permission/plan banner only, `public/sw.js`, `public/manifest` if present | Show `planMarkdown`; PWA open last `?session=` / desk URL |
| **D ProdDeck Dispatch** | ProdDeck work-plane | `sandbox/proddeck/src/os/modules/dispatch/**` only + short OPS note | Real Dispatch UI → `agentverse-upgrade[-staging]` deep-links per DEEP-LINK-CONTRACT |

## Non-goals

- Classic `:4310/:5310` or v2 densify  
- Portal Crew Fabric  
- Promote this turn (Integrate Lead prepares; user may Q1/Q2 later on upgrade fleet only)

## Exit

Each lane: typecheck-clean for its files. Integrate Lead merges, bumps **0.3.1**, updates HANDOFF/OPS, ACTIVITY-LOG.
