# Promote playbook — Upgradation 0.3.0

## Gate

| Gate | Action | Blocker |
|------|--------|---------|
| DEV | `npm run typecheck` + smoke `:3310` | none |
| **Q1** | User GO → F:`apps\agentverse` `:4310` | Evidence `H:\releases\agentverse-0.3.0\evidence\q1\` |
| **Q2** | User GO → G:`apps\agentverse` `:5310` | Evidence `...\evidence\q2\` |

## Mandatory crew

`promote-em` · `promote-qa` · `promote-security` · `promote-review` · `promote-ops` · **`promote-field-ops`**

## Non-negotiables

- Do **not** touch AgentVerse-v2 `:4311/:5311`, ProdDeck, portal, CSS.
- Bake `NEXT_PUBLIC_CSS_ISSUER=https://css.delena.buzz` on PREPROD/PROD builds.
- Cloudflare hosts unchanged: `agentverse-staging` / `agentverse`.
- Other apps health OK after cutover.

## Smoke checklist

1. `/health`
2. CSS login (staging/prod password)
3. Session Desk search + cancel (if busy session)
4. Deep-link: `/desk?intent=hire&crew=rajesh&brief=test&return=https://home-staging.delena.buzz`
5. Quest appears with session id after prompt
6. JWT catalog / portal chat poll

## Status

**Awaiting explicit user Q1 / Q2 GO.** Pack scaffolding under `H:\releases\agentverse-0.3.0\` when promote starts.
