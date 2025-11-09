"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { logsService } from "@/services/logsService";
import { LicenseLog, LicenseLogsResponse, LicenseLogAction, LicenseLogActorType } from "@/types/logs";
import Image from "next/image";
import { Eye, EyeOff, ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";

export default function RegistrosPage() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<LicenseLog[]>([]);
  const [pagination, setPagination] = useState<LicenseLogsResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [actorType, setActorType] = useState<LicenseLogActorType | "">("");
  const [action, setAction] = useState<LicenseLogAction | "">("");
  const [token, setToken] = useState("");
  const [userDiscord, setUserDiscord] = useState("");
  const [scriptName, setScriptName] = useState("");
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});

  const fetchLogs = async () => {
    if (user?.role !== "admin") return;
    setLoading(true);
    setError(null);
    try {
      const res = await logsService.getLicenseLogs({
        page,
        limit,
        actorType: actorType || undefined,
        action: action || undefined,
        token: token || undefined,
        userDiscord: userDiscord || undefined,
        scriptName: scriptName || undefined,
      });
      setData(res.data);
      setPagination(res.pagination);
    } catch (e: any) {
      setError(e.message || "Erro ao carregar registros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, limit, actorType, action, token, userDiscord, scriptName]);

  const toggleToken = (id: string) => {
    setShowTokens((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const actionColors: Record<LicenseLogAction, string> = {
    CREATE: "bg-green-500/20 text-green-400 border border-green-600/40",
    UPDATE: "bg-yellow-500/20 text-yellow-300 border border-yellow-600/40",
    DELETE: "bg-red-500/20 text-red-400 border border-red-600/40",
  };

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
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Registros</h1>
                    <p className="text-sm text-[var(--muted)]">Auditoria das ações sobre licenças</p>
                  </div>
                </div>

                {user.role !== "admin" ? (
                  <div className="text-center py-20">
                    <p className="text-red-400 font-medium">Apenas administradores podem ver os registros.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Filters */}
                    <div className="card p-4 space-y-4">
                      <div className="flex flex-wrap gap-3">
                        <div className="flex flex-col">
                          <label className="text-xs text-[var(--muted)]">Ação</label>
                          <select
                            value={action}
                            onChange={(e) => {
                              setPage(1); setAction(e.target.value as LicenseLogAction | "");
                            }}
                            className="bg-[#141218] border border-[var(--border)] rounded px-2 py-1 text-sm"
                          >
                            <option value="">Todas</option>
                            <option value="CREATE">CREATE</option>
                            <option value="UPDATE">UPDATE</option>
                            <option value="DELETE">DELETE</option>
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-[var(--muted)]">Ator</label>
                          <select
                            value={actorType}
                            onChange={(e) => { setPage(1); setActorType(e.target.value as LicenseLogActorType | ""); }}
                            className="bg-[#141218] border border-[var(--border)] rounded px-2 py-1 text-sm"
                          >
                            <option value="">Todos</option>
                            <option value="admin">admin</option>
                            <option value="bot">bot</option>
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-[var(--muted)]">Token</label>
                          <input
                            value={token}
                            onChange={(e) => { setPage(1); setToken(e.target.value); }}
                            placeholder="Token"
                            className="bg-[#141218] border border-[var(--border)] rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-[var(--muted)]">Usuário Discord</label>
                          <input
                            value={userDiscord}
                            onChange={(e) => { setPage(1); setUserDiscord(e.target.value); }}
                            placeholder="Discord ID"
                            className="bg-[#141218] border border-[var(--border)] rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-[var(--muted)]">Script</label>
                          <input
                            value={scriptName}
                            onChange={(e) => { setPage(1); setScriptName(e.target.value); }}
                            placeholder="Nome do script"
                            className="bg-[#141218] border border-[var(--border)] rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-[var(--muted)]">Itens / página</label>
                          <select
                            value={limit}
                            onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
                            className="bg-[#141218] border border-[var(--border)] rounded px-2 py-1 text-sm"
                          >
                            {[20,40,60,100].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <button
                          onClick={() => { setPage(1); fetchLogs(); }}
                          className="btn btn-accent h-fit mt-5 flex items-center gap-1"
                        >
                          <RefreshCcw size={14} /> Atualizar
                        </button>
                      </div>
                      {error && <p className="text-xs text-red-400">{error}</p>}
                    </div>

                    {/* List */}
                    <div className="space-y-3">
                      {loading ? (
                        <p className="text-xs text-[var(--muted)]">Carregando registros...</p>
                      ) : data.length === 0 ? (
                        <p className="text-xs text-[var(--muted)]">Nenhum registro encontrado.</p>
                      ) : (
                        data.map(log => {
                          const show = showTokens[log._id];
                          return (
                            <div key={log._id} className="card p-3 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full border border-[var(--border)] flex items-center justify-center bg-[#141218] text-xs font-semibold">
                                    {log.actorUsername ? log.actorUsername.charAt(0).toUpperCase() : (log.actorDiscordId ? log.actorDiscordId.slice(-2) : "?")}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{log.actorUsername || log.actorDiscordId || "Desconhecido"}</span>
                                    <span className="text-[10px] text-[var(--muted)]">{log.actorType}</span>
                                  </div>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${actionColors[log.action]}`}>{log.action}</span>
                              </div>
                              <div className="grid gap-1 text-[11px] md:grid-cols-2">
                                {log.licenseToken && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[var(--muted)]">Token:</span>
                                    <span className={`font-mono break-all ${show ? "" : "blur-sm select-none"}`}>{log.licenseToken}</span>
                                    <button
                                      onClick={() => toggleToken(log._id)}
                                      className="p-1 rounded hover:bg-[var(--muted-foreground)]/10"
                                      aria-label={show ? "Ocultar token" : "Exibir token"}
                                    >
                                      {show ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                  </div>
                                )}
                                {log.scriptName && <div><span className="text-[var(--muted)]">Script:</span> {log.scriptName}</div>}
                                {log.userDiscord && <div><span className="text-[var(--muted)]">Usuário:</span> {log.userDiscord}</div>}
                                {log.requestIp && <div><span className="text-[var(--muted)]">IP:</span> {log.requestIp}</div>}
                                <div><span className="text-[var(--muted)]">Criado:</span> {new Date(log.createdAt).toLocaleString()}</div>
                                {log.details && <div className="col-span-full text-[10px] text-[var(--muted)]">Fonte: {(log.details as any).actionSource || "-"}</div>}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between pt-2">
                        <button
                          disabled={page <= 1}
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          className="btn h-8 px-2 disabled:opacity-40"
                        >
                          <ChevronLeft size={16} />
                          <span>Anterior</span>
                        </button>
                        <div className="text-xs text-[var(--muted)]">Página {pagination.page} de {pagination.totalPages} • {pagination.total} registros</div>
                        <button
                          disabled={page >= pagination.totalPages}
                          onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                          className="btn h-8 px-2 disabled:opacity-40"
                        >
                          <span>Próxima</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
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
