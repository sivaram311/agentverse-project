# AgentVerse — Ops

| Env | Drive | Port | URL | Portal API | CSS |
|-----|-------|------|-----|------------|-----|
| DEV | E:\MyWorkspace\agentverse-project | 3310 | http://127.0.0.1:3310 | :8080 | :9000 |
| PREPROD | F:\apps\agentverse | 4310 | https://agentverse-staging.delena.buzz | :4080 | :5900 (`https://css.delena.buzz`) |
| PROD | G:\apps\agentverse | 5310 | https://agentverse.delena.buzz | :5080 | :5900 (`https://css.delena.buzz`) |

## PREPROD

- Release: `H:\releases\agentverse-0.3.0\` (H: nearly full — prefer direct E→F sync for hotfixes)
- Start: `F:\apps\agentverse\start.ps1 -EnvName preprod`
- Evidence: `H:\releases\agentverse-0.3.0\evidence\q1\`
- Auth: CSS clientId `agent-portal` (shared)
- DNS: Cloudflare A `agentverse-staging.delena.buzz` → `103.118.183.185` (proxied)
- **Bypass CF:** `http://103.118.183.185:4310/`
- Public smoke: `https://agentverse-staging.delena.buzz/health` (0.3.1) — **Q1_PREPROD_OK_034**
- **0.3.1:** PROD-like orbit camera on login; brighter day lights + exposure; joystick hard-reset (window pointerup / lost capture)
- **0.3.0:** PROD-sized Siruseri + HexCollab; 2 team pods; 15-seat occupied meeting + TV; FP/Mathura/tap/CORS retained
- **Login:** staging/prod CSS admin password (`G:\apps\css\.env` → `CSS_ADMIN_PASSWORD`). DEV `admin`/`admin123` will return **401** on staging.
- **Camera:** default **overview** (PROD orbit); toggle FP / Orbit when you want walk.

## PROD

- Release: `H:\releases\agentverse-0.2.2\`
- Start: `G:\apps\agentverse\start.ps1 -EnvName prod`
- Evidence: `H:\releases\agentverse-0.2.2\evidence\q2\`
- DNS: Cloudflare A `agentverse.delena.buzz` → `103.118.183.185` (proxied)
- Public smoke: `https://agentverse.delena.buzz/health` (0.2.2) — **Q2_PROD_OK_022**
- **Login:** CSS admin password (`G:\apps\css\.env` → `CSS_ADMIN_PASSWORD`). DEV `admin`/`admin123` returns **401**.

## Health

`GET /health` — process up. Authenticated smoke uses `/api/css` + `/api/portal` proxies.
