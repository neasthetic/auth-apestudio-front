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
import { Eye, EyeOff, User as UserIcon, List, Folder, X } from "lucide-react";

export default function Home() {
  const { user, logout } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loadingLicenses, setLoadingLicenses] = useState(true);
  const [showCreateLicenseModal, setShowCreateLicenseModal] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardInfosResponse | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [showClientsModal, setShowClientsModal] = useState(false);
  const [showLicensesModal, setShowLicensesModal] = useState(false);
  const [showScriptsModal, setShowScriptsModal] = useState(false);

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
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Painel</h1>
                    <p className="text-sm text-[var(--muted)]">Olá, {user.username}</p>
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
              <div className="container-page space-y-12 pb-16">
                {/* Dashboard Overview */}
                <div className="mx-auto w-full max-w-5xl space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold">Visão Geral</h2>
                    <p className="text-sm text-[var(--muted)] mt-1">Resumo rápido das métricas do sistema.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {loadingDashboard ? (
                      <div className="col-span-4 text-sm text-[var(--muted)]">Carregando métricas...</div>
                    ) : dashboard ? (
                      <>
                        <div
                          className="card p-4 flex items-center gap-4 cursor-pointer hover:border-[var(--accent)]/40 transition"
                          onClick={() => setShowClientsModal(true)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="h-12 w-12 rounded-full border border-indigo-700/40 bg-indigo-500/10 text-indigo-300 flex items-center justify-center">
                            <UserIcon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[var(--muted)] uppercase tracking-wide">Clientes</span>
                              <span className="text-2xl font-semibold">{dashboard.totals.customers}</span>
                            </div>
                            <div className="text-[11px] text-[var(--muted)] mt-1">
                              {dashboard.totals.customers > 0
                                ? `${(dashboard.totals.activeLicenses / dashboard.totals.customers).toFixed(2)}x licenças por cliente`
                                : "-"}
                            </div>
                          </div>
                        </div>
                        <div
                          className="card p-4 flex items-center gap-4 cursor-pointer hover:border-[var(--accent)]/40 transition"
                          onClick={() => setShowLicensesModal(true)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="h-12 w-12 rounded-full border border-amber-700/40 bg-amber-500/10 text-amber-300 flex items-center justify-center">
                            <List className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[var(--muted)] uppercase tracking-wide">Licenças</span>
                              <span className="text-2xl font-semibold">{dashboard.totals.activeLicenses}</span>
                            </div>
                            <div className="text-[11px] text-[var(--muted)] mt-1">
                              {dashboard.totals.scripts > 0
                                ? `${(dashboard.totals.activeLicenses / dashboard.totals.scripts).toFixed(2)}x licenças por script`
                                : "-"}
                            </div>
                          </div>
                        </div>
                        <div
                          className="card p-4 flex items-center gap-4 cursor-pointer hover:border-[var(--accent)]/40 transition"
                          onClick={() => setShowScriptsModal(true)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="h-12 w-12 rounded-full border border-emerald-700/40 bg-emerald-500/10 text-emerald-300 flex items-center justify-center">
                            <Folder className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[var(--muted)] uppercase tracking-wide">Scripts</span>
                              <span className="text-2xl font-semibold">{dashboard.totals.scripts}</span>
                            </div>
                            <div className="text-[11px] text-[var(--muted)] mt-1">
                              {dashboard.topScript ? `Mais popular: ${dashboard.topScript.licenseCount} licenças` : "-"}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="card p-4 space-y-3">
                      <h3 className="text-sm font-semibold">Script com mais licenças</h3>
                      {loadingDashboard ? (
                        <p className="text-xs text-[var(--muted)]">Carregando...</p>
                      ) : dashboard?.topScript ? (
                        <div className="text-sm">
                          <p className="font-medium">{dashboard.topScript.scriptName}</p>
                          <p className="text-[var(--muted)] text-xs">{dashboard.topScript.licenseCount} licenças</p>
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--muted)]">Nenhum script encontrado.</p>
                      )}
                    </div>
                    <div className="card p-4 space-y-3">
                      <h3 className="text-sm font-semibold">Usuário com mais licenças</h3>
                      {loadingDashboard ? (
                        <p className="text-xs text-[var(--muted)]">Carregando...</p>
                      ) : dashboard?.topUser ? (
                        <div className="text-sm">
                          <p className="font-medium">{dashboard.topUser.userDiscord}</p>
                          <p className="text-[var(--muted)] text-xs">{dashboard.topUser.licenseCount} licenças</p>
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--muted)]">Nenhum usuário encontrado.</p>
                      )}
                    </div>
                  </div>
                  <div className="card p-4 space-y-3">
                    <h3 className="text-sm font-semibold">Última licença criada</h3>
                    {loadingDashboard ? (
                      <p className="text-xs text-[var(--muted)]">Carregando...</p>
                    ) : dashboard?.latestLicense ? (
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
      {/* Modals Dashboard */}
      {showClientsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border border-indigo-700/40 bg-indigo-500/10 text-indigo-300 flex items-center justify-center">
                  <UserIcon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold">Clientes</h2>
              </div>
              <button onClick={() => setShowClientsModal(false)} className="text-[var(--muted)] hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="text-sm space-y-2">
              <div><span className="text-[var(--muted)]">Total:</span> {dashboard?.totals.customers ?? "-"}</div>
              <div className="text-[11px] text-[var(--muted)]">
                {dashboard && dashboard.totals.customers > 0 ? `${(dashboard.totals.activeLicenses / dashboard.totals.customers).toFixed(2)}x licenças por cliente` : "-"}
              </div>
            </div>
            <div className="flex justify-end pt-4"><button className="btn" onClick={() => setShowClientsModal(false)}>Fechar</button></div>
          </div>
        </div>
      )}
      {showLicensesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border border-amber-700/40 bg-amber-500/10 text-amber-300 flex items-center justify-center">
                  <List className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold">Licenças</h2>
              </div>
              <button onClick={() => setShowLicensesModal(false)} className="text-[var(--muted)] hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="text-sm space-y-2">
              <div><span className="text-[var(--muted)]">Ativas:</span> {dashboard?.totals.activeLicenses ?? "-"}</div>
              <div className="text-[11px] text-[var(--muted)]">
                {dashboard && dashboard.totals.scripts > 0 ? `${(dashboard.totals.activeLicenses / dashboard.totals.scripts).toFixed(2)}x licenças por script` : "-"}
              </div>
            </div>
            <div className="flex justify-end pt-4"><button className="btn" onClick={() => setShowLicensesModal(false)}>Fechar</button></div>
          </div>
        </div>
      )}
      {showScriptsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border border-emerald-700/40 bg-emerald-500/10 text-emerald-300 flex items-center justify-center">
                  <Folder className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold">Scripts</h2>
              </div>
              <button onClick={() => setShowScriptsModal(false)} className="text-[var(--muted)] hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="text-sm space-y-2">
              <div><span className="text-[var(--muted)]">Total:</span> {dashboard?.totals.scripts ?? "-"}</div>
              <div className="text-[11px] text-[var(--muted)]">
                {dashboard?.topScript ? `Mais popular: ${dashboard.topScript.licenseCount} licenças` : "-"}
              </div>
            </div>
            <div className="flex justify-end pt-4"><button className="btn" onClick={() => setShowScriptsModal(false)}>Fechar</button></div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
