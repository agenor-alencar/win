# 🚀 Plano de Finalização - Sistema de Entregas (Desenvolvimento)

**Data:** 14 de Fevereiro de 2026  
**Objetivo:** Finalizar e testar sistema de entregas Uber Direct em ambiente de desenvolvimento  
**Status Atual:** ⚠️ 80% PRONTO - Faltam apenas testes e validações

---

## 📊 Análise do Estado Atual

### ✅ O QUE JÁ ESTÁ 100% IMPLEMENTADO

#### 1. **Backend Completo** 
- ✅ **UberFlashService.java** (807 linhas)
  - Autenticação OAuth 2.0 com cache de token
  - Métodos: `simularFrete()`, `solicitarCorrida()`, `cancelarCorrida()`
  - Integração real com API Uber
  - Tratamento robusto de erros
  - Suporte a modo MOCK para desenvolvimento

- ✅ **FreteController.java** (157 linhas)
  - `GET /api/v1/fretes/estimar` - Estimativa rápida por CEP
  - `POST /api/v1/fretes/calcular` - Cálculo preciso com coordenadas

- ✅ **FreteService.java**
  - Lógica de negócio completa
  - Integração com sistema de geolocalização
  - Cálculo de taxa Win (10%)
  - Suporte a frete grátis na primeira compra

- ✅ **Sistema de Geolocalização** (100%)
  - Tabelas com latitude/longitude (lojistas, usuarios, enderecos)
  - GeocodingService com ViaCEP + Google Maps
  - Cache automático de coordenadas
  - 4 índices otimizados no banco

- ✅ **DTOs Completos**
  - FreteRequestDTO / FreteResponseDTO
  - SimulacaoFreteRequestDTO / Response
  - SolicitacaoCorridaUberRequestDTO / Response

#### 2. **Frontend Completo**
- ✅ **shippingApi.ts** (182 linhas)
  - `calcularFrete()` - Cálculo com endereço completo
  - `estimarFretePorCep()` - Estimativa rápida
  - `verificarPrimeiraCompra()` - Check de frete grátis

- ✅ **CEPRapido.tsx**
  - Widget de cálculo rápido de frete
  - Salva CEP no localStorage
  - UX otimizada

- ✅ **Checkout.tsx**
  - Integração com API de frete
  - Cálculo automático durante checkout
  - Exibição de tempo estimado

#### 3. **Configuração**
- ✅ **application.yml**
  ```yaml
  uber:
    client:
      id: ${UBER_CLIENT_ID:}
      secret: ${UBER_CLIENT_SECRET:}
    api:
      base-url: ${UBER_API_BASE_URL:https://api.uber.com}
      enabled: ${UBER_API_ENABLED:false}
  ```

- ✅ **.env Local** (arquivo existe e está configurado)
  ```bash
  UBER_CLIENT_ID=9zlEgm25UTAIk11QSTlP3BSPjLmAQKgn
  UBER_CLIENT_SECRET=0d-FXqgkvJPwTCnBwhsI4IeYRdZbwz3RrgXZbXWg
  UBER_API_BASE_URL=https://api.uber.com
  UBER_API_ENABLED=true
  Maps_API_KEY=AIzaSyDShWrpS8HkLYS2Rit6AalJmrq3KE9cYHw
  ```

- ✅ **docker-compose.yml**
  - Variáveis de ambiente mapeadas
  - Sandbox URL configurada

#### 4. **Documentação Completa**
- ✅ `GUIA_CONFIGURACAO_UBER_SANDBOX.md` (476 linhas)
- ✅ `INTEGRACAO_UBER_DIRECT_API.md` (561 linhas)
- ✅ `STATUS_UBER_DIRECT_API.md` (294 linhas)
- ✅ `MELHORIAS_UBER_DIRECT_PRODUCAO.md` (646 linhas)
- ✅ `IMPLEMENTACAO_CEP_WIDGET_UBER.md`
- ✅ `IMPLEMENTACAO_GEOLOCALIZACAO_LOJISTAS.md`

---

## 🎯 O QUE FALTA FAZER (Apenas Validação)

### Prioridade CRÍTICA - Testes no Ambiente Local

#### **Passo 1: Validar Credenciais Uber** 🔐
```bash
# Teste se as credenciais estão funcionando
curl -X POST https://login.uber.com/oauth/v2/token \
  -u "9zlEgm25UTAIk11QSTlP3BSPjLmAQKgn:0d-FXqgkvJPwTCnBwhsI4IeYRdZbwz3RrgXZbXWg" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&scope=eats.deliveries"
```

**Resultado Esperado:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 2592000,
  "token_type": "Bearer"
}
```

**Se falhar:**
- Credenciais podem estar expiradas/inválidas
- Verifique no [Uber Developer Portal](https://developer.uber.com/)

---

#### **Passo 2: Subir Ambiente Local** 🐳
```bash
cd C:\Users\user\OneDrive\Documentos\win

# Subir todos os containers
docker compose up -d

