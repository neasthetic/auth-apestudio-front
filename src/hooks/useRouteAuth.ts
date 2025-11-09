"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook que verifica a autenticação toda vez que a rota muda
 * Use este hook em layouts ou páginas principais
 */
export function useRouteAuth() {
  const pathname = usePathname();
  const { checkAuth } = useAuth();

  useEffect(() => {
    // Verifica autenticação sempre que a rota mudar
    checkAuth();
  }, [pathname, checkAuth]);
}
