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

Staging full suite only:

```bash
npx playwright test --project=chromium
```

Upgrade PROD smoke (`health` + `shell` only):

```bash
npx playwright test --project=upgrade-prod
```

## Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `AV_E2E_BASE_URL` | No | Staging origin for default `chromium` project. Default: `https://agentverse-upgrade-staging.delena.buzz` (origin **:4312**) |
| `AV_E2E_PROD_BASE_URL` | No | Prod origin for `upgrade-prod` project. Default: `https://agentverse-upgrade.delena.buzz` |
| `AV_E2E_USER` | No | CSS login user (defaults to `admin` when only password is set) |
| `AV_E2E_PASSWORD` | No | CSS login password for optional auth / logged-in desk specs |
| `PD_E2E_BASE` | No | ProdDeck Home origin for dispatch-path. Default: `https://home-staging.delena.buzz` |

**Never commit secrets.** Pass credentials via shell env or a local untracked file (e.g. `.env*.local` is gitignored). Auth / logged-in desk specs **skip** when `AV_E2E_PASSWORD` is unset.

PowerShell example:

```powershell
$env:AV_E2E_BASE_URL = "https://agentverse-upgrade-staging.delena.buzz"
# optional (Lead re-runs with CSS password):
# $env:AV_E2E_USER = "…"
# $env:AV_E2E_PASSWORD = "…"
npm run test:e2e
```

## Dual projects

| Project | baseURL | Specs |
|---------|---------|-------|
| `chromium` (default) | upgrade **staging** | Full `e2e/` suite |
| `upgrade-prod` | upgrade **PROD** (`agentverse-upgrade.delena.buzz`) | **Only** `health.spec.ts` + `shell.spec.ts` |

## Layout

| Path | Role |
|------|------|
| `playwright.config.ts` | baseURL, dual projects, viewport, retries, screenshots |
| `e2e/helpers.ts` | `baseURL()`, `loginViaJoinLobby()`, `buildDispatchDeskUrl()`, soft helpers |
| `e2e/*.spec.ts` | Suite (closeout Lane B) |
| `e2e-artifacts/` | Failure screenshots / HTML report (gitignored) |

## Specs (Lane E2E / closeout B)

| Spec | Asserts |
|------|---------|
| `health.spec.ts` | `/health` → status ok + service agentverse; prefer `version` **0.3.1** (else attach note, still pass). Also run on `upgrade-prod`. |
| `shell.spec.ts` | `/` → **Enter the hub** / **Join lobby** / **Sessions** / brand **AgentVerse** (not aria-hidden hero “Digital office”). Also run on `upgrade-prod`. |
| `desk-deeplink.spec.ts` | `/desk?intent=session-desk` → Session Desk **or** login; not bare 500 |
| `hire-brief.spec.ts` | hire+brief deeplink → Brief/incident **or** login |
| `auth.spec.ts` | skipped unless `AV_E2E_PASSWORD`; Join lobby (`#av-username` / `#av-password`) → Sessions / Session Desk |
| `session-desk-logged-in.spec.ts` | skipped unless password; login → Sessions → `#session-desk-query` / Search + Active/Archived; New/Refresh if no Cancel run |
| `flat-roster.spec.ts` | Soft: `.flat-roster` / “Open Session Desk” **or** annotate WebGL healthy — never fail solely because WebGL works; optional stylesheet not 500 |
| `dispatch-path.spec.ts` | `GET home-staging/api/pack` → `0.8.x`; staging `/health` → `0.3.1`; `buildDispatchDeskUrl` includes `agentverse-upgrade-staging`; optional desk land (login or desk); Home UI Dispatch click soft |
| `smoke.spec.ts` | Scaffold: upgrade baseURL + `/` not 5xx |

### Selector caveats

- Login CTA is **Join lobby**; heading **Enter the hub** (ChatPanel may still say “Sign in”).
- Do **not** assert visibility of `.hero-copy h1` (“Digital office”) — it is `aria-hidden`.
- `loginViaJoinLobby` waits for `/api/css/auth/login` **200**, overlay dismiss, closes chat if PWA restore opened it, then **Sessions** (CommandStrip; TopBar needs office chrome open).
- Session Desk search: `#session-desk-query` or placeholder **Search…**
- Cancel run appears only for busy sessions — assert **Create session** / **Refresh sessions** (aria-labels; visible text New/Refresh) when absent.
- Incident strip: `role=region` name **Incident brief** + strong **Brief**.
- Unauthenticated deep-links showing only login are **PASS** for desk/hire/dispatch land.
- FlatRoster is WebGL-fallback UI only; healthy WebGL is a soft pass with annotation.

## Defaults

- Browser: **Chromium** only  
- Viewport: **360×780**  
- Timeout: **90s**; expect **30s**; `workers: 2`; retries **1** when `CI` is set  
- Do not use classic `:5310` / v2 `:4311` as SoT for this phase  

See also: `agents/pre-work/waves/upgradation/E2E-PHASE.md`, `docs/CLOSEOUT-PENDING.md`.
