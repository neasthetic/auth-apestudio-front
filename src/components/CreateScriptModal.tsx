"use client";

import { useState, useEffect } from "react";
import { scriptService } from "@/services/scriptService";
import { Folder, X } from "lucide-react";

interface CreateScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateScriptModal({ isOpen, onClose, onSuccess }: CreateScriptModalProps) {
  const [name, setName] = useState("");
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
    
    if (!name.trim()) {
      alert("Digite um nome para o script");
      return;
    }

    setLoading(true);
    try {
      await scriptService.createScript({ name: name.trim() });
      
      // Limpa o formulário
      setName("");
      
      onSuccess();
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao criar script");
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
            <div className="h-9 w-9 rounded-full border border-emerald-700/40 bg-emerald-500/10 text-emerald-300 flex items-center justify-center">
              <Folder className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold">Novo Script</h2>
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
              Nome do Script *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-zinc-500"
              placeholder="Ex: AntiCheat System"
              required
              autoFocus
            />
            <p className="text-[var(--muted)] text-xs mt-1">
              O nome deve ser único no sistema
            </p>
          </div>

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
              {loading ? "Criando..." : "Criar Script"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
