# 🔗 Configuração de Webhooks - Uber Direct

## 📋 O que é Webhook?

Webhook é um **aviso automático** que a Uber envia para seu servidor quando algo importante acontece na entrega. Por exemplo:

```
Uber: "Oi! O motorista chegou para pegar o pacote 📍"
→ Webhook enviado para: /api/v1/webhooks/uber
```

---

## 🔑 Suas Credenciais (Salvas)

```
Customer ID:      01233f28-3140-594c-85b5-553b08284ee0
Client ID:        xM1fvatROhYoEE5q-cgrx0597OH9lIlf
Client Secret:    r2OLu0psdu0lErzpzjdvSiQ_NPFNKCyJORxRJVMy
Environment:      SANDBOX (testes) ← use isso primeiro!
API Base URL:     https://sandbox-api.uber.com
```

---

## ⚙️ PASSO 1: Acessar Dashboard Uber

1. Ir para: **https://direct.uber.com** ou **https://developer.uber.com/dashboard**
2. Fazer login com sua conta Uber Developer
3. Ir em: **"Desenvolvedor"** → **"Webhooks"** (como na imagem)

---

## 📍 PASSO 2: Configurar Webhook para DESENVOLVIMENTO LOCAL

### ⚠️ Problema em Desenvolvimento Local:

Você está testando em `localhost:8080`, mas a Uber não consegue alcançar seu PC porque:
- ❌ `http://localhost:8080` só funciona dentro do seu PC
- ❌ Uber é na nuvem, não consegue chegar em seu PC

### ✅ Soluções:

#### OPÇÃO A: Usar Ngrok (Recomendado para Dev Local)

**O que é:** Um serviço que expõe seu `localhost` para a internet

**Passo 1: Instalar Ngrok**

```bash
# Windows (com Chocolatey)
choco install ngrok

# Ou fazer download: https://ngrok.com/download
```

**Passo 2: Abrir túnel**

```bash
# Terminal novo
ngrok http 8080
```

**Resposta:**
```
Session Status                online
Account                       seu-email@example.com
Version                       3.x.x
Region                        us
Forwarding                    http://abc123def456.ngrok.io -> http://localhost:8080
Forwarding                    https://abc123def456.ngrok.io -> http://localhost:8080
```

**Copiar:** `https://abc123def456.ngrok.io`

**Passo 3: Usar URL ngrok no webhook**

```
https://abc123def456.ngrok.io/api/v1/webhooks/uber
```

---

#### OPÇÃO B: Deploy na VPS (Recomendado para Produção)

Se quiser testar direto na VPS (mais realista):

**URL será:**
```
https://seu-dominio.com.br/api/v1/webhooks/uber
ou
https://SEU_IP_VPS:8443/api/v1/webhooks/uber
```

---

## 🎯 PASSO 3: Criar Webhook na Dashboard Uber

### Na Dashboard Uber:

1. **Ir em:** Desenvolvedor → Webhooks
2. **Clicar em:** "+ Criar webhook" (ou "Create webhook")
3. **Preencher campos:**

| Campo | Valor | Exemplo |
|-------|-------|---------|
| **URL do Webhook** | URL pública + endpoint | `https://abc123def456.ngrok.io/api/v1/webhooks/uber` |
| **Tipo de Evento** | Selecionar qual tipo receber | ✓ `event_delivery_status` |
| **Segredo** | Chave para validar requisição | `sua-webhook-secret-key-123456` |

### Eventos Disponíveis (Marque os que quer):

- ✅ `event_delivery_status` - Status da entrega (PICKUP_ARRIVED, DELIVERY_COMPLETED, etc)
- ✅ `event_courier_update` - Atualização de localização do motorista
- ❌ `event_refund_request` - Pedido de reembolso (marque se precisar)

---

## 📝 Exemplo Prático de Configuração

### Campo: "URL do Webhook"
```
https://abc123def456.ngrok.io/api/v1/webhooks/uber
```

### Campo: "Tipos de Evento" (checkboxes)
```
☑ event_delivery_status
☑ event_courier_update
☐ event_refund_request
```

