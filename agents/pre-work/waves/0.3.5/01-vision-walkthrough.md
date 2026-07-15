# 01 — Vision: Stage truth 0.3.5 (cast swap + context adoption)

**Initiative:** AgentVerse upgrade · W4 Context adoption + `stageVisible` cast swap  
**Version cut:** **0.3.5** (docs/pre-work this wave; product code after Architect + human GO)  
**Branch / fleet:** `feature/upgradation-functionality` · **3312 / 4312 / 5312 only** (never classic 3310/4310/5310 or v2 3311/4311/5311)  
**Date:** 2026-07-15  
**Role:** Vision SME  
**SoT:** [ACTION-PLAN-APP-PERSONAS.md](../../../docs/ACTION-PLAN-APP-PERSONAS.md) · [PACK-TEMPLATE.md](../../../docs/PACK-TEMPLATE.md) · [APP-PERSONA-CAST.md](../../../docs/APP-PERSONA-CAST.md) · CONSCIOUS **#12 / #14–18**  
**Hire:** [2026-07-15-w4-vision-0.3.5.md](../../hires/2026-07-15-w4-vision-0.3.5.md)

**Upstream shipped:** W0–W3 · pack load · Priya · Session Desk / deep-link `setActivePack` · camera + toast · hard `packEpoch` · pilot + work-plane packs (**0.3.4** live on F/G upgrade).  
**Gap this cut closes:** `stageVisible` is declared in pack JSON + typed in `pack-loader` but **not** applied to which bodies appear / are talkable on stage. Adopt / Hire / Switch as operator **decisions** are playbook-only (ACTION-PLAN §8); no single-turn UX yet.

---

## Goal

Make the 3D office a **trustworthy stage of the active pack**: when the operator flips Session Desk (or otherwise lands a pack), the visible cast matches that pack’s `stageVisible` list, overlays/talk targets match the pack, and mid-session context drift is resolved by **exactly one** of Adopt · Switch · Hire — never silent prompt mutation or dual packs.

---

## Operator journeys

### J1 — Session Desk pack flip → stage cast swap (`stageVisible`)

```text
Operator opens Session Desk on upgrade DEV :3312
  → selects / creates a work-plane session (e.g. ProdDeck → css → agentverse-upgrade)
  → setActivePack(appId) runs (W3 already)
  → cameraPreset + pack toast land (W3 already)
  → **NEW 0.3.5:** FlatRoster / Hub bodies / talkable set filter to pack.stageVisible
  → Operator sees only that pack’s cast (plus always-on subset already listed in stageVisible)
  → Compose / Talk target defaults to Help Desk (Priya) unless deep-link crew= overrides to a stageVisible id
```

**Observable truth (examples from pilot packs):**

| Pack | Expect on stage (`stageVisible`) | Must not appear as stage bodies |
|------|----------------------------------|----------------------------------|
| `proddeck` | helpdesk, rajesh, aravind, lavanya, kabilan | meenakshi (unless listed); workflow faces not listed |
| `css` | helpdesk, rajesh, vikram, aravind | lavanya, kabilan, muthu; css-next cast mix |
| `agentverse-upgrade` | helpdesk, rajesh, aravind, meenakshi, kabilan, muthu | lavanya unless pack updated |

**WorkerRoles** stay Layer B (hire notes / Tasks) — **no** extra WebGL bodies when workers are hired.

### J2 — Mid-chat drift → one decision (Adopt / Switch / Hire)

Triggers (from ACTION-PLAN §8):

| Trigger | Decision | Effect |
|---------|----------|--------|
| Operator still on same pack; wrong talk target / overlay | **Adopt** | Rebind talk target + overlay to a `stageVisible` id; **same** `packEpoch`; no worker retire storm |
| Ask clearly another app / Session Desk pack change | **Switch** | Hard default: bump `packEpoch`, retire conflicting Layer B workers, new camera + `stageVisible` cast, toast stage name |
| Worker/context poisoned under same persona id | **Hire** | Replacement Layer B worker (hire note + new ownership); retire old; stage avatar may stay; epoch policy per Architect |

**Hard rule:** max **one** Adopt **or** Switch **or** Hire decision per operator turn. Priya / Rajesh may **offer** choices; they must not auto-chain Switch then Hire in one turn.

```text
Operator: "actually this is CSS not ProdDeck"
  → Priya offers: Adopt (stay pack, talk Vikram) OR Switch (load css pack)
  → Operator picks ONE
  → ACTIVITY-LOG row for that event
  → Stage + toast + roster reflect the choice; no silent stack mix
```

### J3 — Hard Switch retires conflicting workers (ops orientation)

```text
Active: proddeck packEpoch=N · Layer B Aravind worker on ProdDeck paths
  → Operator switches Session Desk → css
  → packEpoch → N+1 · stageVisible → css cast · toast "CSS"
  → ProdDeck-scoped workers marked retired / invalid for further prompts
  → New asks under css packEpoch only
```

