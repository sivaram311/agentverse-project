# Hire — 0.3.0 PROD office + 2 teams + 15-seat meeting

**Session:** `agentverse-0.3.0-prod-office-2026-07-14`  
**Date:** 2026-07-14  
**EM GO:** User — pull all the way back to production office; add 2 teams + one 15-person meeting room; promote PREPROD ASAP.

## Target product

| Piece | Spec |
|-------|------|
| Base office | **PROD 0.2.2** — `SiruseriOffice` + `HexCollabOffice` (commit `2fa29a1`) |
| Keep from staging | FP walk, Mathura, tap-only chat, DistanceLabel, CORS middleware, mobile joystick/#11 fixes, Session Desk auth |
| Teams | **Exactly 2** team pods (desks + orchestrator) fitted **inside** older Siruseri bounds — not Expanded HQ wings |
| Meeting room | **1** room: table + **15 occupied** chairs + TV |
| Drop | 10-team Expanded HQ, GlassCube/side conf block as HQ core, distance streaming proxies |

## Version

**0.3.0** → PREPROD Q1

## Tracks

| Track | Owner | Deliverable |
|-------|-------|-------------|
| A | Scene restore | HubScene = Siruseri+Hex+personas+player; no Expanded montages |
| B | Two teams | `office-layout` slim: 2 zones that fit SIRUSERI halfW≈10.5 |
| C | Meeting 15 | Conference module with 15 seated figures + TV + table |
| D | Ship | Build, push, F: deploy, health 0.3.0 |

## Out of scope

PROD Q2 (needs separate EM GO). LOD/cull compromises that empty the office.
