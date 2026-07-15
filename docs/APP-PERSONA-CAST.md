# App persona cast — stable names (AgentVerse stage + worker ids)

**Status:** W0 GO · cast policy **0.3.6** (shared anchors + pack specialists) · 2026-07-15  
**Companion:** [ACTION-PLAN-APP-PERSONAS.md](./ACTION-PLAN-APP-PERSONAS.md) · stage map [APP-SESSIONS.md](./APP-SESSIONS.md)

Persona **ids** are stable. Display **name/role/prompt** may overlay per `packs/<appId>.json`.

## Stage policy (Grok + human GO 2026-07-15)

| Rule | What |
|------|------|
| **MUST shared** | `helpdesk` (Priya), `rajesh` (Lead) on every work-plane stage |
| **SHOULD diverge** | 2–4 specialists per pack so Switch changes the floor (see APP-SESSIONS) |
| **NEVER on stage by default** | Workflow faces (`selvam`, `anand`, `vikram`, …) until they have catalog bodies |
| **NEVER** | Per-app Priyas / unique Help Desks |

## Always on (anchors)

| id | Name | Default role | Layer |
|----|------|--------------|-------|
| `helpdesk` | Priya | Help Desk / Generalist | Stage + talk |
| `rajesh` | Rajesh | Orchestrator / Crew Lead | Stage + hire Lead |
| `meenakshi` | Meenakshi | Companion | Stage |

## Build cast

| id | Name | Default role | Layer |
|----|------|--------------|-------|
| `karthik` | Karthik | Research | Stage / workers |
| `lavanya` | Lavanya | Creative / design | Stage / workers |
| `aravind` | Aravind | Coder (stack plugin per pack) | Stage / workers |
| `muthu` | Muthu | Project Manager | Stage / workers |
| `kabilan` | Kabilan | Device Lab QA (Realme lead) | Stage / E2E workers |

## Workflow faces

| id | Name | Default role | Machine SoT |
|----|------|--------------|-------------|
| `nisha` | Nisha | E2E desktop/tablet lanes | `workflow/testing/E2E-HIRE.md` |
| `selvam` | Selvam | Promote EM | `promote-em` |
| `anand` | Anand | Promote Ops | `promote-ops` |
| `divya` | Divya | Promote QA | `promote-qa` |
| `vikram` | Vikram | Promote Security | `promote-security` |
| `deepa` | Deepa | Git / promote review | `promote-review` + #17 |
| `raman` | Raman | Field ops | `promote-field-ops` (always on promote) |
| `gowri` | Gowri | Docs Keeper | CONSCIOUS #12 |
| `suresh` | Suresh | Git release / tags | `git-release` |

## Cast id → MyAgent skill / SoT (W0)

| id | Skill / SoT |
|----|-------------|
| `meenakshi` | Companion — stage presence / continuity; no promote or gate authority · cast catalog |
| `karthik` | Research — Layer B research workers · `E:\machine-docs\personas\` pre-work vision |
| `lavanya` | Creative / design · `E:\machine-docs\personas\web-app-standards.md` (+ design-system pre-work) |
| `aravind` | Coder — implement after pre-work GO · stack from active pack |
| `muthu` | Project Manager — parallel hire ownership · `agents/hires/_TEMPLATE-parallel-workers.md` |
| `kabilan` / `nisha` | `workflow/testing/E2E-HIRE.md` · Playwright slot (#15) · devices Realme 360×780 |
| `selvam` | `promote-em` |
| `anand` | `promote-ops` |
| `divya` | `promote-qa` |
| `vikram` | `promote-security` |
| `deepa` | `promote-review` · `workflow/review/` (#17) |
| `raman` | `promote-field-ops` · `workflow/promote/field-lessons.md` |
| `gowri` | CONSCIOUS #12 docs |
| `suresh` | `git-release` · `GIT-RELEASE-MANAGEMENT.md` |
| `rajesh` | Crew Lead / hire — `E:\machine-docs\personas\` |
| `helpdesk` | Generalist router — no promote authority |
