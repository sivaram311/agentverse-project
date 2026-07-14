# Project ↔ workspace binding

**SoT for this convention:** this doc + `src/lib/project-workspace.ts`  
**Fleet:** agentverse-upgrade (`3312` / `4312` / `5312`) only

## Ownership

| Concern | Source of truth |
|---------|-----------------|
| Portal **sessions** (id, status, messages, permissions) | Agent Portal API |
| Office **projects** (desk clusters, crew, local UI) | AgentVerse zustand persist (`agentverse-office-v2`) |
| Project ↔ workspace path | `OfficeProject.workspacePath` (local durable field) |

Portal does **not** own office projects. AgentVerse does **not** invent a second session store — it only binds a project to a workspace path used when creating or switching sessions.

## Path convention

1. **Hub** (`id: "hub"`) → `NEXT_PUBLIC_DEFAULT_WORKSPACE` (default `demo`).
2. **Deployed project** → `{DEFAULT_WORKSPACE}/{slug(project.name)}`  
   - Slug: lowercase, non-alnum → `-`, max 48 chars (see `projectSlug`).
   - Separator follows the base (`/` vs `\`).
3. On `deployProject`, the resolved path is written to `OfficeProject.workspacePath` and becomes the active `workspacePath` in the store (also remembered in `recentWorkspaces`).
4. On `setActiveProject`, if the project has `workspacePath`, the global store `workspacePath` switches to it.

## Session title convention

When a portal session is created **for** an office project:

```text
AgentVerse · {project.name}
```

Helpers: `sessionTitleForProject`, `resolveProjectWorkspacePath` in `src/lib/project-workspace.ts`.

Chat / Session Desk may still use path-basename titles for ad-hoc workspaces that are not tied to a project.

## UI

`ProjectSwitcher` shows a short workspace hint (last path segment) and calls `setActiveProject`, which restores the bound path when present.

## Non-goals

- Creating directories on disk from the browser (portal / host enforces `AGENT_WORKSPACE_ROOT`).
- Moving classic (`:3310`…) or stable-v2 (`:3311`…) fleets.
- Replacing portal session lookup by workspace path — `sessionsByPath` remains a local cache keyed by path.
