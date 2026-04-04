# Correção: Erro de Acesso às Páginas de Lojistas (403 Forbidden)

## Problema Identificado

As páginas de lojistas não estavam carregando corretamente, apresentando o erro:
- **Frontend**: "Erro ao identificar lojista - Forbidden"
- **Backend**: 403 Forbidden na rota `/api/v1/lojistas/me`

## Causa Raiz

O `JwtAuthenticationFilter.java` estava permitindo **todas** as requisições para `/api/v1/lojistas/*` sem validar o token JWT (linha 51):

```java
requestPath.startsWith("/api/v1/lojistas") ||
```

Isso causava um conflito:
1. O filtro JWT **não validava** o token para rotas de lojistas
2. O `SecurityConfig.java` **exigia autenticação** para `/api/v1/lojistas/me`
3. Resultado: Token não era processado, mas rota exigia autenticação = **403 Forbidden**

## Correção Aplicada

Foi removida a linha que permitia todas as rotas de lojistas sem autenticação no `JwtAuthenticationFilter.java`.

### Arquivo Alterado
- `backend/src/main/java/com/win/marketplace/security/JwtAuthenticationFilter.java`

### Mudança
```diff
  // Rotas públicas que não precisam de autenticação JWT
  String requestPath = request.getRequestURI();
  if (requestPath.equals("/") ||
      requestPath.equals("/index.html") ||
      requestPath.equals("/favicon.ico") ||
      requestPath.startsWith("/actuator/") || 
      requestPath.startsWith("/api/v1/webhooks/") ||
      requestPath.startsWith("/api/v1/auth/") ||
      requestPath.startsWith("/api/v1/dev/") ||
      requestPath.startsWith("/api/v1/password-reset/") ||
      requestPath.startsWith("/api/v1/produtos") ||
      requestPath.startsWith("/api/v1/categoria") ||
-     requestPath.startsWith("/api/v1/lojistas") ||
      requestPath.startsWith("/api/v1/banners") ||
      requestPath.startsWith("/api/v1/external/") ||
      requestPath.startsWith("/api/v1/entregas/")) {
```

## Como Aplicar na VPS

### 1. Fazer backup do arquivo atual
```bash
cd ~/win/backend/src/main/java/com/win/marketplace/security
cp JwtAuthenticationFilter.java JwtAuthenticationFilter.java.backup
```

### 2. Editar o arquivo
```bash
nano JwtAuthenticationFilter.java
```

Localize a linha 51 que contém:
```java
requestPath.startsWith("/api/v1/lojistas") ||
```

**Remova essa linha completamente** (incluindo o `||` no final).

Salve com `Ctrl+O` e saia com `Ctrl+X`.

### 3. Recompilar o backend
```bash
cd ~/win/backend
./mvnw clean package -DskipTests
```

### 4. Reconstruir a imagem Docker
```bash
cd ~/win
docker compose build backend
```

### 5. Reiniciar os serviços
```bash
docker compose down
docker compose up -d
```

### 6. Verificar os logs
```bash
docker compose logs -f backend
```

Aguarde até ver a mensagem:
```
Started WinMarketApplication in X.XXX seconds
```

### 7. Testar a correção
1. Acesse o site como lojista
2. Faça login
3. Acesse a página "Meus Produtos"
4. Deve carregar normalmente sem erro "Forbidden"

## Resultado Esperado

✅ Lojistas autenticados conseguem acessar suas páginas\
✅ A rota `/api/v1/lojistas/me` funciona corretamente\
✅ Rotas públicas de lojistas (GET) continuam funcionando\
✅ Segurança JWT mantida

## Verificação de Segurança

A correção **mantém a segurança** pois:
- O `SecurityConfig.java` controla adequadamente quais rotas são públicas
- Apenas GETs para listar lojistas são públicos
- Rotas sensíveis como `/me` e `/estatisticas` exigem autenticação
- O token JWT é validado corretamente para rotas protegidas

## Rotas de Lojistas - Status de Acesso

| Rota | Método | Acesso |
|------|--------|--------|
| `/api/v1/lojistas` | GET | 🌍 Público |
| `/api/v1/lojistas/ativos` | GET | 🌍 Público |
| `/api/v1/lojistas/{id}` | GET | 🌍 Público |
| `/api/v1/lojistas/cnpj/{cnpj}` | GET | 🌍 Público |
| `/api/v1/lojistas/me` | GET | 🔐 Autenticado |
| `/api/v1/lojistas/{id}/estatisticas` | GET | 🔐 Autenticado |
| `/api/v1/lojistas` | POST | 🔐 Autenticado |
| `/api/v1/lojistas/{id}` | PUT | 🔐 Autenticado |
| `/api/v1/lojistas/{id}/ativar` | PATCH | 🔐 Autenticado |
| `/api/v1/lojistas/{id}/desativar` | PATCH | 🔐 Autenticado |

---
**Data**: 21/02/2026\
**Status**: ✅ Correção aplicada e testada localmente\
**Deploy VPS**: Pendente
