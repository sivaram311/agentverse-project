# AgentVerse OPS

| Item | Value |
|------|-------|
| App | agentverse |
| DEV UI port | **3310** (`E:\MyAgent\workflow\ports\REGISTRY.md`) |
| API | Bundled agent-portal `services/agent-portal` → `:8080` via `/api/portal/*` |
| Auth | CSS `services/centralized-security-system` → `:9000` |
| Realtime | Same-origin message poll (SockJS removed) |
| PWA | `public/manifest.webmanifest` + `public/sw.js` |
| Version | `package.json` → `0.1.0` |
| Stack script | `npm run dev:stack` → `scripts/start-stack.ps1` |

## Health checks

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/health
Invoke-WebRequest http://127.0.0.1:3310/ -UseBasicParsing | Select-Object StatusCode
```

## Devices

- Realme P2 Pro / Pad 2 / desktop — touch orbit + mouse, low-poly avatars, DPR capped, reduced-motion respects Stars off.
