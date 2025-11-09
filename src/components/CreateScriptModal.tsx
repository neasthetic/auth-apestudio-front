"use client";

import { useState } from "react";
import { scriptService } from "@/services/scriptService";

interface CreateScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateScriptModal({ isOpen, onClose, onSuccess }: CreateScriptModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

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
          <h2 className="text-xl font-semibold">Novo Script</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