### Campo: "Segredo do Webhook"
```
sua-webhook-secret-key-123456
```

**Depois clicar:** "Salvar"

---

## ✅ PASSO 4: Validar Webhook na Dashboard Uber

Após criar, aparece botão **"Enviar Teste"** (Send Test):

```
┌─────────────────────────────┐
│ Webhook criado com sucesso! │
│ [Editar] [Enviar Teste]     │
└─────────────────────────────┘
```

**Clicar em:** "Enviar Teste"

### Você verá no seu backend:

```bash
# Terminal rodando Docker
docker logs win-marketplace-backend -f

# Deve aparecer:
2026-04-05 14:35:22 [http-nio-8080-exec-5] INFO  c.w.m.controller.WebhookController - 
  ✅ Webhook recebido da Uber!
  Tipo: event_delivery_status
  Delivery ID: delivery_abc123
  Status: DELIVERY_COMPLETED
```

---

## 🧪 PASSO 5: Testar Fluxo Completo

### Sequência de Testes:

1. **Abrir 3 terminais:**

```bash
# Terminal 1: Ngrok (expor localhost)
ngrok http 8080

# Terminal 2: Docker logs (monitorar)
docker logs win-marketplace-backend -f | grep -i "uber\|webhook"

# Terminal 3: Executar testes (seu PC)
cd c:\Users\user\OneDrive\Documentos\win
```

2. **Começar testes** (arquivo `TESTES_FLUXO_COMPRA.http`):

```http
# 1. Fazer login
POST http://localhost:8080/api/v1/auth/login

# 2. Solicitar quote
POST http://localhost:8080/api/v1/uber/quotes

# 3. Criar pedido
POST http://localhost:8080/api/v1/pedidos

# 4. Confirmar entrega (cria delivery_id)
POST http://localhost:8080/api/v1/uber/deliveries

← AQUI A UBER VAI ENVIAR WEBHOOKS AUTOMATICAMENTE
```

3. **Dashboard Uber receberá:**

```json
{
  "event_type": "event_delivery_status",
  "delivery_id": "delivery_abc123",
  "status": "ACCEPTED",
  "timestamp": "2026-04-05T14:40:00Z"
}
```

4. **Seu backend vai logar:**

```
2026-04-05 14:40:01 [webhook-thread] INFO - Webhook recebido!
2026-04-05 14:40:01 [webhook-thread] INFO - Status atualizado: ACCEPTED
2026-04-05 14:40:01 [webhook-thread] INFO - Pedido atualizado: PREPARANDO
```

---

## 🔐 Segurança: Validação do Webhook Secret

Seu backend **valida automaticamente** que webhook veio da Uber (não de hacker):

```java
// No backend (já implementado):
// 1. Recebe webhook com assinatura HMAC
// 2. Calcula hash usando WEBHOOK_SECRET
// 3. Compara se bate
// 4. Se não bater → rejeita (erro 401)
```

**No seu `.env`:**
```env
UBER_WEBHOOK_SECRET=sua-webhook-secret-key-123456
```

---

## 📊 Tabela: Eventos que Chegarão

| Evento | Simulação | O que significa |
|--------|-----------|-----------------|
| `DELIVERY_ACCEPTED` | Uber aceitou pedido | ✅ Entrega confirmada |
| `DRIVER_ASSIGNED` | Motorista foi destinado | 🚗 Motorista pegando rota |
| `PICKUP_ARRIVED` | Motorista chegou loja | 📍 Chegou para pegar |
| `PICKUP_IN_PROGRESS` | Coletando pacote | 📦 Pegando produto |
| `PICKUP_COMPLETED` | Coleta finalizada | ✅ Saiu da loja com pacote |
| `DELIVERY_ARRIVED` | Motorista chegou cliente | 📍 Chegou em casa |
| `DELIVERY_IN_PROGRESS` | Entregando | 🔔 Tocando campainha |
| `DELIVERY_COMPLETED` | Entrega realizada | ✅ Cliente recebeu! |

---

