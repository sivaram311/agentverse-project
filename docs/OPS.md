# AgentVerse — Ops

| Env | Drive | Port | URL | Portal API | CSS |
|-----|-------|------|-----|------------|-----|
| DEV | E:\MyWorkspace\agentverse-project | 3310 | http://127.0.0.1:3310 | :8080 | :9000 |
| PREPROD | F:\apps\agentverse | 4310 | https://agentverse-staging.delena.buzz | :4080 | :5900 (`https://css.delena.buzz`) |
| PROD | G:\apps\agentverse | 5310 | https://agentverse.delena.buzz | :5080 | :5900 (`https://css.delena.buzz`) |

## PREPROD

- Release: `H:\releases\agentverse-0.2.10\` (H: nearly full — prefer direct E→F sync for hotfixes)
- Start: `F:\apps\agentverse\start.ps1 -EnvName preprod`
- Evidence: `H:\releases\agentverse-0.2.10\evidence\q1\`
- Auth: CSS clientId `agent-portal` (shared)
- DNS: Cloudflare A `agentverse-staging.delena.buzz` → `103.118.183.185` (proxied)
- Public smoke: `https://agentverse-staging.delena.buzz/health` (0.2.10) — **Q1_PREPROD_OK_030**
- **0.2.10:** always-full Expanded HQ like PROD — no team cull / proxy / distance streaming; load progress bar until scene ready; HQ + FP retained; 0.2.9 brightness/labels/tap-only retained
- **Login:** staging/prod CSS admin password (`G:\apps\css\.env` → `CSS_ADMIN_PASSWORD`). DEV `admin`/`admin123` will return **401** on staging.
- **Camera:** after login → first-person walk+look; toggle **FP / Orbit** (or Walk / Overview) for HQ orbit.

## PROD

- Release: `H:\releases\agentverse-0.2.2\`
- Start: `G:\apps\agentverse\start.ps1 -EnvName prod`
- Evidence: `H:\releases\agentverse-0.2.2\evidence\q2\`
- DNS: Cloudflare A `agentverse.delena.buzz` → `103.118.183.185` (proxied)
- Public smoke: `https://agentverse.delena.buzz/health` (0.2.2) — **Q2_PROD_OK_022**
- **Login:** CSS admin password (`G:\apps\css\.env` → `CSS_ADMIN_PASSWORD`). DEV `admin`/`admin123` returns **401**.

## Health

`GET /health` — process up. Authenticated smoke uses `/api/css` + `/api/portal` proxies.

## Sessions (Session Desk)

In-app **Sessions** (command strip / top chrome) lists portal sessions:
- **Active / Archived** filters
- **New** — create session on a workspace path
- **Open** — load into tabs + chat
- **Archive / Restore** — `POST /api/portal/sessions/{id}/archive|unarchive`

Config:
- `NEXT_PUBLIC_DEFAULT_WORKSPACE` — default path/name (e.g. `demo`)
- `NEXT_PUBLIC_WORKSPACE_ALLOWLIST` — optional comma-separated paths for quick-picks; empty = unrestricted (portal root still applies)

## DEV env discipline (do not mix)

| Piece | DEV (E:) | PREPROD/PROD |
|-------|----------|--------------|
| CSS | `:9000`, issuer `http://localhost:9000` | `:5900` / `https://css.delena.buzz` |
| Portal | `:8080` | `:4080` / `:5080` |
| AgentVerse `.env.local` | `CSS_AUTH_URL=http://127.0.0.1:9000`, `NEXT_PUBLIC_CSS_ISSUER=http://localhost:9000` | set by `start.ps1` |
| Portal start | `CSS_AUTH_URL` / `CSS_ISSUER` / `CSS_JWKS_URI` all localhost:9000; `CURSOR_AGENT_CMD` absolute; `AGENT_WORKSPACE_ROOT` under E: | F:/G: scripts |

Never load a mixed `.env` that sets `CSS_AUTH_URL=https://delena.buzz` (or css.delena.buzz) into DEV portal — AgentVerse will reject tokens as incompatible JWT (`iss` vs `authUrl`).

## Cloudflare (Ops)

```powershell
cd E:\MyWorkspace\agent-portal
.\scripts\cloudflare-dns.ps1 -Upsert -Name agentverse-staging -Type A -Content 103.118.183.185 -Proxied
.\scripts\cloudflare-dns.ps1 -Upsert -Name agentverse -Type A -Content 103.118.183.185 -Proxied
```

Token: Account API token in `.env` / `E:\MyAgent\workflow\secrets\cloudflare.token` (gitignored). See `.cursor/rules/promote-dns-cloudflare.mdc`.
