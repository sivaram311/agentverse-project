# App persona cast — stable names (AgentVerse stage + worker ids)

**Status:** DRAFT with ACTION-PLAN · 2026-07-15  
**Companion:** [ACTION-PLAN-APP-PERSONAS.md](./ACTION-PLAN-APP-PERSONAS.md)

Persona **ids** are stable. Display **name/role/prompt** may overlay per `packs/<appId>.json`.

## Always on

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
| `kabilan` / `nisha` | `workflow/testing/E2E-HIRE.md` · Playwright slot |
| `selvam` | `promote-em` |
| `anand` | `promote-ops` |
| `divya` | `promote-qa` |
| `vikram` | `promote-security` |
| `deepa` | `promote-review` · `workflow/review/` (#17) |
| `raman` | `promote-field-ops` · `field-lessons.md` |
| `gowri` | CONSCIOUS #12 docs |
| `suresh` | `git-release` · `GIT-RELEASE-MANAGEMENT.md` |
| `rajesh` | Crew Lead / hire — `machine-docs/personas` |
| `helpdesk` | Generalist router — no promote authority |