## 🚨 Troubleshooting

### Problema: "Webhook URL não válida"

**Causa:** URL inválida ou sem HTTPS

**Solução:**
```
❌ http://localhost:8080/api/v1/webhooks/uber
✅ https://abc123def456.ngrok.io/api/v1/webhooks/uber
✅ https://seu-dominio.com/api/v1/webhooks/uber
```

### Problema: "Webhook não chegando"

**Verificar:**
```bash
# 1. Ngrok está rodando?
# (deve haver URL pública no terminal ngrok)

# 2. Backend está rodando?
docker ps | grep marketplace-backend
# deve estar UP

# 3. Clicar "Enviar Teste" na Uber
# deve aparecer log no Terminal 2

# 4. Se não aparecer, checar firewall
sudo ufw status
# porta 8080 e 443 devem estar abertas
```

### Problema: "Erro 401 Unauthorized"

**Causa:** `WEBHOOK_SECRET` errado

**Verificar:**
```bash
# No .env local:
UBER_WEBHOOK_SECRET=sua-webhook-secret-key-123456

# Deve ser igual ao configurado na Uber!
```

---

## 📋 Checklist de Configuração

- [ ] ✅ Credenciais Uber adicionadas ao `.env`
- [ ] ✅ Ngrok instalado e rodando (`ngrok http 8080`)
- [ ] ✅ URL ngrok copiada (ex: `https://abc123def456.ngrok.io`)
- [ ] ✅ Webhook criado na Dashboard Uber
- [ ] ✅ URL do webhook completa: `https://abc123def456.ngrok.io/api/v1/webhooks/uber`
- [ ] ✅ Tipo de evento selecionado: `event_delivery_status`
- [ ] ✅ Webhook Secret configurado: `sua-webhook-secret-key-123456`
- [ ] ✅ Backend rodando: `docker ps`
- [ ] ✅ "Enviar Teste" clicado na Uber
- [ ] ✅ Log apareceu no Terminal 2
- [ ] ✅ Erro 500 no backend? → checar `.env`
- [ ] ✅ Tudo Ok? → começar TESTES_FLUXO_COMPRA.http

---

## 🎯 Próximas Ações

### AGORA (Desenvolvimento Local):

1. **Instalar Ngrok**
   ```bash
   choco install ngrok
   ```

2. **Abrir 3 terminais:**
   ```bash
   # Terminal 1
   ngrok http 8080
   
   # Terminal 2
   docker logs win-marketplace-backend -f | grep -i uber
   
   # Terminal 3
   cd c:\Users\user\OneDrive\Documentos\win
   ```

3. **Copiar URL ngrok**
   ```
   https://abc123def456.ngrok.io/api/v1/webhooks/uber
   ```

4. **Criar webhook na Uber Dashboard**
   - https://developer.uber.com/dashboard → Webhooks
   - URL do Webhook: `https://abc123def456.ngrok.io/api/v1/webhooks/uber`
   - Tipo: `event_delivery_status`
   - Secret: `sua-webhook-secret-key-123456`

5. **Clicar "Enviar Teste"** e validar log

6. **Executar file TESTES_FLUXO_COMPRA.http**

### DEPOIS (Produção na VPS):

- [ ] Webhook URL apontando para domínio: `https://seu-dominio.com/api/v1/webhooks/uber`
- [ ] Certificado SSL válido (HTTPS)
- [ ] `UBER_API_BASE_URL=https://api.uber.com` (mudar de sandbox)
- [ ] Chaves de produção da Uber
- [ ] Fazer testes com valores pequenos de verdade

---

## ✅ Status Atual

| Item | Status | Ação |
|------|--------|------|
| Credenciais Uber | ✅ Configuradas | Ver `.env` |
| Backend | ✅ Pronto | `docker ps` |
| Webhook Handler | ✅ Implementado | Controller já existe |
| Ngrok | ⏳ Instalar | `choco install ngrok` |
| Dashboard Uber | ⏳ Criar webhook | Ir em Developer → Webhooks |

---

**Você está pronto para começar os testes! 🚀**
