# 🔍 Resultado da Validação - Credenciais Uber Direct

**Data:** 14/02/2026  
**Status:** ❌ **FALHOU - Credenciais Inválidas**

---

## 📊 Resultado do Teste

### Teste Executado
```bash
POST https://login.uber.com/oauth/v2/token
Authorization: Basic [credenciais codificadas]
Body: grant_type=client_credentials&scope=eats.deliveries
```

### Resposta da API
```json
{
  "error": "unauthorized_client",
  "error_description": "the current application environment is mismatched with the OAuth server runtime environment"
}
```

**Status HTTP:** 401 Unauthorized

---

## 🔍 Análise do Erro

### Significado
O erro **"application environment is mismatched"** indica que:

1. **As credenciais são de um ambiente (Sandbox/Production)**
2. **Mas estamos tentando usar em outro ambiente**

### Credenciais Testadas
```
Client ID: 9zlEgm25UTAIk11QSTlP3BSPjLmAQKgn
Client Secret: 0d-FXqgkvJPwTCnBwhsI4IeYRdZbwz3RrgXZbXWg
```

### Configuração Atual (.env)
```bash
UBER_API_BASE_URL=https://api.uber.com  # ← PRODUÇÃO
UBER_API_ENABLED=true
```

---

## 🎯 Causas Prováveis

### 1. **Mismatch de Ambiente** (MAIS PROVÁVEL)
- ✅ Credenciais são de **SANDBOX**
- ❌ Configuração aponta para **PRODUÇÃO** (`api.uber.com`)
- **Solução:** Trocar URL para `https://sandbox-api.uber.com`

### 2. **Credenciais Expiradas/Revogadas**
- Credenciais podem ter sido desabilitadas no portal
- **Solução:** Gerar novas credenciais

### 3. **Permissões Incorretas**
- Aplicação pode não ter scope `eats.deliveries`
- **Solução:** Verificar permissões no portal Uber

---

## ✅ AÇÕES NECESSÁRIAS

### Passo 1: Verificar no Portal Uber 🌐

Acesse o portal de desenvolvedores da Uber:
```
👉 https://developer.uber.com/dashboard
```

**Verifique:**
- [ ] As credenciais ainda estão ativas?
- [ ] Qual ambiente? (Sandbox ou Production)
- [ ] A aplicação tem permissão `eats.deliveries`?
- [ ] Há algum alerta ou erro na dashboard?

### Passo 2: Atualizar Configuração Local 📝

**OPÇÃO A - Se as credenciais são de SANDBOX:**

Editar `.env`:
```bash
# Trocar de api.uber.com para sandbox-api.uber.com
UBER_API_BASE_URL=https://sandbox-api.uber.com
```

**OPÇÃO B - Se as credenciais são de PRODUÇÃO mas estão expiradas:**

Gerar novas credenciais no portal:
1. Acessar: https://developer.uber.com/dashboard/client
2. Ir em "Authentication" ou "Credentials"
3. Clicar em "Generate New Client Secret"
4. Copiar novo Client ID + Secret
5. Atualizar `.env`

### Passo 3: Obter Novas Credenciais SANDBOX (Recomendado) 🆕

Para ambiente de desenvolvimento, é recomendado usar **SANDBOX**:

1. **Acessar:** https://developer.uber.com/
2. **Login** com sua conta
3. **Criar nova aplicação:**
   - Nome: "Win Marketplace - Dev"
   - Tipo: "Deliveries"
   - Ambiente: **Sandbox**
4. **Obter credenciais:**
   - Client ID
   - Client Secret
5. **Configurar scopes:**
   - Marcar: `eats.deliveries`
6. **Copiar credenciais para `.env`:**
   ```bash
   UBER_CLIENT_ID=novo_client_id_aqui
   UBER_CLIENT_SECRET=novo_client_secret_aqui
   UBER_API_BASE_URL=https://sandbox-api.uber.com
   UBER_API_ENABLED=true
   ```

---

## 🔄 Próximos Passos

### Após Corrigir Credenciais:

1. **Re-testar OAuth:**
   ```powershell
   # Teste rápido
   curl -X POST https://login.uber.com/oauth/v2/token `
     -u "SEU_CLIENT_ID:SEU_CLIENT_SECRET" `
     -H "Content-Type: application/x-www-form-urlencoded" `
     -d "grant_type=client_credentials&scope=eats.deliveries"
   ```

2. **Subir ambiente Docker:**
   ```powershell
   docker compose up -d
   docker compose logs -f backend | Select-String "Uber"
   ```

3. **Testar endpoints de frete:**
   ```powershell
   curl "http://localhost:8080/api/v1/fretes/estimar?cepDestino=70040902&lojistaId=UUID&pesoKg=1.5"
   ```

---

## 📚 Documentação de Referência

### Uber Developer Docs
- **Portal:** https://developer.uber.com/
- **OAuth 2.0:** https://developer.uber.com/docs/rides/authentication
- **Deliveries API:** https://developer.uber.com/docs/deliveries/introduction
- **API Reference:** https://developer.uber.com/docs/deliveries/references/api

### Diferenças Sandbox vs Production

| Aspecto | Sandbox | Production |
|---------|---------|------------|
| **URL Base** | `sandbox-api.uber.com` | `api.uber.com` |
| **Auth URL** | `login.uber.com` | `login.uber.com` |
| **Custo** | Grátis (simulado) | Cobrado (real) |
| **Dados** | Mock (fictícios) | Reais |
| **Motoristas** | Simulados | Reais |
| **Uso** | Desenvolvimento/Testes | Produção |

---

## 🆘 Troubleshooting

### Se continuar com erro 401:

1. **Limpar cache de credenciais:**
   ```powershell
   Remove-Item Env:UBER_CLIENT_ID
   Remove-Item Env:UBER_CLIENT_SECRET
   ```

2. **Verificar encoding:**
   - Credenciais devem ser Base64(client_id:client_secret)
   - Sem espaços ou quebras de linha

3. **Testar com cURL direto:**
   ```bash
   curl -v -X POST https://login.uber.com/oauth/v2/token \
     --user "client_id:client_secret" \
     -d "grant_type=client_credentials&scope=eats.deliveries"
   ```

4. **Verificar firewall/proxy:**
   - Empresa pode estar bloqueando api.uber.com
   - Testar em rede diferente

---

## 📞 Suporte

**Contato Uber:**
- Email: developer-support@uber.com
- Forum: https://developer.uber.com/community

**Documentação Interna:**
- `_DOCS/GUIA_CONFIGURACAO_UBER_SANDBOX.md`
- `_DOCS/INTEGRACAO_UBER_DIRECT_API.md`

---

## ✅ Checklist

Antes de prosseguir:
- [ ] Credenciais verificadas no portal Uber
- [ ] Ambiente correto identificado (Sandbox/Prod)
- [ ] `.env` atualizado com configuração correta
- [ ] Teste OAuth passou (status 200)
- [ ] Token de acesso recebido com sucesso

**Próximo arquivo a consultar:** `PLANO_FINALIZACAO_ENTREGAS_DEV.md` (Passo 2)

---

**Última Atualização:** 14/02/2026  
**Status:** Aguardando correção de credenciais
