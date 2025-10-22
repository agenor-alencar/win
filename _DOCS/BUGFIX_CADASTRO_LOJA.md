# 🐛 Correção: Erro 500 ao Cadastrar Loja

**Data**: 21/10/2025  
**Status**: ✅ RESOLVIDO

---

## 🎯 Problema Reportado

1. **Erro 500** ao tentar cadastrar uma loja no endpoint `/usuario/tornar-lojista`
2. Após correção inicial, **redirecionamento incorreto** para `/unauthorized` ao invés de `/merchant/dashboard`

---

## 🔍 Análise Root Cause

### Problema 1: Erro 500 - NoResourceFoundException

**Erro Backend:**
```
org.springframework.web.servlet.resource.NoResourceFoundException: 
No static resource usuario/tornar-lojista.
```

**Causa:**
- Frontend estava chamando: `POST /usuario/tornar-lojista`
- Backend esperava: `POST /api/v1/usuario/tornar-lojista`
- Spring estava tentando buscar como **recurso estático** ao invés de rotear para o controller

### Problema 2: Acesso Negado Após Cadastro

**Sintoma:**
- Cadastro da loja funcionava
- Usuário redirecionado para `/unauthorized`
- Mensagem: "Você não tem permissão para acessar esta página"

**Causa:**
- Backend retorna perfis: `["USER", "LOJISTA"]`
- Frontend não estava mapeando `LOJISTA` → `merchant`
- `ProtectedRoute` verificava `role === "merchant"`, mas estava recebendo `undefined`

---

## ✅ Correções Implementadas

### 1. Corrigir URL do Endpoint no Frontend

**Arquivo:** `win-frontend/src/pages/shared/BecomeMerchant.tsx`

**Antes:**
```typescript
await api.post("/usuario/tornar-lojista", dataToSend);
const refreshResponse = await api.post(`/auth/refresh-token?email=${user?.email}`);
```

**Depois:**
```typescript
await api.post("/api/v1/usuario/tornar-lojista", dataToSend);
const refreshResponse = await api.post(`/api/v1/auth/refresh-token?email=${user?.email}`);
```

### 2. Corrigir Chaves do LocalStorage

**Antes:**
```typescript
localStorage.setItem("token", refreshResponse.data.access_token);
localStorage.setItem("user", JSON.stringify(refreshResponse.data.usuario));
```

**Depois:**
```typescript
localStorage.setItem("win-token", refreshResponse.data.access_token);
localStorage.setItem("win-user", JSON.stringify(frontendUser));
```

### 3. Mapear Perfis do Backend para Frontend

**Implementação:**
```typescript
// Mapear perfis do backend (ADMIN, LOJISTA, MOTORISTA, USER)
// para frontend (admin, merchant, driver, user)
const perfisArray = Array.isArray(usuarioBackend.perfis) ? usuarioBackend.perfis : [];

let role: string | undefined;
if (perfisArray.includes('ADMIN')) {
  role = 'admin';
} else if (perfisArray.includes('LOJISTA')) {
  role = 'merchant'; // ← CORREÇÃO PRINCIPAL
} else if (perfisArray.includes('MOTORISTA')) {
  role = 'driver';
} else if (perfisArray.includes('USER')) {
  role = 'user';
}

const frontendUser = {
  ...usuarioBackend,
  role, // role mapeado corretamente
  perfis: perfisArray, // Array original de perfis
};
```

### 4. Forçar Reload Após Atualização

**Motivo:** Garantir que React Router recalcula as rotas protegidas

```typescript
setTimeout(() => {
  window.location.href = "/merchant/dashboard"; // Forçar reload
}, 2000);
```

### 5. Bonus: Corrigir Endpoint de Categorias

**Arquivo:** `win-frontend/src/pages/merchant/ProductFormPage.tsx`

**Antes:**
```typescript
const response = await api.get("/categoria/list/all");
```

**Depois:**
```typescript
const response = await api.get("/api/v1/categorias/list/all");
```

---

## 📋 Fluxo Correto Após Correções

### 1. Usuário preenche formulário de cadastro de loja

```
POST /api/v1/usuario/tornar-lojista
Body: {
  nomeFantasia, razaoSocial, cnpj, descricao,
  telefone, cep, logradouro, numero, complemento,
  bairro, cidade, uf
}
```

### 2. Backend promove usuário

```
Perfis ANTES: ["USER"]
Perfis DEPOIS: ["USER", "LOJISTA"]
```

### 3. Frontend busca novo token

