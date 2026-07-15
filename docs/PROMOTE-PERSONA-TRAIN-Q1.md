# Promote plan (Q1) — agentverse-upgrade 0.3.2 · persona-train W1

**Status:** PLAN ONLY — no deploy, no git tag/push, no copy to F:. Written by **Lane D** (Selvam EM + Raman field-ops) for Lead review.
**Crew personas:** `selvam` (promote-em) · `raman` (promote-field-ops) — see `docs/APP-PERSONA-CAST.md`
**Fleet:** `agentverse-upgrade` side fleet **only** — see `docs/ROADMAP-UPGRADE.md`, `agents/pre-work/waves/upgradation/…`, `docs/ACTION-PLAN-APP-PERSONAS.md` (W1)
**Read first:** `E:\MyAgent\workflow\promote\README.md` · `gates.md` · `field-lessons.md` · `E:\MyAgent\workflow\deps\DEPENDENCY-MATRIX.md`

---

## 0. Scope guard (do not confuse trains)

| Fleet | Ports | Hosts | This plan touches? |
|-------|-------|-------|---------------------|
| **agentverse-upgrade** (this train) | 3312 / **4312** / 5312 | `agentverse-upgrade[-staging].delena.buzz` | **Yes** |
| `agentverse` (classic) | 3310 / 4310 / 5310 | `agentverse[-staging].delena.buzz` | **No — must not touch** |
| `agentverse-v2` (stable-v2) | 3311 / 4311 / 5311 | `agentverse-v2[-staging].delena.buzz` | **No — must not touch** |

**MUST NOT:** bind, restart, or nginx-touch `:4310` (classic) or `:4311` (v2). Only `F:\apps\agentverse-upgrade` on **:4312** moves in this gate.

---

## 1. Candidate

