# Bundled backend services for AgentVerse

| Path | Role |
|------|------|
| `agent-portal/` | Junction → `E:\MyWorkspace\agent-portal` (Spring API `:8080`, SockJS/WS unused by AgentVerse UI) |
| `centralized-security-system/` | Junction → CSS IdP `:9000` |

Source remote: `https://github.com/sivaram311/agent-portal.git`

## Start everything

```powershell
cd E:\MyWorkspace\agentverse-project
npm run dev:stack
```

Or UI only (if API already up):

```powershell
npm run dev
```

AgentVerse talks to the portal **same-origin** via Next rewrites (`/api/portal/*` → `:8080`). No browser SockJS → no CORS / unload violations.
