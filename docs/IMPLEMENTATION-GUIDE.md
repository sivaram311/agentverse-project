# AgentVerse — Implementation Guide

**Status:** GO — implementing (2026-07-12)  
**Stack:** Next.js 15 + R3F / Three.js  
**API:** Existing agent-portal `:8080`  
**UI port:** 3310  
**Personas:** Rajveer, Aarav, Priya, Arjun, Meera (`src/prompts/personas.json`)

## Run

```powershell
cd E:\MyWorkspace\agentverse-project
npm install
npm run dev
```

## Architecture

- `src/app` — App Router shell + PWA metadata
- `src/components/scene` — 3D hub lobby + low-poly avatars
- `src/components/hud` — quests, chat, CSS login, top bar
- `src/lib/api.ts` — portal client via `/api/portal` rewrites
- `src/lib/orchestrator.ts` — Rajveer routing → specialist prompts
- Migration reference: `E:\MyWorkspace\agent-portal`

## Persona bundle

`E:\machine-docs\personas` — crew standards; project crew under `agents/`.
