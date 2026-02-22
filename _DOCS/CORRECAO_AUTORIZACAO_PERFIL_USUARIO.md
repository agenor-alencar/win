# Correção: Autorização de Atualização de Perfil

## Problema Identificado

Usuários comuns (não-ADMIN) não conseguiam atualizar seus próprios perfis devido a restrições de autorização no backend. O erro retornado era:

```
org.springframework.security.authorization.AuthorizationDeniedException: Access Denied
```

### Logs do Erro

```
win-marketplace-backend  | 2026-02-22 08:06:22 [http-nio-8080-exec-2] INFO  c.w.m.s.JwtAuthenticationFilter - Token válido para usuário: thaliabrunac@gmail.com | Perfis: [USER, LOJISTA]
win-marketplace-backend  | 2026-02-22 08:06:22 [http-nio-8080-exec-2] ERROR c.w.m.e.GlobalExceptionHandler - Erro interno do servidor:
win-marketplace-backend  | org.springframework.security.authorization.AuthorizationDeniedException: Access Denied
```

## Causa Raiz

Os endpoints de atualização de perfil e senha estavam restritos apenas para usuários com perfil **ADMIN**:

```java
@PutMapping("/update/{id}")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<UsuarioResponseDTO> atualizarUsuario(...)
```

## Solução Implementada

### 1. Atualização do Endpoint de Perfil

**Arquivo**: `backend/src/main/java/com/win/marketplace/controller/UsuarioController.java`

Modificado o endpoint `/api/v1/usuario/update/{id}` para:
- ✅ Permitir qualquer usuário autenticado (`@PreAuthorize("isAuthenticated()")`)
- ✅ Verificar se o usuário está atualizando seu próprio perfil
- ✅ Bloquear tentativas de atualizar perfis de outros usuários

```java
@PutMapping("/update/{id}")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<UsuarioResponseDTO> atualizarUsuario(
        @PathVariable UUID id, 
        @RequestBody RegisterRequestDTO requestDTO,
        @AuthenticationPrincipal UserDetails userDetails) {
    
    // Verificar se o usuário está tentando atualizar seu próprio perfil
    String emailAutenticado = userDetails.getUsername();
    UsuarioResponseDTO usuarioAutenticado = usuarioService.buscarPorEmail(emailAutenticado);
    
    if (!usuarioAutenticado.id().equals(id)) {
        throw new BusinessException("Você só pode atualizar seu próprio perfil");
    }
    
    UsuarioResponseDTO usuario = usuarioService.atualizarUsuario(id, requestDTO);
    return ResponseEntity.ok(usuario);
}
```

### 2. Atualização do Endpoint de Senha

Mesmo padrão aplicado para `/api/v1/usuario/senha/{id}`:

```java
@PatchMapping("/senha/{id}")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<UsuarioResponseDTO> atualizarSenha(
        @PathVariable UUID id, 
        @RequestBody PasswordUpdateRequestDTO dto,
        @AuthenticationPrincipal UserDetails userDetails) {
    
    // Verificar se o usuário está tentando atualizar sua própria senha
    String emailAutenticado = userDetails.getUsername();
    UsuarioResponseDTO usuarioAutenticado = usuarioService.buscarPorEmail(emailAutenticado);
    
    if (!usuarioAutenticado.id().equals(id)) {
        throw new BusinessException("Você só pode atualizar sua própria senha");
    }
    
    UsuarioResponseDTO usuario = usuarioService.atualizarSenha(id, dto);
    return ResponseEntity.ok(usuario);
}
```

### 3. Import Adicionado

```java
import com.win.marketplace.exception.BusinessException;
```

## Frontend - Correção do Redirecionamento no Checkout

**Problema**: Ao clicar em "Efetuar Pagamento" na página de detalhes do pedido, o usuário era redirecionado para `/cart` ao invés de `/checkout`.

**Arquivo**: `win-frontend/src/pages/shared/Checkout.tsx`

**Causa**: Havia dois `useEffect` monitorando o carrinho vazio, causando redirecionamento prematuro.

