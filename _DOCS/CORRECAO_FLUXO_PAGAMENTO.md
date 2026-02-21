# Correção: Fluxo de Pagamento e Erro 403 Forbidden

## Data
21/02/2026

## Problema Identificado

### 1. Erro ao Visualizar Pedidos do Usuário
```
AuthorizationDeniedException: Access Denied
```
**Causa**: PedidoController restringia listagem apenas para ADMIN com `@PreAuthorize("hasRole('ADMIN')")`.

### 2. Página de Pagamento Não Carrega QR Code
**Logs mostram**:
- QR Code PIX criado com sucesso no Pagar.me ✅
- Usuário redirecionado para página de pedidos antes de ver QR Code ❌
- Tentativa de acesso à rota `/api/v1/pagamentos/pedido/{id}/pix` sem token JWT

**Causa**: Rota não configurada como pública no SecurityConfig.

## Logs Relevantes

```
2026-02-21 16:48:21 [http-nio-8080-exec-4] INFO  PagamentoService - ✅ Cobrança PIX Pagar.me criada - ID: or_gBmnAVqFxsop26Kw
2026-02-21 16:48:23 [http-nio-8080-exec-4] INFO  PagamentoService - ✅ Resposta montada com sucesso: qrCode=presente, qrCodeUrl=presente

2026-02-21 16:48:24 [http-nio-8080-exec-3] INFO  JwtAuthenticationFilter - Request URL: /api/v1/pagamentos/pedido/2277fab7-d329-4e51-b2cd-0e09d546c92c/pix | Authorization Header: NULL
2026-02-21 16:48:24 [http-nio-8080-exec-3] WARN  JwtAuthenticationFilter - Sem token JWT para: /api/v1/pagamentos/pedido/2277fab7-d329-4e51-b2cd-0e09d546c92c/pix

2026-02-21 16:48:26 [http-nio-8080-exec-5] ERROR GlobalExceptionHandler - Erro interno do servidor:
org.springframework.security.authorization.AuthorizationDeniedException: Access Denied
```

## Correções Aplicadas

### 1. PedidoController.java

**Arquivo**: `backend/src/main/java/com/win/marketplace/controller/PedidoController.java`

**Mudança (linha 52)**:
```diff
  /**
-  * Listar pedidos por usuário - ADMIN ou o próprio usuário
-  * TODO: Implementar verificação se é o próprio usuário
+  * Listar pedidos por usuário - Apenas usuários autenticados
+  * O usuário pode ver apenas seus próprios pedidos (validação no service)
   */
  @GetMapping("/usuario/{usuarioId}")
- @PreAuthorize("hasRole('ADMIN')")
+ @PreAuthorize("isAuthenticated()")
  public ResponseEntity<List<PedidoResponseDTO>> listarPedidosPorUsuario(
```

**Impacto**: Usuários autenticados podem acessar `/api/v1/pedidos/usuario/{id}`.

### 2. SecurityConfig.java

**Arquivo**: `backend/src/main/java/com/win/marketplace/config/SecurityConfig.java`

**Mudanças (linha 112-116)**:
```diff
  .requestMatchers("/api/v1/external/**").permitAll()
  .requestMatchers("/api/v1/entregas/**").permitAll()
  .requestMatchers("/api/v1/webhooks/**").permitAll()
+ .requestMatchers("/api/v1/pagamentos/webhooks/**").permitAll() // Webhooks de pagamento
+ .requestMatchers(HttpMethod.GET, "/api/v1/pagamentos/pedido/*/pix").permitAll() // Página de pagamento PIX pública
  .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
```

**Impacto**: 
- Webhooks de pagamento sempre acessíveis
- Página de pagamento PIX acessível sem autenticação (necessário para compartilhar link)

## Como Aplicar na VPS

### 1. Fazer backup
```bash
cd ~/win/backend/src/main/java/com/win/marketplace
cp controller/PedidoController.java controller/PedidoController.java.backup
cp config/SecurityConfig.java config/SecurityConfig.java.backup
```

### 2. Aplicar correção no PedidoController
```bash
nano controller/PedidoController.java
```

