import { LicenseLogsQuery, LicenseLogsResponse } from "@/types/logs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://auth.apestudio.dev";

class LogsService {
  async getLicenseLogs(query: LicenseLogsQuery = {}): Promise<LicenseLogsResponse> {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(Math.min(Math.max(query.limit, 1), 100)));
    if (query.actorType) params.set("actorType", query.actorType);
    if (query.action) params.set("action", query.action);
    if (query.token) params.set("token", query.token);
    if (query.userDiscord) params.set("userDiscord", query.userDiscord);
    if (query.scriptName) params.set("scriptName", query.scriptName);

    const url = `${API_URL}/api/licenses/logs${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Erro ao carregar registros");
    }
    return res.json();
  }
}

export const logsService = new LogsService();
