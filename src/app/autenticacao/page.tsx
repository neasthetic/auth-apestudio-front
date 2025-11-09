"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useCallback } from "react";
import { authApplyService } from "@/services/authApplyService";
import { UploadCloud, FileType, X, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function AutenticacaoPage() {
  const { user, logout } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [successName, setSuccessName] = useState<string | null>(null);

  const onDrop = useCallback((f: File) => {
    setError(null);
    if (!/\.(lua|js)$/i.test(f.name)) {
      setError("Apenas arquivos .lua ou .js são permitidos");
      setFile(null);
      return;
    }
    setFile(f);
    setSuccessName(null);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onDrop(f);
  };

  const handleApply = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const res = await authApplyService.apply(file);
      // disparar download
      const url = URL.createObjectURL(res.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setSuccessName(res.filename);
    } catch (e: any) {
      setError(e.message || "Erro ao aplicar auth");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ProtectedRoute>
      {user && (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
          <div className="flex">
            <DashboardSidebar user={user} onLogout={logout} />
            <main className="flex-1">
              <div className="container-page py-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="relative size-10 overflow-hidden rounded-full border border-[var(--border)] md:size-12">
                    <Image src={user.avatar} alt={user.username} fill className="object-cover" unoptimized />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Autenticação</h1>
                    <p className="text-sm text-[var(--muted)]">Processar e proteger seus arquivos .lua ou .js</p>
                  </div>
                </div>

                {user.role !== "admin" ? (
                  <div className="text-center py-20">
                    <p className="text-red-400 font-medium">Apenas administradores podem usar esta ferramenta.</p>
                  </div>
                ) : (
                  <div className="space-y-8 max-w-3xl">
                    {/* Drop Zone */}
                    <div
                      className="card p-6 flex flex-col items-center justify-center gap-4 border-dashed border-[var(--border)] hover:border-[var(--accent)]/60 transition group"
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const f = e.dataTransfer.files?.[0];
                        if (f) onDrop(f);
                      }}
                    >
                      {!file ? (
                        <>
                          <div className="h-16 w-16 rounded-full bg-[var(--surface)] flex items-center justify-center border border-[var(--border)] group-hover:border-[var(--accent)]/60">
                            <UploadCloud className="h-8 w-8 text-[var(--muted)]" />
                          </div>
                          <p className="text-sm text-center text-[var(--muted)]">
                            Arraste um arquivo <span className="font-semibold">.lua</span> ou <span className="font-semibold">.js</span><br />
                            ou clique abaixo para selecionar
                          </p>
                          <div>
                            <label className="btn cursor-pointer">
                              <FileType size={16} /> Selecionar arquivo
                              <input
                                type="file"
                                accept=".lua,.js"
                                className="hidden"
                                onChange={handleFileInput}
                              />
                            </label>
                          </div>
                        </>
                      ) : (
                        <div className="w-full space-y-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full border border-emerald-700/40 bg-emerald-500/10 text-emerald-300 flex items-center justify-center">
                                <FileType className="h-5 w-5" />
                              </div>
                              <div className="text-sm">
                                <p className="font-medium break-all">{file.name}</p>
                                <p className="text-[10px] text-[var(--muted)]">{(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <button
                              className="text-[var(--muted)] hover:text-red-400 transition"
                              onClick={() => setFile(null)}
                              aria-label="Remover arquivo"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="flex gap-3">
                            <button
                              className="btn flex-1"
                              onClick={() => setFile(null)}
                              disabled={processing}
                            >
                              Limpar
                            </button>
                            <button
                              className="btn btn-accent flex-1 disabled:opacity-50"
                              disabled={processing}
                              onClick={handleApply}
                            >
                              {processing ? "Processando..." : "Aplicar Auth"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Feedback */}
                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                      </div>
                    )}
                    {successName && (
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Download iniciado: {successName}</span>
                      </div>
                    )}

                    {/* Dicas */}
                    <div className="card p-4 space-y-2 text-xs text-[var(--muted)]">
                      <p><strong>Dicas:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Tamanho máximo recomendado: 2MB.</li>
                        <li>Evite enviar arquivos já minificados para melhor resultado.</li>
                        <li>O nome final adiciona o sufixo <code>.auth.lua</code> ou <code>.auth.js</code>.</li>
                      </ul>
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
