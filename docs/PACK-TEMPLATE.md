# Pack template — per appId (schema sketch)

**Status:** DRAFT · not wired in code yet  
**Path (planned):** `src/prompts/packs/<appId>.json`  
**Loaded by:** session / deep-link / project map → overlay onto cast ids

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
  }
}
```

Forbidden in packs: secrets, unbounded prompt dumps. Cap addenda.
