# AgentVerse — Ops

| Env | Drive | Port | URL | Portal API | CSS |
|-----|-------|------|-----|------------|-----|
| DEV | E:\MyWorkspace\agentverse-project | 3310 | http://127.0.0.1:3310 | :8080 | :9000 |
| PREPROD | F:\apps\agentverse | 4310 | https://agentverse-staging.delena.buzz | :4080 | :5900 (`https://css.delena.buzz`) |
| PROD | G:\apps\agentverse | 5310 | https://agentverse.delena.buzz | :5080 | :5900 (`https://css.delena.buzz`) |

## Current PREPROD (ready for next iteration)

- **Version:** **0.3.9** · git `main` · evidence `H:\releases\agentverse-0.3.9\evidence\q1\Q1_PREPROD_OK_042`
- **Smoke:** `https://agentverse-staging.delena.buzz/health` · bypass `http://103.118.183.185:4310/`
- **Office contents:** Siruseri shell (dark walls/pillars, glass, dark polished floor, dark LED ceiling, pantry) + **Intellect-style bench desks** (wood tops, mesh chairs, monitors/phones) + **crew seated** + NPC bench workers + aisle walkers
- **Not in scene:** hex collab table, Team Alpha/Beta pods, Expanded HQ meeting/glass cube/elevators (code still exists under `src/components/scene/` for future reuse)
- **Camera:** view menu snaps to Front/Back/E/W + corners (PROD floor angles) or body shots, then **freestyle rotate / zoom / pan**; **Walk** = first-person
- **Layout SoT:** `src/lib/intellect-benches.ts` (seats) · `src/lib/office-layout.ts` (HQ bounds) · `src/lib/camera-framing.ts` (shots)
- **PROD:** still **0.2.2** — do not promote without EM Q2 GO

## PREPROD runbook

- Start: `F:\apps\agentverse\start.ps1 -EnvName preprod`
- Auth: CSS clientId `agent-portal` (shared)
- DNS: Cloudflare A `agentverse-staging.delena.buzz` → `103.118.183.185` (proxied)
- **Login:** staging/prod CSS admin password (`G:\apps\css\.env` → `CSS_ADMIN_PASSWORD`). DEV `admin`/`admin123` → **401** on staging.
- Hotfix: build on E: → robocopy to `F:\apps\agentverse\app` (skip `node_modules` if junction) → restart :4310

### Version trail (recent)

| Ver | What |
|-----|------|
| **0.3.9** | PROD-matched dark walls/pillars + day lights/fog/exposure; benches + freestyle kept |
| 0.3.8 | Freestyle orbit after view snap; Intellect benches + seated crew/NPCs |
| 0.3.7 | PROD-style floor angles all 8 sides; default Front |
| 0.3.6 | Dark polished floor restored (not bright epoxy) |
| 0.3.5 | Empty shell experiment (walls + pantry + crew) |
| 0.3.4 | More camera views; labels/transcript ~20× smaller |
| 0.3.2 | PROD infra + 2 team pods (furniture superseded) |

## PROD

- Release: `H:\releases\agentverse-0.2.2\`
- Start: `G:\apps\agentverse\start.ps1 -EnvName prod`
- Evidence: `H:\releases\agentverse-0.2.2\evidence\q2\`
- Public smoke: `https://agentverse.delena.buzz/health` (0.2.2) — **Q2_PROD_OK_022**
- **Login:** CSS admin password (`G:\apps\css\.env` → `CSS_ADMIN_PASSWORD`)

## Health

`GET /health` — process up. Authenticated smoke uses `/api/css` + `/api/portal` proxies.
