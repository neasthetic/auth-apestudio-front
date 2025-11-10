"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { licenseService } from "@/services/licenseService";
import { scriptService } from "@/services/scriptService";
import { CreateLicenseDto, License } from "@/types/license";
import { Script } from "@/types/script";
import Image from "next/image";
import { Info, Pencil, Trash2 } from "lucide-react";

interface NewLicenseForm {
  scriptId: string;
  userDiscord: string;
  ip: string;
  port: string;
  expiresAt?: string; // ISO date (YYYY-MM-DD)
  isPermanent: boolean;
}

export default function LicensesPage() {
  const { user, logout } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  // Cache com perfis do Discord buscados pela API externa
  const [discordProfiles, setDiscordProfiles] = useState<Record<string, { username: string; avatar_url: string }>>({});
  const [queryUserDiscord, setQueryUserDiscord] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailLicense, setShowDetailLicense] = useState<License | null>(null);
  const [editLicense, setEditLicense] = useState<License | null>(null);
  const [createForm, setCreateForm] = useState<NewLicenseForm>({
    scriptId: "",
    userDiscord: "",
    ip: "",
    port: "",
    expiresAt: "",
    isPermanent: false,
  });
  const [editForm, setEditForm] = useState<{ ip: string; port: string; expiresAt?: string; isPermanent: boolean }>({
    ip: "",
    port: "",
    expiresAt: "",
    isPermanent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const pageReady = !loading && !profilesLoading;

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

  // Busca nome e avatar do Discord via API do usuário quando não vier do backend
  useEffect(() => {
    if (!licenses.length) return;
    const missingIds = Array.from(
      new Set(
        licenses
          .filter(l => !(l.userName && l.userAvatar))
          .map(l => l.userDiscord)
          .filter(id => id && !discordProfiles[id])
      )
    );
    if (missingIds.length === 0) return; // nada a buscar, evita flicker

    let cancelled = false;
    setProfilesLoading(true);
    (async () => {
      try {
        const results = await Promise.allSettled(
          missingIds.map(async (id) => {
            const res = await fetch(`https://api.neast.dev/v1/discord/users/${id}?raw=true`);
            if (!res.ok) throw new Error("discord fetch failed");
            const json = await res.json();
            return { id, username: json.username || json.global_name || id, avatar_url: json.avatar_url || json.default_avatar_url } as { id: string; username: string; avatar_url: string };
          })
        );
        const updates: Record<string, { username: string; avatar_url: string }> = {};
        results.forEach((r) => {
          if (r.status === "fulfilled" && r.value) {
            updates[r.value.id] = { username: r.value.username, avatar_url: r.value.avatar_url };
          }
        });
        if (!cancelled && Object.keys(updates).length) {
          setDiscordProfiles((prev) => ({ ...prev, ...updates }));
        }
      } catch {
        // Erro silencioso
      } finally {
        if (!cancelled) setProfilesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [licenses, discordProfiles]);

  const filtered = useMemo(() => {
    const q = queryUserDiscord.trim();
    if (!q) return licenses;
    return licenses.filter((lic) => lic.userDiscord.includes(q));
  }, [licenses, queryUserDiscord]);

  const openEdit = (lic: License) => {
    setEditLicense(lic);
    const [ipOnly, portOnly] = (lic.ipPort || "").split(":");
    setEditForm({
      ip: ipOnly || "",
      port: (portOnly || "").trim(),
      expiresAt: lic.expiresAt ? lic.expiresAt.substring(0, 10) : "",
      isPermanent: lic.isPermanent,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.scriptId || !createForm.userDiscord) return alert("Preencha script e usuário");
    const trimmedIp = createForm.ip.trim();
    const trimmedPort = createForm.port.trim();
    if (trimmedPort && Number.isNaN(Number(trimmedPort))) {
      return alert("Porta inválida");
    }
    setSubmitting(true);
    try {
      const payload: CreateLicenseDto = {
        scriptId: createForm.scriptId,
        userDiscord: createForm.userDiscord,
      };

      if (trimmedIp) payload.ip = trimmedIp;
      if (trimmedPort) payload.port = Number(trimmedPort);
      if (createForm.isPermanent) {
        payload.isPermanent = true;
      } else if (createForm.expiresAt) {
        payload.expiresInDays = calcDaysFromToday(createForm.expiresAt);
      }

      await licenseService.createLicense(payload);
      setShowCreateModal(false);
      setCreateForm({ scriptId: "", userDiscord: "", ip: "", port: "", expiresAt: "", isPermanent: false });
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
    const { ip, port, isPermanent, expiresAt } = editForm;
    const normalized = normalizeIpInput(ip, port);
    if (normalized.port && Number.isNaN(Number(normalized.port))) {
      return alert("Porta inválida");
    }
    setSubmitting(true);
    try {
      const actions: Array<Promise<unknown>> = [];

      const newIpPort = buildIpPortString(normalized.ip, normalized.port);
      const currentIpPort = editLicense.ipPort || "";
      if (newIpPort && newIpPort !== currentIpPort) {
        actions.push(licenseService.updateIpPort(editLicense.token, { ipPort: newIpPort }));
      }

      if (!editLicense.isPermanent && isPermanent) {
        actions.push(licenseService.makePermanent(editLicense.token));
      }

      if (!isPermanent && !editLicense.isPermanent) {
        const originalExpires = editLicense.expiresAt ? parseDateOnly(editLicense.expiresAt) : null;
        const targetExpires = expiresAt ? parseDateOnly(expiresAt) : null;
        if (originalExpires && targetExpires) {
          const diffDays = differenceInDays(targetExpires, originalExpires);
          if (diffDays > 0) {
            actions.push(licenseService.addDays(editLicense.token, { days: diffDays }));
          } else if (diffDays < 0) {
            actions.push(licenseService.removeDays(editLicense.token, { days: Math.abs(diffDays) }));
          }
        }
      }

      for (const action of actions) {
        await action;
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
                    <p className="text-sm text-[var(--muted)]">Abaixo, você pode ver a lista de todas as licenças Ape Studio.</p>
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

                  {/* Tabela (aguarda perfis para evitar flicker) */}
                  <div className="card overflow-hidden">
                    <div className="grid grid-cols-12 border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--muted)]">
                      <div className="col-span-3">Script</div>
                      <div className="col-span-3">Cliente</div>
                      <div className="col-span-2">IP</div>
                      <div className="col-span-2">Porta</div>
                      <div className="col-span-2 text-right">Ações</div>
                    </div>
                    {(!pageReady) ? (
                      <div className="px-3 py-10 text-center text-[var(--muted)]">Carregando perfis...</div>
                    ) : filtered.length === 0 ? (
                      <div className="px-3 py-10 text-center text-[var(--muted)]">Nenhuma licença encontrada.</div>
                    ) : (
                      filtered.map((lic) => {
                        const [ip, port] = (lic.ipPort || "").split(":");
                        const isExpired = !lic.isPermanent && lic.expiresAt ? new Date(lic.expiresAt) < new Date() : false;
                        const displayAvatar = lic.userAvatar || discordProfiles[lic.userDiscord]?.avatar_url;
                        const displayName = lic.userName || discordProfiles[lic.userDiscord]?.username || lic.userDiscord;
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
                              {displayAvatar ? (
                                <div className="relative h-6 w-6 overflow-hidden rounded-full border border-[var(--border)]">
                                  <Image src={displayAvatar} alt={displayName} fill className="object-cover" unoptimized />
                                </div>
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-[var(--surface)] flex items-center justify-center text-[10px] border border-[var(--border)]">
                                  {lic.userDiscord.slice(-2)}
                                </div>
                              )}
                              <span className="truncate" title={displayName}>{displayName}</span>
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
                        value={createForm.ip}
                        onChange={(e) => {
                          const normalized = normalizeIpInput(e.target.value, createForm.port);
                          setCreateForm((prev) => ({
                            ...prev,
                            ip: normalized.ip,
                            port: normalized.port,
                          }));
                        }}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-zinc-500"
                        placeholder="179.156.186.227"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-[var(--muted)]">Porta</label>
                      <input
                        value={createForm.port}
                        onChange={(e) => {
                          const next = e.target.value.replace(/[^0-9]/g, "");
                          setCreateForm((prev) => ({ ...prev, port: next }));
                        }}
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
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setCreateForm((prev) => ({
                              ...prev,
                              isPermanent: checked,
                              expiresAt: checked ? "" : prev.expiresAt,
                            }));
                          }}
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
                      value={editForm.ip}
                      onChange={(e) => {
                        const normalized = normalizeIpInput(e.target.value, editForm.port);
                        setEditForm((prev) => ({
                          ...prev,
                          ip: normalized.ip,
                          port: normalized.port || prev.port,
                        }));
                      }}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-[var(--muted)]">Porta</label>
                    <input
                      value={editForm.port}
                      onChange={(e) => {
                        const next = e.target.value.replace(/[^0-9]/g, "");
                        setEditForm((prev) => ({ ...prev, port: next }));
                      }}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="group flex items-center gap-3 text-sm text-[var(--muted)] cursor-pointer select-none">
                      <span className="relative inline-flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={editForm.isPermanent}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setEditForm((prev) => ({
                              ...prev,
                              isPermanent: checked,
                              expiresAt: checked ? "" : prev.expiresAt,
                            }));
                          }}
                          disabled={editLicense?.isPermanent}
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

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function normalizeIpInput(ipValue: string, portValue: string) {
  const [rawIp = "", rawPort = ""] = ipValue.split(":");
  const ip = rawIp.trim();
  const colonPort = rawPort.trim();
  const fallbackPort = (portValue || "").trim();
  return {
    ip,
    port: colonPort || fallbackPort,
  };
}

function buildIpPortString(ip: string, port: string) {
  const trimmedIp = ip.trim();
  const trimmedPort = (port || "").trim();
  if (!trimmedIp) return "";
  return trimmedPort ? `${trimmedIp}:${trimmedPort}` : trimmedIp;
}

function parseDateOnly(value: string) {
  if (!value) return null;
  const base = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
}

function differenceInDays(target: Date, current: Date) {
  return Math.round((target.getTime() - current.getTime()) / MS_PER_DAY);
}
