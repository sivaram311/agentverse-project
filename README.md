# AgentVerse - 3D Multi-Agent Office Workplace

Next.js + React Three Fiber **Tamil Nadu digital office** — agents sit at desks, walk over when summoned, and talk via the Agent Portal API at `:8080`.

**DEV train:** `feature/upgradation-functionality` · **0.3.0** (from `v0.2.2-stable`). Classic PREPROD/PROD stay on prior ship until Q1/Q2.

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
- Click agent → stand → walk → greet → chat → return to desk
- Multi-project desk clusters (ask Rajesh: `new project: …`)
- Per-directory portal sessions (workspace picker + session tabs)
- **Session Desk** — search / filter / create / archive / restore / **cancel run**
- **Deep-links** — `/desk?intent=&crew=&brief=&return=` ([docs/DEEP-LINK-CONTRACT.md](docs/DEEP-LINK-CONTRACT.md))
- Quests bound to portal session status; incident brief strip on hire

## Prerequisites

- Node.js 22+ (host has 24.x)
- Agent Portal backend running on `http://127.0.0.1:8080`
- CSS on `:9000` when `cssEnabled` (DEV login: `admin` / `admin123`)
- **PREPROD/PROD login:** CSS admin password from `G:\apps\css\.env` (`CSS_ADMIN_PASSWORD`) — not `admin123` (staging returns 401)

## Dev (port **3310** reserved)

```powershell
cd E:\MyWorkspace\agentverse-project
copy .env.example .env.local
npm run dev:stack
# Or UI only: npm run dev
```

Open `http://127.0.0.1:3310`.

PREPROD: https://agentverse-staging.delena.buzz (`F:\apps\agentverse` :4310).  
PROD: https://agentverse.delena.buzz (`G:\apps\agentverse` :5310).

## Docs

- `docs/IMPLEMENTATION-GUIDE.md`
- `docs/OPS.md`
- `docs/ROADMAP-UPGRADE.md` — post–0.3.1 backlog + how to confirm upgrade fleet
- `docs/DEEP-LINK-CONTRACT.md`
- `docs/PROMOTE-UPGRADATION.md`
- `docs/HANDOFF.md`
- `agents/roles/office-crew.md`
