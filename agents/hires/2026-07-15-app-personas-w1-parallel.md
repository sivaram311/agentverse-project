# Hire — App personas W0 GO → W1/W2a/Q1 plan (parallel)

**Date:** 2026-07-15  
**Session:** `agentverse-feature-branch-2026-07-15`  
**App pack:** `agentverse-upgrade`  
**Lead:** Integrate (Cursor)  
**Human GO:** W0 approved · proceed W1 + docs · Q1 PREPROD **plan** (Ops only after EM GO)  
**Fleet:** DEV `:3312` · promote target F `:4312` only — never 4310/4311  

## Decisions locked (W0)

- Pack key: deep-link **`src` → appId** (no new `app=` until needed)
- Switch default: **hard** + `packEpoch`
- Layer B: hire notes + Task/CLI — not in-app hire API
- Pilots: proddeck · agentverse-upgrade · css

## Parallel lanes

| Lane | Persona | Owns | Exit |
|------|---------|------|------|
| A W1-chrome | Aravind | store prefs + StageControls + joystick gate + HubScene view override | toggles work on `:3312` |
| B W2a-packs | Gowri + Karthik | packs stubs + Priya catalog docs + schema | 3 pack JSON stubs + personas note |
| C E2E | Kabilan | `e2e/chrome-toggles.spec.ts` + docs/E2E.md | Realme asserts; slot before run |
| D Q1-plan | Selvam + Raman | `docs/PROMOTE-PERSONA-TRAIN-Q1.md` + H: evidence stub tree | Q1 checklist ready (NO deploy without EM GO) |
| E Integrate | Lead | merge · typecheck · commit push · ACTIVITY-LOG | green tip |

## Rules

- Disjoint paths as above  
- Playwright: claim slot before Lane C run  
- No secrets · no classic/v2 ports  
- Single-shot per lane  
- Version for Q1 candidate: **0.3.2** (after W1 ships on branch)

## Promote (plan only until EM GO)

Q1 DEV→F `agentverse-upgrade` `:4312` · evidence `H:\releases\agentverse-upgrade-0.3.2\` · hire EM/QA/Sec/Review/Ops/field-ops **when** human asks deploy.
