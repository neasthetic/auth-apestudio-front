"use client";

import { useEffect, useState } from "react";
import { licenseService } from "@/services/licenseService";
import { Script } from "@/types/script";
import { List, X } from "lucide-react";

interface CreateLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  scripts: Script[];
}

export default function CreateLicenseModal({ isOpen, onClose, onSuccess, scripts }: CreateLicenseModalProps) {
  const [scriptId, setScriptId] = useState("");
  const [userDiscord, setUserDiscord] = useState("");
  const [isPermanent, setIsPermanent] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [loading, setLoading] = useState(false);

  // Close with ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scriptId || !userDiscord) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      await licenseService.createLicense({
        scriptId,
        userDiscord,
        expiresInDays: isPermanent ? undefined : Number(expiresInDays),
      });
      
      // Limpa o formulário
      setScriptId("");
      setUserDiscord("");
      setIsPermanent(false);
      setExpiresInDays("30");
      
      onSuccess();
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao criar licença");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full border border-amber-700/40 bg-amber-500/10 text-amber-300 flex items-center justify-center">
              <List className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold">Nova Licença</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
              Script *
            </label>
            <select
              value={scriptId}
              onChange={(e) => setScriptId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-zinc-500"
              required
            >
              <option value="">Selecione um script</option>
              {scripts.map((script) => (
                <option key={script._id} value={script._id}>
                  {script.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
              Discord do Usuário *
            </label>
            <input
              type="text"
              value={userDiscord}
              onChange={(e) => setUserDiscord(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-zinc-500"
              placeholder="Ex: 735388907772051497"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-[var(--muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={isPermanent}
                onChange={(e) => setIsPermanent(e.target.checked)}
                className="w-4 h-4 rounded bg-[var(--surface)] border-[var(--border)]"
              />
              Licença Permanente
            </label>
          </div>

          {!isPermanent && (
            <div>
              <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                Dias de Validade
              </label>
              <input
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-zinc-500"
                min="1"
                required={!isPermanent}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-accent disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Criando..." : "Criar Licença"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
