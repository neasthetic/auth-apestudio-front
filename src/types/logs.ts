export type LicenseLogAction = "CREATE" | "UPDATE" | "DELETE";

export type LicenseLogActorType = "admin" | "bot";

export interface LicenseLogDetails {
  // Flexible structure coming from backend; keep as record for safety
  [key: string]: unknown;
}

export interface LicenseLog {
  _id: string;
  action: LicenseLogAction;
  actorType: LicenseLogActorType;
  actorId?: string;
  actorDiscordId?: string;
  actorUsername?: string;
  requestIp?: string;
  licenseId?: string;
  licenseToken?: string;
  scriptName?: string;
  userDiscord?: string;
  details?: LicenseLogDetails;
  createdAt: string;
  updatedAt: string;
}

export interface LogsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LicenseLogsResponse {
  data: LicenseLog[];
  pagination: LogsPagination;
}

export interface LicenseLogsQuery {
  page?: number;
  limit?: number; // default 20, max 100
  actorType?: LicenseLogActorType;
  action?: LicenseLogAction;
  token?: string;
  userDiscord?: string;
  scriptName?: string;
}
