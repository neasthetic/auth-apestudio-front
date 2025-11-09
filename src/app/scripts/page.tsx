"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { Script } from "@/types/script";
import { License } from "@/types/license";
import { scriptService } from "@/services/scriptService";
import { licenseService } from "@/services/licenseService";
import CreateScriptModal from "@/components/CreateScriptModal";
import DashboardSidebar from "@/components/DashboardSidebar";
import Image from "next/image";

export default function ScriptsPage() {
  const { user, logout } = useAuth();

  const [scripts, setScripts] = useState<Script[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showCreateScriptModal, setShowCreateScriptModal] = useState(false);

  const loadAll = async () => {
    if (user?.role !== "admin") return;
    setLoading(true);
    try {
      const [s, l] = await Promise.all([
        scriptService.getAllScripts(),
        licenseService.getAllLicenses(),
      ]);
      setScripts(s);
      setLicenses(l);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return scripts;
    return scripts.filter((s) => s.name.toLowerCase().includes(q));
  }, [scripts, query]);

  const licenseCountByScriptName = useMemo(() => {
    const map = new Map<string, number>();
    for (const lic of licenses) {
      const key = lic.scriptName;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [licenses]);

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
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Scripts</h1>
                    <p className="text-sm text-[var(--muted)]">Gerencie seus scripts</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="container-page pb-16">
                <div className="mx-auto w-full max-w-5xl">
                  <div className="mb-4">
                    <div className="tag">{scripts.length} scripts criados</div>
                  </div>

                  {/* Filtro + Criar */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Filtrar por nome"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-zinc-500"
                      />
                    </div>
                    <button
                      className="btn btn-accent"
                      onClick={() => setShowCreateScriptModal(true)}
                    >
                      Novo Script
                    </button>
                  </div>

                  {/* Tabela */}
                  <div className="card overflow-hidden">
                    <div className="grid grid-cols-12 border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--muted)]">
                      <div className="col-span-6">Nome</div>
                      <div className="col-span-4">Criado em</div>
                      <div className="col-span-2 text-right">Licenças</div>
                    </div>

                    {loading ? (
                      <div className="px-3 py-10 text-center text-[var(--muted)]">Carregando...</div>
                    ) : filtered.length === 0 ? (
                      <div className="px-3 py-10 text-center text-[var(--muted)]">
                        Nenhum script encontrado.
                      </div>
                    ) : (
                      filtered.map((s) => (
                        <div
                          key={s._id}
                          className="grid grid-cols-12 items-center px-3 py-3 text-sm border-t border-[var(--border)]"
                        >
                          <div className="col-span-6 font-medium">{s.name}</div>
                          <div className="col-span-4 text-[var(--muted)]">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </div>
                          <div className="col-span-2 text-right font-semibold">
                            {licenseCountByScriptName.get(s.name) || 0}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <CreateScriptModal
                    isOpen={showCreateScriptModal}
                    onClose={() => setShowCreateScriptModal(false)}
                    onSuccess={loadAll}
                  />
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
