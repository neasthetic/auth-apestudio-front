"use client";

import { useState, useEffect } from "react";
import { scriptService } from "@/services/scriptService";
import { License } from "@/types/license";

interface ScriptLicensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptId: string;
  scriptName: string;
}

export default function ScriptLicensesModal({
  isOpen,
  onClose,
  scriptId,
  scriptName,
}: ScriptLicensesModalProps) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && scriptId) {
      loadLicenses();
    }
  }, [isOpen, scriptId]);

  const loadLicenses = async () => {
    setLoading(true);
    try {
      const data = await scriptService.getScriptLicenses(scriptId);
      setLicenses(data.licenses);
    } catch (error) {
      console.error("Erro ao carregar licenças:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-zinc-700">
        {/* Header */}
        <div className="p-6 border-b border-zinc-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Licenças do Script
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              {scriptName} • {licenses.length} licença{licenses.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-zinc-400">Carregando licenças...</div>
            </div>
          ) : licenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400">Nenhuma licença encontrada para este script.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {licenses.map((license) => {
                const daysRemaining = license.isPermanent ? null : (license.expiresAt ? getDaysRemaining(license.expiresAt) : 0);
                const isExpired = daysRemaining !== null && daysRemaining < 0;

                return (
                  <div
                    key={license._id}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Coluna Esquerda */}
                      <div className="space-y-3">
                        {/* User Discord */}
                        <div>
                          <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                            Usuário Discord
                          </p>
                          <p className="text-white font-mono text-sm">
                            {license.userDiscord}
                          </p>
                        </div>

                        {/* IP:Port */}
                        <div>
                          <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                            IP:Porta
                          </p>
                          <p className="text-white font-mono text-sm">
                            {license.ipPort || (
                              <span className="text-zinc-500 italic">Não vinculado</span>
                            )}
                          </p>
                        </div>

                        {/* Token */}
                        <div>
                          <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                            Token
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-zinc-400 bg-zinc-950 px-2 py-1 rounded font-mono break-all flex-1">
                              {license.token.substring(0, 32)}...
                            </code>
                            <button
                              onClick={() => copyToken(license.token)}
                              className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded transition-colors flex-shrink-0"
                            >
                              {copiedToken === license.token ? "✓" : "Copiar"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Coluna Direita */}
                      <div className="space-y-3">
                        {/* Status */}
                        <div>
                          <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                            Status
                          </p>
                          {license.isPermanent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                              </svg>
                              Permanente
                            </span>
                          ) : isExpired ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              Expirada
                            </span>
                          ) : daysRemaining && daysRemaining <= 7 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Expira em {daysRemaining} dia{daysRemaining !== 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Ativa
                            </span>
                          )}
                        </div>

                        {/* Expira em */}
                        {!license.isPermanent && license.expiresAt && (
                          <div>
                            <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                              Expira em
                            </p>
                            <p className={`text-sm font-medium ${isExpired ? "text-red-400" : "text-white"}`}>
                              {formatDate(license.expiresAt)}
                            </p>
                          </div>
                        )}

                        {/* Criada em */}
                        <div>
                          <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                            Criada em
                          </p>
                          <p className="text-zinc-400 text-sm">
                            {formatDate(license.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
