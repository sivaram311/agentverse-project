# Phase — E2E Device Lab (upgrade fleet)

**Date:** 2026-07-15  
**Status:** **SPECS LANDED** — suite green vs upgrade-staging (auth skip without secrets)  
**Target:** AgentVerse **upgrade** fleet only — `https://agentverse-upgrade-staging.delena.buzz` (origin `:4312`)  
**Do not:** hit classic `:5310` / v2 `:4311` as test SoT; do not promote during this phase unless smoke blocks

## Goal

Ship a **Playwright** suite (Realme 360×780) so upgrades are confirmed by automation, not chat-only smokes.

## Crew hire

| Role | Who | Owns |
|------|-----|------|
| Device Lab Lead (E2E) | **Kabilan** | Spec design, viewport, run evidence |
| E2E Coder | **Aravind** | `e2e/` + playwright config + npm scripts |
| Integrate Lead | Cursor | Merge, docs, ROADMAP, commit/push |
| Security standby | Security-Auditor | No secrets in repo; CSS password via env only |

## Spec slices (wise order)

1. **`health.spec`** — GET/page `/health` → version `0.3.1`, upgrade host  
2. **`shell.spec`** — cold load `/` at 360×780; shell visible; no crash  
3. **`desk-deeplink.spec`** — `/desk?intent=session-desk&src=e2e` opens Session Desk (or login gate documented)  
4. **`hire-brief.spec`** — `/desk?intent=hire&crew=rajesh&brief=E2E` shows incident strip **or** login overlay (assert either path)  
5. **`auth.spec` (optional)** — only if `AV_E2E_USER` + `AV_E2E_PASSWORD` set; CSS login then Session Desk search box

## Non-goals this phase

- Full portal prompt chat E2E (needs long agent runs)  
- Visual regression of WebGL pixels  
- Prod `:5312` destructive write tests  

## Exit

- `npm run test:e2e` green against staging (auth tests skipped without secrets)  
- Evidence under `H:\releases\agentverse-upgrade-0.3.1\evidence\e2e\`  
- Docs: `docs/E2E.md` + ROADMAP row  
- Commit + push on `feature/upgradation-functionality`
