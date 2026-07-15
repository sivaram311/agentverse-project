# W7 Gates glue — promote / E2E persona → evidence map (prep only)

**Status:** **DOCS PREP ONLY** — not a promote · **not authorized for Q1**  
**Upgrade id (candidate):** `agentverse-upgrade-0.3.5`  
**Branch:** `feature/upgradation-functionality`  
**Fleet:** `agentverse-upgrade` **3312 / 4312 / 5312** only (classic `:3310/:4310/:5310` and v2 `:3311/:4311/:5311` — **do not touch**)  
**Live pin today:** **0.3.4** @ `v0.3.4` (`dac2e60`) — F:`:4312` + G:`:5312`  
**Hire note:** [`agents/hires/2026-07-15-w7-gates-prep.md`](../agents/hires/2026-07-15-w7-gates-prep.md)  
**Cast SoT:** [`docs/APP-PERSONA-CAST.md`](./APP-PERSONA-CAST.md)

---

## Gate statement (non-negotiable)

| Item | Value |
|------|--------|
| This document | Checklist + persona → evidence path map only |
| EM GO invented? | **No** — decision stays blank / PENDING |
| Ops hire? | **No** |
| Tag / push / F: or G: deploy? | **Forbidden in this hire** |
| When may Q1 open? | Only after **human GO** + **Selvam (EM) GO** recorded in a future gate SUMMARY — **this W7 prep hire does NOT authorize Q1** |

---

## 0. Scope guard

| Fleet | Ports | This prep |
|-------|-------|-----------|
| **agentverse-upgrade** | 3312 / 4312 / 5312 | Yes (docs only) |
| classic `agentverse` | 3310 / 4310 / 5310 | No |
| `agentverse-v2` | 3311 / 4311 / 5311 | No |

Evidence root (open only when a real gate starts — **not now**):

```text
H:\releases\agentverse-upgrade-0.3.5\
  DEPENDENCIES.md
  evidence\
    q1\          ← Q1 DEV→PREPROD (after human + EM GO)
      SUMMARY.md
      CHECKLIST.json
      qa\
      security\
      review\
      ops\       ← Ops writes only after GO
      e2e\
    review\      ← optional pre-push Reviewer pack (#17), before tag push
```

Prior closed packs (reference only): `H:\releases\agentverse-upgrade-0.3.2\` … `0.3.4\`.

---

## 1. Persona → skill → evidence folder map

Upgrade id: **`agentverse-upgrade-0.3.5`**. Paths are under `H:\releases\agentverse-upgrade-0.3.5\evidence\`.

### E2E (CONSCIOUS #14–#16, #18)

| Persona id | Display | Skill / lane | Viewport | Evidence folder |
|------------|---------|--------------|----------|-----------------|
| `kabilan` | Kabilan | Device Lab lead · `e2e-realme` | **360×780** (primary) | `q1\e2e\` (Realme results + notes) |
| `nisha` | Nisha | `e2e-desktop` / `e2e-tablet` | **1280×800** / **800×1280** | `q1\e2e\` (desktop + tablet) |
| — | (slot scripts) | Playwright claim/release (#15) | — | Note session id + claim/release in `q1\e2e\` + ACTIVITY-LOG |
| `aravind` | Aravind | E2E author (specs only; no promote) | — | App `e2e/` + cite paths from `q1\e2e\` |

Also update app `docs/E2E.md` when runs land (CONSCIOUS #12). SoT: `E:\MyAgent\workflow\testing\E2E-HIRE.md`, `PLAYWRIGHT-SLOT.md`, `DEV-HOST-E2E.md`.

**#18 DEV host:** Upgrade fleet has **no** DEV public subdomain in `DEV-HOST-E2E.md` today. Login E2E: prefer registering a DEV host first; otherwise loopback `:3312` alone does **not** satisfy #18 — record waiver per DEV-HOST-E2E §5 under `q1\e2e\`. Staging `https://agentverse-upgrade-staging.delena.buzz` is for post-deploy destination smoke, not the first DEV green.

### Promote crew (Q1 day — after GO only)

