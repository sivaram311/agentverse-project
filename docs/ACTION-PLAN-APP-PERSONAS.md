# Action plan — App-stage personas + parallel off-stage workers

**Status:** W0 **Human GO 2026-07-15** · W4/`stageVisible` **0.3.5 in train** · W1–W3 shipped · W6 packs **0.3.4** live  

**Date:** 2026-07-15  
**Branch / fleet:** `feature/upgradation-functionality` · upgrade side fleet only  
**Workspace root:** `E:\MyWorkspace` (ProdDeck: one canonical path in pack)  
**SoT rules:** `E:\MyAgent\workflow\CONSCIOUS.md` (#14–18) · promote / E2E / ACTIVITY-LOG  

**Locked:** `src`→appId · hard switch + packEpoch · Layer B = hire SOP · pilots proddeck / agentverse-upgrade / css · **0.3.2** shipped · **0.3.3** = W2b/W3 train  

**User confirmations already in force:**
- Chrome toggles (joystick + camera views) first  
- Per-PROD-app persona packs + session flip = camera cut + role flip  
- Help Desk generalist (Priya) always available  
- Single-shot asks  
- On-demand hire of **many parallel workers** — **not required on the 3D stage**  
- Context drift → **adopt / hire / switch** personas mid-session  
- Layer B = Lead SOP + hire notes first — **not** an in-app Cursor hire backend (deferred)
- Faster DEV `:3312` then Q1 to F `:4312` only after EM GO + evidence

---

## 1. Problem statement

AgentVerse today hardcodes one office cast (`personas.json`). Machine work needs:

1. Operator UX controls matching prod (joystick / framing).  
2. One stage per live PROD app, with stack-aware specialists.  
3. Session switch = stage change (camera + roles).  
4. Throughput via **parallel Cursor/CLI subagents** that share persona *identity* but do not all need avatars.  
5. When chat/context drifts (wrong app, wrong role), Lead/Help Desk must **rebind** pack or hire fresh workers without restarting the machine law.

---

## 2. Two layers (do not conflate)

| Layer | What it is | Parallelism | On stage? |
|-------|------------|-------------|-----------|
| **A — Stage cast** | Named avatars + prompts in Hub/FlatRoster | Usually 1 talk target + optional 2–3 visible crew | Yes |
| **B — Worker pool** | Cursor Task / `agent` CLI / Antigravity subagents hired under a persona id | Many parallel; disjoint file ownership | **No** (optional badge in HUD later) |

Layer B **must** exist even if Layer A stays small. Stage is for operator orientation; workers are for speed.

---

## 3. Principles

1. **MyAgent law wins** — ports, CSS, promote evidence, E2E hire (#14), Playwright slot (#15), DEV E2E before tag (#16), reviewer sign-off (#17), DEV host login (#18), ACTIVITY-LOG. Avatars never bypass gates.  
2. **Single-shot** — one ask → one assignee (or one named parallel burst with clear ownership) → one exit result.  
3. **Hire on demand** — Rajesh/Priya (or Lead) spawn **Layer B** workers when wall-clock matters; release when done. Stage avatar count ≠ parallelism budget.  
4. **Context adoption** — **Adopt** (rebind talk target), **Hire** (replacement worker), **Switch** (change pack; default **hard** = bump `packEpoch` + retire conflicting workers). Soft keep only if epoch + ownership still valid. No silent mid-task prompt hot-patch as default.  
5. **No classic/v2 clobber** — implement on upgrade fleet (`3312/4312/5312`) only until EM GO. Session Desk defaults must not target classic/v2 as work planes.  
6. **Docs before code** for each wave (pre-work gate for product surfaces).  
7. **Deep-link SoT** — frozen contract uses `src` / `crew` / `session` / `intent` ([DEEP-LINK-CONTRACT.md](./DEEP-LINK-CONTRACT.md)). Pack key: map `src` → `appId` **or** add optional allowlisted `app=` with legacy behavior — decide in W0 before W3.

---

## 4. Live PROD apps (pack inventory)

**Default Session Desk / Dispatch targets (work plane):** css · css-next · agent-portal · **agentverse-upgrade** · proddeck · stack-pilot · h-drive-server  

**Labeled only (not default work plane):** `agentverse` = classic rollback · `agentverse-v2` = experiment · `library` = candidate (ports reserved, not PROD yet)

| appId | Stack (working) | Default workspace under E: |
|-------|-----------------|----------------------------|
| css | Java IdP | `E:\MyWorkspace\centralized-security-system` |
| css-next | Java OAuth side fleet | same tree / side branch as SoT |
| agent-portal | Java API + Angular | `E:\MyWorkspace\agent-portal` |
| agentverse-upgrade | Next + R3F | `E:\MyWorkspace\agentverse-project` |
| agentverse | Next + R3F (rollback label) | same repo — **not** default Dispatch |
| agentverse-v2 | Next + R3F (experiment label) | same repo — **not** default Dispatch |
| proddeck | Next Cloud OS | Canonical path pinned in pack (prefer under MyWorkspace; if `E:\wt\proddeck-integrate`, document as alias — one SoT) |
| stack-pilot | Java control | stack-pilot SoT path under MyWorkspace / Source as registry |
| h-drive-server | Node H: expose | `E:\MyWorkspace\h-drive-server` |
| library | Next PWA (candidate) | `E:\MyWorkspace\sandbox\library` |

**W6 pilots first (not full matrix):** `proddeck`, `agentverse-upgrade`, `css` — then fill remaining.

---

## 5. Named cast (stable ids)

**Always available:** Priya (Help Desk), Rajesh (Lead), Meenakshi (Companion).  
**Build:** Karthik, Lavanya, Aravind, Muthu, Kabilan.  
**Workflow faces:** Nisha (E2E multi-viewport), Selvam (Promote EM), Anand (Ops), Divya (Promote QA), Vikram (Security), Deepa (Git review), Raman (Field ops), Gowri (Docs), Suresh (Git release/tags).  

Full role table lives in companion doc: [APP-PERSONA-CAST.md](./APP-PERSONA-CAST.md).

---

## 6. Action waves (execution order)

### W0 — Docs SoT (tighten + human GO — no product code)
- [x] ACTION-PLAN + CAST + PACK-TEMPLATE + parallel hire template  
- [x] ROADMAP P5 pointer  
- [x] Grok review → fold (this Revision)  
- [x] **Human GO on revised W0** — operator **GO** 2026-07-15 09:09 (docs closeout · Gowri hire `agents/hires/2026-07-15-w0-closeout.md`)  
- [x] Decide pack key: map `src` → appId (**LOCKED**; no `app=` fork) — stamped [DEEP-LINK-CONTRACT.md](./DEEP-LINK-CONTRACT.md); wired in `pack-loader`  
- [x] Cast id → MyAgent skill path table (in CAST doc) — workflow faces + build cast (`karthik`/`lavanya`/`aravind`/`muthu`/`meenakshi`) · [APP-PERSONA-CAST.md](./APP-PERSONA-CAST.md)  
- [x] Inventory labels: rollback / experiment / candidate — `agentverse` / `agentverse-v2` / `library` · [APP-SESSIONS.md](./APP-SESSIONS.md)  

**Decision notes (W0 closeout):**
- Pack key = **`src` → `appId` only**. No new `app=` query param.
- Inventory: `agentverse` = classic **rollback** · `agentverse-v2` = **experiment** · `library` = **candidate** (labeled seed only; not default work plane).
- Cast→skill SoT complete in APP-PERSONA-CAST.md (always-on + build + workflow faces).
- Docs ready for operator tick; **no product code** until Human GO.

**Exit:** Human GO on W0; **no** product code.

### W1 — Operator chrome toggles (after W0 GO only)
- [x] Pref: show/hide joystick  
- [x] Pref: enable/cycle camera view modes  
- [x] Persist on upgrade fleet  
- [x] Realme E2E: claim Playwright slot (#15); baseURL upgrade DEV/staging only (#18 if login); assert toggles  

**Exit:** Operator can hide joystick + change views. **Shipped 0.3.2.**

### W2a — Pack schema + Priya catalog + hire SOP (docs/config only)
- [x] Schema fields: `packEpoch`/`version`, `switchPolicy` default `hard`, `fleetPorts`, `cssClientId` pointer, `hireBurstMax`, `playwrightOwner`, capped addenda (no secrets) · + `sessionTitle` / `workPlane`  
- [x] Priya entry in personas **catalog docs** (runtime talkable = W2b)  
- [x] Layer B = hire-note SOP only (no in-app hire API)  

**Exit:** Schema + templates frozen.

### W2b — Runtime pack load + Priya talkable (upgrade branch)
- [x] Load packs by appId (`src/lib/pack-loader.ts` · pilot JSON under `src/prompts/packs/`)  
- [x] Priya on stage (`personas.json` id `helpdesk` · Lane A)  

**Exit:** Pack loader + Help Desk seated. **In train toward 0.3.3** — see [hire note](../agents/hires/2026-07-15-w2b-w3-helpdesk-packs.md).

### W3 — Session flip (stage)
- [x] Binding per W0 deep-link decision (SessionDesk · ProjectSwitcher · desk boot → `setActivePack` — Lane C)  
- [x] Camera + overlays (`setActivePack` → `cameraPreset`; `orchestrator.applyPackOverlay` — Lane B/E)  
- [x] Toast stage name (`packToast` + `data-testid="pack-toast"` — Lane C)  
- [x] Default **hard** switch (`packEpoch` bump on `switchPolicy: hard`)  

**Exit:** Session/src/project flip packs on stage. **Candidate 0.3.3** — promote after EM GO (Lane H).

### W4 — Context adoption
- [x] Adopt / Hire / Switch with `packEpoch`; one decision per operator turn (`ContextDecisionOffer` · store latch)  
- [x] ACTIVITY-LOG every event (runtime `activityEvents` buffer → Lead paste)  
- [x] No default mid-task prompt injection  
- [x] `stageVisible` cast swap (Hub / FlatRoster / TeamMemberBar / nearest seats) · **0.3.5**

### W5 — Parallel worker pool (ops pattern)
- [x] Caps + dry-run hire SOP (`docs/PARALLEL-WORKER-SOP.md` · hire `2026-07-15-w5-parallel-pool-dryrun.md`) — Layer B docs only, no in-app hire API  
- Caps: feature **2–4**; Device Lab **3 authors ∥ / 1 Playwright run**; promote EM+QA+Sec+Review ∥, Ops after GO, field-ops always; machine-wide **~3–5** concurrent Tasks  
- Dry-run hire with ≥3 workers, no extra WebGL bodies

### W6 — Pilot packs then fill
- [x] Pilots: proddeck, agentverse-upgrade, css  
- [x] Remaining work-plane + labeled packs · Session Desk ensure ([APP-SESSIONS.md](./APP-SESSIONS.md)) · **0.3.4**  
- [x] Workflow faces as stage bodies — **deferred** (Grok + Vision; Layer B SOP ids only)

### W7 — Gates glue
- [x] Prep checklist only ([PROMOTE-PERSONA-TRAIN-Q1.md](./PROMOTE-PERSONA-TRAIN-Q1.md) · hire `2026-07-15-w7-gates-prep.md`) — **not authorized for Q1** until human + EM GO  
- E2E + promote name mapping; H: evidence; deps matrix — only when train ready for EM GO.

---

## 7. Parallelism model (explicit)

```text
Operator ask
  → Priya or Rajesh (single-shot classify)
  → if large: hire Layer B workers in parallel (Task tool / agent CLI)
       · disjoint files · shared packEpoch · separate ACTIVITY rows
  → Playwright: claim slot → run → release (never parallel browser runs)
  → Integrate Lead merges
  → optional stage label update only
```

| Burst | Cap |
|-------|-----|
| Feature leftovers | 2–4 |
| Device Lab | 3 authors ∥, 1 Playwright execution |
| Promote | EM+QA+Sec+Review ∥; Ops after GO; field-ops always |
| Machine-wide Tasks | ~3–5 concurrent; queue beyond that |

Stage avatars **≤ ~7–12**. Never scale WebGL with worker count.

---

## 8. Context change playbook

| Trigger | Response |
|---------|----------|
| Session Desk / pack change | **Switch** hard: bump `packEpoch`, retire conflicting workers, new camera |
| Ask clearly another app mid-chat | Priya offers Adopt or Switch — no silent stack mix |
| Worker poisoned | **Hire** replacement same persona id + new epoch; retire old |
| Pre-work missing | Rajesh blocks Coder workers; hire Vision/Architect first |
| One turn | Max **one** adopt/switch decision |

---

## 9. Non-goals / defer

- In-app Layer B hire API / HUD worker badges  
- Full pack matrix before pilots  
- Classic densify merge / F·G clobber  
- Auto-promote / auto-tag / auto-push  
- Workflow faces on stage by default  
- Mid-task prompt hot-patch as primary adoption  
- Secrets or huge prompts in pack JSON  

---

## 10. How we proceed (now)

1. ~~Draft plans + Grok review~~  
2. **You:** approve W0 fold (**human GO**) or request more doc edits.  
3. On GO: finish W0 checklist items (deep-link pack key, cast→skill table).  
4. Only then **W1 code** (chrome toggles) on upgrade branch + Realme E2E with slot.  
5. Parallel workers anytime for **docs/impl lanes** under hire notes — need not wait for stage avatars.

---

## Revision (Grok 2026-07-15 · cursor-grok-4.5-high)

**Verdict:** W0 **GO-WITH-CHANGES** · W1 **NO-GO** until human GO after fold.  

**Folded:** W2 split (a docs / b runtime); deep-link vs `app=`; inventory labels; packEpoch + hard switch default; workspace single-SoT; Layer B = SOP not API; parallelism caps; pilot packs first; #16/#18 in principles; W1 E2E slot/host rules.  

**Full review transcript:** `docs/_grok-review-out.md`