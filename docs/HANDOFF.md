# AgentVerse â€” Handoff (continue from here)

**When:** 2026-07-14  
**Branch:** `feature/stable-v2` Â· **Version:** **0.4.3**  
**Scope:** Docs + side-deploy package for **agentverse-v2** (parallel to classic). Do **not** touch F:/G: classic apps unless explicitly asked.

## Whatâ€™s this branch

- Based on **`v0.2.2-stable`** Siruseri office, now a **bright industrial open-plan prototype** (0.4.3): white/blue industrial floor and walls, exposed ceiling beams/ducts (`IndustrialCeiling`), teal desk tops with black mesh chairs, perimeter lockers/cabinets/whiteboards (`OfficeStorage`), shared colors in `office-palette.ts`, composed from `HubScene`.
- Adds PREPROD-style camera framing / first-person + TopBar **Joystick** / **Views** toggles, bright day office.
- Chat panel stays closed on persona select/summon; open only via Talk / command strip / CommsDock / `openChat` (PREPROD-matched).
- Ships as **agentverse-v2** on ports **3311 / 4311 / 5311**.

## Whatâ€™s live (classic â€” DO NOT DISTURB)

| Env | Port | Path | Host / tag |
|-----|------|------|------------|
| PREPROD | **4310** | `F:\apps\agentverse` | agentverse-staging.delena.buzz Â· `v0.3.15-unstable` |
| PROD | **5310** | `G:\apps\agentverse` | agentverse.delena.buzz Â· `v0.2.2-stable` |

Never recycle `:4310` / `:5310` when deploying v2.

## Whatâ€™s next for stable-v2 (0.4.3)

| Env | Port | Path | Host |
|-----|------|------|------|
| DEV | **3311** | this repo | http://127.0.0.1:3311 |
| PREPROD | **4311** | `F:\apps\agentverse-v2` | https://agentverse-v2-staging.delena.buzz Â· bypass `:4311` |
| PROD | **5311** | `G:\apps\agentverse-v2` | https://agentverse-v2.delena.buzz Â· bypass `:5311` |

- Start: `F:\apps\agentverse-v2\start.ps1 -EnvName preprod` / `G:\apps\agentverse-v2\start.ps1 -EnvName prod`
- Launcher: `scripts/start-release.ps1` (ports already 3311/4311/5311)
- Auth: same CSS clientId `agent-portal`; portal `:4080`/`:5080`, CSS `:5900`
- Ops detail: [OPS.md](./OPS.md)

## Ops warning

Side deploy only â€” pack/release to **agentverse-v2** paths. Classic fleet stays up.

## Docs touchpoints

- [OPS.md](./OPS.md) â€” both fleets, DNS, camera, Session Desk
- [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md) â€” Stable-v2 (0.4.3) + industrial office composition + Session Desk
- [README.md](../README.md) â€” fleet ports/URLs
