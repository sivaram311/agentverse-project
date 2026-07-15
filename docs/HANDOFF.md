# HANDOFF — Upgradation side fleet

**When:** 2026-07-15  
**Branch:** `feature/upgradation-functionality` · **Version:** **`v0.3.5` LIVE** (F+G)  
**Side ports:** **3312 / 4312 / 5312**  
**Hosts:** https://agentverse-upgrade-staging.delena.buzz · https://agentverse-upgrade.delena.buzz

## Live

| Env | Version | Evidence |
|-----|---------|----------|
| F PREPROD `:4312` | **0.3.5** | `H:\releases\agentverse-upgrade-0.3.5\` |
| G PROD `:5312` | **0.3.5** | same |

Classic / v2 not overwritten.

## Shipped

- **0.3.3** — Priya + runtime packs + session flip  
- **0.3.4** — Full pack matrix + Session Desk **App sessions** ensure ([APP-SESSIONS.md](./APP-SESSIONS.md))  
- **0.3.5** — `stageVisible` cast swap + W4 Adopt/Switch/Hire (`ContextDecisionOffer`)

## Operator

1. Hard-refresh staging/prod after promote  
2. Change Session Desk pack → crew bar / stage cast should match pack  
3. **Context** chip → Adopt / Switch / Hire (one per turn; Hire = SOP log only)

**If create fails** with `workspacePath is not allowed; must stay under …`: Portal allowlist on `G:\apps\agent-portal\.env` (and F) must include `E:\MyWorkspace,E:\Source,E:\wt,F:\apps,G:\apps`. See [APP-SESSIONS.md](./APP-SESSIONS.md).

**If chat hits 429:** Portal XFF/user buckets + AV slower polls — see [OPS.md](./OPS.md) § Rate limit.
