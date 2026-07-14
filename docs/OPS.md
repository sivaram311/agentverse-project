# AgentVerse — Ops

**Branch (DEV):** `feature/upgradation-functionality` · **Version:** **0.3.0** (upgradation train on `v0.2.2-stable`)

| Env | Drive | Port | URL | Portal API | CSS |
|-----|-------|------|-----|------------|-----|
| DEV | E:\MyWorkspace\agentverse-project | 3310 | http://127.0.0.1:3310 | :8080 | :9000 |
| PREPROD | F:\apps\agentverse | 4310 | https://agentverse-staging.delena.buzz | :4080 | :5900 (`https://css.delena.buzz`) |
| PROD | G:\apps\agentverse | 5310 | https://agentverse.delena.buzz | :5080 | :5900 (`https://css.delena.buzz`) |

## PREPROD

- Live classic currently: `H:\releases\agentverse-0.2.1\` until Q1 of 0.3.0
- Target release: `H:\releases\agentverse-0.3.0\` (await user GO)
- Start: `F:\apps\agentverse\start.ps1 -EnvName preprod`
- Auth: CSS clientId `agent-portal` (shared)
- DNS: Cloudflare A `agentverse-staging.delena.buzz` → `103.118.183.185` (proxied)
- **Login:** staging/prod CSS admin password (`G:\apps\css\.env` → `CSS_ADMIN_PASSWORD`). DEV `admin`/`admin123` will return **401** on staging.
- Bake on build: `NEXT_PUBLIC_CSS_ISSUER=https://css.delena.buzz`

## PROD

- Live classic currently: `H:\releases\agentverse-0.2.1\` until Q2 of 0.3.0
- Target: `H:\releases\agentverse-0.3.0\`
- Start: `G:\apps\agentverse\start.ps1 -EnvName prod`
- DNS: Cloudflare A `agentverse.delena.buzz` → `103.118.183.185` (proxied)

## Health

`GET /health` — process up. TopBar shows Portal + CSS reachability + env badge (DEV/PREPROD/PROD).

## Sessions (Session Desk)

- Active / Archived + **status filters** + **search**
- **Cancel run** on busy sessions
- Title set at create (portal has no rename API)
- Deep-link: `/desk?...` — see [DEEP-LINK-CONTRACT.md](./DEEP-LINK-CONTRACT.md)
- Promote gate: [PROMOTE-UPGRADATION.md](./PROMOTE-UPGRADATION.md)

Config:
- `NEXT_PUBLIC_DEFAULT_WORKSPACE` — default path/name (e.g. `demo`)
- `NEXT_PUBLIC_WORKSPACE_ALLOWLIST` — optional comma-separated paths
- `NEXT_PUBLIC_AV_ENV` — optional `DEV`|`PREPROD`|`PROD` override for badge
- `NEXT_PUBLIC_PORTAL_UI_URL` — optional “Open Portal” link base

## DEV env discipline (do not mix)

| Piece | DEV (E:) | PREPROD/PROD |
|-------|----------|--------------|
| CSS | `:9000`, issuer `http://localhost:9000` | `:5900` / `https://css.delena.buzz` |
| Portal | `:8080` | `:4080` / `:5080` |
| AgentVerse `.env.local` | `CSS_AUTH_URL=http://127.0.0.1:9000`, `NEXT_PUBLIC_CSS_ISSUER=http://localhost:9000` | set by `start.ps1` |

Never load a mixed `.env` that sets CSS issuer to production into DEV portal.

## Cloudflare (Ops)

```powershell
cd E:\MyWorkspace\agent-portal
.\scripts\cloudflare-dns.ps1 -Upsert -Name agentverse-staging -Type A -Content 103.118.183.185 -Proxied
.\scripts\cloudflare-dns.ps1 -Upsert -Name agentverse -Type A -Content 103.118.183.185 -Proxied
```
