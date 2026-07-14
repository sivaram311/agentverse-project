# AgentVerse handoff — 2026-07-15

**Continue from:** densify **0.3.15** + deep-link port → **0.3.16** (`feature/deep-link-0.3.16`).

## What’s live (F classic)

- PREPROD densify plaza **0.3.15** (`Q1_PREPROD_OK_048`) until Lead cutover of 0.3.16
- PROD classic still **0.2.2** on `:5310`

## 0.3.16 (this branch)

Ports ProdDeck deep-link land from upgradation `@f5249ed` onto densify base `v0.3.15-unstable` **without** merging the upgradation train (quests/perms/env-badge fleet):

- `/desk` route + dual brief decode (URI + legacy base64url)
- IncidentStrip + `applyDeepLinkAfterAuth`
- Return allowlist: `home.delena.buzz` / `home-staging.delena.buzz` (+ localhost / AV hosts)

Contract: [DEEP-LINK-CONTRACT.md](./DEEP-LINK-CONTRACT.md). Ops: [OPS.md](./OPS.md).

**Do not** robocopy `feature/upgradation-functionality` over F — that train diverged from densify.
