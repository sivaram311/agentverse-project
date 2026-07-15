# Hire — W4 Technical Architect · 0.3.5 stage truth

**Date:** 2026-07-15  
**Session:** `agentverse-feature-branch-2026-07-15`  
**Role:** Technical Architect  
**Provider:** cursor  
**App pack:** `agentverse-upgrade`  
**Fleet:** DEV `:3312` · PREPROD `:4312` · PROD `:5312` only — **never** classic/v2  

## Ask

Docs/pre-work only for **0.3.5**: Burst-2 ownership + store API sketch (`stageVisible` on `setActivePack`, Adopt / Switch / Hire) + filter vs hide + risks. No product code. No push. No Vision file edits. No ACTION-PLAN edits. No promote.

## Ownership (exclusive)

| Path | Action |
|------|--------|
| `agents/pre-work/waves/0.3.5/02-architecture.md` | Create |
| `agents/hires/2026-07-15-w4-architecture-0.3.5.md` | This note |
| `E:\MyAgent\workflow\activity\ACTIVITY-LOG.md` | One append row |

## Burst-2 lanes (for Integrate kickoff after GO)

| Lane | Owns | Exit |
|------|------|------|
| **ST** | `store.ts` · NEW `stage-cast.ts` | Cast coerce on pack; `adoptPersona` / `switchPack` / `hireReplacement` (SOP event) |
| **SCENE** | `HubScene.tsx` · `PlayerAvatar.tsx` | Bodies + nearest ⊆ cast; unmount off-cast |
| **W4-UI** | `FlatRoster` · `TeamMemberBar` · `ChatPanel` · NEW `ContextDecisionOffer` | Roster = cast; one-turn Adopt/Switch/Hire confirm |

Zero path overlap — see architecture § Burst-2.

## Locked from SoT

- W3: `setActivePack` = camera + toast + hard `packEpoch`  
- W4: one decision / turn; no mid-task prompt injection; Hire = hire-note SOP not Cursor API  
- Vision J1–J3 + taxonomy frozen (Architect does not rewrite Vision)

## Exit (this hire)

- [x] Architecture with ownership table, store API, filter policy, risks, blockers  
- [x] ACTIVITY-LOG row  
- [ ] Human GO → Burst-2 coding (downstream)

## Downstream (not this hire)

Burst-2 ST∥SCENE∥W4-UI → Integrate 0.3.5 → Device Lab E2E (#14–18) → Reviewer (#17) → EM promote
