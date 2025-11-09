"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { useEffect, useState } from "react";
import { License } from "@/types/license";
import { Script } from "@/types/script";
import { licenseService } from "@/services/licenseService";
import { scriptService } from "@/services/scriptService";
import LicenseCard from "@/components/LicenseCard";
import ScriptCard from "@/components/ScriptCard";
import CreateLicenseModal from "@/components/CreateLicenseModal";
import CreateScriptModal from "@/components/CreateScriptModal";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function Home() {
  const { user, logout } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loadingLicenses, setLoadingLicenses] = useState(true);
  const [loadingScripts, setLoadingScripts] = useState(true);
  const [showCreateLicenseModal, setShowCreateLicenseModal] = useState(false);
  const [showCreateScriptModal, setShowCreateScriptModal] = useState(false);

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
    
    setLoadingScripts(true);
    try {
      const data = await scriptService.getAllScripts();
      setScripts(data);
    } catch (error) {
      console.error("Erro ao carregar scripts:", error);
    } finally {
      setLoadingScripts(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadLicenses();
      loadScripts();
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
                {/* Seção de Scripts */}
                <div id="scripts">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold">Scripts</h2>
                      <p className="text-[var(--muted)] text-sm mt-1">
                        {scripts.length} script{scripts.length !== 1 ? "s" : ""} cadastrado{scripts.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCreateScriptModal(true)}
                      className="btn btn-accent"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Novo Script
                    </button>
                  </div>

                  {loadingScripts ? (
                    <div className="text-center py-12">
                      <div className="text-[var(--muted)]">Carregando scripts...</div>
                    </div>
                  ) : scripts.length === 0 ? (
                    <div className="text-center py-12 card">
                      <p className="text-[var(--muted)]">Nenhum script cadastrado ainda.</p>
                      <button
                        onClick={() => setShowCreateScriptModal(true)}
                        className="mt-4 text-[var(--accent)] hover:opacity-90 transition-opacity"
                      >
                        Criar primeiro script
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {scripts.map((script) => (
                        <ScriptCard
                          key={script._id}
                          script={script}
                          onUpdate={loadScripts}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Seção de Licenças */}
                <div id="licenses">
                  <div className="flex items-center justify-between mb-6">
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
                    <div className="text-center py-12">
                      <div className="text-[var(--muted)]">Carregando licenças...</div>
                    </div>
                  ) : licenses.length === 0 ? (
                    <div className="text-center py-12 card">
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <CreateScriptModal
                isOpen={showCreateScriptModal}
                onClose={() => setShowCreateScriptModal(false)}
                onSuccess={loadScripts}
              />
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
