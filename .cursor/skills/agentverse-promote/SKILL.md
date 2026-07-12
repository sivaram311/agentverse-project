---
name: agentverse-promote
description: >-
  Promote AgentVerse DEV→PREPROD→PROD using MyAgent evidence packs, Cloudflare
  DNS, and F:/G: drive layout. Use when the user asks to promote, ship, qualify,
  or deploy AgentVerse to staging or production.
---

# AgentVerse promote

## Read first

1. `E:\MyAgent\workflow\promote\README.md` + `gates.md` + `evidence-pack.md`
2. `E:\MyAgent\.cursor\skills\promote-em\SKILL.md` (orchestrate GO/NO-GO)
3. Project `docs/OPS.md` and `.cursor/rules/promote-dns-cloudflare.mdc`

## Env matrix

| Env | Drive | Port | URL | Portal | CSS |
|-----|-------|------|-----|--------|-----|
| DEV | E:\MyWorkspace\agentverse-project | 3310 | http://127.0.0.1:3310 | :8080 | :9000 |
| PREPROD | F:\apps\agentverse | 4310 | https://agentverse-staging.delena.buzz | :4080 | :5900 |
| PROD | G:\apps\agentverse | 5310 | https://agentverse.delena.buzz | :5080 | :5900 |

## Flow

1. Bump `package.json` version; `npm run build`.
2. Pack `H:\releases\agentverse-<ver>\` (`app\`, `start.ps1`, `VERSION`, evidence folders).
3. Q1: QA smoke (prefer release artifact), security, review → EM **GO** → Ops to `F:` → DNS staging → destination smoke.
4. Q2: PREPROD regression + Q1 present → EM **GO** → `deploy-prod-app.ps1` dry-run then `-Execute` → start `-EnvName prod` → public smoke.
5. Log `agents/crew-activity.md` + `E:\MyAgent\workflow\activity\ACTIVITY-LOG.md`.

## Smoke notes

- DEV CSS: `admin` / `admin123`.
- PREPROD/PROD CSS: password from `G:\apps\css\.env` (`CSS_ADMIN_PASSWORD`) — never commit.
- Markers: e.g. `Q1_PREPROD_OK_*`, `Q2_PROD_OK_*`.
- Do **not** run `next build` while `next dev` is using the same `.next` (chunk corruption).

## Forbidden

- Ops deploy before CHECKLIST `decision: GO`
- Leaving Cloudflare DNS pending
- Secrets in evidence or git
