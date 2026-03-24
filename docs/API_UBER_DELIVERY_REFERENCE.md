# 📡 API Reference - Uber Direct Delivery Integration

## Endpoint Overview

| **Serviço** | **Método** | **Endpoint** | **Autenticação** | **Descrição** |
|---|---|---|---|---|
| **Geocoding** | GET | `/api/v1/geocoding/cep/{cep}` | Bearer Token | Converter CEP para coordenadas |
| | GET | `/api/v1/geocoding/endereco` | Bearer Token | Converter endereço completo para coords |
| | GET | `/api/v1/geocoding/rota` | Bearer Token | Calcular rota entre dois pontos |
| | GET | `/api/v1/geocoding/cache/stats` | Bearer Token | Estatísticas do cache |
| | POST | `/api/v1/geocoding/cache/limpar` | Bearer Token | Limpar cache manualmente |
| **Uber Auth** | POST | `/api/v1/uber/auth/token` | Bearer Token | Obter/renovar token de acesso |
| | POST | `/api/v1/uber/auth/token/{id}/revogar` | Bearer Token | Revogar um token |
| | GET | `/api/v1/uber/auth/tokens/stats` | Bearer Token | Estatísticas de tokens |
| | POST | `/api/v1/uber/auth/config/validar` | Bearer Token | Validar configuração |
| | POST | `/api/v1/uber/auth/tokens/limpar-expirados` | Bearer Token | Cleanup automático |
| **Uber Quote** | POST | `/api/v1/uber/quotes` | Bearer Token | Cotação completa |
| | POST | `/api/v1/uber/quotes/simples` | Bearer Token | Cotação com query params |
| **Uber Delivery** | POST | `/api/v1/uber/deliveries` | Bearer Token | Criar entrega |
| | GET | `/api/v1/uber/deliveries/{id}/status` | Bearer Token | Consultar status |
| | POST | `/api/v1/uber/deliveries/generate-pin` | Bearer Token | Gerar PIN aleatório |
| **Webhook** | POST | `/api/v1/webhooks/uber` | HMAC-SHA256 | Receber eventos Uber |
| | GET | `/api/v1/webhooks/uber/health` | Público | Health check |

---

## 🔐 Detalhes dos Endpoints

### 1️⃣ **Geocoding - Converter CEP para Coordenadas**

```http
GET /api/v1/geocoding/cep/01311-100
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
{
  "latitude": -23.561,
  "longitude": -46.656,
  "cep": "01311-100",
  "endereco": "Avenida Paulista, 1000, São Paulo, SP, Brasil",
  "cache": false
}
```

**Erro** (400 Bad Request):
```json
{
  "error": "CEP inválido ou não encontrado",
  "cep": "12345-000"
}
```

---

### 2️⃣ **Geocoding - Endereço Completo**

```http
GET /api/v1/geocoding/endereco?cep=01311-100&endereco=Avenida Paulista 1000, São Paulo, SP
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
{
  "latitude": -23.561,
  "longitude": -46.656,
  "endereco": "Avenida Paulista, 1000, São Paulo, SP, Brasil",
  "cache": false
}
```

---

### 3️⃣ **Geocoding - Rota**

```http
GET /api/v1/geocoding/rota?cep_origem=01311-100&endereco_origem=Avenida Paulista&cep_destino=02310-100&endereco_destino=Rua Augusta
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
{
  "origem": {
    "latitude": -23.561,
    "longitude": -46.656,
    "endereco": "Avenida Paulista, São Paulo, SP"
  },
  "destino": {
    "latitude": -23.550,
    "longitude": -46.633,
    "endereco": "Rua Augusta, São Paulo, SP"
  },
  "distancia_km": 2.5,
  "tempo_minutos": 8
}
```

---

### 4️⃣ **Geocoding - Cache Stats**

