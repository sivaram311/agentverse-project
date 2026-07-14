# 03 — API contracts (Upgradation)

## Portal (via `/api/portal`) — existing

| Op | Path |
|----|------|
| List/get sessions | `GET /sessions`, `GET /sessions/{id}` |
| Create / archive / unarchive | `POST` variants |
| Messages / prompt | `GET/POST .../messages`, `.../prompt` |
| Cancel run | `POST /sessions/{id}/cancel` |

## Session status enum (client)

`IDLE` | `STREAMING` | `WAITING_PERMISSION` | `WAITING_PLAN` | `FAILED` | `ARCHIVED` | …

## Deep-link (AV client)

`/desk?src=&crew=&session=&intent=&brief=&skills=&return=&env=`  
Alias: `/?session=`

- `intent=session-desk` | `hire`
- `return` must be same-origin allowlist or known ProdDeck hosts only (open-redirect guard)

## Permission / plan (0.2.6)

Spike portal for approve/deny endpoints. If absent → UI offers “Open Portal” only — no fake buttons.