```
POST /api/v1/auth/refresh-token?email=user@example.com
Response: {
  access_token: "eyJhbGc...",
  usuario: {
    id: "uuid",
    perfis: ["USER", "LOJISTA"],
    ...
  }
}
```

### 4. Frontend mapeia perfis

```typescript
Backend: LOJISTA → Frontend: merchant
```

### 5. Atualiza localStorage e contexto

```typescript
win-token: "eyJhbGc..."
win-user: {
  role: "merchant", // ← Mapeado corretamente
  perfis: ["USER", "LOJISTA"]
}
```

### 6. Redireciona para dashboard

```typescript
window.location.href = "/merchant/dashboard"
// ProtectedRoute verifica: role === "merchant" ✅
```

---

## 🎯 Mapeamento de Perfis

| Backend | Frontend | Descrição |
|---------|----------|-----------|
| `ADMIN` | `admin` | Administrador do sistema |
| `LOJISTA` | `merchant` | Dono de loja/vendedor |
| `MOTORISTA` | `driver` | Entregador |
| `USER` | `user` | Cliente comum |

---

## 🧪 Como Testar

### Passo 1: Fazer login como usuário comum
```
Email: user@example.com
Senha: sua-senha
```

### Passo 2: Acessar "Venda no WIN"
```
http://localhost:3000/become-merchant
```

### Passo 3: Preencher formulário
```
Nome Fantasia: Minha Loja Completa
Razão Social: Minha Empresa LTDA
CNPJ: 12.345.678/0001-99 (14 dígitos)
Descrição: Descrição da loja (mínimo 20 caracteres)
Telefone: (11) 98765-4321
CEP: 12345-678
Logradouro: Rua Exemplo
Número: 123
Bairro: Centro
Cidade: São Paulo
UF: SP
```

### Passo 4: Clicar em "Cadastrar Minha Loja"

**Resultado Esperado:**
1. ✅ Toast de sucesso: "🎉 Parabéns! Você agora é um lojista do WIN!"
2. ✅ Redirecionamento automático para `/merchant/dashboard`
3. ✅ Acesso permitido ao painel do lojista
4. ✅ Console mostra: `role: "merchant"`

---

## 🔍 Debug

### Verificar perfis no localStorage

```javascript
// Abrir DevTools Console
const user = JSON.parse(localStorage.getItem('win-user'));
console.log('Role:', user.role); // Deve ser "merchant"
console.log('Perfis:', user.perfis); // Deve ser ["USER", "LOJISTA"]
```

### Verificar token

```javascript
const token = localStorage.getItem('win-token');
console.log('Token:', token ? 'Presente' : 'Ausente');
```

### Verificar logs do backend

```bash
docker-compose logs backend --tail=50 | grep "tornar-lojista"
```

---

## 📦 Arquivos Modificados

1. **Frontend:**
   - `win-frontend/src/pages/shared/BecomeMerchant.tsx` ✅
   - `win-frontend/src/pages/merchant/ProductFormPage.tsx` ✅

2. **Backend:**
   - Nenhuma alteração necessária (estava correto)

3. **Documentação:**
   - `_DOCS/BUGFIX_CADASTRO_LOJA.md` (este arquivo)

---

## 🚀 Deploy

Para aplicar as correções em produção:

```bash
# Reconstruir frontend
docker-compose up -d --build frontend

# Verificar status
docker-compose ps

# Testar
curl http://localhost:3000
```

---

## ✅ Checklist de Validação

- [x] Erro 500 corrigido
- [x] Cadastro de loja funciona
- [x] Token atualizado após cadastro
- [x] Perfis mapeados corretamente
- [x] Redirecionamento funciona
- [x] Acesso ao dashboard permitido
- [x] LocalStorage usa chaves corretas
- [x] Logs de debug implementados

---

## 📝 Lições Aprendidas

1. **Sempre usar prefixo `/api/v1/`** em chamadas de API do frontend
2. **Mapear perfis do backend para frontend** seguindo o padrão estabelecido
3. **Usar chaves corretas do localStorage** (`win-token`, `win-user`)
4. **Forçar reload** quando necessário atualizar contexto de rotas
5. **Adicionar logs de debug** para facilitar troubleshooting

---

## 🔗 Referências

- Backend Controller: `backend/src/main/java/com/win/marketplace/controller/UsuarioController.java`
- Frontend Auth: `win-frontend/src/contexts/AuthContext.tsx`
- Protected Routes: `win-frontend/src/auth/ProtectedRoute.tsx`
- Rotas: `win-frontend/src/main.tsx`

---

**Status Final**: ✅ Sistema funcionando perfeitamente!  
**Próximo Passo**: Testar com usuários reais e validar fluxo completo
