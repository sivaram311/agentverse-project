# App sessions (Session Desk work plane)

**Status:** Wired in **0.3.4** · Portal remains session SoT  
**Fleet:** agentverse-upgrade (`3312` / `4312` / `5312`)

## What you get

| Kind | Packs | Portal title |
|------|-------|--------------|
| **Work plane** (auto-ensure) | css · css-next · agent-portal · agentverse-upgrade · proddeck · stack-pilot · h-drive-server | `AgentVerse · CSS`, `… · CSS Next`, `… · Agent Portal`, `… · Upgrade`, `… · ProdDeck`, `… · Stack Pilot`, `… · H-Drive` |
| **Labeled** (optional seed) | agentverse · agentverse-v2 · library | `AgentVerse · Classic`, `… · V2`, `… · Library` |

Opening Session Desk (logged in) runs **ensure work-plane sessions**: create missing titles via Portal `POST /sessions` bound to each pack’s `workspacePath`. Buttons: **Ensure app sessions** · **Seed labeled too**.

Chips open the matching session (or create then open) and flip the active pack (title wins over path so CSS vs CSS Next do not collide).

## Operator note after Q2

1. Login on https://agentverse-upgrade.delena.buzz  
2. Open Session Desk once — work-plane sessions appear under **App sessions**  
3. Optionally **Seed labeled too** for classic / v2 / library  

## Portal allowlist (PROD)

Prod Portal must include absolute work-plane roots or create fails with `workspacePath is not allowed; must stay under …`:

`AGENT_WORKSPACE_ALLOWED_ROOTS=E:\MyWorkspace,E:\Source,E:\wt,F:\apps,G:\apps`

Set on `G:\apps\agent-portal\.env` (and F for staging). Restart Portal `:5080` / `:4080` after change.

