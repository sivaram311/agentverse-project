# AgentVerse handoff — 2026-07-15

**Live classic:** PREPROD/PROD **0.3.17** (`:4310` / `:5310`) densify + `/desk` + Desk upgradation  
**Pack:** tag `v0.3.17` · `H:\releases\agentverse-0.3.17` · evidence Q1/Q2 under pack  
**Git:** `main` includes classic desk via merge `dc7acce` (`release/0.3.17`). Runtime tag remains `v0.3.17` (docs-only commits on tip; no `v0.3.18`).

## Depends on (minimum)

| Peer | Version | Why |
|------|---------|-----|
| CSS | issuer `https://css.delena.buzz` baked · `v0.1.0` | Auth |
| Agent Portal | **≥ 0.1.8** on matching env | Sessions / cancel / quests |
| ProdDeck Dispatch | **≥ 0.6.2** URI `brief` (live **0.8.0**; pack ready **0.8.1**) | Deep-link producer |
| agentverse-upgrade | **0.3.1** (`:4312/:5312`) | Dispatch SoT peer — **not** classic |

Full fleet matrix: ProdDeck docs/SUPPORTED-VERSIONS.md (hub).

## 0.3.17 contents

Session Desk search/filter/cancel · quests sync · Chat cancel/reuse · CSS issuer bake notes.  
**Do not** merge/deploy full `feature/upgradation-functionality` over densify (diverged; side ports 4312/5312).

Contract: [DEEP-LINK-CONTRACT.md](./DEEP-LINK-CONTRACT.md) · Ops: [OPS.md](./OPS.md) · Strategy: `H:\releases\agentverse-0.3.17\evidence\git-release-strategy.md`
