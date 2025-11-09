"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const ERROR_MESSAGES: Record<string, string> = {
  rate_limit: "Muitas tentativas de login. Por favor, aguarde alguns minutos e tente novamente.",
  auth_failed: "Falha na autenticação com o Discord. Tente novamente.",
  no_user: "Não foi possível obter seus dados do Discord.",
  login_failed: "Erro ao criar sessão. Tente novamente.",
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveUserData, login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [loadingDelay, setLoadingDelay] = useState(true);

  // Keep loader visible +2s even after data processed (or error shown)
  useEffect(() => {
    const t = window.setTimeout(() => setLoadingDelay(false), 2000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    // Evita processar múltiplas vezes
    if (hasProcessed) return;

    const errorParam = searchParams.get("error");

    if (errorParam) {
      // Se há erro, mostra a mensagem
      const errorMessage = ERROR_MESSAGES[errorParam] || "Erro desconhecido ao fazer login.";
      setError(errorMessage);
      setHasProcessed(true);
      return;
    }

    // Pega os dados do usuário dos query params
    const userId = searchParams.get("userId");
    const discordId = searchParams.get("discordId");
    const username = searchParams.get("username");
    const email = searchParams.get("email");
    const avatar = searchParams.get("avatar");
    const role = searchParams.get("role");
    const accessToken = searchParams.get("accessToken");

    // Se tem os dados do usuário, salva e redireciona
    if (userId && discordId && username) {
      setHasProcessed(true);
      
      saveUserData({
        _id: userId,
        discordId,
        username,
        email: email || "",
        avatar: avatar || "",
        role: role || "user",
        accessToken: accessToken || "",
        discriminator: "0",
        refreshToken: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Redireciona para a página inicial
      setTimeout(() => {
        router.push("/");
      }, 500);
    }
  }, [searchParams, saveUserData, router, hasProcessed]);

  // Se há erro, mostra a mensagem com opção de tentar novamente
  if (error && !loadingDelay) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="text-red-400 text-lg font-semibold">Erro na Autenticação</div>
          <p className="text-white text-base">{error}</p>
          <button
            onClick={() => login()}
            className="btn btn-accent"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Loading normal
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      {loadingDelay ? <div className="loader" /> : <div className="text-white text-sm">Autenticando...</div>}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]"><div className="loader" /></div>
    }>
      <LoginContent />
    </Suspense>
  );
}