**Solução**: Removido o `useEffect` redundante que verificava o carrinho vazio, mantendo apenas a lógica no primeiro `useEffect` que já trata corretamente o modo de reprocessamento.

```typescript
// ❌ REMOVIDO - useEffect redundante
useEffect(() => {
  if (cartState.items.length === 0 && !modoReprocessamento) {
    navigate("/cart");
  }
}, [cartState.items, navigate, modoReprocessamento]);
```

## Benefícios

### Segurança
- ✅ Usuários só podem atualizar seus próprios dados
- ✅ Validação de identidade usando JWT token
- ✅ Proteção contra edição de perfis alheios

### Experiência do Usuário
- ✅ Usuários comuns podem atualizar nome, telefone e CPF
- ✅ Lojistas podem manter dados pessoais atualizados
- ✅ Não requer privilégios de administrador

### Funcionalidades Mantidas
- ✅ Validação de email único no sistema
- ✅ Validação de CPF único no sistema
- ✅ Geocodificação automática de endereços
- ✅ Criptografia de senha com BCrypt

## Dados que Usuários Podem Atualizar

### Perfil Pessoal (USER)
- Nome completo
- Telefone
- CPF (para pagamentos)
- Endereço

### Perfil Lojista (LOJISTA)
- Todos os dados de USER
- CNPJ (obrigatório para lojista)
- Dados da loja

## Deploy

### 1. Rebuild do Backend

```bash
cd backend
mvn clean package -DskipTests
```

✅ **Status**: Build realizado com sucesso

### 2. Reiniciar Container Docker

```bash
docker compose down
docker compose up -d --build backend
```

### 3. Verificar Logs

```bash
docker compose logs -f backend
```

## Testes Recomendados

### 1. Atualização de Perfil Pessoal
- [ ] Usuário loga no sistema
- [ ] Acessa página "Meu Perfil"
- [ ] Atualiza nome, telefone e CPF
- [ ] Clica em "Salvar"
- [ ] ✅ Dados são atualizados sem erro

### 2. Tentativa de Edição de Outro Usuário
- [ ] Usuário loga no sistema
- [ ] Tenta fazer PUT para `/api/v1/usuario/update/{outro-id}`
- [ ] ❌ Recebe erro 403 "Você só pode atualizar seu próprio perfil"

### 3. Fluxo de Pagamento
- [ ] Usuário cria pedido
- [ ] Acessa "Meus Pedidos"
- [ ] Clica em pedido pendente
- [ ] Clica em "Efetuar Pagamento"
- [ ] ✅ É redirecionado para página de checkout (não para carrinho)

## Arquivos Modificados

1. `backend/src/main/java/com/win/marketplace/controller/UsuarioController.java`
   - Endpoint `/update/{id}` - Autorização atualizada
   - Endpoint `/senha/{id}` - Autorização atualizada
   - Import de `BusinessException` adicionado

2. `win-frontend/src/pages/shared/Checkout.tsx`
   - Removido `useEffect` redundante

## Considerações Adicionais

### Diferença entre USER e LOJISTA

- **USER (Cliente)**: Precisa de CPF registrado para:
  - Processar pagamentos
  - Identificação fiscal
  - Emissão de notas fiscais

- **LOJISTA**: Precisa de CNPJ adicional para:
  - Cadastro de loja
  - Recebimento de split de pagamentos
  - Emissão de notas fiscais de vendas

### Validações Mantidas

- Email único no sistema
- CPF único no sistema
- CNPJ único para lojistas
- Senha criptografada com BCrypt
- Token JWT válido e não expirado

## Notas de Segurança

⚠️ **Importante**: O usuário NÃO pode:
- Alterar seus próprios perfis (USER, LOJISTA, ADMIN)
- Ativar/desativar sua própria conta
- Alterar data de cadastro
- Alterar último acesso

Essas operações continuam restritas apenas a ADMIN.

## Status

- ✅ Código implementado
- ✅ Build realizado com sucesso
- ⏳ Aguardando deploy no VPS
- ⏳ Aguardando testes em produção

---

**Data**: 22/02/2026  
**Tipo**: Correção de Bug (Autorização)  
**Prioridade**: Alta  
**Autor**: GitHub Copilot