```http
GET /api/v1/geocoding/cache/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
{
  "total_cached": 145,
  "hit_rate": 78.5,
  "memory_usage_mb": 12.3,
  "ttl_minutos": 1440,
  "items": [
    {
      "cep": "01311-100",
      "hits": 45,
      "criado_em": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 5️⃣ **Uber Auth - Obter Token**

```http
POST /api/v1/uber/auth/token
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "customer_id": "UBER_CUSTOMER_ID_OPCIONAL"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3599,
  "scope": "eats.deliveries eats.deliveries.write",
  "criado_em": "2024-01-15T10:30:00Z",
  "expira_em": "2024-01-15T11:30:00Z"
}
```

**Erro - Credenciais inválidas** (401 Unauthorized):
```json
{
  "error": "invalid_client",
  "error_description": "Client authentication failed"
}
```

---

### 6️⃣ **Uber Quote - Cotação Completa**

```http
POST /api/v1/uber/quotes
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "localizacao_origem": {
    "latitude": -23.561,
    "longitude": -46.656
  },
  "localizacao_destino": {
    "latitude": -23.550,
    "longitude": -46.633
  },
  "pedido_id": "12345"
}
```

**Response** (200 OK):
```json
{
  "quote_id": "quote_ABC123XYZ",
  "valor_uber": 15.50,
  "taxa_win": 1.55,
  "frete_cliente": 17.05,
  "tempo_estimado_minutos": 12,
  "distancia_km": 2.5,
  "validade_minutos": 15,
  "expires_at": "2024-01-15T10:45:00Z"
}
```

**Validação**:
- `valor_uber` = valor cobrado pela Uber
- `taxa_win` = 10% do `valor_uber` (margem da WIN)
- `frete_cliente` = `valor_uber` + `taxa_win` (total a cobrar)

---

### 7️⃣ **Uber Quote - Versão Simplificada**

```http
POST /api/v1/uber/quotes/simples?lat_origem=-23.561&lon_origem=-46.656&lat_destino=-23.550&lon_destino=-46.633
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
{
  "quote_id": "quote_ABC123XYZ",
  "valor_uber": 15.50,
  "taxa_win": 1.55,
  "frete_cliente": 17.05,
  "tempo_estimado_minutos": 12
}
```

---

### 8️⃣ **Uber Delivery - Criar Entrega**

```http
POST /api/v1/uber/deliveries
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "quote_id": "quote_ABC123XYZ",
  "pin_coleta": "1234",
  "pin_entrega": "5678",
  "pedido_id": "12345"
}
```

**Response** (201 Created):
```json
{
  "delivery_id": "delivery_XYZ789ABC",
  "quote_id": "quote_ABC123XYZ",
  "status": "SEARCHING_FOR_COURIER",
  "tracking_url": "https://marketplace.uber.com/deliveries/delivery_XYZ789ABC",
  "pin_coleta": "1234",
  "pin_entrega": "5678",
  "criado_em": "2024-01-15T10:30:00Z"
}
```

**Validação de PIN**:
- ✅ Válido: `"1234"`, `"123456"`, `"5678"`
- ❌ Inválido: `"123"` (menos de 4 dígitos)
- ❌ Inválido: `"1234567"` (mais de 6 dígitos)
- ❌ Inválido: `"12AB"` (contém letras)

**Erros Comuns**:
```json
{
  "error": "Invalid PIN format",
  "message": "PIN must be 4-6 numeric digits"
}
```

---

### 9️⃣ **Uber Delivery - Consultar Status**

```http
GET /api/v1/uber/deliveries/delivery_XYZ789ABC/status
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
{
  "delivery_id": "delivery_XYZ789ABC",
  "status": "PICKED_UP",
  "courier_name": "João Silva",
  "courier_phone": "+5511987654321",
  "courier_location": {
    "latitude": -23.555,
    "longitude": -46.645
  },
  "estimated_arrival": 480,
  "updated_at": "2024-01-15T10:45:00Z"
}
```

**Status Possíveis**:
- `SEARCHING_FOR_COURIER` - Procurando motorista (ETA: até 10 min)
- `ACCEPTED` - Motorista aceitou (ETA: até 5 min)
- `ARRIVED_AT_PICKUP` - Chegou na coleta
- `PICKED_UP` - Pedido coletado
- `ARRIVED_AT_DROPOFF` - Chegou no destino
- `DELIVERED` - Entregue com sucesso
- `CANCELLED` - Entrega cancelada

---

### 🔟 **Uber Delivery - Gerar PIN Aleatório**

```http
POST /api/v1/uber/deliveries/generate-pin
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
{
  "pin": "923847"
}
```

---

### 1️⃣1️⃣ **Webhook - Receber Evento**

```http
POST /api/v1/webhooks/uber
X-Uber-Signature: HmacSHA256=jKLdm+OEdmvjSstw123abc...
Content-Type: application/json

{
  "event_type": "delivery.status_changed",
  "delivery_id": "delivery_XYZ789ABC",
  "status": "DELIVERED",
  "timestamp": "2024-01-15T11:00:00Z",
  "courier": {
    "name": "João Silva",
    "phone": "+5511987654321"
  }
}
```

**Response** (200 OK):
```json
{
  "status": "processed",
  "event_id": "event_123"
}
```

**Validação de Assinatura HMAC**:

```python
import hmac
import hashlib

# Backend recebe:
payload = '{"event_type":"delivery.status_changed"...}'
signature_header = request.headers.get('X-Uber-Signature')
webhook_secret = os.getenv('UBER_WEBHOOK_SECRET')

# Calcula:
computed_signature = 'HmacSHA256=' + hmac.new(
  webhook_secret.encode(),
  payload.encode(),
  hashlib.sha256
).hexdigest()

# Valida:
assert computed_signature == signature_header  # ✅ Autêntico
```

---

### 1️⃣2️⃣ **Webhook - Health Check**

```http
GET /api/v1/webhooks/uber/health
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "webhook_url": "https://seu-server.com/api/v1/webhooks/uber",
  "last_event": "2024-01-15T11:00:00Z",
  "total_events_processed": 145
}
```

---

## 🔄 Fluxo Completo - Exemplo Prático

### Passo 1: Geocodificar Endereços

```bash
# Loja
curl -X GET "http://localhost:8080/api/v1/geocoding/cep/01311-100" \
  -H "Authorization: Bearer $TOKEN"
