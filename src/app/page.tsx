"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import { License } from "@/types/license";
import { Script } from "@/types/script";
import { DashboardInfosResponse } from "@/types/dashboard";
import { licenseService } from "@/services/licenseService";
import { scriptService } from "@/services/scriptService";
import { dashboardService } from "@/services/dashboardService";
import LicenseCard from "@/components/LicenseCard";
import CreateLicenseModal from "@/components/CreateLicenseModal";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Eye, EyeOff, User as UserIcon, List, Folder } from "lucide-react";

export default function Home() {
  const { user, logout } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loadingLicenses, setLoadingLicenses] = useState(true);
  const [showCreateLicenseModal, setShowCreateLicenseModal] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardInfosResponse | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [topUserProfile, setTopUserProfile] = useState<{ username: string; avatar_url: string } | null>(null);
  const [topUserLoading, setTopUserLoading] = useState(false);
  const pageReady = !loadingDashboard && !topUserLoading;
  

  const loadLicenses = async () => {
    if (user?.role !== "admin") return;
    
    setLoadingLicenses(true);
    try {
      const data = await licenseService.getAllLicenses();
      setLicenses(data);
    } catch (error) {
      console.error("Erro ao carregar licenças:", error);
    } finally {
      setLoadingLicenses(false);
    }
  };

  const loadScripts = async () => {
    if (user?.role !== "admin") return;
    try {
      const data = await scriptService.getAllScripts();
      setScripts(data);
    } catch (error) {
      console.error("Erro ao carregar scripts:", error);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadLicenses();
      loadScripts();
      const loadDashboard = async () => {
        setLoadingDashboard(true);
        try {
          const data = await dashboardService.getInfos();
          setDashboard(data);
        } catch (e) {
          console.error("Erro ao carregar dashboard:", e);
        } finally {
          setLoadingDashboard(false);
        }
      };
      loadDashboard();
    }
  }, [user]);

  // Buscar avatar/nome do topUser (cliente com mais licenças) e evitar flicker do ID cru
  useEffect(() => {
    const id = dashboard?.topUser?.userDiscord;
    if (!id) return;
    let cancelled = false;
    setTopUserLoading(true);
    (async () => {
      try {
        const res = await fetch(`https://api.neast.dev/v1/discord/users/${id}?raw=true`);
        if (!res.ok) throw new Error("fetch falhou");
        const json = await res.json();
        if (!cancelled) {
          setTopUserProfile({
            username: json.username || json.global_name || id,
            avatar_url: json.avatar_url || json.default_avatar_url,
          });
        }
      } catch {
        if (!cancelled) setTopUserProfile(null);
      } finally {
        if (!cancelled) setTopUserLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [dashboard?.topUser?.userDiscord]);

  return (
    <ProtectedRoute>
      {user && (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
          <div className="flex">
            {/* Sidebar */}
            <DashboardSidebar user={user} onLogout={logout} />

            {/* Content */}
            <main className="flex-1">
              {/* Top header */}
              <div className="container-page py-8">
                <div className="flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-full border border-[var(--border)] md:size-12">
                    <Image src={user.avatar} alt={user.username} fill className="object-cover" unoptimized />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Home</h1>
                    <p className="text-sm text-[var(--muted)]">Bom te ver novamente, {user.username}</p>
                  </div>
                </div>
              </div>

          {/* Verifica se o usuário é admin */}
          {user.role !== "admin" ? (
            <div className="flex items-center justify-center h-[calc(100vh-120px)]">
              <div className="text-center">
                <p className="text-xl font-semibold text-red-400">
                  Você deve ser administrador para acessar essa página!
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className={`container-page space-y-12 pb-16 page-fade ${pageReady ? "ready" : ""}`}>
                {/* Dashboard Overview */}
                <div className="mx-auto w-full max-w-5xl space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold">Visão Geral</h2>
                    <p className="text-sm text-[var(--muted)] mt-1">Resumo rápido das métricas do sistema.</p>
                  </div>
                  {/* Overview stat cards */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {dashboard ? (
                      <>
                        <div className="card p-4 flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full border border-indigo-700/40 bg-indigo-500/10 text-indigo-300 flex items-center justify-center">
                            <UserIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[var(--muted)] uppercase tracking-wide">Clientes</span>
                              <span className="text-2xl font-semibold">{dashboard.totals.customers}</span>
                            </div>
                            <p className="text-[10px] text-[var(--muted)] mt-1">
                              {(() => {
                                const c = dashboard.totals.customers || 0;
                                const l = dashboard.totals.activeLicenses || 0;
                                const ratio = c > 0 ? (l / c) : 0;
                                return `${ratio.toFixed(2)}x licenças por cliente`;
                              })()}
                            </p>
                          </div>
                        </div>
                        <div className="card p-4 flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full border border-amber-700/40 bg-amber-500/10 text-amber-300 flex items-center justify-center">
                            <List className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[var(--muted)] uppercase tracking-wide">Licenças</span>
                              <span className="text-2xl font-semibold">{dashboard.totals.activeLicenses}</span>
                            </div>
                            <p className="text-[10px] text-[var(--muted)] mt-1">
                              {(() => {
                                const s = dashboard.totals.scripts || 0;
                                const l = dashboard.totals.activeLicenses || 0;
                                const ratio = s > 0 ? (l / s) : 0;
                                return `${ratio.toFixed(2)}x licenças por script`;
                              })()}
                            </p>
                          </div>
                        </div>
                        <div className="card p-4 flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full border border-emerald-700/40 bg-emerald-500/10 text-emerald-300 flex items-center justify-center">
                            <Folder className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[var(--muted)] uppercase tracking-wide">Scripts</span>
                              <span className="text-2xl font-semibold">{dashboard.totals.scripts}</span>
                            </div>
                            <p className="text-[10px] text-[var(--muted)] mt-1">
                              {dashboard.topScript ? `Mais popular: ${dashboard.topScript.licenseCount} licença${dashboard.topScript.licenseCount !== 1 ? "s" : ""}` : "Sem dados"}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-3 text-sm text-[var(--muted)]">Sem dados do dashboard.</div>
                    )}
                  </div>
                  
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="card p-4 space-y-3">
                      <h3 className="text-sm font-semibold">SCRIPT COM MAIS LICENÇAS</h3>
                      {dashboard?.topScript ? (
                        <div className="text-sm">
                          <p className="font-medium">{dashboard.topScript.scriptName}</p>
                          <p className="text-[var(--muted)] text-xs">{dashboard.topScript.licenseCount} licenças</p>
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--muted)]">Nenhum script encontrado.</p>
                      )}
                    </div>
                    <div className="card p-4 space-y-3">
                      <h3 className="text-sm font-semibold">CLIENTE COM MAIS LICENÇAS</h3>
                      {dashboard?.topUser ? (
                        topUserLoading ? (
                          <p className="text-xs text-[var(--muted)]">Carregando cliente...</p>
                        ) : (
                          <div className="flex items-center gap-3 text-sm">
                            {topUserProfile?.avatar_url ? (
                              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[var(--border)]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={topUserProfile.avatar_url} alt={topUserProfile.username} className="object-cover h-full w-full" />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-[var(--surface)] flex items-center justify-center text-xs border border-[var(--border)]">
                                {dashboard.topUser.userDiscord.slice(-2)}
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <p className="font-medium truncate max-w-[160px]" title={topUserProfile?.username || dashboard.topUser.userDiscord}>
                                {topUserProfile?.username || dashboard.topUser.userDiscord}
                              </p>
                              <p className="text-[var(--muted)] text-xs">{dashboard.topUser.licenseCount} licenças</p>
                            </div>
                          </div>
                        )
                      ) : (
                        <p className="text-xs text-[var(--muted)]">Nenhum usuário encontrado.</p>
                      )}
                    </div>
                  </div>
                  <div className="card p-4 space-y-3">
                    <h3 className="text-sm font-semibold">ÚLTIMA LICENÇA CRIADA</h3>
                    {dashboard?.latestLicense ? (
                      <div className="text-xs flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--muted)]">Token:</span>
                          <span className={`font-mono break-all transition ${showToken ? "" : "blur-sm select-none"}`}>
                            {dashboard.latestLicense.token}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowToken((v) => !v)}
                            className="p-1 rounded border border-transparent hover:border-[var(--border)] hover:bg-[var(--muted-foreground)]/10 text-[var(--muted)]"
                            aria-label={showToken ? "Ocultar token" : "Exibir token"}
                            title={showToken ? "Ocultar token" : "Exibir token"}
                          >
                            {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <div><span className="text-[var(--muted)]">Script:</span> {dashboard.latestLicense.scriptName}</div>
                        <div><span className="text-[var(--muted)]">Usuário:</span> {dashboard.latestLicense.userDiscord}</div>
                        <div><span className="text-[var(--muted)]">Criada:</span> {new Date(dashboard.latestLicense.createdAt).toLocaleString()}</div>
                        <div><span className="text-[var(--muted)]">Expira:</span> {dashboard.latestLicense.isPermanent ? "Nunca" : (dashboard.latestLicense.expiresAt ? new Date(dashboard.latestLicense.expiresAt).toLocaleDateString() : "-")}</div>
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--muted)]">Nenhuma licença registrada.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
            </main>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
