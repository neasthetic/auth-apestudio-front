"use client";

import { Script } from "@/types/script";
import { useState } from "react";
import { scriptService } from "@/services/scriptService";
import ScriptLicensesModal from "./ScriptLicensesModal";

interface ScriptCardProps {
  script: Script;
  onUpdate: () => void;
}

export default function ScriptCard({ script, onUpdate }: ScriptCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLicensesModal, setShowLicensesModal] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja deletar o script "${script.name}"?\n\nAtenção: As licenças deste script não serão deletadas.`)) return;
    
    setLoading(true);
    try {
      await scriptService.deleteScript(script._id);
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao deletar script");
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    const newName = prompt("Digite o novo nome do script:", script.name);
    if (!newName || newName === script.name) return;

    setLoading(true);
    try {
      await scriptService.updateScript(script._id, { name: newName });
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao renomear script");
    } finally {
      setLoading(false);
    }
  };

  const viewLicenses = () => {
    setShowActions(false);
    setShowLicensesModal(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg">{script.name}</h3>
          <p className="text-zinc-500 text-xs mt-1">
            Criado em {formatDate(script.createdAt)}
          </p>
        </div>
        <button
          onClick={() => setShowActions(!showActions)}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {showActions && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-700">
          <button
            onClick={viewLicenses}
            disabled={loading}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors disabled:opacity-50"
          >
            Ver Licenças
          </button>
          <button
            onClick={handleRename}
            disabled={loading}
            className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors disabled:opacity-50"
          >
            Renomear
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors disabled:opacity-50 ml-auto"
          >
            Deletar
          </button>
        </div>
      )}

      {/* Modal de Licenças */}
      <ScriptLicensesModal
        isOpen={showLicensesModal}
        onClose={() => setShowLicensesModal(false)}
        scriptId={script._id}
        scriptName={script.name}
      />
    </div>
  );
}
