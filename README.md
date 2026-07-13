# AgentVerse - 3D Multi-Agent Office Workplace

Next.js + React Three Fiber **Tamil Nadu digital office** — agents sit at desks, walk over when summoned, and talk via the Agent Portal API at `:8080`.

## Office crew

| Name | Role |
|------|------|
| Rajesh | Orchestrator (Office Lead) |
| Karthik | Research |
| Lavanya | Creative |
| Aravind | Coder |
| Mathura | Companion |
| Muthu | Project Manager |
| Kabilan | Device Lab QA (Chrome DevTools) |

Greetings default to **Tamil** (`ta-IN`); switch Hindi / English in the top bar.  
Prompts & routing: `src/prompts/personas.json`  
Crew / pre-work: `agents/`

## Features

- Expanded Mandala HQ floor (X±18) — central conference, 10 team pods, glass cube, side rooms, elevators
- Mandala office floor, holographic desks, work-loop animations
- Click agent → stand → walk → greet → chat → return to desk
- Multi-project desk clusters (ask Rajesh: `new project: …`)
- Per-directory portal sessions (workspace picker + session tabs)
- **Session Desk** — list / create / archive / restore portal sessions (Active & Archived)

## Prerequisites

- Node.js 22+ (host has 24.x)
- Agent Portal backend running on `http://127.0.0.1:8080`
- CSS on `:9000` when `cssEnabled` (DEV login: `admin` / `admin123`)
- **PREPROD/PROD login:** CSS admin password from `G:\apps\css\.env` (`CSS_ADMIN_PASSWORD`) — not `admin123` (staging returns 401)

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
PROD: https://agentverse.delena.buzz (`G:\apps\agentverse` :5310).

CORS is open (`Access-Control-Allow-Origin: *`) on the UI and `/api/*` proxies for LAN/public-IP access. Portal/CSS use `APP_CORS_ORIGINS=*` / `CSS_CORS_ORIGINS=*`.

Realtime uses same-origin message polling (no SockJS → no CORS / unload console noise).

## Production build / release

```powershell
npm run build
# Pack to H:\releases\agentverse-<ver>\ then start via start.ps1 -EnvName preprod|prod
# Promote playbook: .cursor/skills/agentverse-promote + docs/OPS.md
```

## Docs

- `docs/IMPLEMENTATION-GUIDE.md`
- `docs/OPS.md`
- `agents/roles/office-crew.md`
- Migration source: `https://github.com/sivaram311/agent-portal.git` → `E:\MyWorkspace\agent-portal`
