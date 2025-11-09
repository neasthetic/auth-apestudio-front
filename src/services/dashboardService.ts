import { DashboardInfosResponse } from "@/types/dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://auth.apestudio.dev";

class DashboardService {
  async getInfos(): Promise<DashboardInfosResponse> {
    const res = await fetch(`${API_URL}/api/dashboard-infos`, { credentials: "include" });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Erro ao carregar o painel");
    }
    return res.json();
  }
}

export const dashboardService = new DashboardService();
