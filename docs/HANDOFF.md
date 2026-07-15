# HANDOFF — Upgradation side fleet

**When:** 2026-07-15  
**Branch:** `feature/upgradation-functionality` · **Version:** **`0.3.5` candidate** (DEV) · F/G still **`0.3.4` LIVE** until EM GO  
**Side ports:** **3312 / 4312 / 5312**  
**Hosts:** https://agentverse-upgrade-staging.delena.buzz · https://agentverse-upgrade.delena.buzz

## Live

| Env | Version | Evidence |
|-----|---------|----------|
| F PREPROD `:4312` | **0.3.4** | `H:\releases\agentverse-upgrade-0.3.4\` |
| G PROD `:5312` | **0.3.4** | same |

Classic / v2 not overwritten.

## Shipped

- **0.3.3** — Priya + runtime packs + session flip  
- **0.3.4** — Full pack matrix + Session Desk **App sessions** ensure ([APP-SESSIONS.md](./APP-SESSIONS.md))  
- **0.3.5 candidate** — `stageVisible` cast swap + W4 Adopt/Switch/Hire (`ContextDecisionOffer`)

## Operator: create Portal sessions

1. Login on prod (or staging)  
2. Open **Session Desk** once → work-plane sessions auto-created  
3. Optional: **Seed labeled too** for Classic / V2 / Library  

**If create fails** with `workspacePath is not allowed; must stay under …`: Portal allowlist on `G:\apps\agent-portal\.env` (and F) must include `E:\MyWorkspace,E:\Source,E:\wt,F:\apps,G:\apps` — already flexed 2026-07-15; restart `:5080`/`:4080` if changing. See [APP-SESSIONS.md](./APP-SESSIONS.md).

**If chat hits 429 Rate limit exceeded:** 2026-07-15 hotfix is live (Portal XFF/user buckets + 180/min; AV slower polls + ensure debounce). Hard-refresh the client; reopen Desk at most once per hour for auto-ensure. See [OPS.md](./OPS.md) § Rate limit.

**Context drift:** Command strip / chat **Context** → Adopt (talk target) · Switch (pack) · Hire (SOP log only). One decision per turn.
