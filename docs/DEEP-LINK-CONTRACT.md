# AgentVerse ↔ ProdDeck Deep-Link Contract

**Status:** Frozen for Upgradation 0.2.4+ · **SoT fleet = upgrade** (2026-07-15)  
**Primary hosts:** `agentverse-upgrade.delena.buzz` · `agentverse-upgrade-staging.delena.buzz` · DEV `:3312`  
**Legacy (still accepted):** classic `agentverse.delena.buzz` / staging / DEV `:3310` · `/?session=<id>`

## Canonical URL

```
https://agentverse-upgrade[-staging].delena.buzz/desk?src=&crew=&session=&intent=&brief=&skills=&return=&env=&evidence=
```

| Param | Meaning |
|-------|---------|
| `src` | Caller id (e.g. `proddeck`) |
| `crew` | Persona id: `rajesh` … `kabilan` |
| `session` | Portal session UUID |
| `intent` | `session-desk` \| `hire` |
| `brief` | URL-encoded incident/hire text |
| `skills` | Comma skills (informational; future tabs) |
| `return` | Absolute URL back to Home/Watch — **allowlisted hosts only** |
| `env` | Hint `dev` / `preprod` / `prod` |
| `evidence` | Optional path/string for strip |

**Brief decode:** AV accepts URI brief (canonical) and legacy base64url during transition.

## Security

`return` must resolve to host in:

- `localhost`, `127.0.0.1`
- `home.delena.buzz`, `home-staging.delena.buzz`
- `agentverse-upgrade.delena.buzz`, `agentverse-upgrade-staging.delena.buzz`
- `agentverse.delena.buzz`, `agentverse-staging.delena.buzz` (legacy)
- `agentverse-v2.delena.buzz`, `agentverse-v2-staging.delena.buzz` (legacy side)

Others → ignored.

## Behavior

1. After CSS auth, AV parses query.
2. `intent=session-desk` → open Session Desk.
3. `intent=hire` → select crew, open chat, seed compose from brief.
4. Brief → Incident strip (dismissible) + compose prefills `Investigate: …`.
5. `src=proddeck` → Incident strip banner **“ProdDeck dispatch params received”** even if `brief` empty (chat opens so strip is visible).
6. Safe `return` → “Back to Home” in chat/TopBar/IncidentStrip.

**ProdDeck Dispatch SoT:** upgrade hosts (not classic). See ProdDeck `docs/SUPPORTED-VERSIONS.md`.
