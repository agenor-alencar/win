# 🚀 Guia de Testes - Fluxo Completo de Compra com Entrega

## 📋 Overview do Fluxo

```
FLUXO COMPRA + ENTREGA UBER DIRECT
│
├─ Passo 1: AUTENTICAÇÃO (Login)
│  └─ POST /api/v1/auth/login
│
├─ Passo 2: GEOCODING (Endereço → Coordenadas)
│  └─ Usar biblioteca externa ou Google Maps API
│
├─ Passo 3: COTAÇÃO DE FRETE (Quote)
│  └─ POST /api/v1/uber/quotes
│  └─ Retorna: quote_id, valor_frete, tempo_estimado
│
├─ Passo 4: CRIAR PEDIDO
│  └─ POST /api/v1/pedidos
│  └─ Retorna: pedido_id, status
│
├─ Passo 5: CRIAR ENTREGA (Confirmar Quote)
│  └─ POST /api/v1/uber/deliveries
│  └─ Retorna: delivery_id, tracking_url
│
├─ Passo 6: PAGAMENTO
│  └─ POST /api/v1/pagamentos/pedido/{id}/calcular-total
│  └─ POST /api/v1/pagamentos/pedido/{id}/criar-quase-tudo
│
└─ Passo 7: RASTREAMENTO
   └─ Webhooks da Uber atualizam status em tempo real
```

---

## ✅ PASSO 1: AUTENTICAÇÃO

### Criar Usuário (Cliente)

```bash
POST http://localhost:8080/api/v1/auth/register
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "Senha123@",
  "cpf": "12345678901",
  "telefone": "+5511987654321"
}
```

**Resposta esperada (201):**
```json
{
  "id": "uuid-do-usuario",
  "email": "joao@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "mensagem": "Usuário registrado com sucesso"
}
```

### Fazer Login

```bash
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "senha": "Senha123@"
}
```