| Persona id | Display | Skill | Evidence folder / artifact |
|------------|---------|-------|----------------------------|
| `selvam` | Selvam | `promote-em` | `q1\SUMMARY.md`, `q1\CHECKLIST.json` (GO/NO-GO owner — **not set by this prep**) |
| `divya` | Divya | `promote-qa` | `q1\qa\` |
| `vikram` | Vikram | `promote-security` | `q1\security\` |
| `deepa` | Deepa | `promote-review` + Reviewer #17 | `q1\review\` and/or `evidence\review\` (SIGN-OFF before push) |
| `anand` | Anand | `promote-ops` | `q1\ops\` — **only after EM GO**; **not hired in W7 prep** |
| `raman` | Raman | `promote-field-ops` | Lessons applied in each role folder; rides QA/Ops/EM |
| `suresh` | Suresh | `git-release` | Tag only after DEV E2E green (#16); push only after Reviewer GO (#17) |
| `gowri` | Gowri | Docs (#12) | App OPS/HANDOFF sync — not an H: promote folder |

Release root: `H:\releases\agentverse-upgrade-0.3.5\DEPENDENCIES.md` (EM + Security CSS row).

---

## 2. CONSCIOUS checklist (#13–#18) — for the future Q1

Do **not** tick these as done in this prep. They are the bar when the train actually opens.

| # | Gate | Owner | Prep note / evidence path |
|---|------|-------|---------------------------|
| **#14** | E2E hire mandatory | Kabilan + Nisha (+ Aravind author) | Hire Device Lab lanes → results in `…\evidence\q1\e2e\` |
| **#15** | Playwright slot claim → run → release | E2E lead | One machine slot; exit 2 = wait; log claim in `q1\e2e\` |
| **#16** | DEV E2E before tag | Kabilan lead → then Suresh | No `v0.3.5` / H: pack until DEV Device Lab green |
| **#17** | Reviewer before push | Deepa | SIGN-OFF GO in review evidence before `git push` / tag push |
| **#18** | DEV host for login E2E | E2E + Docs | Public DEV hostname when present; else documented waiver in `q1\e2e\` |
| **#13** | Deps matrix | Selvam (+ Vikram CSS) | `DEPENDENCIES.md` + CHECKLIST flags; after GO+deploy update `E:\MyAgent\workflow\deps\DEPENDENCY-MATRIX.md` |

Templates: `E:\MyAgent\workflow\promote\templates\` (`SUMMARY.md`, `CHECKLIST.json`, `DEPENDENCIES.md`).

### Checklist outline (mirrors promote CHECKLIST — leave PENDING)

- [ ] `app_git_tag_recorded` — target `v0.3.5` (not cut in this hire)
- [ ] `dependency_versions_recorded` — css **0.1.0** / `v0.1.0` / `H:\releases\css-0.1.0` / clientId `agent-portal` (reuse)
- [ ] `qa_smoke_pass` / `qa_regression_pass`
- [ ] `security_pass` / `review_pass`
- [ ] `ports_compliant` — **:4312** only for Q1 target
- [ ] `css_client_registered`
- [ ] `evidence_complete`
- [ ] E2E hired + green (#14–#16, #18)
- [ ] Reviewer SIGN-OFF before push (#17)
- [ ] `dependency_matrix_updated` — only after GO + deploy

**`decision`:** must remain **unset / PENDING** until human + EM GO. **This hire does not set GO.**

---

## 3. What this hire may / may not do

| Allowed now | Forbidden now |
|-------------|----------------|
| Edit this doc + W7 hire note | Invent EM or human GO |
| Map personas → `H:\releases\agentverse-upgrade-0.3.5\evidence\…` | Open Ops hire / deploy F: or G: |
| ACTIVITY-LOG prep row | `git tag`, `git push`, edit `src/` |
| Point crew at #13–#18 | Touch classic/v2 fleets or ports outside 3312/4312/5312 |

---

## References

- Hire: `agents/hires/2026-07-15-w7-gates-prep.md`
- Cast: `docs/APP-PERSONA-CAST.md` · Action plan W7: `docs/ACTION-PLAN-APP-PERSONAS.md`
- Promote SoT: `E:\MyAgent\workflow\promote\` (README, gates, evidence-pack, field-lessons)
- Deps: `E:\MyAgent\workflow\deps\DEPENDENCY-MATRIX.md`
- E2E: `E:\MyAgent\workflow\testing\E2E-HIRE.md` · `PLAYWRIGHT-SLOT.md` · `DEV-HOST-E2E.md`
- Reviewer: `E:\MyAgent\workflow\review\REVIEWER-SIGNOFF.md`
