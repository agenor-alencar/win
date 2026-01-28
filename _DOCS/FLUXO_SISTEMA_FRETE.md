# 🔍 FLUXO COMPLETO DO SISTEMA DE FRETE - DIAGNÓSTICO

## 📊 FLUXO ATUAL (Como está implementado)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1️⃣ CEPWidget (Home) - Pré-cadastro do CEP                           │
└─────────────────────────────────────────────────────────────────────┘
         │
         ├─ Usuário informa CEP (ex: 71025-050)
         │
         ├─ Valida CEP via ViaCEP
         │  └─ GET https://viacep.com.br/ws/71025050/json/
         │     ✅ Retorna: logradouro, bairro, cidade, uf
         │
         ├─ Salva CEP no localStorage
         │  └─ localStorage.setItem('win_cep_cliente', '71025050')
         │
         └─ Se usuário LOGADO:
            ├─ POST /api/v1/enderecos
            │  Body: {
            │    cep: "71025050",
            │    logradouro: "Quadra QE 23 Área Especial",
            │    numero: "S/N",
            │    bairro: "Guará II",
            │    cidade: "Brasília",
            │    estado: "DF",
            │    temporario: true  ⚠️
            │  }
            │
            ├─ Backend GEOCODIFICA endereço
            │  └─ GeocodingService.geocodificar(cep, enderecoCompleto)
            │     └─ Nominatim API → retorna latitude/longitude
            │
            ├─ Salva no banco: enderecos
            │  └─ latitude: -15.xxxxx
            │      longitude: -47.xxxxx
            │
            └─ Retorna ID do endereço
               └─ localStorage.setItem('win_endereco_temp_id', 'UUID')

┌─────────────────────────────────────────────────────────────────────┐
│ 2️⃣ Checkout - Cálculo de Frete                                       │
└─────────────────────────────────────────────────────────────────────┘
         │
         ├─ useEffect() - Ao carregar página
         │
         ├─ 🚀 ESTRATÉGIA 1: Usa endereço temporário (se existir)
         │  │
         │  ├─ Pega: enderecoTempId = localStorage.getItem('win_endereco_temp_id')
         │  │
         │  ├─ GET /v1/enderecos/{enderecoTempId}  ❌ ERRO 500 AQUI!
         │  │
         │  └─ ⚠️ PROBLEMA: Endpoint está como /v1/enderecos
         │     └─ Deveria ser: /api/v1/enderecos
         │
         └─ 🎯 ESTRATÉGIA 2: Completa endereço e recalcula
            │
            ├─ Se campos preenchidos (CEP, logradouro, numero, cidade)
            │
            ├─ PUT /v1/enderecos/{enderecoId}  ❌ ERRO 500 AQUI TAMBÉM!
            │  └─ ⚠️ PROBLEMA: Endpoint errado (/v1 em vez de /api/v1)
            │
            ├─ POST /api/v1/fretes/calcular
            │  Body: {
            │    lojistaId: "UUID",
            │    enderecoEntregaId: "UUID",
            │    pesoTotalKg: 1.5
            │  }
            │
            └─ Backend: FreteService.calcularFrete()
               │
               ├─ Busca Lojista no banco
               │  └─ SELECT * FROM lojistas WHERE id = ?
               │
               ├─ Busca Endereço de entrega
               │  └─ SELECT * FROM enderecos WHERE id = ?  
               │     ✅ Com latitude/longitude já geocodificadas
               │
               ├─ Valida coordenadas da origem (lojista)
               │  └─ Se não tiver → geocodifica em tempo real
               │
               ├─ Chama Uber Direct API
               │  └─ POST https://api.uber.com/v1/customers/delivery_quotes
               │     Body: {
               │       "pickup": { "lat": -15.xx, "lng": -47.xx },
               │       "dropoff": { "lat": -15.yy, "lng": -47.yy }
               │     }
               │
               └─ Retorna FreteResponseDTO
                  └─ valorFreteTotal, quoteId, tempo, distancia