# Verificar logs
docker compose logs -f backend | Select-String "Uber"

# Verificar se backend subiu
curl http://localhost:8080/actuator/health
```

**Logs esperados:**
```
INFO  - Uber Direct API habilitada: true
INFO  - Uber API Base URL: https://api.uber.com
INFO  - Geocoding Service inicializado com sucesso
```

---

#### **Passo 3: Testar Endpoint de Estimativa** 📍

**Teste 1: Estimativa por CEP (sem autenticação)**
```bash
# Estimativa rápida para CEP de Brasília
curl "http://localhost:8080/api/v1/fretes/estimar?cepDestino=70040902&lojistaId=USAR_UUID_REAL&pesoKg=1.5"
```

**Resposta esperada:**
```json
{
  "sucesso": true,
  "valorFreteTotal": 17.90,
  "valorCorridaUber": 15.00,
  "taxaWin": 1.50,
  "distanciaKm": 5.2,
  "tempoEstimadoMinutos": 25,
  "tipoVeiculo": "motorcycle",
  "mensagem": "Cotação via Uber Direct API",
  "modoProducao": true
}
```

**Se falhar:**
- Verificar se lojista tem coordenadas geocodificadas
- Verificar logs: `docker compose logs backend | Select-String "Erro"`

---

#### **Passo 4: Testar Cálculo Completo** 🚚

**Teste 2: Cálculo preciso (requer autenticação)**
```bash
# Primeiro, fazer login e obter token JWT
$token = "SEU_TOKEN_JWT_AQUI"

# Calcular frete com endereço completo
curl -X POST http://localhost:8080/api/v1/fretes/calcular `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{
    "lojistaId": "UUID_DO_LOJISTA",
    "enderecoEntregaId": "UUID_DO_ENDERECO",
    "pesoTotalKg": 2.5
  }'
```

**Resposta esperada:**
```json
{
  "sucesso": true,
  "quoteId": "quote_abc123xyz",  ← IMPORTANTE: Trava o preço
  "valorFreteTotal": 22.90,
  "valorCorridaUber": 20.00,
  "taxaWin": 2.00,
  "distanciaKm": 8.5,
  "tempoEstimadoMinutos": 35,
  "tipoVeiculo": "motorcycle",
  "modoProducao": true
}
```

---

#### **Passo 5: Testar Frontend** 🌐

1. **Abrir navegador:** http://localhost:3000

2. **Testar Widget CEP na Home:**
   - Informar CEP: `70040-902`
   - Clicar em "Calcular Frete"
   - Verificar se aparece o valor e tempo estimado

3. **Testar Checkout Completo:**
   - Adicionar produto ao carrinho
   - Ir para checkout
   - Selecionar endereço de entrega
   - Verificar se o frete é calculado automaticamente
   - Verificar se aparece mensagem "Estimado em X minutos"

4. **Verificar DevTools (F12):**
   ```javascript
   // Console não deve ter erros
   // Network tab deve mostrar:
   GET /api/v1/fretes/estimar?cepDestino=...  → 200 OK
   POST /api/v1/fretes/calcular  → 200 OK
   ```

---

#### **Passo 6: Testar Fluxo Completo** 🎯

**Cenário End-to-End:**

1. ✅ Cliente informa CEP na home
2. ✅ Sistema calcula estimativa (Uber API)
3. ✅ Cliente adiciona produtos ao carrinho
4. ✅ No checkout, seleciona endereço completo
5. ✅ Sistema calcula frete preciso (Uber API)
6. ✅ Cliente finaliza pedido (Mercado Pago)
7. ✅ Após pagamento, pedido vai para "PAGO"
8. ✅ Lojista marca "Pronto para Retirada"
9. ✅ Sistema chama Uber Direct API
10. ✅ Motorista é despachado automaticamente

**Ponto crítico:** Passo 9 (solicitar corrida) só acontece quando lojista confirma pedido pronto.

---

## 🔍 Checklist de Validação

### Backend
- [ ] Containers Docker rodando sem erros
- [ ] Log mostra "Uber Direct API habilitada: true"
- [ ] Credenciais Uber válidas (teste OAuth)
- [ ] Endpoint `/fretes/estimar` retorna 200 OK
- [ ] Endpoint `/fretes/calcular` retorna 200 OK
- [ ] Geocodificação funcionando (coordenadas salvas)
- [ ] Token OAuth em cache (sem requisições excessivas)

### Frontend
- [ ] Aplicação rodando em http://localhost:3000
- [ ] Widget CEP exibe estimativa de frete
- [ ] Checkout calcula frete automaticamente
- [ ] Não há erros no console do navegador
- [ ] Valores exibidos corretamente formatados (R$ XX,XX)
- [ ] Tempo estimado aparece ("Estimado em X minutos")

### Integração
- [ ] CEP informado na home é salvo no localStorage
- [ ] Frete calculado no checkout usa coordenadas reais
- [ ] Primeira compra tem frete grátis (se configurado)
- [ ] Lojistas têm coordenadas geocodificadas
- [ ] Endereços de usuários têm coordenadas

### APIs Externas
- [ ] Uber OAuth 2.0 funcionando (token gerado)
- [ ] Uber Delivery Quote API retornando cotações
- [ ] Google Maps Geocoding API funcionando (se configurada)
- [ ] ViaCEP retornando endereços

---

## 🚨 Troubleshooting Comum

### Erro 1: "Credenciais Uber não configuradas"
**Causa:** Variáveis de ambiente não carregadas  
**Solução:**
```bash
# Verificar se .env está correto
cat .env | Select-String "UBER"

