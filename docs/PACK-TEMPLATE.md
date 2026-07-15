# Pack template — per appId (schema sketch)

**Status:** **WIRED in runtime** (W2b) via [`src/lib/pack-loader.ts`](../src/lib/pack-loader.ts) — pilot packs: `proddeck` · `agentverse-upgrade` · `css`  
**Path:** `src/prompts/packs/<appId>.json`  
**Loaded by:** `getPack(appId)` · deep-link `src` → `resolvePackIdFromSrc` · Session Desk / project switch → `setActivePack` (W3 bindings)

```json
{
  "appId": "proddeck",
  "version": "0.1.0",
  "packEpoch": 1,
  "workspacePath": "E:/MyWorkspace/...",
  "cameraPreset": "portrait",
  "singleShot": true,
  "switchPolicy": "hard",
  "hireBurstMax": 4,
  "playwrightOwner": "kabilan",
  "fleetPorts": { "dev": 3320, "preprod": 4320, "prod": 5320 },
  "cssClientId": "proddeck",
  "stageVisible": ["helpdesk", "rajesh", "aravind", "lavanya", "kabilan"],
  "workerRoles": ["karthik", "nisha", "gowri", "deepa", "raman"],
  "overlays": {
    "aravind": {
      "role": "Next.js / Cloud OS Coder",
      "title": "ProdDeck engineer",
      "systemPromptAddendum": "Stack: Next.js ProdDeck. Honor fleetPorts. Dispatch → agentverse-upgrade only."
    }
  },
  "composeSeed": "One-line seed for the compose box when this pack becomes active (optional)."
}
```

**`composeSeed`** — short operator hint applied when the pack lands (deep-link / session flip); not a second Portal session. Merged with hire `brief` when both present (brief wins for incident strip).

Forbidden in packs: secrets, unbounded prompt dumps. Cap addenda.