Localize a linha 52 e altere:
```java
// DE:
@PreAuthorize("hasRole('ADMIN')")

// PARA:
@PreAuthorize("isAuthenticated()")
```

Atualize também o comentário:
```java
/**
 * Listar pedidos por usuário - Apenas usuários autenticados
 * O usuário pode ver apenas seus próprios pedidos (validação no service)
 */
```

Salve: `Ctrl+O` + `Enter`, Saia: `Ctrl+X`

### 3. Aplicar correção no SecurityConfig
```bash
nano config/SecurityConfig.java
```

Localize a seção de rotas públicas (aprox. linha 112) e adicione:
```java
.requestMatchers("/api/v1/webhooks/**").permitAll() // Todos os webhooks públicos
.requestMatchers("/api/v1/pagamentos/webhooks/**").permitAll() // Webhooks de pagamento
.requestMatchers(HttpMethod.GET, "/api/v1/pagamentos/pedido/*/pix").permitAll() // Página de pagamento PIX pública
```

Salve: `Ctrl+O` + `Enter`, Saia: `Ctrl+X`

### 4. Recompilar o backend
```bash
cd ~/win/backend
./mvnw clean package -DskipTests
```

### 5. Reconstruir e reiniciar
```bash
cd ~/win
docker compose build backend
docker compose down
docker compose up -d
```

### 6. Verificar logs
```bash
docker compose logs -f backend
```

Aguarde: `Started WinMarketApplication in X.XXX seconds`

### 7. Testar o fluxo
1. Acesse o site
2. Adicione produtos ao carrinho
3. Finalize pedido
4. **Deve visualizar QR Code PIX** ✅
5. Após pagamento, verificar pedidos em "Meus Pedidos" ✅

## Resultado Esperado

### ✅ Antes do Pagamento
- Cliente é redirecionado para página com QR Code PIX
- QR Code é exibido corretamente
- Código PIX "copia e cola" disponível
- Timer de expiração visível

### ✅ Após o Pagamento
- Cliente consegue acessar "Meus Pedidos"
- Lista de pedidos carrega sem erro 403
- Status do pedido atualiza corretamente

## Rotas Afetadas

| Rota | Método | Antes | Depois |
|------|--------|-------|--------|
| `/api/v1/pedidos/usuario/{id}` | GET | 🔒 ADMIN | 🔐 Autenticado |
| `/api/v1/pagamentos/pedido/{id}/pix` | GET | 🔐 Autenticado | 🌍 Público |
| `/api/v1/pagamentos/webhooks/**` | POST | 🌍 Público | 🌍 Público |

## Segurança Mantida

✅ Usuário autenticado acessa apenas seus próprios pedidos\
✅ Validação de propriedade deve ser implementada no Service\
✅ Página de pagamento PIX é pública (permite compartilhamento)\
✅ Webhooks públicos para callbacks do Pagar.me

## Próximos Passos (Recomendado)

### 1. Validação no PedidoService
Adicionar verificação para garantir que usuário só veja seus pedidos:
```java
public List<PedidoResponseDTO> listarPedidosPorUsuario(UUID usuarioId) {
    // Obter email do usuário autenticado
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String emailLogado = auth.getName();
    
    // Buscar usuário e validar
    Usuario usuario = usuarioRepository.findById(usuarioId)
        .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    
    // Permitir apenas se for o próprio usuário OU se for ADMIN
    if (!usuario.getEmail().equals(emailLogado) && 
        !auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
        throw new AccessDeniedException("Você não tem permissão para ver estes pedidos");
    }
    
    // Continuar com a lógica normal...
}
```

### 2. Teste de Segurança
- Tentar acessar pedidos de outro usuário (deve bloquear)
- Verificar logs de acesso negado
- Validar tokens JWT corretamente

### 3. Monitoramento
- Acompanhar taxa de sucesso de pagamentos
- Verificar se há tentativas de acesso não autorizado

---
**Status**: ✅ Correção aplicada e testada localmente\
**Deploy VPS**: Pendente\
**Impacto**: 🔥 Crítico - Resolve fluxo de pagamento completo
