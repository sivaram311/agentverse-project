# App sessions (Session Desk work plane)

**Status:** Wired in **0.3.4** · Portal remains session SoT  
**Fleet:** agentverse-upgrade (`3312` / `4312` / `5312`)

## What you get

| Kind | Packs | Portal title |
|------|-------|--------------|
| **Work plane** (auto-ensure) | css · css-next · agent-portal · agentverse-upgrade · proddeck · stack-pilot · h-drive-server | `AgentVerse · CSS`, `… · CSS Next`, `… · Agent Portal`, `… · Upgrade`, `… · ProdDeck`, `… · Stack Pilot`, `… · H-Drive` |
| **Labeled** (optional seed) | agentverse · agentverse-v2 · library | `AgentVerse · Classic`, `… · V2`, `… · Library` |

### Inventory labels (W0 SoT — not default work plane)

| Pack / label | Inventory label | Meaning |
|--------------|-----------------|--------|
| `agentverse` | **rollback** | Classic fleet label (3310/4310/5310) — seed/open only; never Dispatch default |
| `agentverse-v2` | **experiment** | V2 side fleet label (3311/4311/5311) — optional seed; not work plane |
| `library` | **candidate** | Ports reserved; not PROD yet — optional seed only |

Opening Session Desk (logged in) runs **ensure work-plane sessions** at most **once per browser-tab hour** (sessionStorage debounce): create missing titles via Portal `POST /sessions` bound to each pack’s `workspacePath`. Creates are spaced **~350ms** apart. Buttons **Ensure app sessions** / **Seed labeled too** always run on demand.

Chips open the matching session (or create then open) and flip the active pack (title wins over path so CSS vs CSS Next do not collide).

## Stage cast policy (0.3.7)

**Shared anchors on every work-plane stage:** Priya (`helpdesk`) · Rajesh.  
**Switch-feel:** specialists diverge by pack (not unique Help Desks). Ghost ids without bodies (`anand`, `vikram`) are **not** listed in `stageVisible`.  
**Display names:** pack `overlays.<id>.name` overrides the label on the avatar tag / crew bar (same GLB body; catalog id unchanged).  
**Chat:** tap an agent (or crew pill) to open chat; walking near or approach greet alone does **not** open the chat panel.

| Pack | On stage (display names) |
|------|---------------------------|
| proddeck | Priya, Rajesh, Aravind, **Ravi**, **Lena**, Keerthi |
| agentverse-upgrade | Priya, Rajesh, Aravind, **Arjun**, **Maya**, Manu |
| css | Priya, Rajesh, Aravind, **Amrit**, Kiran |
| css-next | Priya, Rajesh, Aravind, **Amrit**, Mahesh |
| agent-portal | Priya, Rajesh, Aravind, **Arjun**, Manoj, Kavi |
| stack-pilot | Priya, Rajesh, **Murali**, Karthik |
| h-drive-server | Priya, Rajesh, Aravind, **Naveen**, Kiran |

## Portal rate-limit friendliness

Chat message poll base **8s**; status poll **8s** while busy (`STREAMING` / waiting) else **20s**. Pair with Portal XFF + user-keyed rate limit (Portal OPS). Avoid opening Desk repeatedly in the same minute after a cold ensure.

## Operator note after Q2

1. Login on https://agentverse-upgrade.delena.buzz  
2. Open Session Desk once — work-plane sessions appear under **App sessions**  
3. Optionally **Seed labeled too** for classic / v2 / library  

## Portal allowlist (PROD)

Prod Portal must include absolute work-plane roots or create fails with `workspacePath is not allowed; must stay under …`:

`AGENT_WORKSPACE_ALLOWED_ROOTS=E:\MyWorkspace,E:\Source,E:\wt,F:\apps,G:\apps`

`NEXT_PUBLIC_WORKSPACE_ALLOWLIST` (client) and Portal `AGENT_WORKSPACE_ALLOWED_ROOTS` must agree:

`E:/MyWorkspace,E:/Source,E:/wt,F:/apps,G:/apps`

Do **not** use short labels like `AgentVerse,MyAgent` — those reject absolute pack paths (e.g. `E:/MyWorkspace/agentverse-project`). Bake allowlist at **build** time; then restart Portal after server `.env` changes.

