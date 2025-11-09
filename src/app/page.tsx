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

export default function Home() {
  const { user, logout } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loadingLicenses, setLoadingLicenses] = useState(true);
  const [showCreateLicenseModal, setShowCreateLicenseModal] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardInfosResponse | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

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
                        <div className="card p-4 flex flex-col gap-1">
                          <span className="text-xs text-[var(--muted)] uppercase tracking-wide">Scripts</span>
                          <span className="text-2xl font-semibold">{dashboard.totals.scripts}</span>
                        </div>
                        <div className="card p-4 flex flex-col gap-1">
                          <span className="text-xs text-[var(--muted)] uppercase tracking-wide">Clientes</span>
                          <span className="text-2xl font-semibold">{dashboard.totals.customers}</span>
                        </div>
                        <div className="card p-4 flex flex-col gap-1">
                          <span className="text-xs text-[var(--muted)] uppercase tracking-wide">Licenças Ativas</span>
                          <span className="text-2xl font-semibold">{dashboard.totals.activeLicenses}</span>
                        </div>
                        <div className="card p-4 flex flex-col gap-1">
                          <span className="text-xs text-[var(--muted)] uppercase tracking-wide">Top Script</span>
                          <span className="text-lg font-medium truncate">{dashboard.topScript ? `${dashboard.topScript.scriptName}` : "—"}</span>
                          <span className="text-xs text-[var(--muted)]">{dashboard.topScript ? `${dashboard.topScript.licenseCount} licenças` : "Sem dados"}</span>
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
                        <div><span className="text-[var(--muted)]">Token:</span> {dashboard.latestLicense.token}</div>
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

                {/* Seção de Licenças */}
                <div id="licenses">
                  <div className="mx-auto w-full max-w-5xl flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold">Licenças</h2>
                      <p className="text-[var(--muted)] text-sm mt-1">
                        {licenses.length} licença{licenses.length !== 1 ? "s" : ""} cadastrada{licenses.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCreateLicenseModal(true)}
                      className="btn btn-accent"
                      disabled={scripts.length === 0}
                      title={scripts.length === 0 ? "Crie um script primeiro" : ""}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Nova Licença
                    </button>
                  </div>

                  {loadingLicenses ? (
                    <div className="text-center py-12 mx-auto max-w-5xl">
                      <div className="text-[var(--muted)]">Carregando licenças...</div>
                    </div>
                  ) : licenses.length === 0 ? (
                    <div className="text-center py-12 card mx-auto max-w-5xl">
                      <p className="text-[var(--muted)]">
                        {scripts.length === 0 
                          ? "Crie um script primeiro antes de criar licenças." 
                          : "Nenhuma licença cadastrada ainda."}
                      </p>
                      {scripts.length > 0 && (
                        <button
                          onClick={() => setShowCreateLicenseModal(true)}
                          className="mt-4 text-[var(--accent)] hover:opacity-90 transition-opacity"
                        >
                          Criar primeira licença
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mx-auto max-w-5xl">
                      {licenses.map((license) => (
                        <LicenseCard
                          key={license._id}
                          license={license}
                          onUpdate={loadLicenses}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modais */}
              <CreateLicenseModal
                isOpen={showCreateLicenseModal}
                onClose={() => setShowCreateLicenseModal(false)}
                onSuccess={loadLicenses}
                scripts={scripts}
              />
            </>
          )}
            </main>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