# Reiniciar containers
docker compose restart backend
```

### Erro 2: "Lojista sem coordenadas"
**Causa:** Lojista não foi geocodificado  
**Solução:**
```sql
-- Verificar lojistas sem coordenadas
SELECT id, fantasia, latitude, longitude 
FROM lojistas 
WHERE latitude IS NULL;

-- Geocodificar manualmente via API
POST /api/admin/lojistas/{id}/geocodificar
```

### Erro 3: "401 Unauthorized" na API Uber
**Causa:** Credenciais inválidas ou expiradas  
**Solução:**
1. Verificar no [Developer Portal](https://developer.uber.com/)
2. Regenerar Client Secret se necessário
3. Atualizar .env
4. Reiniciar backend

### Erro 4: "Quote API retorna 400 Bad Request"
**Causa:** Endereço incompleto ou coordenadas inválidas  
**Solução:**
```java
// Verificar logs detalhados
docker compose logs backend | Select-String "Uber" | Select-String "ERROR"

// Validar payload enviado
log.info("Request Uber: {}", objectMapper.writeValueAsString(request));
```

### Erro 5: Frontend não calcula frete
**Causa:** CORS ou URL da API errada  
**Solução:**
```bash
# Verificar ALLOWED_ORIGINS no .env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Verificar VITE_API_URL no frontend
cat win-frontend/.env
```

---

## 📈 Próximos Passos Após Validação

### Fase 1: Desenvolvimento Local (AGORA)
- [x] Ambiente configurado
- [ ] **Testes básicos (VOCÊ ESTÁ AQUI)**
- [ ] Validar integração end-to-end
- [ ] Documentar resultados

### Fase 2: Melhorias (Opcional)
- [ ] Adicionar peso real nos produtos (tabela `produtos`)
- [ ] Implementar cache de quotes (5 minutos)
- [ ] Dashboard admin de entregas

### Fase 3: Sandbox (Uber)
- [ ] Registrar webhook na Uber
- [ ] Testar tracking em tempo real
- [ ] Simular fluxo completo de entrega

### Fase 4: Produção (Futuro)
- [ ] Trocar credenciais para produção
- [ ] Configurar monitoramento (Sentry/LogRocket)
- [ ] Setup de alertas (falhas de API)
- [ ] Documentar runbook operacional

---

## 🎓 Recursos Importantes

### Documentação Interna
- `_DOCS/GUIA_CONFIGURACAO_UBER_SANDBOX.md` - Setup completo
- `_DOCS/INTEGRACAO_UBER_DIRECT_API.md` - Detalhes da API
- `_DOCS/STATUS_UBER_DIRECT_API.md` - Estado atual
- `_DOCS/MELHORIAS_UBER_DIRECT_PRODUCAO.md` - Otimizações

### Documentação Externa
- [Uber Direct API Docs](https://developer.uber.com/docs/deliveries)
- [Uber OAuth 2.0](https://developer.uber.com/docs/rides/authentication)
- [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding)

### Ferramentas
- **Postman/Insomnia**: Testar APIs manualmente
- **Docker Desktop**: Gerenciar containers
- **pgAdmin**: Verificar dados do banco
- **Browser DevTools**: Debug frontend

---

## ✅ Resumo Executivo

**Estado Atual:** Sistema 80% pronto - apenas falta validação

**Trabalho Pendente:**
1. ⏱️ **15 min** - Validar credenciais Uber (teste OAuth)
2. ⏱️ **5 min** - Subir ambiente local (docker compose up)
3. ⏱️ **10 min** - Testar endpoints backend (curl)
4. ⏱️ **15 min** - Testar interface frontend (navegador)
5. ⏱️ **15 min** - Validar fluxo completo (end-to-end)

**Tempo Total Estimado:** ~1 hora

**Próxima Ação:** Executar Passo 1 (validar credenciais)

**Bloqueadores:** Nenhum - tudo está implementado

**Riscos:**
- ⚠️ Credenciais Uber podem estar expiradas (fácil de resolver)
- ⚠️ Lojistas podem não ter coordenadas (geocodificar em batch)

---

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs: `docker compose logs -f backend`
2. Consultar documentação em `_DOCS/`
3. Verificar issues no GitHub
4. Contatar desenvolvedor responsável

**Última Atualização:** 14/02/2026  
**Autor:** Sistema Copilot  
**Versão:** 1.0
