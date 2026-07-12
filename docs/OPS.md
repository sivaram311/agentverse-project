# AgentVerse — Ops

| Env | Drive | Port | URL | Portal API | CSS |
|-----|-------|------|-----|------------|-----|
| DEV | E:\MyWorkspace\agentverse-project | 3310 | http://127.0.0.1:3310 | :8080 | :9000 |
| PREPROD | F:\apps\agentverse | 4310 | https://agentverse-staging.delena.buzz | :4080 | :5900 (`https://css.delena.buzz`) |
| PROD | — | — | not promoted | — | — |

## PREPROD

- Release: `H:\releases\agentverse-0.1.0\`
- Start: `F:\apps\agentverse\start.ps1 -EnvName preprod`
- Evidence: `H:\releases\agentverse-0.1.0\evidence\q1\`
- Auth: CSS clientId `agent-portal` (shared)
- DNS: Cloudflare A `agentverse-staging.delena.buzz` → `103.118.183.185` (proxied) — **live**
- Public smoke: `https://agentverse-staging.delena.buzz/health`

## Health

`GET /health` — process up. Authenticated smoke uses `/api/css` + `/api/portal` proxies.

## Cloudflare (Ops)

```powershell
cd E:\MyWorkspace\agent-portal
.\scripts\cloudflare-dns.ps1 -Upsert -Name agentverse-staging -Type A -Content 103.118.183.185 -Proxied
```

Token: Account API token in `.env` / `E:\MyAgent\workflow\secrets\cloudflare.token` (gitignored). See `.cursor/rules/promote-dns-cloudflare.mdc`.
