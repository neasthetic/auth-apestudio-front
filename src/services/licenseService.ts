import { License, CreateLicenseDto, UpdateIpDto, ModifyDaysDto } from "@/types/license";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://auth.apestudio.dev";

class LicenseService {
  /**
   * Cria uma nova licença
   */
  async createLicense(data: CreateLicenseDto): Promise<License> {
    const response = await fetch(`${API_URL}/api/licenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao criar licença");
    }

    return response.json();
  }

  /**
   * Lista todas as licenças
   */
  async getAllLicenses(): Promise<License[]> {
    const response = await fetch(`${API_URL}/api/licenses`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao listar licenças");
    }

    return response.json();
  }

  /**
   * Busca uma licença específica pelo token
   */
  async getLicenseByToken(token: string): Promise<License> {
    const response = await fetch(`${API_URL}/api/licenses/${token}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao buscar licença");
    }

    return response.json();
  }

  /**
   * Deleta uma licença
   */
  async deleteLicense(token: string): Promise<{ message: string; license: License }> {
    const response = await fetch(`${API_URL}/api/licenses/${token}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao deletar licença");
    }

    return response.json();
  }

  /**
   * Atualiza o IP:Porta de uma licença
   */
  async updateIpPort(token: string, data: UpdateIpDto): Promise<License> {
    const response = await fetch(`${API_URL}/api/licenses/${token}/ip`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao atualizar IP");
    }

    return response.json();
  }

  /**
   * Adiciona dias à licença
   */
  async addDays(token: string, data: ModifyDaysDto): Promise<License> {
    const response = await fetch(`${API_URL}/api/licenses/${token}/add-days`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao adicionar dias");
    }

    return response.json();
  }

  /**
   * Remove dias da licença
   */
  async removeDays(token: string, data: ModifyDaysDto): Promise<License> {
    const response = await fetch(`${API_URL}/api/licenses/${token}/remove-days`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao remover dias");
    }

    return response.json();
  }

  /**
   * Torna a licença permanente
   */
  async makePermanent(token: string): Promise<License> {
    const response = await fetch(`${API_URL}/api/licenses/${token}/make-permanent`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao tornar licença permanente");
    }

    return response.json();
  }

  /**
   * Tenta converter uma licença permanente em temporária aplicando um novo prazo.
   * NOTE: esta rota pode não existir no servidor; tratar erro no cliente.
   */
  async makeTemporary(token: string, data: { expiresInDays?: number; expiresAt?: string } = {}): Promise<License> {
    const response = await fetch(`${API_URL}/api/licenses/${token}/make-temporary`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Erro ao converter licença para temporária (${response.status})`);
    }

    return response.json();
  }
}

export const licenseService = new LicenseService();
