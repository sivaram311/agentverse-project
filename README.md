# AgentVerse - 3D Multi-Agent Office Workplace

Next.js + React Three Fiber **Tamil Nadu digital office** — agents sit at desks, walk over when summoned, and talk via the Agent Portal API.

**Current branch:** `feature/stable-v2` · **0.4.2** (ships as **agentverse-v2** alongside classic AgentVerse). Ops detail: [`docs/OPS.md`](docs/OPS.md).

## Office crew

| Name | Role |
|------|------|
| Rajesh | Orchestrator (Office Lead) |
| Karthik | Research |
| Lavanya | Creative |
| Aravind | Coder |
| Meenakshi | Companion |
| Muthu | Project Manager |
| Kabilan | Device Lab QA (Chrome DevTools) |

Greetings default to **Tamil** (`ta-IN`); switch Hindi / English in the top bar.  
Prompts & routing: `src/prompts/personas.json`  
Crew / pre-work: `agents/`

## Features

- Mandala office floor, holographic desks, work-loop animations
- **Bright industrial office** (0.4.2) — white/blue industrial floor, exposed ceiling, teal desks, black chairs, perimeter storage (`OfficeStorage`)
- Click agent → stand → walk → greet → return to desk (chat opens only via Talk / command strip / CommsDock / `openChat`)
- Multi-project desk clusters (ask Rajesh: `new project: …`)
- Per-directory portal sessions (workspace picker + session tabs)
- **Session Desk** — list / create / archive / restore portal sessions (Active & Archived)
- **Camera angles + chrome toggles** (0.4.0) — OrbitShot / first-person Views bar; TopBar **Joystick** / **Views** show-hide; bright day office

## Parallel fleets (ports / URLs)

Two fleets share CSS (`agent-portal` clientId) and portal APIs but use **different ports and app paths**. Do not recycle classic ports when deploying v2.

| Fleet | DEV | PREPROD | PROD |
|-------|-----|---------|------|
| **Classic** (do not disturb) | **3310** | **4310** · https://agentverse-staging.delena.buzz · `F:\apps\agentverse` · `v0.3.15-unstable` | **5310** · https://agentverse.delena.buzz · `G:\apps\agentverse` · `v0.2.2-stable` |
| **stable-v2** (this branch, 0.4.2) | **3311** | **4311** · https://agentverse-v2-staging.delena.buzz · `F:\apps\agentverse-v2` | **5311** · https://agentverse-v2.delena.buzz · `G:\apps\agentverse-v2` |

Bypass (v2): http://103.118.183.185:4311 · http://103.118.183.185:5311  
Staging/prod portal `:4080`/`:5080`, CSS `:5900`. Full tables + DNS: [`docs/OPS.md`](docs/OPS.md).

## Prerequisites

- Node.js 22+ (host has 24.x)
- Agent Portal backend running on `http://127.0.0.1:8080` (DEV) or `:4080`/`:5080` (staging/prod)
- CSS on `:9000` when `cssEnabled` (DEV login: `admin` / `admin123`)
- **PREPROD/PROD login:** CSS admin password from `G:\apps\css\.env` (`CSS_ADMIN_PASSWORD`) — not `admin123` (staging returns 401)

## Dev (stable-v2 port **3311**)

```powershell
cd E:\MyWorkspace\agentverse-project
copy .env.example .env.local
# Full stack (CSS + agent-portal API + UI) — preferred
npm run dev:stack

# Or UI only if :8080 / :9000 already running
npm run dev
```

Bundled backends (junctions): `services/agent-portal`, `services/centralized-security-system`.

Open `http://127.0.0.1:3311` (phone/tablet / public IP: `http://<host>:3311`).

PREPROD (v2): https://agentverse-v2-staging.delena.buzz (`F:\apps\agentverse-v2` :4311).  
PROD (v2): https://agentverse-v2.delena.buzz (`G:\apps\agentverse-v2` :5311).

CORS is open (`Access-Control-Allow-Origin: *`) on the UI and `/api/*` proxies for LAN/public-IP access. Portal/CSS use `APP_CORS_ORIGINS=*` / `CSS_CORS_ORIGINS=*`.

Realtime uses same-origin message polling (no SockJS → no CORS / unload console noise).

## Production build / release

```powershell
npm run build
# Pack to H:\releases\ then deploy to F:\apps\agentverse-v2 or G:\apps\agentverse-v2
# Start: .\start.ps1 -EnvName preprod|prod  (ports 4311 / 5311 from scripts/start-release.ps1)
# Never recycle classic :4310 / :5310
# Promote playbook: .cursor/skills/agentverse-promote + docs/OPS.md
```

## Docs

- `docs/OPS.md` — both fleets, DNS, camera, Session Desk
- `docs/HANDOFF.md` — continue-from for next session
- `docs/IMPLEMENTATION-GUIDE.md`
- `agents/roles/office-crew.md`
- Migration source: `https://github.com/sivaram311/agent-portal.git` → `E:\MyWorkspace\agent-portal`
