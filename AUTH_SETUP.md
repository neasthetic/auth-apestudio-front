# Sistema de Autenticação com Discord

Sistema de autenticação OAuth2 implementado com Discord usando Context API do React.

## Arquivos Criados

### 1. **`src/types/user.ts`**
Interface TypeScript com a estrutura do usuário retornada pela API.

### 2. **`src/contexts/AuthContext.tsx`**
Context Provider com:
- `user`: Dados do usuário autenticado (ou `null`)
- `loading`: Estado de carregamento
- `login()`: Inicia o fluxo OAuth2 com Discord
- `logout()`: Encerra a sessão
- `checkAuth()`: Verifica autenticação atual

### 3. **`src/components/ProtectedRoute.tsx`**
Componente wrapper que:
- Verifica se o usuário está autenticado
- Redireciona automaticamente para `/auth/discord` se não estiver logado
- Mostra loading durante verificação

### 4. **`.env.local`**
Configuração da URL da API backend.

## Como Funciona

### Fluxo de Autenticação

1. **Usuário acessa a página** → `ProtectedRoute` verifica autenticação
2. **Não autenticado** → Redireciona automaticamente para `GET /auth/discord`
3. **Discord OAuth** → Usuário autoriza no Discord
4. **Callback** → Discord redireciona para `/auth/discord/callback`
5. **Sessão criada** → Backend cria sessão com cookie
6. **Redirecionado** → Usuário volta para a aplicação autenticado

### Uso do Hook `useAuth`

```tsx
import { useAuth } from "@/contexts/AuthContext";

function MeuComponente() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      {user ? (
        <>
          <p>Olá, {user.username}!</p>
          <button onClick={logout}>Sair</button>
        </>
      ) : (
        <button onClick={login}>Entrar com Discord</button>
      )}
    </div>
  );
}
```

## Configuração

### 1. Configurar URL da API

Edite `.env.local` com a URL do seu backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Garantir CORS no Backend

Seu backend deve aceitar requisições do frontend com credenciais:

```javascript
app.use(cors({
  origin: 'https://auth.apestudio.dev', // URL do Next.js
  credentials: true
}));
```

### 3. Configurar Session Cookie

O backend deve configurar o cookie de sessão corretamente:

```javascript
app.use(session({
  secret: 'seu-segredo',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true em produção com HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));
```

## Rodar o Projeto

```powershell
npm run dev
```

Acesse https://auth.apestudio.dev

## Comportamento Esperado

- **Primeira vez**: Redireciona automaticamente para Discord OAuth
- **Após login**: Página carrega normalmente com fundo cinza
- **Session ativa**: Mantém login entre recarregamentos
- **Logout**: Chame `logout()` do hook `useAuth`

## Endpoints da API Utilizados

- `GET /user` - Verifica autenticação e retorna dados do usuário
- `GET /auth/discord` - Inicia fluxo OAuth2
- `GET /auth/discord/callback` - Callback do Discord (automático)
- `GET /logout` - Encerra sessão

## Proteção de Rotas

Para proteger qualquer página, basta envolver com `<ProtectedRoute>`:

```tsx
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MinhaPage() {
  return (
    <ProtectedRoute>
      <div>Conteúdo protegido</div>
    </ProtectedRoute>
  );
}
```

## Produção

Em produção, atualize:

1. `.env.local` → `.env.production` com URL da API em produção
2. Configure CORS no backend para aceitar domínio de produção
3. Ative `secure: true` nos cookies (HTTPS obrigatório)
4. Configure redirect_uri no Discord Developer Portal
