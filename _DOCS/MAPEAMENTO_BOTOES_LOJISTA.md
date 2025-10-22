# 🔘 Mapeamento de Botões - Fluxo USER → LOJISTA

**Data**: 18 de outubro de 2025  
**Status**: ✅ Corrigido

---

## 📍 Localização e Função dos Botões

### **1. Header (Componente Header.tsx)**

#### Botão: "Venda no WIN"
- **Localização**: Header superior (linha 87)
- **Link atual**: `/sell` ✅ CORRETO
- **Função**: Levar para página informativa sobre vender no WIN
- **Público**: Todos os usuários
- **Status**: ✅ Funcionando corretamente

---

### **2. Página Inicial (Index.tsx)**

#### Botão: "Venda no WIN"
- **Localização**: Hero section (linha 124-130)
- **Link atual**: `/sell` ✅ CORRETO
- **Função**: Mesma do header - página informativa
- **Público**: Visitantes e usuários
- **Status**: ✅ Funcionando corretamente

---

### **3. Página "Venda no WIN" (BecomeASeller.tsx)**

#### Botão 1: "Cadastrar Minha Loja" (Hero)
- **Localização**: Topo da página (linha 164-172)
- **Link ANTES**: `/merchant/auth` ❌
- **Link AGORA**: `/become-merchant` ✅ CORRIGIDO
- **Função**: Ir direto para formulário de cadastro de loja
- **Fluxo**:
  - Se não logado → Pede para fazer login
  - Se logado como USER → Mostra formulário
  - Se já é LOJISTA → Redireciona para dashboard

#### Botão 2: "Cadastrar Agora" (Rodapé)
- **Localização**: Seção CTA final (linha 414-422)
- **Link ANTES**: `/merchant/auth` ❌
- **Link AGORA**: `/become-merchant` ✅ CORRIGIDO
- **Função**: Mesmo que Botão 1
- **Status**: ✅ Corrigido nesta sessão

---

### **4. Página Cadastro de Loja (BecomeMerchant.tsx)**

#### Botão: "Cadastrar Minha Loja"
- **Localização**: Formulário (linha 354)
- **Tipo**: Submit button
- **Função**: Enviar formulário para API
- **Endpoint**: `POST /api/v1/usuario/tornar-lojista`
- **Ação**: Transforma USER em LOJISTA
- **Status**: ✅ Funcionando

---

### **5. Página Login Lojista (MerchantLogin.tsx)**

⚠️ **ATENÇÃO**: Esta página precisa de revisão!

#### Contexto:
- Rota: `/merchant/auth`
- Originalmente servia para login E cadastro de lojista
- Com o novo fluxo, essa página deveria ser **APENAS LOGIN**

#### Recomendações:

**OPÇÃO 1: Remover aba de cadastro**
```tsx
// Remover tab "register"
// Manter apenas tab "login"
// Adicionar link "Ainda não é lojista? Cadastre sua loja"
// Link aponta para /become-merchant
```

**OPÇÃO 2: Redirecionar cadastro**
```tsx
// Na aba "register", mostrar mensagem:
// "Para se tornar um lojista, você precisa primeiro criar uma conta de usuário"
// Botão: "Criar Conta de Usuário" → /login
// Link: "Já tem conta? Cadastre sua loja" → /become-merchant
```

**OPÇÃO 3: Manter como está (não recomendado)**
- Permite criar lojista diretamente
- Inconsistente com novo fluxo
- Usuário não teria perfil USER

---

## 🔄 Fluxo Correto Atual

```
VISITANTE
   ↓
Clica "Venda no WIN" (Header ou Index)
   ↓
Vai para /sell (BecomeASeller)
   ↓
Lê informações sobre vender no WIN
   ↓
Clica "Cadastrar Minha Loja" OU "Cadastrar Agora"
   ↓
Vai para /become-merchant (BecomeMerchant)
   ↓
SISTEMA VERIFICA:
   ├─ Não logado? → Redireciona para /login
   ├─ Logado como USER? → Mostra formulário
   └─ Já é LOJISTA? → Redireciona para /merchant/dashboard
   ↓
Preenche formulário de loja
   ↓
Submete para API (POST /usuario/tornar-lojista)
   ↓
Backend adiciona perfil LOJISTA
   ↓
Perfis: ["USER", "LOJISTA"]
   ↓
Redireciona para /merchant/dashboard
   ✅ CONCLUÍDO
```

---

## 🎯 Fluxo Alternativo (Login de Lojista Existente)

```
LOJISTA (já cadastrado)
   ↓
Vai direto para /merchant/auth
   ↓
Faz login
   ↓
Vai para /merchant/dashboard
```

---

## ✅ Correções Aplicadas Nesta Sessão

1. ✅ **BecomeASeller.tsx linha 414-422**:
   - Botão "Cadastrar Agora"
   - Alterado de `/merchant/auth` → `/become-merchant`

2. ✅ **BecomeASeller.tsx linha 164-172** (sessão anterior):
   - Botão "Cadastrar Minha Loja"
   - Alterado de `/merchant/auth` → `/become-merchant`

---

## ⚠️ Ações Pendentes (Recomendadas)

### 1. Revisar MerchantLogin.tsx
- Decidir se mantém cadastro ou apenas login
- Se mantiver, adicionar lógica para criar como USER + LOJISTA
- Se remover, deixar apenas login e link para /become-merchant

### 2. Adicionar Link no Header (Opcional)
- Para lojistas existentes acessarem login rapidamente
- Exemplo: "Área do Lojista" → /merchant/auth

### 3. Breadcrumb/Navegação
- Adicionar navegação clara no BecomeMerchant
- Mostrar passo a passo: "1. Criar conta → 2. Cadastrar loja → 3. Adicionar produtos"

---

## 📊 Matriz de Botões (Resumo)

| Botão | Página | Link Atual | Correto? |
|-------|--------|-----------|----------|
| "Venda no WIN" | Header.tsx | /sell | ✅ Sim |
| "Venda no WIN" | Index.tsx | /sell | ✅ Sim |
| "Cadastrar Minha Loja" (Hero) | BecomeASeller.tsx | /become-merchant | ✅ Sim |
| "Cadastrar Agora" (CTA) | BecomeASeller.tsx | /become-merchant | ✅ Sim (corrigido) |
| "Cadastrar Minha Loja" (Form) | BecomeMerchant.tsx | Submit API | ✅ Sim |
| "Cadastrar Minha Loja" (Tab) | MerchantLogin.tsx | ? | ⚠️ Revisar |

---

## 🎓 Boas Práticas Implementadas

1. ✅ **Consistência**: Todos os botões "Cadastrar" levam para /become-merchant
2. ✅ **Validação**: BecomeMerchant verifica se usuário está logado
3. ✅ **Prevenção**: Impede cadastro duplicado de lojista
4. ✅ **UX**: Mensagens claras em cada etapa
5. ✅ **Segurança**: Endpoint protegido com JWT + role USER

---

## 🚀 Próximo Passo

**Recomendação**: Testar fluxo completo via interface

1. Acessar http://localhost:3000
2. Criar conta nova
3. Fazer login
4. Clicar "Venda no WIN"
5. Clicar "Cadastrar Minha Loja" ou "Cadastrar Agora"
6. Preencher formulário
7. Verificar se vira LOJISTA
8. Verificar acesso ao dashboard

---

**Documentado por**: GitHub Copilot  
**Data**: 18 de outubro de 2025  
**Versão**: 1.0
