# 🔐 Gerenciamento de Usuários ADMIN - Sistema WIN Marketplace

## 📊 Análise de Desempenho Atual

### **Status do Sistema** ✅
```
CONTAINER              CPU %    MEMÓRIA          ESTADO
Backend (Java)         0.13%    573.9 MiB (8%)   ✅ Saudável
Frontend (Node)        0.23%    186.7 MiB (3%)   ✅ Saudável  
PostgreSQL             0.00%    54.64 MiB (1%)   ✅ Saudável
```

**Conclusão**: O sistema está performando muito bem, com uso baixo de recursos.

---

## 🔒 Segurança de Perfis ADMIN

### **✅ Implementações de Segurança**

1. **Hash BCrypt (Forte)**
   - Algoritmo: `BCrypt` com custo 10
   - Tamanho: 60 caracteres
   - Exemplo: `$2a$10$IfW...` (hash real oculto)
   - **Nível de Segurança**: 🔐 ALTO

2. **Estrutura de Banco Normalizada**
   ```
   usuarios (id, email, senha_hash, cpf, telefone)
        ↓
   usuario_perfis (usuario_id, perfil_id, data_atribuicao)
        ↓
   perfis (id, nome="ADMIN", descricao, ativo)
   ```
   - Separação de concerns ✅
   - Múltiplos perfis por usuário ✅
   - Auditoria com `data_atribuicao` ✅

3. **JWT com Perfis Embarcados**
   - Token inclui lista de perfis
   - Verificação em cada requisição
   - Expiração em 24h

---

## 🚀 Métodos para Criar Usuários ADMIN

### **Método 1: Via API + Promoção (RECOMENDADO)** ⭐

**Passo 1**: Criar usuário normal via API
```bash
POST http://localhost:8080/api/v1/auth/register
Content-Type: application/json

{
  "nome": "Nome Completo",
  "email": "admin@example.com",
  "senha": "SenhaSegura123!",
  "cpf": "000.000.000-00",
  "telefone": "(00) 00000-0000"
}
```

**Passo 2**: Promover para ADMIN (requer token de ADMIN existente)
```bash
POST http://localhost:8080/api/v1/auth/promote-to-admin?email=admin@example.com
Authorization: Bearer {seu_token_admin}
```

**Vantagens**:
- ✅ Hash gerado corretamente automaticamente
- ✅ Validações aplicadas (CPF, telefone, email)
- ✅ Auditável via logs
- ✅ Processo rápido (< 2 segundos)

---

### **Método 2: Via Banco de Dados (Primeira vez / Emergência)**

**Quando usar**: Primeira instalação ou perda de acesso admin.

```sql
-- 1. Criar usuário via API primeiro (garante hash correto)
-- Depois promover manualmente:

INSERT INTO usuario_perfis (perfil_id, usuario_id, data_atribuicao)
VALUES (
  '4aa9cbdf-e6f3-4a34-a36c-269caa14fd97',  -- ID do perfil ADMIN
  'UUID-DO-USUARIO',                        -- Obter do SELECT abaixo
  NOW()
);

-- Para encontrar o UUID do usuário:
SELECT id, email FROM usuarios WHERE email = 'seu@email.com';

-- Para verificar perfis:
SELECT u.email, p.nome as perfil 
FROM usuarios u 
JOIN usuario_perfis up ON u.id = up.usuario_id 
JOIN perfis p ON up.perfil_id = p.id 
WHERE u.email = 'seu@email.com';
```

**⚠️ NÃO tente criar hash manualmente via SQL!**
- PowerShell escapa caracteres especiais (`$`, `\`)
- Resultado: hash inválido e login falha
- **Sempre use a API para criar usuários!**

---

## 📋 IDs dos Perfis no Sistema

```sql
PERFIL       UUID                                    USUÁRIOS
--------------------------------------------------------------
USER         964cac1e-b226-4632-82d4-c8c95959abad    3 usuários
LOJISTA      b4cd96f2-7d4d-4b47-aa07-324d43c16447    1 usuário
MOTORISTA    4cb5536b-b489-4d69-9834-c276cdf5e670    0 usuários
ADMIN        4aa9cbdf-e6f3-4a34-a36c-269caa14fd97    1 usuário  ← VOCÊ
```

---

## 🎯 Fluxo Otimizado para Novos Admins

### **Cenário**: Criar novo administrador do zero

```bash
# 1. CRIAR USUÁRIO (API gera hash correto)
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Novo Admin",
    "email": "novoadmin@empresa.com",
    "senha": "SenhaForte123!",
    "cpf": "123.456.789-01",
    "telefone": "(11) 98765-4321"
  }'

