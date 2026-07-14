import type { OfficeProject } from "./types";
import { getDefaultWorkspace, shortWorkspaceLabel } from "./workspaces";

/**
 * Durable office-project ↔ filesystem workspace convention.
 *
 * Portal sessions remain SoT for session lifecycle; AgentVerse persists a local
 * `OfficeProject.workspacePath` binding so project switches restore the path.
 *
 * Integrate Lead / Lane C (ChatPanel): when creating a portal session for a newly
 * deployed project, prefer `project.workspacePath` + `sessionTitleForProject(project)`
 * instead of the bare DEFAULT_WORKSPACE / path-basename title.
 */

export function projectSlug(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "project";
}

/** Join DEFAULT_WORKSPACE + slug using the base path's separator style. */
export function joinWorkspacePath(base: string, segment: string): string {
  const trimmed = base.replace(/[/\\]+$/, "");
  if (!trimmed) return segment;
  const sep = trimmed.includes("\\") && !trimmed.includes("/") ? "\\" : "/";
  const clean = segment.replace(/^[/\\]+/, "");
  return `${trimmed}${sep}${clean}`;
}

/**
 * Resolve (and conventionally "create") the workspace path for a project.
 * If `workspacePath` is already bound, return it; otherwise DEFAULT_WORKSPACE + slug.
 * Hub maps to DEFAULT_WORKSPACE itself.
 */
export function resolveProjectWorkspacePath(
  project: Pick<OfficeProject, "id" | "name"> & {
    workspacePath?: string | null;
  },
  baseWorkspace: string = getDefaultWorkspace(),
): string {
  const bound = project.workspacePath?.trim();
  if (bound) return bound;
  if (project.id === "hub") return baseWorkspace;
  return joinWorkspacePath(baseWorkspace, projectSlug(project.name));
}

/** Portal session title convention: `AgentVerse · {project.name}` */
export function sessionTitleForProject(
  project: Pick<OfficeProject, "name">,
): string {
  return `AgentVerse · ${project.name}`;
}

export function findProjectById(
  projects: OfficeProject[],
  projectId: string,
): OfficeProject | undefined {
  return projects.find((p) => p.id === projectId);
}

/** Map workspace path → office project (exact match on bound workspacePath). */
export function findProjectByWorkspacePath(
  projects: OfficeProject[],
  workspacePath: string,
): OfficeProject | undefined {
  const normalized = workspacePath.replace(/\\/g, "/").replace(/\/+$/, "");
  return projects.find((p) => {
    const bound = p.workspacePath?.replace(/\\/g, "/").replace(/\/+$/, "");
    return bound != null && bound === normalized;
  });
}

/** Short UI hint for switcher / chrome (last path segment). */
export function workspaceHintForProject(
  project: Pick<OfficeProject, "id" | "name" | "workspacePath">,
): string {
  const path = resolveProjectWorkspacePath(project);
  return shortWorkspaceLabel(path);
}
