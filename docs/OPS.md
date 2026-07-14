# AgentVerse â€” Ops

Two **parallel fleets** share CSS/portal but never share ports or app paths. Deploying stable-v2 must **not** recycle classic `:4310` / `:5310`.

---

## Environment map (both fleets)

### Classic AgentVerse (DO NOT DISTURB)

| Env | Drive / path | Port | URL | Portal API | CSS |
|-----|--------------|------|-----|------------|-----|
| DEV | `E:\MyWorkspace\agentverse-project` (main / classic tags) | **3310** | http://127.0.0.1:3310 | `:8080` | `:9000` |
| PREPROD | `F:\apps\agentverse` | **4310** | https://agentverse-staging.delena.buzz | `:4080` | `:5900` (`https://css.delena.buzz`) |
| PROD | `G:\apps\agentverse` | **5310** | https://agentverse.delena.buzz | `:5080` | `:5900` (`https://css.delena.buzz`) |

| Piece | Value |
|-------|--------|
| PROD tag | `v0.2.2-stable` |
| PREPROD tag | `v0.3.15-unstable` (full office / PREPROD experiments) |
| Start PREPROD | `F:\apps\agentverse\start.ps1 -EnvName preprod` |
| Start PROD | `G:\apps\agentverse\start.ps1 -EnvName prod` |

Leave this fleet running when promoting or smoking **agentverse-v2**.

### AgentVerse stable-v2 (this branch — 0.4.2)

| Env | Drive / path | Port | URL | Portal API | CSS |
|-----|--------------|------|-----|------------|-----|
| DEV | `E:\MyWorkspace\agentverse-project` (`feature/stable-v2`) | **3311** | http://127.0.0.1:3311 | `:8080` | `:9000` |
| PREPROD | `F:\apps\agentverse-v2` | **4311** | https://agentverse-v2-staging.delena.buzz | `:4080` | `:5900` |
| PROD | `G:\apps\agentverse-v2` | **5311** | https://agentverse-v2.delena.buzz | `:5080` | `:5900` |

| Piece | Value |
|-------|--------|
| Version | **0.4.2** |
| Branch | `feature/stable-v2` (based on `v0.2.2-stable`) |
| Package / ship name | `agentverse-v2` |
| CSS clientId | `agent-portal` (same as classic) |
| Bypass (no DNS) | http://103.118.183.185:4311 · http://103.118.183.185:5311 |
| Start PREPROD | `F:\apps\agentverse-v2\start.ps1 -EnvName preprod` |
| Start PROD | `G:\apps\agentverse-v2\start.ps1 -EnvName prod` |
| Launcher source | `scripts/start-release.ps1` → copied as `start.ps1` on F:/G: (`PORT` 3311 / 4311 / 5311) |

**Features (v2):** bright industrial open-plan office — white/blue industrial floor, exposed ceiling (`IndustrialCeiling`), teal desks / black chairs, perimeter `OfficeStorage`. Still bright day lighting (`toneMappingExposure` ≈ 1.32) + PREPROD-style camera angles / first-person + TopBar **Joystick** / **Views** toggles. Chat does **not** auto-open on select/summon (Talk / command strip / Comms only — PREPROD-matched). Persist key `agentverse-office-v2-stable`.

> **Never** stop, recycle, or bind classic **:4310** / **:5310** when deploying or restarting agentverse-v2. Use **:4311** / **:5311** and paths `F:\apps\agentverse-v2` / `G:\apps\agentverse-v2` only.

---

## PREPROD (stable-v2)

- Path: `F:\apps\agentverse-v2`
- Start: `F:\apps\agentverse-v2\start.ps1 -EnvName preprod` â†’ listens **4311**
- Public: https://agentverse-v2-staging.delena.buzz
- Bypass: http://103.118.183.185:4311
- Portal / CSS: `:4080` / `:5900` (`https://css.delena.buzz`)
- Auth: CSS clientId `agent-portal` (shared with classic)
- Health: `GET /health` on :4311 or via public host
- **Login:** staging CSS admin password (`G:\apps\css\.env` â†’ `CSS_ADMIN_PASSWORD`). DEV `admin`/`admin123` returns **401** on staging.

## PROD (stable-v2)

- Path: `G:\apps\agentverse-v2`
- Start: `G:\apps\agentverse-v2\start.ps1 -EnvName prod` â†’ listens **5311**
- Public: https://agentverse-v2.delena.buzz
- Bypass: http://103.118.183.185:5311
- Portal / CSS: `:5080` / `:5900`
- Auth: same `agent-portal` clientId + CSS admin password (not DEV credentials)

## Classic PREPROD / PROD (reference only)

