# ✅ Checklist - Integração Uber Direct API (Produção)

## 📋 O que você precisa fazer

Quando você tiver as credenciais de Uber de **produção** (não sandbox), siga este checklist.

---

## 🔑 Passo 1: Obter Credenciais Uber

### Onde conseguir:

1. **Ir para:** https://developer.uber.com/dashboard
2. **Criar aplicação** da Uber Direct (se não tiver)
3. **Obter credenciais:**
   - `CUSTOMER_ID` → Customer ID da sua conta
   - `CLIENT_ID` → OAuth Client ID
   - `CLIENT_SECRET` → OAuth Client Secret (salve em local seguro!)
   - `WEBHOOK_SECRET` → Para validar webhooks

### ⚠️ Sobre Sandbox vs Produção

| Aspecto | Sandbox | Produção |
|--------|---------|----------|
| URL Base | `https://sandbox-api.uber.com` | `https://api.uber.com` |
| Credenciais | De teste | Reais |
| Entregas | Simuladas | Reais! Cobra do cliente |
| Risco | Nenhum | Financeiro |
| Recomendação | Testar primeiro | Depois de validar |

---

## 🔧 Passo 2: Configurar Variáveis de Ambiente

### Arquivo: `.env` (arquivo local, NÃO COMITAR NO GIT)

```env
# ========================================
# 🚗 UBER DIRECT API - PRODUÇÃO
# ========================================

# ✅ Substituir pelos valores reais
UBER_CUSTOMER_ID=SEU_CUSTOMER_ID_AQUI
UBER_CLIENT_ID=SEU_CLIENT_ID_AQUI  
UBER_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI_SUPER_SECRETO
UBER_WEBHOOK_SECRET=SEU_WEBHOOK_SECRET_AQUI

# ✅ Mudança mais importante: SANDBOX → PRODUÇÃO
# De:  UBER_API_BASE_URL=https://sandbox-api.uber.com
# Para:
UBER_API_BASE_URL=https://api.uber.com

# ✅ Ativar Uber (era false antes)
UBER_API_ENABLED=true

# ✅ URL pública da VPS para receber webhooks
UBER_WEBHOOK_URL=https://seu-dominio.com.br/api/v1/webhooks/uber
# ou
UBER_WEBHOOK_URL=https://SEU_IP_VPS:8443/api/v1/webhooks/uber
```

### Onde colocar o .env:

- **Local**: `c:\Users\user\OneDrive\Documentos\win\.env`
- **VPS**: `/home/usuario/win/.env` (nunca comitar no Git!)

---

## 🔐 Passo 3: Segurança das Credenciais

### ✅ Abrir o arquivo `.env` apenas localmente

```bash
# ❌ NUNCA fazer:
git add .env
git commit -m "add env file"
git push

# ✅ SEMPRE fazer:
echo ".env" >> .gitignore
git add .gitignore
git commit -m "add .env to gitignore"
```

### ✅ Na VPS, copiar o arquivo com SCP (SSH Copy)

```bash
# Copiar do seu PC para VPS
scp .env usuario@SEU_IP_VPS:/home/usuario/win/.env

# Dar permissão restrita (apenas leitura para owner)
ssh usuario@SEU_IP_VPS
cd /home/usuario/win
chmod 600 .env    # -rw------- (somente owner pode ler/escrever)
```

### ✅ Verificar que não foi commitado

```bash
git status
# Deve estar vazio (commit atual = HEAD)

git log --all --full-history .env
# Deve estar vazio (histórico sem .env)
```

---

## 📍 Passo 4: Configurar Webhooks

### O que são Webhooks?

Quando a Uber Direct atualiza status da entrega (ex: motorista chegou, entrega realizada), ela envia um "aviso" para seu servidor. Isso acontece em:

- ✅ Delivery Accepted
- ✅ Driver Assigned
- ✅ Pickup Arrived
- ✅ Pickup Completed
- ✅ Delivery Arrived
- ✅ Delivery Completed

### Como configurar:

1. **Dashboard Uber:** https://developer.uber.com/dashboard
2. **Ir em:** Settings → Webhooks
3. **Configurar:**
   ```
   Event Type: direct_deliveries
   Webhook URL: https://SEU_DOMINIO.com.br/api/v1/webhooks/uber
   ```

### ⚠️ Requisitos para Webhooks funcionarem:

- ✅ **URL pública** (não localhost)
- ✅ **HTTPS** (certificado SSL válido)
- ✅ **Endpoint implementado** no backend (já tem! `/api/v1/webhooks/uber`)
- ✅ **Webhook Secret** configurado no .env
- ✅ **Firewall aberto** na porta 443 (HTTPS)

### Testar Webhook:

```bash
# No dashboard Uber, clicar em "Send Test"
# Debe aparecer no log:
docker logs win-marketplace-backend -f | grep webhook
```

---

## 🧪 Passo 5: Testar com Valores Pequenos

### Antes de colocar em produção REAL, teste assim:

