# AgentVerse E2E (Playwright)

Realme P2 Pro viewport (**360×780**) against the **upgrade** fleet. Infrastructure only lives in this doc + `playwright.config.ts` / `e2e/`; product specs are under `e2e/*.spec.ts`.

## Quick start

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

UI mode:

```bash
npm run test:e2e:ui
```

## Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `AV_E2E_BASE_URL` | No | Target origin. Default: `https://agentverse-upgrade-staging.delena.buzz` (upgrade staging, origin **:4312**) |
| `AV_E2E_USER` | No | CSS login user for optional auth specs |
| `AV_E2E_PASSWORD` | No | CSS login password for optional auth specs |

**Never commit secrets.** Pass credentials via shell env or a local untracked file (e.g. `.env*.local` is gitignored). Auth specs must skip when `AV_E2E_USER` / `AV_E2E_PASSWORD` are unset.

PowerShell example:

```powershell
$env:AV_E2E_BASE_URL = "https://agentverse-upgrade-staging.delena.buzz"
# optional:
# $env:AV_E2E_USER = "…"
# $env:AV_E2E_PASSWORD = "…"
npm run test:e2e
```

## Layout

| Path | Role |
|------|------|
| `playwright.config.ts` | baseURL, viewport, retries, screenshots |
| `e2e/helpers.ts` | `baseURL()`, `isUpgradeHost()`, soft helpers |
| `e2e/*.spec.ts` | Suite (SPECS lane) |
| `e2e-artifacts/` | Failure screenshots / HTML report (gitignored) |

## Specs (Lane E2E-SPECS)

| Spec | Asserts |
|------|---------|
| `health.spec.ts` | `/health` → status ok + service agentverse; prefer `version` **0.3.1** (else attach note, still pass) |
| `shell.spec.ts` | `/` → AgentVerse / Digital office / login UI within 30s (no WebGL) |
| `desk-deeplink.spec.ts` | `/desk?intent=session-desk` → Session Desk **or** login; not bare 500 |
| `hire-brief.spec.ts` | hire+brief deeplink → Brief/incident **or** login |
| `auth.spec.ts` | skipped unless `AV_E2E_PASSWORD`; login then Sessions / Session Desk |
| `smoke.spec.ts` | Scaffold: upgrade baseURL + `/` not 5xx |

### Selector caveats

- Login CTA is **Join lobby**; heading **Enter the hub** (ChatPanel may still say “Sign in”).
- Incident strip: `role=region` name **Incident brief** + strong **Brief**.
- Unauthenticated deep-links showing only login are **PASS** for desk/hire specs.

## Defaults

- Browser: **Chromium** only  
- Viewport: **360×780**  
- Timeout: **60s**; expect **30s**; retries **1** when `CI` is set  
- Do not use classic `:5310` / v2 `:4311` as SoT for this phase  

See also: `agents/pre-work/waves/upgradation/E2E-PHASE.md`.