**Resposta esperada (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "uuid-do-usuario",
    "email": "joao@example.com",
    "nome": "João Silva"
  }
}
```

> 💡 **Salvar o token** para usar em requisições autenticadas:
> ```bash
> Authorization: Bearer <token>
> ```

---

## ✅ PASSO 2: GEOCODING (Endereço → Coordenadas)

> ⚠️ **Pré-requisito:** Configurar `GOOGLE_MAPS_API_KEY` no `.env`

### Endereço de Pickup (Loja)

```
Loja: Rua Principal, 100, São Paulo - SP
Latitude: -23.5505
Longitude: -46.6333
```

### Endereço de Entrega (Cliente)

```
Cliente: Rua Secundária, 500, São Paulo - SP
Latitude: -23.5600
Longitude: -46.6400
```

### Script de Geocoding (Node.js/Postman)

```javascript
// Usando Google Maps API ou biblioteca local
const enderecoCliente = "Rua Secundária, 500, São Paulo - SP";
const coordenadas = await geocoder.geocode(enderecoCliente);
// Retorna: { latitude: -23.5600, longitude: -46.6400 }
```

---

## ✅ PASSO 3: SOLICITAR COTAÇÃO DE FRETE

### Endpoint: Get Quote

```bash
POST http://localhost:8080/api/v1/uber/quotes
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "pickupLatitude": -23.5505,
  "pickupLongitude": -46.6333,
  "dropoffLatitude": -23.5600,
  "dropoffLongitude": -46.6400,
  "pickupContactName": "Loja ABC",
  "pickupPhoneNumber": "+551140001234",
  "dropoffContactName": "João Silva",
  "dropoffPhoneNumber": "+5511987654321"
}
```

**Resposta esperada (200):**
```json
{
  "quoteId": "quote_12345",
  "estimatedFare": {
    "amount": 1500,
    "currency": "BRL"
  },
  "estimatedDurationMinutes": 30,
  "estimatedPickupWaitMinutes": 5,
  "pickupStartMinutes": 2
}
```

> 💾 **Salvar `quoteId`** - será usado no passo 5

---

## ✅ PASSO 4: CRIAR PEDIDO

### Endpoint: Create Order

```bash
POST http://localhost:8080/api/v1/pedidos
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "usuarioId": "uuid-do-usuario",
  "enderecoEntregaId": "uuid-endereco-entrega",
  "itens": [
    {
      "produtoId": "uuid-produto-1",
      "quantidade": 2,
      "preco": 50.00
    },
    {
      "produtoId": "uuid-produto-2",
      "quantidade": 1,
      "preco": 100.00
    }
  ],
  "totalItens": 200.00,
  "observacoes": "Entrega urgente"
}
```

**Resposta esperada (201):**
```json
{
  "pedidoId": "pedido_12345",
  "usuarioId": "uuid-usuario",
  "status": "AGUARDANDO_CONFIRMACAO",
  "valorTotal": 320.00,
  "dataCriacao": "2026-04-05T14:30:00Z"
}
```

> 💾 **Salvar `pedidoId`** - será usado nos próximos passos

---

## ✅ PASSO 5: CRIAR ENTREGA (Confirmar Quote)

### Endpoint: Create Delivery

```bash
POST http://localhost:8080/api/v1/uber/deliveries
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "quoteId": "quote_12345",
  "pedidoId": "pedido_12345",
  "pinColeta": "1234",           # PIN para lojista (pickup)
  "pinEntrega": "5678",          # PIN para cliente (delivery)
  "pickupInstructions": "Retirar pacote na recepção",
  "dropoffInstructions": "Deixar na porta principal"
}
```

**Resposta esperada (200):**
```json
{
  "deliveryId": "delivery_abc123",
  "status": "ACCEPTED",
  "trackingUrl": "https://t.uber.com/tracking/12345",
  "pickupEstimatedAt": "2026-04-05T14:40:00Z",
  "dropoffEstimatedAt": "2026-04-05T15:10:00Z"
}
```

> 🎯 **A entrega agora está confirmada com a Uber!**

---

## ✅ PASSO 6: PROCESSAR PAGAMENTO

### Opção A: PIX (Recomendado para testes)

#### 6a. Calcular Total

```bash
POST http://localhost:8080/api/v1/pagamentos/pedido/pedido_12345/calcular-total
Authorization: Bearer <JWT_TOKEN>
```

**Resposta esperada:**
```json
{
  "pedidoId": "pedido_12345",
  "valorProdutos": 200.00,
  "valorFrete": 15.00,
  "valorDesconto": 0.00,
  "valorTotal": 215.00,
  "currencyCode": "BRL"
}
```

#### 6b. Criar PIX

```bash
POST http://localhost:8080/api/v1/pagamentos/pedido/pedido_12345/criar-quase-tudo
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "formaPagamento": "PIX",
  "lojistaSelecionadoId": "uuid-lojista"
}
```

**Resposta esperada (201):**
```json
{
  "pagamentoId": "pag_12345",
  "pedidoId": "pedido_12345",
  "status": "PENDENTE",
  "formaPagamento": "PIX",
  "qrCode": "00020126580014br.gov.bcb.pix...",
  "pixKey": "pedido_12345@winmarketplace",
  "expiresAt": "2026-04-05T15:30:00Z"
}
```

---

## ✅ PASSO 7: RASTREAMENTO (Webhooks)

### Eventos que chegam automaticamente:

```
1. DELIVERY_ACCEPTED          → Uber aceitou a entrega
2. DRIVER_ASSIGNED            → Motorista assinalado
3. PICKUP_ARRIVED             → Motorista chegou na loja
4. PICKUP_IN_PROGRESS         → Coleta em andamento
5. PICKUP_COMPLETED           → Coleta realizada
6. DELIVERY_ARRIVED           → Motorista chegou no cliente
7. DELIVERY_IN_PROGRESS       → Entrega em andamento
8. DELIVERY_COMPLETED         → Entrega concluída ✅
```

---

## 🔧 CHECKLIST PRÉ-REQUISITOS

### Configuração de Chaves (`.env`)

```env
# ========================================
# UBER DIRECT - PRODUÇÃO
# ========================================
UBER_CUSTOMER_ID=SEU_CUSTOMER_ID
UBER_CLIENT_ID=SEU_CLIENT_ID
UBER_CLIENT_SECRET=SEU_CLIENT_SECRET
UBER_API_BASE_URL=https://api.uber.com/v1/customers    # ⚠️ Mudar de "sandbox-api" para "api"
UBER_API_ENABLED=true
UBER_WEBHOOK_SECRET=SEU_WEBHOOK_SECRET

# ========================================
# GOOGLE MAPS API
# ========================================
GOOGLE_MAPS_API_KEY=SEU_GOOGLE_MAPS_API_KEY

