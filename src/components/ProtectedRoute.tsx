"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, login } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Se terminou de carregar e não há usuário, inicia o login
    if (!loading && !user && !redirecting) {
      console.log("Usuário não autenticado, redirecionando para Discord OAuth...");
      setRedirecting(true);
      login();
    }
  }, [user, loading, login, redirecting]);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  // Se não está autenticado, mostra loading (pois o redirect está acontecendo)
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <div className="text-white text-lg">Redirecionando para login...</div>
      </div>
    );
  }

  // Usuário autenticado, renderiza o conteúdo
  return <>{children}</>;
}
