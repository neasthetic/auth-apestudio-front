const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://auth.apestudio.dev";

class AuthApplyService {
  async applyAuth(file: File): Promise<Blob> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/api/auth/apply`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      let msg = "Erro ao processar arquivo";
      try {
        const json = await res.json();
        msg = json.error || msg;
      } catch {}
      throw new Error(msg);
    }

    return res.blob();
  }
}

export const authApplyService = new AuthApplyService();
