# AgentVerse — Ops (upgradation side fleet)

**Branch:** `feature/upgradation-functionality` · **Version:** **0.3.7** · Base `v0.2.2-stable`

**This fleet must NOT recycle classic or v2 ports.**

| Env | Drive | Port | Path | Host |
|-----|-------|------|------|------|
| DEV | E:\MyWorkspace\agentverse-project | **3312** | repo | http://127.0.0.1:3312 |
| PREPROD | F:\apps\agentverse-upgrade | **4312** | side | https://agentverse-upgrade-staging.delena.buzz |
| PROD | G:\apps\agentverse-upgrade | **5312** | side | https://agentverse-upgrade.delena.buzz |

## Untouched fleets

| Fleet | Ports | Hosts |
|-------|-------|-------|
| Classic | 3310 / 4310 / 5310 | agentverse[-staging].delena.buzz |
| stable-v2 | 3311 / 4311 / 5311 | agentverse-v2[-staging].delena.buzz |

## Auth / API

- CSS: `:5900` / `https://css.delena.buzz` — bake `NEXT_PUBLIC_CSS_ISSUER=https://css.delena.buzz`
- Portal PREPROD `:4080` · PROD `:5080`
- clientId: `agent-portal` (shared)

## App sessions / Portal workspace allowlist

Session Desk creates Portal sessions on absolute app trees (`E:\MyWorkspace\…`, `E:\Source\…`, `E:\wt\…`). Portal must allow those roots or create fails with `workspacePath is not allowed; must stay under …`.

Live F/G Portal `.env`:

```env
AGENT_WORKSPACE_ALLOWED_ROOTS=E:\MyWorkspace,E:\Source,E:\wt,F:\apps,G:\apps
```

AV client bake (must match at **build** time):

```env
NEXT_PUBLIC_WORKSPACE_ALLOWLIST=E:/MyWorkspace,E:/Source,E:/wt,F:/apps,G:/apps
```

Do not use short labels (`AgentVerse,MyAgent`) — they reject absolute pack paths. Restart Portal after server `.env` changes; rebuild AV after allowlist changes.

## Rate limit / polling (2026-07-15 hotfix on live 0.3.4)

AV previously poll-hammered Portal through loopback (`127.0.0.1` shared bucket → 429). Client: message poll **8s**, status **8s/20s** adaptive, ensure spaced + Desk auto-ensure **≤1/hour**. Portal F/G: XFF/user-keyed filter + **180**/min. See [APP-SESSIONS.md](./APP-SESSIONS.md) and Portal `docs/OPS.md` § Rate limit.

## Start

```powershell
cd F:\apps\agentverse-upgrade
.\start.ps1 -EnvName preprod

cd G:\apps\agentverse-upgrade
.\start.ps1 -EnvName prod
```

## Deep-links

See [DEEP-LINK-CONTRACT.md](./DEEP-LINK-CONTRACT.md). Prefer upgrade hosts for Dispatch return URLs when targeting this fleet.

## Operator chrome toggles

A floating "stage controls" chip (bottom-right of the floor, hidden while chat is open) lets an operator turn the on-screen joystick off/on and cycle the camera view (Portrait → Portrait S → Landscape → Landscape S → Auto) without opening full office chrome. Both prefs persist via the zustand store (`joystickEnabled`, `cameraViewOverride`) so they survive reloads; `cameraViewOverride: null` means auto-detect from `resolveViewMode` on resize, same as before this change.

## Promote

[PROMOTE-UPGRADATION.md](./PROMOTE-UPGRADATION.md) · Evidence `H:\releases\agentverse-upgrade-0.3.0\`
