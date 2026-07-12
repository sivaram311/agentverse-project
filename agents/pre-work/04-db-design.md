# 04 - DB Design

**Status:** PLACEHOLDER — blocked on architecture

## Current assumption

MVP may be **frontend-only** (persona roster + orchestrator UI) with session in memory/localStorage.

If persistence is required:

| Item | Value |
|------|-------|
| Database | `app_agentverse` on `127.0.0.1:5432` |
| Schema | `dev` on E: |
| Role | `app_agentverse_dev` |
| Registry | Reserve in `E:\MyAgent\workflow/db/` before DDL |

## Candidate tables (later)

- `persona_profile` — id, role_key, display_name, model_asset, locale
- `crew_session` — id, user_sub, status, created_at
- `prework_gate` — session_id, doc_key, approved_by, approved_at

No DDL until user confirms need + reservation.
