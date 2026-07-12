# AgentVerse — Implementation Guide

**Status:** GO — implementing (2026-07-12); **Q1 PREPROD live** (`F:\apps\agentverse` :4310)  
**Stack:** Next.js 15 + R3F / Three.js  
**API:** agent-portal DEV `:8080` / PREPROD `:4080`  
**UI ports:** DEV 3310 · PREPROD 4310  
**Personas:** Rajveer, Aarav, Priya, Arjun, Meera (`src/prompts/personas.json`)

## Run

```powershell
# DEV
cd E:\MyWorkspace\agentverse-project
npm install
npm run dev

# PREPROD
cd F:\apps\agentverse
.\start.ps1 -EnvName preprod
```

See [OPS.md](./OPS.md) for env matrix and promote notes.

## Architecture

- `src/app` — App Router shell + PWA metadata
- `src/components/scene` — 3D hub lobby + low-poly avatars
- `src/components/hud` — quests, chat, CSS login, top bar
- `src/lib/api.ts` — portal client via `/api/portal` rewrites
- `src/lib/orchestrator.ts` — Rajveer routing → specialist prompts
- Migration reference: `E:\MyWorkspace\agent-portal`

## Persona bundle

`E:\machine-docs\personas` — crew standards; project crew under `agents/`.
