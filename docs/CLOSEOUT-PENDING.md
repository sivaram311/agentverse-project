# Closeout phase — pending items → implement

**Date:** 2026-07-15  
**Status:** docs first → commit → plan → parallel subagents  
**User direction:** everything previously listed as pending must be implemented

## Scope (must ship)

### Implementation / docs SoT
1. Register **agentverse-upgrade 0.3.1** in ProdDeck `SUPPORTED-VERSIONS` + MyAgent `workflow/deps/`
2. Refresh AgentVerse `docs/DEEP-LINK-CONTRACT.md` — upgrade hosts as SoT; expand `return` allowlist text

### Testing (Playwright Device Lab)
3. **Auth E2E** — use env `AV_E2E_*` (password from machine CSS env at runtime only; never commit)
4. **Logged-in Session Desk** — search UI + Cancel run control visible when busy or button exists after open
5. **Home → Dispatch → Desk → return** path — ProdDeck staging Dispatch preview URL contains `agentverse-upgrade` + optional navigate land
6. **Upgrade PROD** project in Playwright (`agentverse-upgrade.delena.buzz`) — health + shell smoke
7. **WebGL / FlatRoster** — force or detect fallback path OR unit-less DOM test that FlatRoster markup exists when `data-webgl-failed` / navigate with query if supported; else assert FlatRoster component export + CSS classes present via static check + soft runtime probe

## Non-goals
- Classic densify merge · Cloud OS hard-outs · inventing new features beyond pending list

## Exit
All items checked · `npm run test:e2e` green (auth enabled when password available) · commit/push · evidence under `H:\releases\agentverse-upgrade-0.3.1\evidence\e2e-closeout\`
