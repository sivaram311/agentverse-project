# AgentVerse - 3D Multi-Device Agent Portal (Gaming Style)

Next.js + React Three Fiber hub that **migrates Agent Portal UX** onto a gamified 3D lobby, reusing the existing API at `:8080`.

## Personas

| Name | Role |
|------|------|
| Rajveer | Orchestrator |
| Aarav | Research |
| Priya | Creative |
| Arjun | Coder |
| Meera | Companion |
| Kabir | Device Lab QA (Chrome DevTools) |

Prompts & routing: `src/prompts/personas.json`  
Machine persona standards: `E:\machine-docs\personas`  
Crew / pre-work: `agents/`

## Prerequisites

- Node.js 22+ (host has 24.x)
- Agent Portal backend running on `http://127.0.0.1:8080`
- CSS on `:9000` when `cssEnabled` (login: `admin` / `admin123` in DEV)

## Dev (port **3310** reserved)

```powershell
cd E:\MyWorkspace\agentverse-project
copy .env.example .env.local
# Full stack (CSS + agent-portal API + UI) — preferred
npm run dev:stack

# Or UI only if :8080 / :9000 already running
npm run dev
```

Bundled backends (junctions): `services/agent-portal`, `services/centralized-security-system`.

Open `http://127.0.0.1:3310` (phone/tablet / public IP: `http://<host>:3310`).

PREPROD: https://agentverse-staging.delena.buzz (`F:\apps\agentverse` :4310).

CORS is open (`Access-Control-Allow-Origin: *`) on the UI and `/api/*` proxies for LAN/public-IP access. Portal/CSS use `APP_CORS_ORIGINS=*` / `CSS_CORS_ORIGINS=*`.

Realtime uses same-origin message polling (no SockJS → no CORS / unload console noise).

## Production build

```powershell
npm run build
npm run start
```

## Docs

- `docs/IMPLEMENTATION-GUIDE.md`
- `docs/OPS.md`
- Migration source: `https://github.com/sivaram311/agent-portal.git` → `E:\MyWorkspace\agent-portal`
