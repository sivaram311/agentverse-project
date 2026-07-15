# Parallel worker pool — Lead SOP (Layer B)

**Status:** W5 ops pattern · **SOP only** (Layer B deferred — not an AgentVerse backend)  
**Date:** 2026-07-15  
**Owner:** Integrate Lead (Anand / Rajesh)  
**Fleet:** AgentVerse **upgrade only** — DEV `:3312` · PREPROD `:4312` · PROD `:5312`  
**Do not:** invent classic/v2 ports · F/G deploy without EM GO · spawn WebGL bodies per worker · treat this as an in-app hire API  

**Related:** [ACTION-PLAN-APP-PERSONAS.md](./ACTION-PLAN-APP-PERSONAS.md) §7 · [agents/hires/_TEMPLATE-parallel-workers.md](../agents/hires/_TEMPLATE-parallel-workers.md) · MyAgent `CONSCIOUS.md` #10/#14–#18  

---

## 1. What Layer B is

| | Layer A — Stage cast | Layer B — Worker pool |
|-|----------------------|------------------------|
| Mechanism | Named avatars + prompts in Hub / FlatRoster | Cursor Task / `agent` CLI / Antigravity subagents |
| Count | Talk target + optional small crew (stage ≤ ~7–12) | Many parallel; capped below |
| On stage? | Yes | **No** (optional HUD badge later — deferred) |
| SoT for hire | Cast / pack JSON | **This SOP + hire notes under `agents/hires/`** |

Layer B exists so wall-clock work finishes faster. Stage avatars are for operator orientation; **avatar count ≠ parallelism budget**.

**Explicit deferral:** Layer B is Lead SOP + hire notes only. There is **no** in-app Cursor/CLI hire API, no HUD worker badges, and no AV backend orchestration for spawning workers in this train. Product code must not implement hire-burst APIs as a W5 deliverable.

---

## 2. When to hire

Operator ask → Priya or Rajesh (single-shot classify) → if large / multi-file:

1. Lead writes a hire note (`agents/hires/YYYY-MM-DD-<topic>.md`) from the parallel-workers template.  
2. Lead starts workers (Task / CLI) with **disjoint path ownership** and a **shared `packEpoch`**.  
3. Each lane logs its own ACTIVITY-LOG row; Lead logs integrate.  
4. Playwright: **claim → run → release** one machine slot (`PLAYWRIGHT-SLOT`) — never concurrent browser runs.  
5. Lead merges; optional stage label update only — **no** extra WebGL bodies for workers.

Release workers when their exit criteria are met. On hard **Switch**, bump `packEpoch` and retire conflicting lanes before re-hire.

---

## 3. Caps (hard)

| Burst type | Cap | Notes |
|------------|-----|--------|
| Feature leftovers / impl lanes | **2–4** concurrent | Prefer fewer, clearer ownership maps |
| Device Lab | **3 authors ∥** / **1 Playwright** execution | Authors write specs in parallel; one slot owner runs PW |
| Promote | **EM + QA + Sec + Review ∥** | **Ops after GO**; **field-ops always** on promote crew |
| Machine-wide Tasks | **~3–5** concurrent | Queue beyond that; do not stampede the IDE |

Stage avatars stay ≤ ~7–12. Never scale WebGL with worker count.

---

## 4. Ownership rules

1. **Disjoint paths** — no two lanes edit the same file path (or overlapping glob). Lead resolves overlaps before start.  
2. **Shared `packEpoch`** — every worker prompt states the active `appId` + `packEpoch`. Stale epoch → stop and wait for Lead.  
3. **Single-shot** — one ask → one lane exit. No silent mid-task prompt hot-patch.  
4. **Hard switch default** — pack change bumps epoch; Lead retires conflicting workers and re-hires under the new epoch. Soft keep only if epoch + ownership still valid.  
5. **One adopt/switch decision per operator turn.**  
6. **ACTIVITY-LOG** — one row per lane + one integrate row (provider + session + persona role).  
7. **Upgrade fleet only** for AgentVerse product work until EM GO says otherwise (`3312` / `4312` / `5312`).  
8. **No secrets** in hire notes or pack JSON addenda.

---

## 5. Hire-note minimum fields

Copy `agents/hires/_TEMPLATE-parallel-workers.md`. Every live hire must name:

- Session id · pack `appId` · **`packEpoch`** · Lead  
- ≥1 worker row with persona id, display name, ownership paths, tool, exit  
- Caps applicable to this burst  
- Playwright slot owner (if any)  
- Explicit "no extra stage avatars" when Layer B-only  

Dry-runs (pattern practice without Task spawn) use the same shape — marked **DRY-RUN**.

---

## 6. Parallelism model (quick)

```text
Operator ask
  → Priya or Rajesh (single-shot classify)
  → if large: hire Layer B workers in parallel (Task / agent CLI)
       · disjoint files · shared packEpoch · separate ACTIVITY rows
  → Playwright: claim slot → run → release (never parallel browser runs)
  → Integrate Lead merges
  → optional stage label update only
```

---

## 7. Context change vs workers

| Trigger | Lead action |
|---------|-------------|
| Session Desk / pack Switch | Hard: bump `packEpoch`, retire conflicting workers, new camera |
| Ask clearly another app mid-chat | Offer Adopt or Switch — no silent stack mix |
| Worker poisoned | Hire replacement same persona id + new epoch; retire old |
| Pre-work missing | Block Coders; hire Vision/Architect first |

---

## 8. Non-goals (stay deferred)

- In-app Layer B hire API / HUD worker badges  
- Treating WebGL cast size as the worker budget  
- Auto-promote / auto-tag / auto-push  
- Multiple concurrent Playwright instances  
- F:/G: deploy without evidence + EM GO  

---

## 9. Evidence of W5

| Artifact | Role |
|----------|------|
| This SOP | Layer B Lead standing procedure |
| `agents/hires/2026-07-15-w5-parallel-pool-dryrun.md` | Dry-run hire (≥3 named workers, disjoint paths, shared epoch) |
| ACTION-PLAN § W5 | Checklist owner (D0 / Lead fold later — not edited by W5 author) |

W5 exit: caps documented · dry-run hire on disk · Layer B labeled SOP-only · ACTIVITY-LOG row for the wave.
