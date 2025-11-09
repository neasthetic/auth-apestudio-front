"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, login } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [loadingDelay, setLoadingDelay] = useState(true);
  const redirectTimeoutRef = useRef<number | null>(null);

  // Extra 2s after auth loading completes to keep loader visible
  useEffect(() => {
    let t: number | null = null;
    if (!loading) {
      t = window.setTimeout(() => setLoadingDelay(false), 2000);
    } else {
      // when loading starts again, ensure delay is on
      setLoadingDelay(true);
    }
    return () => { if (t) window.clearTimeout(t); };
  }, [loading]);

  useEffect(() => {
    // Se terminou de carregar e não há usuário, inicia o login
    if (!loading && !user && !redirecting) {
      console.log("Usuário não autenticado, redirecionando para Discord OAuth em 2s...");
      setRedirecting(true);
      // Wait +2s before triggering OAuth to show loader
      redirectTimeoutRef.current = window.setTimeout(() => {
        login();
      }, 2000);
    }
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [user, loading, login, redirecting]);

  // Mostra loading enquanto verifica autenticação
  if (loading || loadingDelay) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="loader"></div>
      </div>
    );
  }

  // Se não está autenticado, mostra loading (pois o redirect está acontecendo)
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="loader"></div>
      </div>
    );
  }

  // Usuário autenticado, renderiza o conteúdo
  return <>{children}</>;
}
