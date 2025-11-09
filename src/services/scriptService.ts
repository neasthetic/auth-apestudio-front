import { Script, CreateScriptDto, UpdateScriptDto, ScriptLicensesResponse } from "@/types/script";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://auth.apestudio.dev";

class ScriptService {
  /**
   * Cria um novo script
   */
  async createScript(data: CreateScriptDto): Promise<Script> {
    const response = await fetch(`${API_URL}/api/scripts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao criar script");
    }

    return response.json();
  }

  /**
   * Lista todos os scripts
   */
  async getAllScripts(): Promise<Script[]> {
    const response = await fetch(`${API_URL}/api/scripts`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao listar scripts");
    }

    return response.json();
  }

  /**
   * Busca um script específico pelo ID
   */
  async getScriptById(id: string): Promise<Script> {
    const response = await fetch(`${API_URL}/api/scripts/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao buscar script");
    }

    return response.json();
  }

  /**
   * Lista todas as licenças de um script
   */
  async getScriptLicenses(id: string): Promise<ScriptLicensesResponse> {
    const response = await fetch(`${API_URL}/api/scripts/${id}/licenses`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao buscar licenças do script");
    }

    return response.json();
  }

  /**
   * Atualiza um script
   */
  async updateScript(id: string, data: UpdateScriptDto): Promise<Script> {
    const response = await fetch(`${API_URL}/api/scripts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao atualizar script");
    }

    return response.json();
  }

  /**
   * Deleta um script
   */
  async deleteScript(id: string): Promise<{ message: string; script: Script }> {
    const response = await fetch(`${API_URL}/api/scripts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao deletar script");
    }

    return response.json();
  }
}

export const scriptService = new ScriptService();
