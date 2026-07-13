# AgentVerse — Ops

| Env | Drive | Port | URL | Portal API | CSS |
|-----|-------|------|-----|------------|-----|
| DEV | E:\MyWorkspace\agentverse-project | 3310 | http://127.0.0.1:3310 | :8080 | :9000 |
| PREPROD | F:\apps\agentverse | 4310 | https://agentverse-staging.delena.buzz | :4080 | :5900 (`https://css.delena.buzz`) |
| PROD | G:\apps\agentverse | 5310 | https://agentverse.delena.buzz | :5080 | :5900 (`https://css.delena.buzz`) |

## Current PREPROD (ready for next iteration)

- **Version:** **0.3.15** · git `main` · evidence `H:\releases\agentverse-0.3.15\evidence\q1\Q1_PREPROD_OK_048`
- **Smoke:** `https://agentverse-staging.delena.buzz/health` · bypass `http://103.118.183.185:4310/`
- **Office contents:** Micro entrance — interlocking paver plaza, glass sliding doors + canopy, Intellect totem, white planters, staked trees/palms, scooters, manhole/drain, CCTV/downlights; plus 7-floor life, canteen, security, prior campus
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
| **0.3.15** | Entrance micro: pavers, auto doors, canopy, planters, scooters, plaza props |
| **0.3.14** | 7-floor workers; canteen eat/drink; gate + roaming security uniforms |
| **0.3.13** | Photo-matched Intellect facade+logo; double-height lobby; glass corridors; plaza/boom/EV polish |
| **0.3.12** | Exterior: Nxt Level tower shell, SIPCOT compound gate, lake, OMR, TCS landmark silhouettes |
| **0.3.11** | Atrium lobby, turnstiles, cafeteria, focus pods, SIPCOT parking exterior |
| **0.3.10** | Nxt Level infra: elevators, reception, glass huddles, boardroom, glass cube, breakout + benches |
| 0.3.9 | PROD-matched dark walls/pillars + day lights/fog/exposure; benches + freestyle kept |
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
