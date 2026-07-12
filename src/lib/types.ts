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

export type PersonaId =
  | "rajveer"
  | "aarav"
  | "priya"
  | "arjun"
  | "meera"
  | "kabir";

export type Quest = {
  id: string;
  title: string;
  description: string;
  assignee: PersonaId;
  status: "open" | "active" | "done";
  createdAt: number;
};

export type AgentEvent = {
  sessionId: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
};
