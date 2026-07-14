# Roadmap — AgentVerse upgrade fleet (post–0.3.1)

**Status:** Living backlog (Grok 4.5 next-step ask, 2026-07-15)  
**SoT branch:** `feature/upgradation-functionality`  
**Live pack:** **0.3.1** on side fleet only  

| Fleet | Ports | Hosts | Role |
|-------|-------|-------|------|
| **Upgrade (this train)** | 3312 / **4312** / **5312** | `agentverse-upgrade-staging.delena.buzz` · `agentverse-upgrade.delena.buzz` | Operator work plane (new UX) |
| Classic | 3310 / 4310 / 5310 | `agentverse[-staging].delena.buzz` | Rollback / peer matrix classic |
| stable-v2 | 3311 / 4311 / 5311 | `agentverse-v2[-staging].delena.buzz` | Industrial experiment — not Dispatch target |

Do **not** recycle classic/v2 ports for this train.

---

## Shipped (done — do not reopen unless bug)

Functional train through **0.3.1**: Session Desk control · deep-links · honest quests · permissions · incident strip · durable project↔workspace · WebGL FlatRoster · planMarkdown + PWA last-desk · side-fleet Q1/Q2.

Evidence: `H:\releases\agentverse-upgrade-0.3.1\`

---

## Next (priority)

| Pri | Item | Owner | Exit |
|-----|------|-------|------|
| **P0** | Truth check: operator sees latest upgrade fleet | QA / field-ops | **DONE 2026-07-15** — operator confirmed; proceed |
| **P0** | Confirm edge pack is **0.3.1** (not 0.3.0) | Ops | **DONE** — upgrade hosts `/health` → 0.3.1 |
| **P1** | Realme E2E: Home → Dispatch → upgrade Desk → return | QA | Optional polish evidence; wire already live |
| **P1** | ProdDeck Dispatch → upgrade hosts on home[-staging] | ProdDeck | **DONE** — ProdDeck **0.8.0** F+G; Dispatch SoT = upgrade hosts (evidence `H:\releases\proddeck-0.8.0\evidence\dispatch-upgrade-wire.md`) |
| **P2** | Fleet SoT in `SUPPORTED-VERSIONS` + MyAgent `workflow/deps/` | EM + docs | Register agentverse-upgrade 0.3.1 + Dispatch peer |
| **P3** | Hygiene: git tag `v0.3.1` if missing; DEEP-LINK-CONTRACT hosts | Docs | Tag + contract host list |
| **P4** | Defer | — | Cloud OS hard-outs · v2 · merge onto densify F/G |

**SemVer:** Call AV upgrade train **done at 0.3.1** after P0–P1 pass. Only cut **0.3.2** if phone E2E finds a real bug.

---

## How to confirm you are on the **new** upgrade app

### 1. Host (strongest signal)

| You opened… | Fleet |
|-------------|--------|
| `https://agentverse-upgrade.delena.buzz` or `…-staging…` | **NEW (upgrade)** |
| `https://agentverse.delena.buzz` or `agentverse-staging…` | Classic |
| `https://agentverse-v2.delena.buzz` or `…-v2-staging…` | v2 industrial |

### 2. Health JSON

```text
https://agentverse-upgrade.delena.buzz/health
https://agentverse-upgrade-staging.delena.buzz/health
```

Expect: `"version":"0.3.1"` and `"port":5312` (prod) or `"port":4312` (staging).

Classic will show a different version/port (e.g. 5310).

### 3. In-app env badge (TopBar chrome)

Open office chrome → look for env pill **PREPROD** / **PROD** and Portal/CSS up dots. Upgrade builds bake `NEXT_PUBLIC_AV_ENV`.

### 4. Feature smells (upgrade 0.3.1+)

- Session Desk: **search**, status chips, **Cancel run**
- `/desk?intent=hire&brief=…` → incident strip + compose seed
- WebGL fail → **FlatRoster** (2D list), not a blank canvas
- After Dispatch from Home (once ProdDeck patch is live): URL hostname contains **`agentverse-upgrade`**

### 5. Origin bypass (ops)

```text
http://127.0.0.1:4312/health   → staging upgrade
http://127.0.0.1:5312/health   → prod upgrade
http://127.0.0.1:5310/health   → classic (not new)
http://127.0.0.1:4311/health   → v2 (not this train)
```

---

## Risks (three fleets)

Keep upgrade as work plane, classic as rollback, v2 untouched. Time-box dual Dispatch advertising; update matrix so Home does not silently hire into the wrong desk.

---

## References

- [OPS.md](./OPS.md) · [DEEP-LINK-CONTRACT.md](./DEEP-LINK-CONTRACT.md) · [PROMOTE-0.3.1.md](./PROMOTE-0.3.1.md) · [HANDOFF.md](./HANDOFF.md)  
- Plan SoT: `agents/pre-work/waves/upgradation/LEFTOVER-0.3.1.md`
