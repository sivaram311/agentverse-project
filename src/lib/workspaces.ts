export function getDefaultWorkspace(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE || "demo";
}

function normalizeWorkspacePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/\/+$/, "");
}

export function getWorkspaceAllowlist(): string[] | null {
  const raw = process.env.NEXT_PUBLIC_WORKSPACE_ALLOWLIST;
  if (!raw) return null;

  const allowlist = raw
    .split(",")
    .map((path) => path.trim())
    .filter(Boolean);

  return allowlist.length > 0 ? allowlist : null;
}

export function isWorkspaceAllowed(path: string): boolean {
  const allowlist = getWorkspaceAllowlist();
  if (!allowlist) return true;

  const normalizedPath = normalizeWorkspacePath(path);

  return allowlist.some((allowedPath) => (
    normalizedPath === normalizeWorkspacePath(allowedPath) ||
    normalizedPath.startsWith(`${normalizeWorkspacePath(allowedPath)}/`)
  ));
}

export function shortWorkspaceLabel(path: string): string {
  const segments = normalizeWorkspacePath(path).split("/").filter(Boolean);
  return segments[segments.length - 1] || path;
}
