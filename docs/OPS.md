# AgentVerse — Ops

| Env | Drive | Port | URL | Portal API | CSS |
|-----|-------|------|-----|------------|-----|
| DEV | E:\MyWorkspace\agentverse-project | 3310 | http://127.0.0.1:3310 | :8080 | :9000 |
| PREPROD | F:\apps\agentverse | 4310 | https://agentverse-staging.delena.buzz | :4080 | :5900 (`https://css.delena.buzz`) |
| PROD | G:\apps\agentverse | 5310 | https://agentverse.delena.buzz | :5080 | :5900 (`https://css.delena.buzz`) |

## PREPROD

- Release: `H:\releases\agentverse-0.2.0\`
- Start: `F:\apps\agentverse\start.ps1 -EnvName preprod`
- Evidence: `H:\releases\agentverse-0.2.0\evidence\q1\`
- Auth: CSS clientId `agent-portal` (shared)
- DNS: Cloudflare A `agentverse-staging.delena.buzz` → `103.118.183.185` (proxied)
- Public smoke: `https://agentverse-staging.delena.buzz/health`

## PROD

- Release: `H:\releases\agentverse-0.2.0\`
- Start: `G:\apps\agentverse\start.ps1 -EnvName prod`
- Evidence: `H:\releases\agentverse-0.2.0\evidence\q2\`
- DNS: Cloudflare A `agentverse.delena.buzz` → `103.118.183.185` (proxied)
- Public smoke: `https://agentverse.delena.buzz/health`

## Health

`GET /health` — process up. Authenticated smoke uses `/api/css` + `/api/portal` proxies.

## Cloudflare (Ops)

```powershell
cd E:\MyWorkspace\agent-portal
.\scripts\cloudflare-dns.ps1 -Upsert -Name agentverse-staging -Type A -Content 103.118.183.185 -Proxied
.\scripts\cloudflare-dns.ps1 -Upsert -Name agentverse -Type A -Content 103.118.183.185 -Proxied
```

Token: Account API token in `.env` / `E:\MyAgent\workflow\secrets\cloudflare.token` (gitignored). See `.cursor/rules/promote-dns-cloudflare.mdc`.
