# AgentVerse handoff — 2026-07-15

**Continue from:** densify **0.3.16** deep-link → **0.3.17** Desk upgradation (`feature/desk-0.3.17`).

## What’s live (F classic)

- PREPROD densify+deep-link **0.3.16** until Lead cutover of 0.3.17
- PROD densify deep-link **0.3.16** on `:5310` (do not touch until EM Q2 GO)

## 0.3.17 (this branch)

Ports Session Desk / search / cancel / status / quests slices from upgradation `@f5249ed` onto densify+deeplink **0.3.16** — **without** Quay/scene densify edits and **without** side-fleet ports:

- Session Desk: search, status filters, cancel run, title-at-create
- Chat: cancel+reuse when busy, status chips, permission poll/resolve
- Quests bound to portal `sessionId` + `syncQuestFromSessionStatus`
- Bake note: `NEXT_PUBLIC_CSS_ISSUER=https://css.delena.buzz` on future F/G builds

Contract: [DEEP-LINK-CONTRACT.md](./DEEP-LINK-CONTRACT.md). Ops: [OPS.md](./OPS.md).

**Do not** robocopy `feature/upgradation-functionality` over F/G — that train diverged from densify (and uses `:4312/:5312` side fleet).
