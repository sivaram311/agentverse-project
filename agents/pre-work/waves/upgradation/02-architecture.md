# 02 — Architecture delta (Upgradation)

## Unchanged

- Next.js + R3F shell, CSS auth, portal proxy `/api/portal`, Zustand persist `agentverse-office-v2`.
- Classic fleet ports 3310 / 4310 / 5310.

## Deltas

| Module | Change |
|--------|--------|
| `SessionDesk` | Search, status filter, cancel run, rename UX (portal-backed if API exists) |
| `session-share` / boot | Deep-link parse after auth; `/desk` + `?session=` alias |
| `store` + quests | Bind quest ↔ `sessionId`; status from portal |
| `ChatPanel` | Status chip, cancel, permission banner or Portal fallback |
| `IncidentStrip` | Read-only brief from deep-link |
| TopBar / health | Env badge + CSS/portal reachability |

## Non-goals

Industrial v2 scene, Socket/STOMP swap, ticket CRUD, Crew Fabric UI.
