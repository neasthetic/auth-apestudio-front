"use client";

import { License } from "@/types/license";
import { useState } from "react";
import { licenseService } from "@/services/licenseService";

interface LicenseCardProps {
  license: License;
  onUpdate: () => void;
}

export default function LicenseCard({ license, onUpdate }: LicenseCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (date?: string) => {
    if (!date) return "Permanente";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getDaysRemaining = () => {
    if (license.isPermanent || !license.expiresAt) return null;
    const now = new Date().getTime();
    const expires = new Date(license.expiresAt).getTime();
    const days = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja deletar esta licença?")) return;
    
    setLoading(true);
    try {
      await licenseService.deleteLicense(license.token);
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao deletar licença");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDays = async () => {
    const days = prompt("Quantos dias deseja adicionar?");
    if (!days || isNaN(Number(days))) return;

    setLoading(true);
    try {
      await licenseService.addDays(license.token, { days: Number(days) });
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao adicionar dias");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDays = async () => {
    const days = prompt("Quantos dias deseja remover?");
    if (!days || isNaN(Number(days))) return;

    setLoading(true);
    try {
      await licenseService.removeDays(license.token, { days: Number(days) });
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao remover dias");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIp = async () => {
    const ipPort = prompt("Digite o novo IP:Porta", license.ipPort || "");
    if (!ipPort) return;

    setLoading(true);
    try {
      await licenseService.updateIpPort(license.token, { ipPort });
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao atualizar IP");
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(license.token);
    alert("Token copiado!");
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg">{license.scriptName}</h3>
          <p className="text-zinc-400 text-sm">{license.userDiscord}</p>
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

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Expira em:</span>
          <span className={`font-medium ${license.isPermanent ? "text-green-400" : daysRemaining && daysRemaining < 7 ? "text-red-400" : "text-white"}`}>
            {formatDate(license.expiresAt)}
            {daysRemaining !== null && ` (${daysRemaining} dias)`}
          </span>
        </div>
        {license.ipPort && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">IP:Porta:</span>
            <span className="text-white font-mono">{license.ipPort}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Token:</span>
          <button
            onClick={copyToken}
            className="text-zinc-400 hover:text-white font-mono text-xs truncate max-w-xs"
            title="Clique para copiar"
          >
            {license.token.substring(0, 16)}...
          </button>
        </div>
      </div>

      {showActions && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-700">
          <button
            onClick={handleUpdateIp}
            disabled={loading}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors disabled:opacity-50"
          >
            Editar IP
          </button>
          {!license.isPermanent && (
            <>
              <button
                onClick={handleAddDays}
                disabled={loading}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors disabled:opacity-50"
              >
                + Dias
              </button>
              <button
                onClick={handleRemoveDays}
                disabled={loading}
                className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors disabled:opacity-50"
              >
                - Dias
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors disabled:opacity-50 ml-auto"
          >
            Deletar
          </button>
        </div>
      )}
    </div>
  );
}