- `F:\apps\agentverse` :4310 Â· https://agentverse-staging.delena.buzz Â· tag `v0.3.15-unstable`
- `G:\apps\agentverse` :5310 Â· https://agentverse.delena.buzz Â· tag `v0.2.2-stable`
- Do not use these paths/ports for 0.4.0 side deploy.

## Health

`GET /health` â€” process up. Authenticated smoke uses `/api/css` + `/api/portal` proxies against the envâ€™s portal/CSS ports above.

## Camera + HUD toggles (0.4.0 stable-v2)

- Default mood: **day**; canvas `toneMappingExposure` â‰ˆ **1.32** (bright office).
- Open top chrome â†’ **Joystick** / **Views** toggle on-screen stick and angle picker (persisted).
- Angle bar (when Views on): Front/Back/East/West + diagonals + body shots + **Walk**.
- Authenticated: **Walk** / **Overview** (TopBar) or **FP** / **Orbit** (command strip) flips first-person vs orbit.
- Persist key: `agentverse-office-v2-stable` (cameraMode, orbitShot, joystickVisible, cameraViewsVisible, officeMood, â€¦).
- Chat panel does **not** open on persona select/summon (PREPROD-matched); open only via **Talk**, command strip, CommsDock, or explicit `openChat`.

## Sessions (Session Desk)

In-app **Sessions** (command strip / top chrome) lists portal sessions:

- **Active / Archived** filters
- **New** â€” create session on a workspace path
- **Open** â€” load into tabs + chat
- **Archive / Restore** â€” `POST /api/portal/sessions/{id}/archive|unarchive`

Config:

- `NEXT_PUBLIC_DEFAULT_WORKSPACE` â€” default path/name (e.g. `demo`)
- `NEXT_PUBLIC_WORKSPACE_ALLOWLIST` â€” optional comma-separated paths for quick-picks; empty = unrestricted (portal root still applies)

## DEV env discipline (do not mix)

| Piece | DEV (E:) | PREPROD/PROD |
|-------|----------|--------------|
| CSS | `:9000`, issuer `http://localhost:9000` | `:5900` / `https://css.delena.buzz` |
| Portal | `:8080` | `:4080` / `:5080` |
| AgentVerse `.env.local` | `CSS_AUTH_URL=http://127.0.0.1:9000`, `NEXT_PUBLIC_CSS_ISSUER=http://localhost:9000` | set by `start.ps1` |
| UI port (stable-v2) | **3311** | **4311** / **5311** |
| UI port (classic) | **3310** | **4310** / **5310** |

Never load a mixed `.env` that sets `CSS_AUTH_URL=https://delena.buzz` (or css.delena.buzz) into DEV portal â€” AgentVerse will reject tokens as incompatible JWT (`iss` vs `authUrl`).

## Cloudflare (Ops) â€” stable-v2 DNS

```powershell
cd E:\MyWorkspace\agent-portal
.\scripts\cloudflare-dns.ps1 -Upsert -Name agentverse-v2-staging -Type A -Content 103.118.183.185 -Proxied
.\scripts\cloudflare-dns.ps1 -Upsert -Name agentverse-v2 -Type A -Content 103.118.183.185 -Proxied
```

Classic hosts (leave alone unless intentionally changing classic DNS):

```powershell
.\scripts\cloudflare-dns.ps1 -Upsert -Name agentverse-staging -Type A -Content 103.118.183.185 -Proxied
.\scripts\cloudflare-dns.ps1 -Upsert -Name agentverse -Type A -Content 103.118.183.185 -Proxied
```

Token: Account API token in `.env` / `E:\MyAgent\workflow\secrets\cloudflare.token` (gitignored). See `.cursor/rules/promote-dns-cloudflare.mdc`.

## Version trail

| Version | Notes |
|---------|--------|
| **0.4.2** | Bright industrial office prototype: white/blue industrial floor, exposed ceiling, teal desks, black chairs, `OfficeStorage`; palette SoT `office-palette.ts` |
| **0.4.1** | Chat does not auto-open on select/summon (Talk/Comms only; PREPROD-matched) |
| **0.4.0** | `feature/stable-v2` side deploy. Siruseri 0.2.2-stable base + bright day office + OrbitShot / FP / ViewAngles + TopBar Joystick/Views. Ports **3311/4311/5311**, paths `agentverse-v2`. Persist `agentverse-office-v2-stable`. |
| 0.2.2 | Classic PROD tag `v0.2.2-stable` on :5310 (`G:\apps\agentverse`). Do not overwrite with v2. |
| 0.3.15 | Classic PREPROD full-office unstable on :4310 (`F:\apps\agentverse`). Do not overwrite with v2. |