Soft keep is **exception-only** (epoch + ownership still valid) — not the default UX.

---

## Decision taxonomy (Adopt vs Switch vs Hire)

| | **Adopt** | **Switch** | **Hire** |
|---|-----------|------------|----------|
| **Intent** | Rebind who we talk to / which overlay applies **inside** current pack | Change **pack** (app work plane) | Replace a **Layer B** worker under a persona id |
| **packEpoch** | Unchanged | Bump on `switchPolicy: hard` (default) | Usually same pack; new worker ownership; may pair with epoch rules Architect defines — **not** a second pack load |
| **Stage cast** | Same `stageVisible`; talk target moves | Rebuild from new pack’s `stageVisible` | Stage body optional; worker is off-stage |
| **Camera / toast** | No pack toast required | Camera + pack toast (W3) | None for pack; hire note is SoT |
| **Layer B** | Keep if ownership valid | Retire conflicting (hard) | Retire poisoned; spawn replacement |
| **Operator cue** | “Talk to Lavanya” / roster click | Session Desk / pack chip / explicit Switch | Lead / Priya hire SOP + hire note path |

One turn → one cell only.

---

## Non-goals (explicit)

1. **No default mid-task prompt injection** — do not hot-patch active worker system prompts as the primary adoption path; Adopt rebinds target; Switch bumps epoch; Hire replaces worker via SOP.  
2. **No Layer B in-app hire API** — workers remain Cursor Task / CLI / Antigravity under hire notes; no HUD “spawn worker” product backend this cut.  
3. **No workflow-faces-on-stage by default** — Nisha, Selvam, Anand, Divya, Deepa, Raman, Gowri, Suresh stay **workerRoles** unless a pack **explicitly** lists them in `stageVisible` (e.g. css may keep `vikram` as a deliberate security face). Do not mass-promote W6 “workflow faces as stage bodies.”  
4. **No classic / v2 fleet work** — implement and test only **:3312 / :4312 / :5312**.  
5. **No soft Switch as default** — hard remains default; soft is documented exception only.  
6. **No secrets / unbounded prompts in pack JSON** — capped addenda only (existing W2a rule).

---

## Success metrics (0.3.5 — observable)

| # | Metric | Where operator sees it |
|---|--------|------------------------|
| M1 | Pack flip changes **which characters are on stage** to match `stageVisible` | 3D Hub / FlatRoster after Session Desk select |
| M2 | Pack name / stage identity surfaces on flip | Existing pack toast (`data-testid="pack-toast"`) + updated session/stage label |
| M3 | Talk / compose target is always a `stageVisible` id (or blocked with clear UX) | Roster highlight + compose assignee |
| M4 | **Adopt** changes talk target without bumping `packEpoch` | HUD / debug strip or roster; epoch stable |
| M5 | **Switch** bumps `packEpoch` and refreshes cast + camera | Epoch indicator (if exposed) + toast + cast swap |
| M6 | **Hire** produces a hire-note / ACTIVITY row — not an extra avatar | `agents/hires/…` + ACTIVITY-LOG; stage body count unchanged |
| M7 | One decision per turn enforced | UI: single confirm; no auto-chain |
| M8 | Device Lab E2E (after code) on upgrade DEV | Realme **360×780** + desktop **1280×800** + tablet **800×1280**; Playwright **slot claim** (#15); DEV host login if auth (#18); before tag (#16) |

---

## Out of scope for this vision doc

- Architecture / store API design (Architect wave)  
- Product implementation (`src/`)  
- E2E authoring/run (Device Lab after code lands)  
- Promote Q1/Q2 (EM after DEV E2E + Reviewer GO)

---

## GO blockers (Vision → product)

| ID | Blocker | Unblocks |
|----|---------|----------|
| B1 | **Human GO** on this vision + W4 scope as **0.3.5** | Coding hires |
| B2 | **Architect** contract: apply `stageVisible` to roster/bodies/talkable; Adopt vs Switch vs Hire state machine; epoch rules for Hire | Impl lanes |
| B3 | Clarify UI surface for decision offer (Priya chip / modal / compose confirm) — one affordance | Design-lite + FE |
| B4 | css `stageVisible` includes `vikram` (workflow face) — intentional exception must stay **pack-listed only**, not a precedent to put all faces on stage | Cast / pack hygiene |
| B5 | After code: hire E2E (#14) + slot (#15) + DEV E2E before tag (#16) + Reviewer before push (#17) | Ship / promote |

**Vision verdict:** **GO-WITH-CHANGES** for docs — product coding **NO-GO** until B1 + B2.

---

## Docs #12 checklist (this turn)

- [x] This walkthrough  
- [x] Hire note `agents/hires/2026-07-15-w4-vision-0.3.5.md`  
- [x] `agents/crew-activity.md` summary row  
- [x] MyAgent ACTIVITY-LOG append (provider `cursor`)