# 2. FAZER LOGIN COMO ADMIN ATUAL
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agenoralencaar@gmail.com",
    "senha": "Admin123!"
  }'
# Salvar o access_token retornado

# 3. PROMOVER NOVO USUÁRIO
curl -X POST "http://localhost:8080/api/v1/auth/promote-to-admin?email=novoadmin@empresa.com" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# ✅ PRONTO! Novo admin criado em 10 segundos
```

---

## 🛡️ Melhores Práticas de Segurança

### **DO's (Fazer)** ✅
- ✅ Sempre criar usuários via API `/register`
- ✅ Usar senhas fortes (min 8 chars, maiúscula, número, especial)
- ✅ Promover para admin via endpoint `/promote-to-admin`
- ✅ Fazer backup dos tokens de admin
- ✅ Auditar logs de promoção de admin
- ✅ Revogar acesso admin quando necessário

### **DON'Ts (Não Fazer)** ❌
- ❌ NUNCA criar hash BCrypt manualmente via SQL
- ❌ NUNCA inserir senha em texto plano no banco
- ❌ NUNCA compartilhar tokens JWT
- ❌ NUNCA usar senhas fracas para admin
- ❌ NUNCA logar credenciais de admin

---

## 🔧 Solução de Problemas

### **Problema**: "Email ou senha incorretos" ao fazer login

**Causa**: Hash BCrypt inválido no banco.

**Solução**:
1. Deletar usuário com problema
2. Criar novamente via API `/register`
3. Promover para admin via `/promote-to-admin`

```sql
-- Verificar se hash está correto (deve começar com $2a$10$)
SELECT email, substring(senha_hash, 1, 10) as hash_inicio 
FROM usuarios 
WHERE email = 'seu@email.com';
```

---

### **Problema**: "403 Forbidden" ao promover usuário

**Causa**: Token JWT inválido ou usuário atual não é ADMIN.

**Solução**:
1. Fazer novo login para obter token fresco
2. Verificar se usuário logado tem perfil ADMIN
3. Verificar se token está no header: `Authorization: Bearer TOKEN`

---

## 📈 Melhorias Implementadas

### **Antes** (Problema Original)
```
❌ Hash criado manualmente via SQL
❌ Caracteres escapados incorretamente
❌ Login sempre falhava
❌ Processo demorado e frustrante
```

### **Depois** (Solução Atual)
```
✅ Hash gerado automaticamente pela API
✅ BCrypt válido e seguro
✅ Login funciona perfeitamente
✅ Processo rápido (< 10 segundos)
✅ Endpoint dedicado para promoção
✅ Auditável e seguro
```

---

## 📞 Comandos Úteis

```bash
# Ver todos os admins
docker-compose exec -T postgres psql -U postgres -d win_marketplace \
  -c "SELECT u.email, u.nome FROM usuarios u 
      JOIN usuario_perfis up ON u.id = up.usuario_id 
      JOIN perfis p ON up.perfil_id = p.id 
      WHERE p.nome = 'ADMIN';"

# Ver perfis de um usuário
docker-compose exec -T postgres psql -U postgres -d win_marketplace \
  -c "SELECT p.nome FROM usuarios u 
      JOIN usuario_perfis up ON u.id = up.usuario_id 
      JOIN perfis p ON up.perfil_id = p.id 
      WHERE u.email = 'email@exemplo.com';"

# Ver logs do backend
docker-compose logs backend --tail=50 | grep -i admin
```

---

## ✅ Conclusão

O sistema agora possui:
- 🔐 **Segurança robusta** com BCrypt
- ⚡ **Processo rápido** para criar admins
- 🎯 **Endpoint dedicado** para promoção
- 📊 **Performance excelente** (< 10% CPU/RAM)
- 🛡️ **Auditoria completa** com logs

**Nenhum problema ao criar novos admins** - processo otimizado e eficiente! 🎉
