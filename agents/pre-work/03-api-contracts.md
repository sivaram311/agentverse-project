# 03 - API Contracts

**Status:** PLACEHOLDER — blocked on architecture approval

## Intent

- Auth via CSS (token + JWKS); register `clientId` in `workflow/css/CLIENT-REGISTRY.md` when wiring.
- Version header / body field per SemVer.
- Error shape: `{ error, code, message, traceId? }`.
- If reusing agent-portal Agent API, document subset used; else define AgentVerse-local routes under `/api/v1/...`.

## TBD

- Session/persona state endpoints
- Orchestrator event stream (SSE/WebSocket)
- Health: `GET /health`
