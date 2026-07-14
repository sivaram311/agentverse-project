# HANDOFF — Upgradation train

**When:** 2026-07-15  
**Branch:** `feature/upgradation-functionality` · **Version:** **0.3.0**  
**Base:** `v0.2.2-stable`

## Shipped on this branch

| Slice | Capability |
|-------|------------|
| 0.2.3 | Session Desk search/filter/status/cancel; title-at-create; cancel-first resume |
| 0.2.4 | `/desk` deep-link + `docs/DEEP-LINK-CONTRACT.md`; return allowlist |
| 0.2.5 | Quests bind `sessionId`; status from portal (no fake % SoT) |
| 0.2.6 | Status chip; Cancel run; WAITING_* Allow/Deny via portal permissions API |
| 0.2.7 | Incident strip from brief/evidence |
| 0.2.8 | Dual brief decode (URI + legacy base64url); `src=proddeck` strip always |
| 0.3.0 | Env badge + Portal/CSS health pills; workspace/project docs |

## Promote

Classic **3310 → 4310 → 5310** only. Await user **Q1** / **Q2**.  
Bake `NEXT_PUBLIC_CSS_ISSUER=https://css.delena.buzz` on F/G (CSS issuer awareness).  
Playbook: `docs/PROMOTE-UPGRADATION.md`

## Deep-link land (ProdDeck)

See `docs/DEEP-LINK-CONTRACT.md`. AV accepts URI brief (canonical) and legacy base64url during transition.