1. **Login como cliente** com conta de teste
2. **Selecionar endereço válido** (que Uber atenda)
3. **Solicitar quote** (DEVE retornar valor)
4. **Criar pedido** com 1 item barato (ex: R$ 10)
5. **Confirmar entrega** à Uber
6. **Gerar PIX** e **pagar com Chave PIX de teste**
   - Use chave de teste PagarMe: `000.000.000-00`
   - Ou cartão de teste: `4111111111111111`

### Validações antes de ir para a rua:

- ✅ Quote retorna valor REALISTA (não muito baixo/alto)
- ✅ Delivery criado com sucesso (retorna delivery_id)
- ✅ PIX gerado corretamente (QR Code scanevel)
- ✅ Webhook chegou no backend (checar logs)
- ✅ Status atualizado para ENTREGUE após confirmar
- ✅ Cliente recebeu notificação

---

## 🚀 Passo 6: Deploy para VPS

### Quando tudo estiver testando localmente:

```bash
# 1. Copiar .env para VPS
scp .env usuario@SEU_IP_VPS:/home/usuario/win/

# 2. SSH na VPS
ssh usuario@SEU_IP_VPS
cd ~/win

# 3. Rebuildar imagem Docker com novas chaves
docker-compose build --no-cache

# 4. Restart containers
docker-compose down
docker-compose up -d

# 5. Verificar logs
docker logs win-marketplace-backend -f
```

---

## ✅ Passo 7: Validação Final

### Checklist pré-lançamento:

- [ ] `.env` está **fora do Git** (.gitignore tem `.env` ✓)
- [ ] Variáveis de ambiente estão **corretas**
- [ ] UBER_API_BASE_URL = `https://api.uber.com` ✅
- [ ] UBER_API_ENABLED = `true` ✅
- [ ] Webhook Secret está **configurado** ✅
- [ ] URL de webhook é **HTTPS público** ✅
- [ ] JWT_SECRET tem **64+ caracteres** ✅
- [ ] PostgreSQL está **acessível** ✅
- [ ] Redis está **rodando** ✅
- [ ] Backend **iniciou sem erros** ✅
- [ ] Pelo menos 1 teste de fluxo completo **passou** ✅

---

## 🔍 Debugging de Problemas

### Problema: Quote retorna erro "DELIVERY_QUOTE_UNAVAILABLE"

**Causa:** Endereço fora da área de cobertura Uber  
**Solução:** Usar endereço em São Paulo centro (área bem coberta)

### Problema: "Invalid OAuth Token"

**Causa:** CLIENT_SECRET incorreto ou expirado  
**Solução:**
```bash
# 1. Ir no dashboard Uber
# 2. Regenerar CLIENT_SECRET
# 3. Atualizar .env local
# 4. Copiar para VPS: scp .env usuario@IP:/home/usuario/win/
# 5. docker-compose restart
```

### Problema: Webhook não chega

**Causa:** URL incorreta ou firewall bloqueio  
**Solução:**
```bash
# 1. Verificar URL é HTTPS e pública:
curl -I https://seu-dominio.com/api/v1/webhooks/uber
# Deve retornar: HTTP/1.1 200 OK

# 2. Verificar firewall:
sudo ufw status
# Porta 443 deve estar aberta

# 3. Clicar "Send Test" no dashboard da Uber
# 4. Checar logs:
docker logs win-marketplace-backend | grep webhook
```

### Problema: "Connection refused" ao chamar API Uber

**Causa:** API Base URL errada ou sem internet na VPS  
**Solução:**
```bash
# De dentro do container backend:
docker exec win-marketplace-backend curl -I https://api.uber.com

# Deve retornar 200 OK (não timeout)
```

---

## 📝 Checklist de Segurança

- [ ] `.env` **nunca foi commitado**
- [ ] `.gitignore` contém `.env`
- [ ] CLIENT_SECRET **não está em logs** (NEVER log `AuthToken`, `ClientSecret`)
- [ ] WEBHOOK_SECRET **não é fácil de adivinhar** (usar UUID)
- [ ] HTTPS está **habilitado** na VPS
- [ ] Certificado SSL é **válido** (não auto-assinado)
- [ ] Rate limiting está **ativo** (Redis rate limit)
- [ ] Database backups estão **automáticos** (cron job)
- [ ] Monitoria de erros está **configurada** (Sentry/logs)
- [ ] Alertas estão **habilitados** (Slack/Email)

---

## 📞 Suporte Uber

Se tiver problemas com a API:

- **Dashboard:** https://developer.uber.com/dashboard
- **Documentação:** https://developer.uber.com/docs/direct
- **Email Support:** partner-support@uber.com
- **Status Page:** https://status.uber.com/

---

## ⏱️ Próximas Ações

1. **Hoje:** Obter credenciais Uber de produção
2. **Hoje:** Testar localmente com valores pequenos
3. **Amanhã:** Copiar .env para VPS
4. **Amanhã:** Fazer 3-5 testes reais na VPS
5. **Próxima semana:** Colocar loja LIVE para clientes

---

**Status:** ⏳ Aguardando credenciais Uber
