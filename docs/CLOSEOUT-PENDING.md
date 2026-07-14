# Closeout phase — pending items → implement

**Date:** 2026-07-15  
**Status:** DONE (integrate + green E2E with auth)  
**User direction:** everything previously listed as pending must be implemented

## Scope (must ship)

### Implementation / docs SoT
1. [x] Register **agentverse-upgrade 0.3.1** in ProdDeck `SUPPORTED-VERSIONS` + MyAgent `workflow/deps/`
2. [x] Refresh AgentVerse `docs/DEEP-LINK-CONTRACT.md` — upgrade hosts as SoT; expand `return` allowlist text

### Testing (Playwright Device Lab)
3. [x] **Auth E2E** — use env `AV_E2E_*` (password from machine CSS env at runtime only; never commit)
4. [x] **Logged-in Session Desk** — search UI + Cancel run control visible when busy or button exists after open
5. [x] **Home → Dispatch → Desk → return** path — ProdDeck staging Dispatch preview URL contains `agentverse-upgrade` + optional navigate land
6. [x] **Upgrade PROD** project in Playwright (`agentverse-upgrade.delena.buzz`) — health + shell smoke
7. [x] **WebGL / FlatRoster** — soft runtime probe + never fail solely because WebGL is healthy

## Non-goals
- Classic densify merge · Cloud OS hard-outs · inventing new features beyond pending list

## Exit
- All items checked
- `npm run test:e2e` green with `AV_E2E_PASSWORD` set from machine CSS env (not committed)
- Evidence: `H:\releases\agentverse-upgrade-0.3.1\evidence\e2e-closeout\`
- E2E fixes note: shell ignores aria-hidden hero; login waits for CSS `/auth/login` + Sessions chrome; `workers: 2`
