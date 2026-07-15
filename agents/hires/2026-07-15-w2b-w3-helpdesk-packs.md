# Hire — W2b runtime packs + W3 session flip (parallel)

**Date:** 2026-07-15  
**Session:** `agentverse-feature-branch-2026-07-15`  
**App pack:** `agentverse-upgrade`  
**Lead:** Integrate (Cursor / Director)  
**Human GO:** W0 locked · W1 **shipped 0.3.2** · this wave → candidate **0.3.3**  
**Fleet:** DEV `:3312` · promote target F `:4312` / G `:5312` only — **never** 3310/4310/5310 or 3311/4311/5311  

## Decisions locked (W2b/W3)

- Deep-link **`src` → pack `appId`** — SoT `src/lib/pack-loader.ts` + [DEEP-LINK-CONTRACT.md](../../docs/DEEP-LINK-CONTRACT.md)
- Session / Project / desk land → **`setActivePack`** + camera + optional **`composeSeed`**
- Switch default: **hard** + `packEpoch` bump
- Priya (`helpdesk`) always on stage; crew deep-link may target **`helpdesk`**
- Pilot packs only: `proddeck` · `agentverse-upgrade` · `css`
- Layer B = hire notes + Task/CLI — not in-app hire API

## Parallel lanes

| Lane | Persona seat | Owns (disjoint) | Exit |
|------|--------------|-----------------|------|
| **D0 Docs** | Gowri | `agents/hires/2026-07-15-w2b-w3-helpdesk-packs.md` · ACTION-PLAN W2b/W3 · DEEP-LINK `src`→pack · PACK-TEMPLATE · PRIYA-HELPDESK · HANDOFF status | Docs committed same train |
| **A Cast** | Aravind | `helpdesk` in `personas.json` + `PersonaId` + `agentStates` + avatar catalog | Priya on roster + Talk |
| **B Pack core** | Karthik + Aravind | `src/lib/pack-loader.ts` · store `activePackId`/`packEpoch`/`setActivePack` · `orchestrator.applyPackOverlay` | Switch pack changes `getPersona().role` |
| **C Bindings** | Muthu | SessionDesk select · ProjectSwitcher · deep-link boot → `resolvePackIdFromSrc` + `setActivePack` + `composeSeed` | `src=` / session switch flips pack + toast |
| **E Camera** | Lavanya-lite | Pack `cameraPreset` → `setCameraViewOverride` on hard switch | Framing shifts on pack land |
| **F E2E** | Kabilan (+ Nisha author) | `e2e/helpdesk-pack.spec.ts` Realme · claim Playwright slot **before** run | Priya visible; pack toast/overlay after `src=proddeck` |
| **G Integrate** | Lead | Merge lanes · typecheck · DEV `:3312` smoke · bump **0.3.3** · ACTIVITY-LOG | Green tip on branch |
| **H Promote** | Selvam crew | Q1→F `:4312` then Q2→G `:5312` **only after human EM GO** | Staging + prod upgrade hosts **0.3.3** |

## Kickoff order

```text
Director kickoff
  → hire D0 + A + B in parallel (foundation)
  → after A+B land interfaces: hire C + E parallel
  → F E2E after C mergeable
  → G integrate → human GO promote → H
```

## Rules

- Disjoint paths as above — no two lanes edit the same file  
- Playwright: **one** slot claim for Lane F (#15) — Integrate runs after C merge  
- No secrets in pack JSON · no classic/v2 ports  
- Single-shot per lane  
- Version for this wave: **0.3.3** (after G integrate; do not tag until DEV E2E green #16)

## Promote (plan only until EM GO)

Evidence target: `H:\releases\agentverse-upgrade-0.3.3\`  
Hire EM / QA / Sec / Review / Ops / field-ops **when** human asks deploy — Lane H standby.

## Integrate checklist

- [ ] Merge D0–F lanes  
- [ ] Docs #12 (this hire + SoT docs)  
- [ ] DEV smoke on `:3312`  
- [ ] `package.json` → **0.3.3** (Lane G only)  
- [ ] ACTIVITY-LOG row  
- [ ] E2E + promote only after human GO (Lane F/H)
