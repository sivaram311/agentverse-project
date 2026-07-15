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
| `src` | Caller id — resolved to pack **`appId`** after auth (see table below) |
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

## `src` → pack `appId` (W2b SoT)

Runtime resolver: `src/lib/pack-loader.ts` (`SRC_TO_APPID` · `resolvePackIdFromSrc`).

| `src` param | Pack `appId` | Notes |
|-------------|--------------|-------|
| `proddeck` | `proddeck` | ProdDeck Cloud OS dispatch |
| `home` | `proddeck` | Home / Watch caller alias |
| `agentverse-upgrade` | `agentverse-upgrade` | This fleet (3312/4312/5312) |
| `agentverse` | `agentverse-upgrade` | Classic label → upgrade pack (no classic port work) |
| `css` | `css` | CSS IdP pilot |
| `css-next` | `css` | CSS side-fleet alias |
| *(missing / unknown)* | `agentverse-upgrade` | **DEFAULT** — safe fallback |

Pilot packs only until W6 fills the matrix. Pack schema: [PACK-TEMPLATE.md](./PACK-TEMPLATE.md).

## Behavior

1. After CSS auth, AV parses query.
2. **`src`** → resolve pack `appId` → **`setActivePack(appId, reason)`** — applies camera preset, bumps `packEpoch` on hard switch, sets stage toast; optional **`composeSeed`** from active pack prefills compose when bindings land (W3 Lane C).
3. **`crew`** — persona id for Talk target (e.g. `rajesh` … `kabilan`, or **`helpdesk`** for Priya). Informational at parse time; hire intent may default crew to Help Desk.
4. `intent=session-desk` → open Session Desk.
5. `intent=hire` → select crew, open chat, seed compose from brief.
6. Brief → Incident strip (dismissible) + compose prefills `Investigate: …`.
7. `src=proddeck` → Incident strip banner **“ProdDeck dispatch params received”** even if `brief` empty (chat opens so strip is visible).
8. Safe `return` → “Back to Home” in chat/TopBar/IncidentStrip.

**ProdDeck Dispatch SoT:** upgrade hosts (not classic). See ProdDeck `docs/SUPPORTED-VERSIONS.md`.
