# Hire note — W5 parallel worker pool (DRY-RUN)

**Date:** 2026-07-15  
**Session:** `agentverse-feature-branch-2026-07-15`  
**App pack:** `agentverse-upgrade`  
**packEpoch:** `5` (shared — all lanes; stale epoch → stop)  
**Lead:** Anand (ops / Integrate)  
**Mode:** **DRY-RUN** — pattern proof only; no Task/CLI spawn required for W5 close  
**Fleet:** upgrade `:3312` / `:4312` / `:5312` only  
**Layer B:** SOP + hire note — **not** an in-app hire API / AV backend  

**Why:** Demonstrate W5 Layer B burst shape (≥3 named workers, disjoint ownership, shared epoch, no extra stage avatars) per `docs/PARALLEL-WORKER-SOP.md`.

## Caps this burst

| Rule | Applied |
|------|---------|
| Feature lanes | 3 workers (within **2–4**) |
| Device Lab | N/A (no PW run) |
| Promote | N/A |
| Machine Tasks | Would be 3 concurrent (within **~3–5**) |
| Stage avatars | **None added** — Layer B off-stage only |

## Workers (named · disjoint · shared epoch)

| Lane | Persona id | Name | Ownership (paths) | Tool | Exit |
|------|------------|------|-------------------|------|------|
| A | `ops-sop` | **Vikram** | `docs/PARALLEL-WORKER-SOP.md` | Task / agent CLI | SOP caps + Layer B deferral prose complete |
| B | `ops-hire` | **Nisha** | `agents/hires/2026-07-15-w5-parallel-pool-dryrun.md` · `agents/hires/_TEMPLATE-parallel-workers.md` (read-only ref) | Task / agent CLI | Dry-run hire note matches template + DoD |
| C | `ops-log` | **Ravi** | `E:\MyAgent\workflow\activity\ACTIVITY-LOG.md` (append row only) | Task / agent CLI | One ACTIVITY-LOG row for W5; provider `cursor` |

**Integrate Lead (Anand):** confirms three exits align · no `src/` touches · no Playwright · no F/G deploy · no ACTION-PLAN edit (D0 owns W0; Lead folds W5 pointer later).

## Rules

- Disjoint file ownership as table — no path overlap between Vikram / Nisha / Ravi.  
- All prompts carry `appId=agentverse-upgrade` + **`packEpoch=5`**.  
- Playwright: **not in scope** — do not claim slot.  
- Single-shot per lane.  
- On hard Switch: Lead bumps epoch, retires A/B/C, re-hires under new epoch.  
- ACTIVITY-LOG: one row per live lane when executed; this dry-run records Lead integrate row only.  
- **No extra WebGL / stage bodies** for these workers.  
- Forbidden: `src/` product changes · in-app hire API design · classic/v2 ports · push · F/G deploy.

## Integrate checklist

- [x] SOP on disk (`docs/PARALLEL-WORKER-SOP.md`)  
- [x] This dry-run hire note (≥3 named workers)  
- [x] Layer B explicit as SOP-only (deferred backend)  
- [x] ACTIVITY-LOG append (Lead)  
- [ ] Live Task spawn — optional later; not required for W5 DoD  
