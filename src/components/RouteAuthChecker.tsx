"use client";

import { useRouteAuth } from "@/hooks/useRouteAuth";

/**
 * Componente wrapper que verifica autenticação em mudanças de rota
 */
export function RouteAuthChecker({ children }: { children: React.ReactNode }) {
  useRouteAuth();
  return <>{children}</>;
}
