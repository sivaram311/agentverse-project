# AgentVerse — Ops (upgradation side fleet)

**Branch:** `feature/upgradation-functionality` · **Version:** **0.3.0** · Base `v0.2.2-stable`

**This fleet must NOT recycle classic or v2 ports.**

| Env | Drive | Port | Path | Host |
|-----|-------|------|------|------|
| DEV | E:\MyWorkspace\agentverse-project | **3312** | repo | http://127.0.0.1:3312 |
| PREPROD | F:\apps\agentverse-upgrade | **4312** | side | https://agentverse-upgrade-staging.delena.buzz |
| PROD | G:\apps\agentverse-upgrade | **5312** | side | https://agentverse-upgrade.delena.buzz |

## Untouched fleets

| Fleet | Ports | Hosts |
|-------|-------|-------|
| Classic | 3310 / 4310 / 5310 | agentverse[-staging].delena.buzz |
| stable-v2 | 3311 / 4311 / 5311 | agentverse-v2[-staging].delena.buzz |

## Auth / API

- CSS: `:5900` / `https://css.delena.buzz` — bake `NEXT_PUBLIC_CSS_ISSUER=https://css.delena.buzz`
- Portal PREPROD `:4080` · PROD `:5080`
- clientId: `agent-portal` (shared)

## Start

```powershell
cd F:\apps\agentverse-upgrade
.\start.ps1 -EnvName preprod

cd G:\apps\agentverse-upgrade
.\start.ps1 -EnvName prod
```

## Deep-links

See [DEEP-LINK-CONTRACT.md](./DEEP-LINK-CONTRACT.md). Prefer upgrade hosts for Dispatch return URLs when targeting this fleet.

## Promote

[PROMOTE-UPGRADATION.md](./PROMOTE-UPGRADATION.md) · Evidence `H:\releases\agentverse-upgrade-0.3.0\`