# ========================================
# PAGAMENTO (PIX via PagarMe)
# ========================================
PAGARME_API_KEY=SEU_PAGARME_API_KEY
PAGARME_PUBLIC_KEY=SEU_PAGARME_PUBLIC_KEY
PAGARME_ENVIRONMENT=live                               # ⚠️ Mudar de "test" para "live"
PAGARME_ENABLED=true
```

### Banco de Dados

- ✅ PostgreSQL 16 rodando
- ✅ Tabelas de `pedidos`, `entregas`, `usuarios` criadas
- ✅ Migrations executadas

### Backend

- ✅ Spring Boot 3.5.6 rodando
- ✅ Todas as dependências instaladas
- ✅ Chaves Uber configuradas
- ✅ Webhooks configurados

---

## 🧪 CENÁRIOS DE TESTE

### Cenário 1: Fluxo Feliz ✅

1. ✅ Login de usuário
2. ✅ Solicitar quote (frete calculado)
3. ✅ Criar pedido com itens
4. ✅ Confirmar entrega (quote aceito)
5. ✅ Gerar PIX
6. ✅ Receber webhook de DELIVERY_COMPLETED

**Resultado esperado:** Compra concluída, cliente recebe notificação

---

### Cenário 2: Quote Recusada ❌

Se a Uber recusar a quote (área fora de cobertura):

**Resposta (400/403):**
```json
{
  "error": "DELIVERY_QUOTE_UNAVAILABLE",
  "message": "Entrega indisponível nesta região"
}
```

**Ação:** Mostrar mensagem ao cliente e pedir endereço alternativo

---

### Cenário 3: Pedido Cancelado

Antes da entrega ser confirmada:

```bash
POST http://localhost:8080/api/v1/pedidos/{pedidoId}/cancelar
Authorization: Bearer <JWT_TOKEN>
```

---

### Cenário 4: Webhook não Recebido

Se a Uber não enviou webhook após 1 hora:

```bash
GET http://localhost:8080/api/v1/uber/deliveries/{deliveryId}/status
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "deliveryId": "delivery_abc123",
  "status": "PICKUP_COMPLETED",
  "lastUpdate": "2026-04-05T14:50:00Z"
}
```

---

## 📊 ENDPOINTS COMPLEMENTARES

### Listar Pedidos do Usuário

```bash
GET http://localhost:8080/api/v1/pedidos/usuario/{usuarioId}
Authorization: Bearer <JWT_TOKEN>
```

### Obter Detalhes do Pedido

```bash
GET http://localhost:8080/api/v1/pedidos/{pedidoId}
Authorization: Bearer <JWT_TOKEN>
```

### Atualizar Status do Pedido (Admin/Lojista)

```bash
PATCH http://localhost:8080/api/v1/pedidos/{pedidoId}/status
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "novoStatus": "PREPARANDO",
  "observacoes": "Produto em separação"
}
```

---

## ⚠️ OBSERVAÇÕES IMPORTANTES

### Sobre Chaves de Produção Uber

> **Quando mudar de Sandbox para Produção:**

1. **UBER_API_BASE_URL**: `sandbox-api.uber.com` → `api.uber.com`
2. **Credenciais**: Usar chaves de produção (não sandbox)
3. **Webhook**: Apontar para URL pública da VPS
4. **Testes**: Deve-se fazer testes com pequenos valores primeiros
5. **SLA**: Garantia de entrega é responsabilidade da Uber

### Validações Implementadas

- ✅ PIN codes (obrigatórios para coleta e entrega)
- ✅ Geolocalização (endereço deve estar em formato correto)
- ✅ Coordenadas (latitude/longitude validadas)
- ✅ Tempo mínimo de quote (geralmente 5-10 minutos)
- ✅ Horário de funcionamento da Uber (varável por cidade)

---

## 🔍 DEBUGGING

### Verificar Logs do Backend

```bash
docker logs win-marketplace-backend -f
```

### Procurar por erros Uber

```bash
docker logs win-marketplace-backend | grep -i "uber\|delivery"
```

### Verificar Webhooks Recebidos

```sql
SELECT * FROM webhooks_log 
WHERE tipo = 'UBER_DELIVERY' 
ORDER BY criado_em DESC 
LIMIT 10;
```

---

## ✅ PRÓXIMOS PASSOS

1. **Configurar chaves Uber** (produção ou sandbox)
2. **Testar cenário 1** (fluxo feliz)
3. **Validar webhooks** chegando em tempo real
4. **Testar fluxo de cancelamento**
5. **Monitorar logs** para erros
6. **Fazer checkout com PIX real** (pequeno valor)
7. **Validar entrega** até o final

---

**Recomendação:** Começar com **ambiente de teste/sandbox** da Uber e depois migrar para produção com confirmação Uber.
