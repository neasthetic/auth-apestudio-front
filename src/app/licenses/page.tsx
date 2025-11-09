"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { licenseService } from "@/services/licenseService";
import { scriptService } from "@/services/scriptService";
import { License } from "@/types/license";
import { Script } from "@/types/script";
import Image from "next/image";
import { Info, Pencil, Trash2 } from "lucide-react";

interface NewLicenseForm {
  scriptId: string;
  userDiscord: string;
  ipPort: string;
  port: string;
  expiresAt?: string; // ISO date (YYYY-MM-DD)
  isPermanent: boolean;
}

export default function LicensesPage() {
  const { user, logout } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryUserDiscord, setQueryUserDiscord] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailLicense, setShowDetailLicense] = useState<License | null>(null);
  const [editLicense, setEditLicense] = useState<License | null>(null);
  const [createForm, setCreateForm] = useState<NewLicenseForm>({
    scriptId: "",
    userDiscord: "",
    ipPort: "",
    port: "",
    expiresAt: "",
    isPermanent: false,
  });
  const [editForm, setEditForm] = useState<{ ipPort: string; port: string; expiresAt?: string; isPermanent: boolean }>({
    ipPort: "",
    port: "",
    expiresAt: "",
    isPermanent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const pageReady = !loading;

  // Close page modals with ESC
  useEffect(() => {
    const anyOpen = showCreateModal || !!showDetailLicense || !!editLicense;
    if (!anyOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showCreateModal) setShowCreateModal(false);
        if (showDetailLicense) setShowDetailLicense(null);
        if (editLicense) setEditLicense(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showCreateModal, showDetailLicense, editLicense]);

  const loadAll = async () => {
    if (user?.role !== "admin") return;
    setLoading(true);
    try {
      const [l, s] = await Promise.all([
        licenseService.getAllLicenses(),
        scriptService.getAllScripts(),
      ]);
      setLicenses(l);
      setScripts(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = useMemo(() => {
    const q = queryUserDiscord.trim();
    if (!q) return licenses;
    return licenses.filter((lic) => lic.userDiscord.includes(q));
  }, [licenses, queryUserDiscord]);

  const openEdit = (lic: License) => {
    setEditLicense(lic);
    setEditForm({
      ipPort: lic.ipPort || "",
      port: lic.ipPort?.split(":")[1] || "", // placeholder if port separated
      expiresAt: lic.expiresAt ? lic.expiresAt.substring(0, 10) : "",
      isPermanent: lic.isPermanent,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.scriptId || !createForm.userDiscord) return alert("Preencha script e usuário");
    setSubmitting(true);
    try {
      await licenseService.createLicense({
        scriptId: createForm.scriptId,
        userDiscord: createForm.userDiscord,
        expiresInDays: !createForm.isPermanent && createForm.expiresAt ? calcDaysFromToday(createForm.expiresAt) : undefined,
      });
      setShowCreateModal(false);
      setCreateForm({ scriptId: "", userDiscord: "", ipPort: "", port: "", expiresAt: "", isPermanent: false });
      loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao criar licença");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLicense) return;
    setSubmitting(true);
    try {
      // only updating ip/port or days (simplified placeholder; real API might differ)
      if (editForm.ipPort) {
        await licenseService.updateIpPort(editLicense.token, { ipPort: editForm.ipPort });
      }
      if (!editForm.isPermanent && editForm.expiresAt) {
        const days = calcDaysFromToday(editForm.expiresAt);
        if (days > 0) {
          await licenseService.addDays(editLicense.token, { days });
        }
      }
      setEditLicense(null);
      loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao editar licença");
    } finally {
      setSubmitting(false);
    }
  };

  const removeLicense = async (lic: License) => {
    if (!confirm("Remover licença?")) return;
    try {
      await licenseService.deleteLicense(lic.token);
      loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao remover");
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
                <div className="flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-full border border-[var(--border)] md:size-12">
                    <Image src={user.avatar} alt={user.username} fill className="object-cover" unoptimized />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Licenças</h1>
                    <p className="text-sm text-[var(--muted)]">Abaixo, você pode ver a lista de todas as suas licenças.</p>
                  </div>
                </div>
              </div>
              <div className={`container-page pb-16 page-fade ${pageReady ? "ready" : ""}`}>
                <div className="mx-auto w-full max-w-5xl space-y-5">
                  {/* Filtros e ações */}
                  <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex-1 min-w-[180px]">
                      <input
                        value={queryUserDiscord}
                        onChange={(e) => setQueryUserDiscord(e.target.value)}
                        placeholder="ID do cliente"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-zinc-500"
                      />
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-accent"
                      disabled={scripts.length === 0}
                    >
                      + Criar licença
                    </button>
                  </div>

                  {/* Tabela */}
                  <div className="card overflow-hidden">
                    <div className="grid grid-cols-12 border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--muted)]">
                      <div className="col-span-3">Script</div>
                      <div className="col-span-3">Cliente</div>
                      <div className="col-span-2">IP</div>
                      <div className="col-span-2">Porta</div>
                      <div className="col-span-2 text-right">Ações</div>
                    </div>
                    {filtered.length === 0 ? (
                      <div className="px-3 py-10 text-center text-[var(--muted)]">Nenhuma licença encontrada.</div>
                    ) : (
                      filtered.map((lic) => {
                        const [ip, port] = (lic.ipPort || "").split(":");
                        const isExpired = !lic.isPermanent && lic.expiresAt ? new Date(lic.expiresAt) < new Date() : false;
                        return (
                          <div key={lic.token} className="grid grid-cols-12 items-center px-3 py-3 text-sm border-t border-[var(--border)]">
                            <div className="col-span-3 font-medium truncate flex items-center gap-2">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: isExpired ? "#ef4444" : "#22c55e" }}
                                title={isExpired ? "Expirada" : "Ativa"}
                              />
                              <span className="truncate">{lic.scriptName}</span>
                            </div>
                            <div className="col-span-3 flex items-center gap-2 min-w-0">
                              {lic.userAvatar ? (
                                <div className="relative h-6 w-6 overflow-hidden rounded-full border border-[var(--border)]">
                                  <Image src={lic.userAvatar} alt={lic.userName || lic.userDiscord} fill className="object-cover" unoptimized />
                                </div>
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-[var(--surface)] flex items-center justify-center text-[10px] border border-[var(--border)]">
                                  {lic.userDiscord.slice(-2)}
                                </div>
                              )}
                              <span className="truncate" title={lic.userName || lic.userDiscord}>{lic.userName || lic.userDiscord}</span>
                            </div>
                            <div className="col-span-2 text-[var(--muted)]">{ip || "-"}</div>
                            <div className="col-span-2 text-[var(--muted)]">{port || "-"}</div>
                            <div className="col-span-2 flex items-center justify-end gap-2">
                              <button onClick={() => setShowDetailLicense(lic)} className="tag cursor-pointer"><Info size={14} /> DETALHES</button>
                              <button onClick={() => openEdit(lic)} className="tag cursor-pointer"><Pencil size={14} /> EDITAR</button>
                              <button onClick={() => removeLicense(lic)} className="tag cursor-pointer text-red-500"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>

          {/* Modal Criar */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="card w-full max-w-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-full border border-amber-700/40 bg-amber-500/10 text-amber-300 flex items-center justify-center">
                    {/* Ícone Lista */}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
                  </div>
                  <h2 className="text-lg font-semibold">Criar Licença</h2>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm text-[var(--muted)]">Script *</label>
                    <select
                      value={createForm.scriptId}
                      onChange={(e) => setCreateForm({ ...createForm, scriptId: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-zinc-500"
                      required
                    >
                      <option value="">Selecione</option>
                      {scripts.map((s) => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-[var(--muted)]">ID do Usuário (Discord) *</label>
                    <input
                      value={createForm.userDiscord}
                      onChange={(e) => setCreateForm({ ...createForm, userDiscord: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-zinc-500"
                      required
                      placeholder="735388907772051497"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm text-[var(--muted)]">IP</label>
                      <input
                        value={createForm.ipPort}
                        onChange={(e) => setCreateForm({ ...createForm, ipPort: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-zinc-500"
                        placeholder="179.156.186.227"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-[var(--muted)]">Porta</label>
                      <input
                        value={createForm.port}
                        onChange={(e) => setCreateForm({ ...createForm, port: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-zinc-500"
                        placeholder="30120"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="group flex items-center gap-3 text-sm text-[var(--muted)] cursor-pointer select-none">
                      <span className="relative inline-flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={createForm.isPermanent}
                          onChange={(e) => setCreateForm({ ...createForm, isPermanent: e.target.checked })}
                          className="peer h-5 w-5 rounded-md border border-[var(--border)] bg-[var(--surface)] appearance-none cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-0 checked:bg-[var(--accent)] checked:border-[var(--accent)]"
                          aria-label="Marcar licença como permanente"
                        />
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white opacity-0 peer-checked:opacity-100">✓</span>
                      </span>
                      <span className="text-white font-medium group-hover:text-white transition-colors">Permanente</span>
                    </label>
                    {!createForm.isPermanent && (
                      <input
                        type="date"
                        value={createForm.expiresAt}
                        onChange={(e) => setCreateForm({ ...createForm, expiresAt: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-zinc-500"
                      />
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowCreateModal(false)} className="btn flex-1">Cancelar</button>
                    <button type="submit" disabled={submitting} className="btn btn-accent flex-1">
                      {submitting ? "Criando..." : "Criar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Detalhes */}
          {showDetailLicense && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="card w-full p-6" style={{ maxWidth: Math.min(Math.max((showDetailLicense.token.length * 8), 380), 640) }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-full border border-indigo-700/40 bg-indigo-500/10 text-indigo-300 flex items-center justify-center">
                    {/* Ícone Info */}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
                  </div>
                  <h2 className="text-lg font-semibold">Detalhes da Licença</h2>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="break-all font-mono"><span className="text-[var(--muted)]">Token:</span> {showDetailLicense.token}</div>
                  <div><span className="text-[var(--muted)]">Criada em:</span> {new Date(showDetailLicense.createdAt).toLocaleString()}</div>
                  <div><span className="text-[var(--muted)]">Expira em:</span> {showDetailLicense.isPermanent ? "Nunca" : (showDetailLicense.expiresAt ? new Date(showDetailLicense.expiresAt).toLocaleString() : "-")}</div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setShowDetailLicense(null)} className="btn">Fechar</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Editar */}
          {editLicense && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="card w-full max-w-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-full border border-green-700/40 bg-green-500/10 text-green-300 flex items-center justify-center">
                    {/* Ícone Pencil */}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </div>
                  <h2 className="text-lg font-semibold">Editar Licença</h2>
                </div>
                <form onSubmit={handleEdit} className="space-y-4 text-sm">
                  <div>
                    <label className="mb-1 block text-sm text-[var(--muted)]">IP</label>
                    <input
                      value={editForm.ipPort}
                      onChange={(e) => setEditForm({ ...editForm, ipPort: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-[var(--muted)]">Porta</label>
                    <input
                      value={editForm.port}
                      onChange={(e) => setEditForm({ ...editForm, port: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="group flex items-center gap-3 text-sm text-[var(--muted)] cursor-pointer select-none">
                      <span className="relative inline-flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={editForm.isPermanent}
                          onChange={(e) => setEditForm({ ...editForm, isPermanent: e.target.checked })}
                          className="peer h-5 w-5 rounded-md border border-[var(--border)] bg-[var(--surface)] appearance-none cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-0 checked:bg-[var(--accent)] checked:border-[var(--accent)]"
                          aria-label="Marcar licença como permanente"
                        />
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white opacity-0 peer-checked:opacity-100">✓</span>
                      </span>
                      <span className="text-white font-medium group-hover:text-white transition-colors">Permanente</span>
                    </label>
                    {!editForm.isPermanent && (
                      <input
                        type="date"
                        value={editForm.expiresAt}
                        onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-zinc-500"
                      />
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setEditLicense(null)} className="btn flex-1">Cancelar</button>
                    <button type="submit" disabled={submitting} className="btn btn-accent flex-1">
                      {submitting ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </ProtectedRoute>
  );
}

function calcDaysFromToday(dateStr: string) {
  const today = new Date();
  const target = new Date(dateStr + "T00:00:00");
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
