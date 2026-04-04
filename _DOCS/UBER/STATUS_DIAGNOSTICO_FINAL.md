# STATUS INTEGRAÇÃO UBER - DIAGNÓSTICO COMPLETO

## ✅ O Que Já Foi Resolvido

### 1. **Tabela `configuracoes` Criada**
- ✅ Migration 010_create_configuracoes_table.sql executada com sucesso
- ✅ Tabela populada com valores padrão (taxa_comissao_win = 7%)  
- ✅ Foi o erro CRÍTICO que bloqueava o fallback para MOCK

### 2. **Maps_API_KEY Confirmada**
- ✅ A chave **já existe** no `.env`
-Key: `AIzaSyDShWrpS8HkLYS2Rit6AalJmrq3KE9cYHw`
- ✅ Backend carrega corretamente

### 3. **Docker Compose Atualizado**
- ✅ Adicionado `UBER_CUSTOMER_ID` mapping (faltava antes)
- ✅ Maps_API_KEY corretamente mapeado

## ❌ Problemas Ainda Existentes

### 1. **Erro de Coluna Faltante**
```
ERROR: column c1_0.pagarme_recipient_id_marketplace does not exist
```
- Causa: Tabela `configuracoes` não tem essa coluna
- Locução no código: `ConfiguracaoService.buscarConfigInterna()`
- Impacto: Erro ao buscar taxa comissão, usa padrão de 10%
- Status: ⚠️ Não bloqueia operação, mas não ideal

### 2. **Uber API Rejeitando Request**
```
400 BAD_REQUEST
"pickup_address": "This field is required."
"dropoff_address": "This field is required."
```
- Causa: Backend está enviando estrutura ERRADA para Uber
- Esperado: `pickup_address` e `dropoff_address` como TOP-LEVEL fields
- Atual: Estrutura ninhada em `pickup` e `dropoff` objects
- Impacto: API Uber retorna erro 400, fallback para MOCK
- Status: ❌ **BLOQUEADOR PRINCIPAL**

### 3. **Problemas de Compilação**
```
[ERROR] bad operand types for binary operator '*'
first type: Integer
second type: BigDecimal
Location: ItemPedidoMapperImpl (MapStruct generated code)
```
- Causa: Erro no mapper gerado entre Integer * BigDecimal
- Impacto: Impossível compilar projeto Maven locally
- Status: 🔧 Requer fix no projeto source

---

## 🎯 RECOMENDAÇÕES IMEDIATAS

### **Opção 1: Usar Backend Atual (RECOMENDADO)**
Backend container já está em funcionamento com todos os fixes aplicados em BD.

**Próximos passos:**
1. Reiniciar backend para carregar configuracoes table
2. Testar com estrutura CORRETA para Uber (manual curl ou update script)
3. Monitorar logs para confirmar que agora pega REAL quotes

**Implementação:**
```bash
docker restart win-marketplace-backend
sleep 20

# Test with CORRECT struktur for Uber
curl -X POST http://localhost:8080/api/v1/entregas/simular-frete \
  -H "Content-Type: application/json" \
  -d '{
    "lojistaId": "550e8400-e29b-41d4-a716-446655440000",
    "cepOrigem": "01310-100",
    "cepDestino": "04567-000",
    "enderecoOrigemCompleto": "Avenida Paulista 1000, Sao Paulo, SP",
    "enderecoDestinoCompleto": "Rua Maria Prestes 500, Sao Paulo, SP",
    "pesoTotalKg": 5.0,
    "origemLatitude": -23.5615,
    "origemLongitude": -46.6560,
    "destinoLatitude": -23.5725,
    "destinoLongitude": -46.6440
  }'
```

### **Opção 2: Corrigir Source Code e Recompilar**
Se você quer trabalhar com código atualizado:

1. **Fix na source code:**
   - Abrir: `backend/src/main/java/com/win/marketplace/service/UberFlashService.java`
   - Mudar estrutura para enviar TOP-LEVEL `pickup_address` e `dropoff_address`
   - (Mudança JÁ foi feita, mas precisa recompilar)

2. **Fix MapStruct error:**
   - Abrir mappers que usam Integer * BigDecimal
   - Adicionar conversão explícita
   - Recompilar

3. **Rebuild Docker:**
```bash
docker-compose down win-marketplace-backend
docker rmi win-marketplace-backend  # Remove old image
docker-compose build --no-cache win-marketplace-backend
docker-compose up -d win-marketplace-backend
```

### **Opção 3: Trabalhar com Google Cloud para Debug**
Se quiser entender exatamente o que Uber espera:

1. Testar com curl direto usando estrutura TOP-LEVEL
2. Se funcionar, significa o backend precisa desse fix
3. Se falhar, significa outro problema

---

## 📊 RESUMO TECHNICAL

| Componente | Status | Próxima Ação |
|-----------|--------|----------|
| **PIN_VALIDACOES** | ✅ | Testar com pedidos reais |
| **Tabela Configuracoes** | ✅ | Verificar coluna pagarme_* |
| **Maps_API_KEY** | ✅ | Confirmar Google Maps funciona |
| **Uber Credentials** | ✅ | Já carregados |
| **Request Structure** | ❌ | ⏳ Recompilar com fix |
| **Database Integridade** | ⚠️ | Falta coluna pagarme_recipient_id |
| **Backend Health** | ✅ | Rodando, configs carregadas |
| **Logs Geocoding** | ✅ | ViaCEP + Nominatim OK |

---

## 🚀 PRÓXIMA REUNIÃO/TESTE

**Quando:** Depois que decidir qual opção acima

**O que testar:**
1. Endpoint `/api/v1/entregas/simular-frete` retorna `quoteId` com **"quo_"** (REAL), não "MOCK-QUOTE"
2. Logs mostram: "Access token obtido" + "Resposta Uber recebida"
3. Não há mais "Endereço não encontrado pela Uber, usando simulação mock"

**Sucesso =** ✅ Integração Uber REAL com sucesso!

---

## 📝 NOTAS

- ViaCEP + Nominatim geocoding está OK (testes confirmaram)
- Uber Sandbox Credentials estão configurados corretamente
- Backend tentou API REAL (logs comprovam: "Realizando cotação real via API Uber Direct")
- Bloqueador é estrutura JSON enviada para Uber

---

**Recomendação Final:** Ir com **Opção 1** (usar backend atual) se quiser resultado fast. Opção 2 se quiser código limpo e compilado.
