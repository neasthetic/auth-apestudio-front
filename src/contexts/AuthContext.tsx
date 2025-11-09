"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  saveUserData: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://auth.apestudio.dev";

  // Salva dados do usuário localmente (localStorage + state)
  const saveUserData = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setLoading(false);
  };

  // Verifica se o usuário está autenticado consultando o backend
  const checkAuth = async () => {
    // Evita múltiplas verificações simultâneas
    if (isChecking) return;
    
    setIsChecking(true);
    
    try {
      // Sempre verifica no backend para validar a sessão
      const response = await fetch(`${API_URL}/user`, {
        credentials: "include", // Importante para enviar cookies
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } else {
        // Se o backend retornar erro (401, 403, etc.), limpa tudo
        console.log("Sessão inválida ou expirada, limpando dados...");
        localStorage.removeItem("user");
        setUser(null);
        setLoading(false);
        setIsChecking(false);
        return;
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      // Em caso de erro de rede, limpa e força reautenticação
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
      setIsChecking(false);
    }
  };

  // Inicia o fluxo de login com Discord
  const login = () => {
    console.log("🔐 Iniciando login com Discord...");
    console.log("🌐 URL:", `${API_URL}/auth/discord`);
    window.location.href = `${API_URL}/auth/discord`;
  };

  // Realiza logout
  const logout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        credentials: "include",
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      // Sempre limpa os dados locais e redireciona
      localStorage.removeItem("user");
      setUser(null);
      // Força redirecionamento para login
      window.location.href = "/";
    }
  };

  // Carrega usuário do backend ao montar (sempre busca dados atualizados)
  useEffect(() => {
    const initAuth = async () => {
      // Primeiro carrega do cache para mostrar algo rápido
      const cachedUser = localStorage.getItem("user");
      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Erro ao carregar usuário do cache:", error);
          localStorage.removeItem("user");
        }
      }

      // Depois busca os dados atualizados do backend
      try {
        const response = await fetch(`${API_URL}/user`, {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        } else {
          // Sessão inválida, limpa tudo
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        // Se der erro, mantém o cache se existir
        if (!cachedUser) {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, saveUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
