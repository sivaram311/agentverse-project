# AgentVerse - 3D Multi-Agent Office Workplace

Next.js + React Three Fiber **Tamil Nadu digital office** (Intellect Design Arena / Siruseri vibe) — agents sit at bench desks, walk over when summoned, and talk via the Agent Portal API.

**PREPROD:** **0.3.14** · https://agentverse-staging.delena.buzz · [docs/OPS.md](docs/OPS.md)  
**PROD:** **0.2.2** (unchanged until promote)

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

## What’s on the PREPROD floor (0.3.14)

- Dark Siruseri shell (PROD-matched walls/pillars/lights) + pantry
- Intellect-style **bench desks** (wood tops, black mesh chairs, monitors, phones)
- Crew seated + NPC workers + aisle walkers
- View menu: PROD floor angles (all sides) + body shots; **freestyle rotate/zoom** after snap; Walk = FP

## Features

- Tap agent → approach → greet → chat (chat does not auto-open on every select)
- Multi-project / Session Desk via portal sessions
- Open CORS for LAN / public-IP access (`:4310` bypass URL in OPS)

## Prerequisites

- Node.js 22+ (host has 24.x)
- Agent Portal backend on `http://127.0.0.1:8080` (DEV)
- CSS on `:9000` when `cssEnabled` (DEV login: `admin` / `admin123`)
- **PREPROD/PROD login:** CSS admin password from `G:\apps\css\.env` (`CSS_ADMIN_PASSWORD`) — not `admin123`

## Dev (port **3310** reserved)

```powershell
cd E:\MyWorkspace\agentverse-project
copy .env.example .env.local
npm run dev:stack   # preferred
# or: npm run dev
```

Open `http://127.0.0.1:3310`

PREPROD: https://agentverse-staging.delena.buzz (`F:\apps\agentverse` :4310)  
PROD: https://agentverse.delena.buzz (`G:\apps\agentverse` :5310)

## Docs

- `docs/OPS.md` — envs, version trail, handoff
- `docs/IMPLEMENTATION-GUIDE.md` — architecture + next notes
- `agents/roles/office-crew.md`
