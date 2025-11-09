"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { logsService } from "@/services/logsService";
import { LicenseLog, LicenseLogsResponse, LicenseLogAction, LicenseLogActorType } from "@/types/logs";
import Image from "next/image";
import { Eye, EyeOff, ChevronLeft, ChevronRight, RefreshCcw, Info } from "lucide-react";

export default function RegistrosPage() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<LicenseLog[]>([]);
  const [pagination, setPagination] = useState<LicenseLogsResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [actorType, setActorType] = useState<LicenseLogActorType | "">("");
  const [action, setAction] = useState<LicenseLogAction | "">("");
  const [token, setToken] = useState("");
  const [userDiscord, setUserDiscord] = useState("");
  const [scriptName, setScriptName] = useState("");
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const [detailLog, setDetailLog] = useState<LicenseLog | null>(null);
  const [showDetailToken, setShowDetailToken] = useState(false);
  const [actorProfiles, setActorProfiles] = useState<Record<string, { username: string; avatar_url: string }>>({});
  const [actorProfilesLoading, setActorProfilesLoading] = useState(false);

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
      setInitialLoaded(true);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, limit, actorType, action, token, userDiscord, scriptName]);

  // Buscar perfis Discord dos atores (avatar + username) quando faltarem
  useEffect(() => {
    if (!data.length) return;
    // Sempre buscar perfil para cada actorDiscordId que ainda não está no cache
    const missing = Array.from(new Set(
      data
        .filter(l => l.actorDiscordId && !actorProfiles[l.actorDiscordId])
        .map(l => l.actorDiscordId as string)
    ));
    if (!missing.length) return; // nada novo para buscar
    let cancelled = false;
    setActorProfilesLoading(true);
    (async () => {
      try {
        const results = await Promise.allSettled(
          missing.map(async id => {
            const res = await fetch(`https://api.neast.dev/v1/discord/users/${id}?raw=true`);
            if (!res.ok) throw new Error("fetch discord actor failed");
            const json = await res.json();
            return { id, username: json.username || json.global_name || id, avatar_url: json.avatar_url || json.default_avatar_url };
          })
        );
        const updates: Record<string, { username: string; avatar_url: string }> = {};
        results.forEach(r => {
          if (r.status === "fulfilled") {
            updates[r.value.id] = { username: r.value.username, avatar_url: r.value.avatar_url };
          }
        });
        if (!cancelled && Object.keys(updates).length) {
          setActorProfiles(prev => ({ ...prev, ...updates }));
        }
      } catch {
        // silencioso
      } finally {
        if (!cancelled) setActorProfilesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [data, actorProfiles]);

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
                  <div className={`space-y-8 page-fade ${(initialLoaded && !loading && !actorProfilesLoading) ? "ready" : ""}`}> 
                    {/* Filters */}
                    <div className="card p-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-end">
                        <div className="space-y-1">
                          <label className="text-[11px] text-[var(--muted)] font-medium">Ação</label>
                          <select
                            value={action}
                            onChange={(e) => {
                              setPage(1); setAction(e.target.value as LicenseLogAction | "");
                            }}
                            className="w-full h-9 rounded-lg bg-[var(--surface)] border border-[var(--border)] px-3 text-sm outline-none focus:border-zinc-500"
                          >
                            <option value="">Todas</option>
                            <option value="CREATE">CREATE</option>
                            <option value="UPDATE">UPDATE</option>
                            <option value="DELETE">DELETE</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-[var(--muted)] font-medium">Ator</label>
                          <select
                            value={actorType}
                            onChange={(e) => { setPage(1); setActorType(e.target.value as LicenseLogActorType | ""); }}
                            className="w-full h-9 rounded-lg bg-[var(--surface)] border border-[var(--border)] px-3 text-sm outline-none focus:border-zinc-500"
                          >
                            <option value="">Todos</option>
                            <option value="admin">admin</option>
                            <option value="bot">bot</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-[var(--muted)] font-medium">Token</label>
                          <input
                            value={token}
                            onChange={(e) => { setPage(1); setToken(e.target.value); }}
                            placeholder="Token"
                            className="w-full h-9 rounded-lg bg-[var(--surface)] border border-[var(--border)] px-3 text-sm outline-none placeholder:text-[var(--muted)] focus:border-zinc-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-[var(--muted)] font-medium">Usuário Discord</label>
                          <input
                            value={userDiscord}
                            onChange={(e) => { setPage(1); setUserDiscord(e.target.value); }}
                            placeholder="Discord ID"
                            className="w-full h-9 rounded-lg bg-[var(--surface)] border border-[var(--border)] px-3 text-sm outline-none placeholder:text-[var(--muted)] focus:border-zinc-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-[var(--muted)] font-medium">Script</label>
                          <input
                            value={scriptName}
                            onChange={(e) => { setPage(1); setScriptName(e.target.value); }}
                            placeholder="Nome do script"
                            className="w-full h-9 rounded-lg bg-[var(--surface)] border border-[var(--border)] px-3 text-sm outline-none placeholder:text-[var(--muted)] focus:border-zinc-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-[var(--muted)] font-medium">Itens / página</label>
                          <select
                            value={limit}
                            onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
                            className="w-full h-9 rounded-lg bg-[var(--surface)] border border-[var(--border)] px-3 text-sm outline-none focus:border-zinc-500"
                          >
                            {[20,40,60,100].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <button
                          onClick={() => { setPage(1); fetchLogs(); }}
                          className="btn btn-accent h-9 self-end inline-flex items-center justify-center gap-2"
                        >
                          <RefreshCcw size={14} /> Atualizar
                        </button>
                      </div>
                      {error && <p className="text-xs text-red-400">{error}</p>}
                    </div>

                    {/* List (fixed height with scroll) */}
                    <div className="card p-2 overflow-hidden">
                      <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-2">
                      {data.length === 0 ? (
                        <p className="text-xs text-[var(--muted)] px-2 py-2">Nenhum registro encontrado.</p>
                      ) : (
                        data.map(log => {
                          const source = (log.details as any)?.actionSource || "-";
                          const profile = log.actorDiscordId ? actorProfiles[log.actorDiscordId] : undefined;
                          // Preferir nome vindo do perfil Discord; fallback para actorUsername e depois para ID
                          const displayName = profile?.username || log.actorUsername || log.actorDiscordId || "Desconhecido";
                          const avatarUrl = profile?.avatar_url;
                          return (
                            <div key={log._id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)]/30 px-3 py-2">
                              <div className="flex items-center gap-3 min-w-0">
                                {avatarUrl ? (
                                  <div className="relative h-8 w-8 overflow-hidden rounded-full border border-[var(--border)] shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={avatarUrl} alt={displayName} className="object-cover h-full w-full" />
                                  </div>
                                ) : (
                                  <div className="h-8 w-8 rounded-full border border-[var(--border)] flex items-center justify-center bg-[#141218] text-[11px] font-semibold shrink-0">
                                    {displayName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-sm font-medium truncate max-w-[160px]" title={displayName}>{displayName}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${actionColors[log.action]}`}>{log.action}</span>
                                  <span className="text-[10px] text-[var(--muted)] truncate">Fonte: {source}</span>
                                  <span className="text-[10px] text-[var(--muted)]">• {new Date(log.createdAt).toLocaleString()}</span>
                                </div>
                              </div>
                              <button onClick={() => { setDetailLog(log); setShowDetailToken(false); }} className="tag cursor-pointer ml-3">
                                <Info size={14} /> DETALHES
                              </button>
                            </div>
                          );
                        })
                      )}
                      </div>
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

      {/* Modal Detalhes */}
      {detailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full p-6" style={{ maxWidth: 640 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-full border border-indigo-700/40 bg-indigo-500/10 text-indigo-300 flex items-center justify-center">
                <Info className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold">Detalhes do Registro</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-[var(--muted)]">Autor:</span> {detailLog.actorUsername || detailLog.actorDiscordId || "Desconhecido"} <span className="text-[10px] text-[var(--muted)]">({detailLog.actorType})</span></div>
              <div><span className="text-[var(--muted)]">Ação:</span> {detailLog.action}</div>
              <div><span className="text-[var(--muted)]">Criado:</span> {new Date(detailLog.createdAt).toLocaleString()}</div>
              <div><span className="text-[var(--muted)]">Fonte:</span> {(detailLog.details as any)?.actionSource || "-"}</div>
              {detailLog.licenseToken && (
                <div className="flex items-center gap-2">
                  <span className="text-[var(--muted)]">Token:</span>
                  <span className={`font-mono break-all ${showDetailToken ? "" : "blur-sm select-none"}`}>{detailLog.licenseToken}</span>
                  <button onClick={() => setShowDetailToken(v => !v)} className="p-1 rounded hover:bg-[var(--muted-foreground)]/10" aria-label={showDetailToken ? "Ocultar token" : "Exibir token"}>
                    {showDetailToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              )}
              {detailLog.scriptName && <div><span className="text-[var(--muted)]">Script:</span> {detailLog.scriptName}</div>}
              {detailLog.userDiscord && <div><span className="text-[var(--muted)]">Usuário:</span> {detailLog.userDiscord}</div>}
              {detailLog.requestIp && <div><span className="text-[var(--muted)]">IP:</span> {detailLog.requestIp}</div>}
              {detailLog.details && <pre className="text-[10px] text-[var(--muted)] bg-black/20 p-2 rounded border border-[var(--border)] overflow-x-auto">{JSON.stringify(detailLog.details, null, 2)}</pre>}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setDetailLog(null)} className="btn">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
