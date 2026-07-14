# AgentVerse — Ops

| Env | Drive | Port | URL | Portal API | CSS |
|-----|-------|------|-----|------------|-----|
| DEV | E:\MyWorkspace\agentverse-project | 3310 | http://127.0.0.1:3310 | :8080 | :9000 |
| PREPROD | F:\apps\agentverse | 4310 | https://agentverse-staging.delena.buzz | :4080 | :5900 (`https://css.delena.buzz`) |
| PROD | G:\apps\agentverse | 5310 | https://agentverse.delena.buzz | :5080 | :5900 (`https://css.delena.buzz`) |

## Current PREPROD (ready for next iteration)

- **Live F:** **0.3.16** densify+deep-link · evidence `H:\releases\agentverse-0.3.16\evidence\q1\`
- **Packaged next:** **0.3.17** Desk upgradation · `H:\releases\agentverse-0.3.17\` (await EM Q1 GO — Lead cutover)
- **Smoke:** `https://agentverse-staging.delena.buzz/health` · bypass `http://103.118.183.185:4310/`
- **Office contents:** unchanged densify plaza (0.3.15–0.3.16); Desk HUD only in 0.3.17
- **PROD:** **0.3.16** — do not promote 0.3.17 without EM Q2 GO
- **Deep-link:** `/desk?...` — [DEEP-LINK-CONTRACT.md](./DEEP-LINK-CONTRACT.md). Bake `NEXT_PUBLIC_CSS_ISSUER=https://css.delena.buzz` on F/G builds.

## PREPROD runbook

- Start: `F:\apps\agentverse\start.ps1 -EnvName preprod`
- Auth: CSS clientId `agent-portal` (shared)
- DNS: Cloudflare A `agentverse-staging.delena.buzz` → `103.118.183.185` (proxied)
- **Login:** staging/prod CSS admin password (`G:\apps\css\.env` → `CSS_ADMIN_PASSWORD`). DEV `admin`/`admin123` → **401** on staging.
- Hotfix: build on E:/worktree → robocopy to `F:\apps\agentverse\app` (skip `node_modules` if junction) → restart :4310
- **Bake on build:** `NEXT_PUBLIC_CSS_ISSUER=https://css.delena.buzz` (PREPROD/PROD). DEV may use `http://localhost:9000`.
- **Do not** overwrite F with upgradation `0.3.0` / `feature/upgradation-functionality` — use densify+deep-link+desk packs only.

### Version trail (recent)

| Ver | What |
|-----|------|
| **0.3.17** | Desk search/status/cancel + quest↔session sync + permission poll (from upgradation `@f5249ed`) on densify chrome |
| **0.3.16** | ProdDeck deep-link on densify: `/desk`, dual brief decode, IncidentStrip, return allowlist (home / home-staging) |
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