# → latitude: -23.561, longitude: -46.656

# Cliente
curl -X GET "http://localhost:8080/api/v1/geocoding/endereco?cep=02310-100&endereco=Rua Augusta" \
  -H "Authorization: Bearer $TOKEN"
# → latitude: -23.550, longitude: -46.633
```

### Passo 2: Solicitar Cotação

```bash
curl -X POST "http://localhost:8080/api/v1/uber/quotes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "localizacao_origem": {"latitude": -23.561, "longitude": -46.656},
    "localizacao_destino": {"latitude": -23.550, "longitude": -46.633},
    "pedido_id": "ped_12345"
  }'
# → quote_id: "quote_ABC123XYZ"
# → frete_cliente: 17.05
```

### Passo 3: Lojista Marca "Pronto para Retirada"

```bash
# Frontend chama ao clicar no botão:
curl -X POST "http://localhost:8080/api/v1/uber/deliveries" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quote_id": "quote_ABC123XYZ",
    "pin_coleta": "1234",
    "pin_entrega": "5678",
    "pedido_id": "ped_12345"
  }'
# → delivery_id: "delivery_XYZ789ABC"
# → tracking_url: "https://marketplace.uber.com/deliveries/delivery_XYZ789ABC"
```

### Passo 4: Consultar Status

```bash
# Frontend faz polling a cada 30 segundos:
curl -X GET "http://localhost:8080/api/v1/uber/deliveries/delivery_XYZ789ABC/status" \
  -H "Authorization: Bearer $TOKEN"
# → status: "PICKED_UP"
# → courier_name: "João Silva"
# → estimated_arrival: 480 (segundos)
```

### Passo 5: Webhook Recebe Eventos

```bash
# Uber envia POST para seu servidor:
POST /api/v1/webhooks/uber
X-Uber-Signature: HmacSHA256=...
Content-Type: application/json

{
  "event_type": "delivery.status_changed",
  "delivery_id": "delivery_XYZ789ABC",
  "status": "DELIVERED"
}

# ✅ Backend retorna 200 OK
# → Atualiza banco de dados
# → Envia WebSocket para frontend
# → Client vê "Entregue!" com CheckCircle2 icon
```

---

## 📊 Status Code Referência

| **Code** | **Significado** | **Ação** |
|---|---|---|
| 200 | OK | Sucesso |
| 201 | Created | Entrega criada |
| 400 | Bad Request | Validação falhou (ex: PIN inválido) |
| 401 | Unauthorized | Token JWT inválido/expirado |
| 403 | Forbidden | Sem permissão para esta ação |
| 404 | Not Found | Recurso não encontrado |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro no servidor (verificar logs) |
| 503 | Service Unavailable | Uber API offline |

---

## 🔐 Variáveis de Ambiente

```bash
# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSyDxxxxxxxxxx

# Uber Direct
UBER_CUSTOMER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
UBER_CLIENT_ID=client_id_uber
UBER_CLIENT_SECRET=secret_uber
UBER_OAUTH_URL=https://auth.uber.com/oauth/v2/token
UBER_API_BASE_URL=https://api.uber.com/v1/customers
UBER_WEBHOOK_SECRET=webhook_secret_para_validacao_hmac

# Scheduler
SCHEDULER_INITIAL_DELAY=60000
SCHEDULER_FIXED_DELAY=43200000
```

---

## 🛠️ Debugging

### Ver tokens gerados

```bash
# No database:
SELECT customer_id, access_token, expira_em, total_usos 
FROM uber_oauth_tokens 
ORDER BY atualizado_em DESC 
LIMIT 5;
```

### Ver entregas criadas

```bash
# No database:
SELECT delivery_id, quote_id, status_uber, criado_em 
FROM entrega 
WHERE delivery_id IS NOT NULL 
ORDER BY criado_em DESC 
LIMIT 10;
```

### Testar webhook localmente

```bash
# Terminal 1: Exposer local port
ngrok http 8080
# Copia URL gerada (ex: https://abc123.ngrok.io)

# Terminal 2: Registra webhook na Uber
curl -X POST https://api.uber.com/v1/webhooks \
  -H "Authorization: Bearer $UBER_TOKEN" \
  -d '{"url": "https://abc123.ngrok.io/api/v1/webhooks/uber"}'

# Terminal 3: Testa com curl
curl -X POST http://localhost:8080/api/v1/webhooks/uber \
  -H "X-Uber-Signature: HmacSHA256=..." \
  -H "Content-Type: application/json" \
  -d '{"event_type": "delivery.status_changed"}'
```

---

## 📚 Referências

- [Uber Deliveries API Docs](https://developer.uber.com/docs/delivery/deliveries-api/reference)
- [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [OAuth 2.0 Client Credentials](https://tools.ietf.org/html/rfc6749#section-4.4)
- [HMAC-SHA256 Webhook Validation](https://tools.ietf.org/html/rfc4868)