| Field | Value |
|-------|-------|
| App ID | `agentverse-upgrade` |
| Candidate version | **0.3.2** |
| Branch | `feature/upgradation-functionality` |
| Precondition | **W1** operator chrome toggles (joystick/camera view show-hide) + docs land on the branch — see `docs/ACTION-PLAN-APP-PERSONAS.md` §W1. Current HEAD is pre-W1 (`ae17b39`); 0.3.2 does not exist yet. |
| Current live pin | 0.3.1 @ `v0.3.1` (`bda5a9b`) — see `workflow/deps/DEPENDENCY-MATRIX.md` |
| App git tag (target) | `v0.3.2` — cut only **after** DEV E2E green (CONSCIOUS #16) via `git-release` skill |
| Gate | **Q1** (DEV E: → PREPROD F:) |

**Do not open this gate until:**
1. W1 chrome toggle code + `docs/ACTION-PLAN-APP-PERSONAS.md` W1 checklist items are checked off and committed, **and**
2. `package.json` version bumped to `0.3.2`, **and**
3. Human GO on W0 fold is in force (already a precondition for any W1 code per the action plan).

---

## 2. Environments / hosts

| Env | Drive | Port | Host | Notes |
|-----|-------|------|------|-------|
| DEV | E: | **3312** | loopback only (no DEV subdomain registered for upgrade fleet yet — see `workflow/testing/DEV-HOST-E2E.md` table) | `npm run dev` → `next dev -H 0.0.0.0 -p 3312` |
| PREPROD (Q1 target) | F: | **4312** | `https://agentverse-upgrade-staging.delena.buzz` | `F:\apps\agentverse-upgrade` — existing side-fleet path, do not create a second root |
| PROD (Q2, out of scope this plan) | G: | 5312 | `https://agentverse-upgrade.delena.buzz` | Not touched by Q1 |

Evidence root: `H:\releases\agentverse-upgrade-0.3.2\`

---

## 3. Faster DEV loop (pre-promote, on E:)

Run these on the branch before cutting the candidate build, in order:

```powershell
cd E:\MyWorkspace\agentverse-project
git checkout feature/upgradation-functionality
npm install
npm run dev            # next dev -H 0.0.0.0 -p 3312 — manual chrome-toggle click-through
npm run typecheck      # tsc --noEmit — must be clean before E2E
```

Then, **after** a candidate build exists on staging (post Q1 build/deploy step — Ops, not this plan):

```powershell
$env:AV_E2E_BASE_URL = "https://agentverse-upgrade-staging.delena.buzz"
npm run test:e2e       # playwright test — claim slot first, see §5
```

`npm run typecheck` failing is a hard stop before any hire/E2E spend — cheaper to catch here than in Playwright.

---

## 4. Evidence pack layout (to open when the gate actually starts)

```text
H:\releases\agentverse-upgrade-0.3.2\
  DEPENDENCIES.md
  evidence\
    q1\
      SUMMARY.md
      CHECKLIST.json
      qa\
      security\
      review\
      ops\
      e2e\
```

Copy starters from `E:\MyAgent\workflow\promote\templates\` (`DEPENDENCIES.md`, `SUMMARY.md`, `CHECKLIST.json`). This plan pre-creates only the stub described in §8 — the rest is opened by the EM when the real gate runs.

---

## 5. Required crew (promote day)

| Persona | Skill | Role this gate |
|---------|-------|-----------------|
| Selvam | `promote-em` | Orchestrate; owns SUMMARY/CHECKLIST; GO/NO-GO only — never deploys |
| Divya | `promote-qa` | Smoke + regression on staging; results.md |
| Vikram | `promote-security` | CSS clientId + CSS version/tag, CORS, secrets scan |
| Deepa | `promote-review` | Diff + rule compliance; confirms `DEPENDENCIES.md` present; fleet-split check (§0) |
| Anand | `promote-ops` | Deploy **after GO only**; bind-race poll; deploy-log.md |
| Raman | `promote-field-ops` | Field lessons applied on every role (§7 below); always on |
| — | `e2e-hire` | Hires Realme/desktop/tablet Device Lab lanes (CONSCIOUS #14–16); owns Playwright slot claim/release |

Parallel where possible: QA + Security + Review + e2e-hire authoring. Ops waits for GO. Field-ops rides with QA/Ops/EM throughout, not a separate pass at the end.

---

## 6. DEV gate (CONSCIOUS #14–16) before any git tag / H: pack

1. **Hire** `e2e-hire` → spin Device Lab lanes: `e2e-realme` (**360×780**, primary), `e2e-desktop` (**1280×800**), `e2e-tablet` (**800×1280**) — presets in `workflow/devices/VIEWPORTS.md`.
2. **Claim** Playwright slot (CONSCIOUS #15) before any run:
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File E:\MyAgent\workflow\testing\scripts\claim-playwright-slot.ps1 -SessionId "<session>" -Provider cursor -AppId agentverse-upgrade -Project "all" -AgentRole e2e-lead
   ```
   Exit 2 = busy → wait, do not start a second run.
3. **Run** target: Realme E2E **green** against either
   - upgrade **staging** (`https://agentverse-upgrade-staging.delena.buzz`, `:4312`) — this is the existing default `AV_E2E_BASE_URL` in `docs/E2E.md`, **or**
   - a **DEV public host** for the upgrade fleet, **if** one exists by then (none is registered today in `workflow/testing/DEV-HOST-E2E.md` — loopback `:3312` does not satisfy #18 for login specs; add the DEV subdomain first if login E2E must gate DEV, otherwise waive per DEV-HOST-E2E.md §5 and record it).
4. **Release** the slot with result:
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File E:\MyAgent\workflow\testing\scripts\release-playwright-slot.ps1 -SessionId "<session>" -Result pass -Notes "upgrade 0.3.2 W1 chrome toggles"
   ```
5. New specs to add for W1 (chrome toggles) beyond the existing `docs/E2E.md` suite: joystick show/hide assertion, camera-view cycle assertion — author under `e2e/` per existing layout, disjoint per lane.
6. Evidence: `docs/E2E.md` updated + `H:\releases\agentverse-upgrade-0.3.2\evidence\q1\e2e\`.
7. Only **after** this is green: hire `git-release` to cut annotated tag `v0.3.2` (CONSCIOUS #16). Reviewer SIGN-OFF (#17) required before `git push`/`git push --tags`.

---

## 7. Field lessons callouts (Raman — apply, don't rediscover)

| # | Lesson | Applied how this gate |
|---|--------|------------------------|
| 1 | **Bind race** — `start.ps1` sleep ~10s can false-negative on cold Next.js start | Ops polls `LISTENING` on `:4312` for 30–60s before declaring deploy fail; check `*.out.log`/`*.err.log` + `netstat` first |
| 2 | **CF cache ≠ Zone Edit purge** | If static asset purge fails (`code: 10000`), do not block GO — rely on Next.js build-hashed asset filenames (already versioned by default) + document purge attempt/failure in `ops/deploy-log.md` |
| 3 | **Smoke the href the HTML actually loads** | QA checks `index.html`-referenced hashed JS/CSS on the public staging URL, not just `/api/health` |
| 4 | **PowerShell `$PID`/`$HOME`** | Any one-liner Ops writes for this gate uses `$procId`/`$appHome`, never `$PID`/`$HOME` |
| 5 | **ACTIVITY-LOG serialize** | Selvam (EM) owns the ACTIVITY-LOG rows for this gate, or crew appends one at a time; EM spot-checks table header after parallel crew finishes |
| 6 | **Staging hostname is part of the gate** | `https://agentverse-upgrade-staging.delena.buzz` must be live + nginx → `:4312` **and** destination-smoked on that public URL — not only `127.0.0.1:4312` |

---

## 8. Explicit stop condition

**NO Ops cutover (no bits move to F:, no nginx change, no restart of `:4312`) until:**

1. All of §5 crew have written evidence under `H:\releases\agentverse-upgrade-0.3.2\evidence\q1\`,
2. `CHECKLIST.json` — all `required` flags `true` (including `app_git_tag_recorded`, `dependency_versions_recorded`),
3. **Human / EM explicit GO** is recorded in `SUMMARY.md`.

This document does not itself constitute a GO. It is the plan Selvam/Raman hand to the Lead.

---

## 9. Dependency versions (to fill at gate-open, not now)

Per `workflow/deps/README.md` — mandatory, currently **pending** (candidate does not exist yet):

| Field | Value (fill when real) |
|-------|---------|
| App git tag | `v0.3.2` (after DEV E2E green, §6) |
| App commit | — |
| css | 0.1.0 / `v0.1.0` / `H:\releases\css-0.1.0` / clientId `agent-portal` (reused) |
| Matrix row to update after GO+deploy | `workflow/deps/DEPENDENCY-MATRIX.md` — `agentverse-upgrade` row, bump 0.3.1 → 0.3.2, new tag/commit |

---

## 10. Checklist outline (mirrors `templates/CHECKLIST.json`)

- [ ] `app_git_tag_recorded` — `v0.3.2`
- [ ] `dependency_versions_recorded` — css 0.1.0/`v0.1.0`
- [ ] `qa_smoke_pass` — health + login + core flow on staging
- [ ] `qa_regression_pass` — recommended, full suite
- [ ] `security_pass` — CSS clientId + CORS + secrets scan
- [ ] `review_pass` — diff + DEPENDENCIES.md + fleet-split (§0)
- [ ] `ports_compliant` — `:4312` only, registry unchanged (already `active`)
- [ ] `db_schema_compliant` — n/a unless Postgres wired for this app
- [ ] `css_client_registered` — reuse `agent-portal` clientId, confirmed live
- [ ] `evidence_complete` — all role folders populated
- [ ] `dependency_matrix_updated` — set true only after GO + deploy
- [ ] E2E hired + green (§6) — Realme primary, desktop/tablet, noted in SUMMARY

`decision` stays `PENDING` until EM sets GO/NO-GO per §8.

---

## References

- `docs/ROADMAP-UPGRADE.md` · `docs/PROMOTE-0.3.1.md` · `docs/PROMOTE-UPGRADATION.md` (prior-gate style)
- `docs/E2E.md` · `docs/ACTION-PLAN-APP-PERSONAS.md` (W1) · `docs/APP-PERSONA-CAST.md`
- `E:\MyAgent\workflow\promote\README.md` / `gates.md` / `field-lessons.md` / `evidence-pack.md`
- `E:\MyAgent\workflow\deps\DEPENDENCY-MATRIX.md`
- `E:\MyAgent\workflow\testing\E2E-HIRE.md` / `PLAYWRIGHT-SLOT.md` / `DEV-HOST-E2E.md`
- `E:\MyAgent\workflow\ports\REGISTRY.md` (PREPROD `:4312` row)
