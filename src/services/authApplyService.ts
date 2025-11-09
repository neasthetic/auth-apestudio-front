export interface ApplyAuthResponse {
  filename: string;
  blob: Blob;
}

export const authApplyService = {
  async apply(file: File): Promise<ApplyAuthResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
    const url = baseURL.replace(/\/$/, "") + "/api/auth/apply";

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Falha ao aplicar auth (${res.status})`);
    }

    // Try read filename from Content-Disposition; fallback to deterministic name
    const cd = res.headers.get("Content-Disposition") || "";
    const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(cd);
    const suggested = decodeURIComponent(match?.[1] || match?.[2] || "");
    const blob = await res.blob();
    const fallback = file.name.replace(/\.(lua|js)$/i, "") + ".auth." + (file.name.toLowerCase().endsWith(".lua") ? "lua" : "js");

    return { filename: suggested || fallback, blob };
  },
};