┌─────────────────────────────────────────────────────────────────────┐
│ 3️⃣ Finalização do Pedido                                             │
└─────────────────────────────────────────────────────────────────────┘
         │
         ├─ POST /api/v1/pedidos
         │  Body: {
         │    enderecoEntregaId: "UUID",
         │    valorFrete: 15.50,
         │    quoteId: "uber-quote-xxx"  ⚠️ Importante!
         │  }
         │
         └─ Backend cria pedido com valor garantido pela Uber
```

---

## ❌ PROBLEMAS IDENTIFICADOS

### 🔴 PROBLEMA 1: Endpoints Incorretos no Frontend

**Arquivo**: `Checkout.tsx` linha ~126 e ~179

```typescript
// ❌ ERRADO
const responseEndereco = await api.get(`/v1/enderecos/${enderecoTempId}`);
await api.put(`/v1/enderecos/${enderecoFinalId}`, enderecoCompleto);

// ✅ CORRETO
const responseEndereco = await api.get(`/api/v1/enderecos/${enderecoTempId}`);
await api.put(`/api/v1/enderecos/${enderecoFinalId}`, enderecoCompleto);
```

**Consequência**: Erro 500 ao tentar buscar/atualizar endereço temporário

---

### 🟡 PROBLEMA 2: Pool de Conexões PostgreSQL (JÁ CORRIGIDO)

**Arquivo**: `application.yml`

```yaml
# ✅ ANTES (causava erros)
max-lifetime: 300000  # 5 minutos - conexões morriam rápido

# ✅ DEPOIS (corrigido)
max-lifetime: 1800000  # 30 minutos - conexões estáveis
```

---

### 🟡 PROBLEMA 3: Falta de Logs de Debug

**Arquivo**: `FreteService.java` linha ~92

```java
// ✅ JÁ ADICIONADO
log.info("🔍 Geocodificando CEP destino: {}", cepLimpo);
log.info("📍 Coordenadas destino: lat={}, lon={}", coordsDestino[0], coordsDestino[1]);
```

---

## ✅ SOLUÇÃO IMEDIATA

### 1. Corrigir Endpoints no Checkout.tsx

```typescript
// Linha ~126
const responseEndereco = await api.get(`/api/v1/enderecos/${enderecoTempId}`);

// Linha ~179
await api.put(`/api/v1/enderecos/${enderecoFinalId}`, enderecoCompleto);

// Linha ~183
const responseNovoEndereco = await api.post('/api/v1/enderecos', enderecoCompleto);
```

### 2. Rebuild Frontend

```bash
cd win-frontend
npm run build
```

### 3. Redeploy no Servidor

```bash
cd ~/win
docker compose down
docker compose build --no-cache backend frontend
docker compose up -d
```

---

## 📋 FLUXO CORRETO ESPERADO

```
1. CEPWidget → Salva CEP + cria endereço temp com coordenadas
   ↓
2. localStorage → Guarda: win_cep_cliente + win_endereco_temp_id
   ↓
3. Checkout → Busca endereço temp (API correta: /api/v1/enderecos)
   ↓
4. Checkout → Completa dados + recalcula frete
   ↓
5. FreteService → Usa coordenadas geocodificadas
   ↓
6. Uber API → Retorna cotação com quoteId
   ↓
7. Finalizar Pedido → Usa quoteId para garantir preço
```

---

## 🧪 COMO TESTAR

### No Console do Navegador:

```javascript
// 1. Ver CEP salvo
localStorage.getItem('win_cep_cliente')

// 2. Ver ID do endereço temporário
localStorage.getItem('win_endereco_temp_id')

// 3. Testar endpoint manualmente
fetch('https://winmarketplace.com.br/api/v1/enderecos/{ID}', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
```

### Nos Logs do Servidor:

```bash
docker compose logs -f backend | grep -E "🔍|📍|❌|Calculando frete"
```

---

## 🎯 RESUMO DAS CORREÇÕES NECESSÁRIAS

1. ✅ HikariCP configurado (JÁ FEITO)
2. ✅ Logs adicionados no FreteService (JÁ FEITO)
3. ⏳ **Corrigir endpoints no Checkout.tsx** (FAZER AGORA)
4. ⏳ Rebuild frontend (FAZER AGORA)
5. ⏳ Redeploy no servidor (FAZER AGORA)
