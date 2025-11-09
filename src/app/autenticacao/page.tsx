"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { UploadCloud, FileUp, CheckCircle2, AlertTriangle } from "lucide-react";
import { authApplyService } from "@/services/authApplyService";

export default function AutenticacaoPage() {
  const { user, logout } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const accept = ".lua,.js";
  const isAllowed = (f: File) => [".lua", ".js"].some((ext) => f.name.toLowerCase().endsWith(ext));

  const onSelect = (f: File) => {
    if (!isAllowed(f)) {
      setError("Formato inválido. Envie um arquivo .lua ou .js");
      setFile(null);
      return;
    }
    setError(null);
    setSuccess(null);
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleApply = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const blob = await authApplyService.applyAuth(file);
      const suggestedName = file.name.replace(/\.(lua|js)$/i, ".auth.$1");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = suggestedName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setSuccess("Arquivo processado com sucesso. O download foi iniciado.");
    } catch (e: any) {
      setError(e.message || "Falha ao aplicar auth");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setFile(null); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <ProtectedRoute>
      {user && (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
          <div className="flex">
            <DashboardSidebar user={user} onLogout={logout} />
            <main className="flex-1">
              <div className="container-page py-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative size-10 overflow-hidden rounded-full border border-[var(--border)] md:size-12">
                    <Image src={user.avatar} alt={user.username} fill className="object-cover" unoptimized />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Autenticação de Arquivo</h1>
                    <p className="text-sm text-[var(--muted)]">Envie um arquivo .lua ou .js para aplicar a auth</p>
                  </div>
                </div>

                {user.role !== "admin" ? (
                  <div className="text-center py-20">
                    <p className="text-red-400 font-medium">Apenas administradores podem usar esta ferramenta.</p>
                  </div>
                ) : (
                  <div className="max-w-3xl space-y-6">
                    <div
                      className={`card p-6 border-dashed ${dragActive ? "border-[var(--accent)]" : ""}`}
                      onDrop={onDrop}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                    >
                      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                        <UploadCloud className="h-8 w-8 text-[var(--muted)]" />
                        <div className="text-sm">
                          Arraste um arquivo aqui ou
                          <button
                            type="button"
                            className="ml-1 text-[var(--accent)] hover:underline"
                            onClick={() => inputRef.current?.click()}
                          >
                            selecione do computador
                          </button>
                        </div>
                        <div className="text-[10px] text-[var(--muted)]">Formatos aceitos: .lua, .js</div>
                        <input
                          ref={inputRef}
                          type="file"
                          accept={accept}
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) onSelect(f);
                          }}
                        />
                      </div>
                      {file && (
                        <div className="mt-4 flex items-center justify-between rounded border border-[var(--border)] bg-[#141218] p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <FileUp className="h-4 w-4 text-[var(--muted)]" />
                            <div>
                              <div className="font-medium">{file.name}</div>
                              <div className="text-[10px] text-[var(--muted)]">{(file.size/1024).toFixed(1)} KB</div>
                            </div>
                          </div>
                          <button
                            className="btn h-8 px-3"
                            onClick={() => setFile(null)}
                          >
                            Remover
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        className="btn btn-accent disabled:opacity-50"
                        disabled={!file || loading}
                        onClick={handleApply}
                      >
                        {loading ? "Processando..." : "Aplicar auth"}
                      </button>
                      {success && (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <CheckCircle2 className="h-4 w-4" /> {success}
                        </div>
                      )}
                      {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                          <AlertTriangle className="h-4 w-4" /> {error}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
