export type AuthConfig = {
  cssEnabled: boolean;
  authUrl: string;
  clientId: string;
  loginPath: string;
  refreshPath: string;
  apiKeyFallbackEnabled: boolean;
};

export type SessionStatus =
  | "IDLE"
  | "STREAMING"
  | "WAITING_PERMISSION"
  | "WAITING_PLAN"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "ARCHIVED";

export type Session = {
  id: string;
  title: string;
  workspacePath: string;
  cursorSessionId: string | null;
  status: SessionStatus;
  provider: string;
  ownerUsername: string | null;
  platformRole: string | null;
  platformTaskId: string | null;
  allowedTools: string[];
  allowedActions: string[];
  rolePromptHint: string | null;
  humanApprovalRequired: boolean | null;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  sessionId: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  sequenceNo: number;
  createdAt: string;
};

export type CreateSessionRequest = {
  workspacePath: string;
  title?: string;
  provider?: string;
  useGuidanceDefaults?: boolean;
  platformRole?: string;
  platformTaskId?: string;
};

export type Health = {
  status: string;
  cssEnabled: boolean;
  cssClientId: string;
  capabilities?: Record<string, boolean>;
};

/** Tamil Nadu office crew */
export type PersonaId =
  | "rajesh"
  | "karthik"
  | "lavanya"
  | "aravind"
  | "meenakshi"
  | "muthu"
  | "kabilan";

export type UiLanguage = "ta" | "hi" | "en";

export type AgentPose = "sitting" | "standing" | "walking";

export type AgentRuntimeState = {
  pose: AgentPose;
  status: string;
  progress: number;
  projectId: string | null;
  working: boolean;
};

export type OfficeProject = {
  id: string;
  name: string;
  idea: string;
  color: string;
  /** World-space offset for this project's desk cluster */
  clusterOffset: [number, number, number];
  managerId: PersonaId;
  crewIds: PersonaId[];
  createdAt: number;
};

export type SessionTab = {
  sessionId: string;
  workspacePath: string;
  label: string;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  assignee: PersonaId;
  status: "open" | "active" | "done" | "failed" | "cancelled";
  createdAt: number;
  /** Cosmetics only — portal session status is source of truth when sessionId set */
  progress?: number;
  projectId?: string | null;
  /** Portal session this quest is bound to */
  sessionId?: string | null;
};

export type PermissionDto = {
  id: string;
  sessionId: string;
  toolCallId: string | null;
  detailsJson: string | null;
  status: string;
  kind: string | null;
  planMarkdown: string | null;
  createdAt: string;
};

export type DeepLinkIntent = "session-desk" | "hire" | "";

export type DeepLinkParams = {
  src: string | null;
  crew: string | null;
  session: string | null;
  intent: DeepLinkIntent;
  brief: string | null;
  skills: string | null;
  returnUrl: string | null;
  env: string | null;
  evidence: string | null;
};

export type AgentEvent = {
  sessionId: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
};
