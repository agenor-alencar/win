# Script de Teste - Integração Uber Direct API

## Como Testar a Integração

### 1. Verificar Configuração

```bash
# Verificar se as variáveis estão carregadas
docker exec win-marketplace-backend env | grep UBER
```

**Saída esperada:**
```
UBER_CLIENT_ID=seu_client_id
UBER_CLIENT_SECRET=seu_client_secret
UBER_API_BASE_URL=https://api.uber.com
UBER_API_ENABLED=false
```

---

### 2. Testar Autenticação (Logs)

Ative a API e veja os logs:

```bash
# Editar .env
UBER_API_ENABLED=true

# Restart
docker-compose restart backend

# Ver logs
docker logs -f win-marketplace-backend | grep -i uber
```

**Logs de sucesso:**
```
INFO  c.w.m.s.UberFlashService : Obtendo novo access token da Uber via OAuth 2.0
INFO  c.w.m.s.UberFlashService : Access token obtido com sucesso. Expira em 2592000 segundos
```

---

### 3. Teste Manual - Cotação de Frete

#### Request (CURL)
```bash
curl -X POST http://localhost:8080/entregas/simular-frete \
  -H "Content-Type: application/json" \
  -d '{
    "lojistaId": "123e4567-e89b-12d3-a456-426614174000",
    "cepOrigem": "01310100",
    "enderecoOrigemCompleto": "Av Paulista, 1000 - Bela Vista, São Paulo/SP",
    "cepDestino": "04543907",
    "enderecoDestinoCompleto": "Av Brigadeiro Faria Lima, 2000 - Jardim Paulistano, São Paulo/SP",
    "pesoTotalKg": 2.5
  }'
```

#### Response (Modo MOCK)
```json
{
  "sucesso": true,
  "tipoVeiculo": "UBER_MOTO",
  "valorCorridaUber": 18.50,
  "taxaWinmarket": 1.85,
  "valorFreteTotal": 20.35,
  "distanciaKm": 8.3,
  "tempoEstimadoMinutos": 39,
  "mensagem": "Entrega expressa em até 39 minutos (MOCK)"
}
```

#### Response (API Real)
```json
{
  "sucesso": true,
  "tipoVeiculo": "UBER_MOTO",
  "valorCorridaUber": 22.40,
  "taxaWinmarket": 2.24,
  "valorFreteTotal": 24.64,
  "distanciaKm": 5.2,
  "tempoEstimadoMinutos": 18,
  "mensagem": "Entrega expressa em até 18 minutos"
}
```

**Diferenças:**
- Modo MOCK: valores estimados, mensagem com "(MOCK)"
- API Real: valores reais da Uber, distância e tempo precisos

---

### 4. Teste Manual - Solicitar Entrega

⚠️ **ATENÇÃO:** Solicitação real cria entrega na Uber (cobranças aplicam-se)

#### Pré-requisitos
1. Ter um pedido criado
2. Estar autenticado como lojista
3. Ter credenciais Uber configuradas

#### Request (CURL)
```bash
# Obter token do lojista primeiro
TOKEN="seu_bearer_token_aqui"
PEDIDO_ID="uuid-do-pedido"

curl -X POST "http://localhost:8080/entregas/${PEDIDO_ID}/solicitar" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json"
```

#### Response (Sucesso)
```json
{
  "sucesso": true,
  "idCorridaUber": "delivery_abc123xyz",
  "nomeMotorista": "Carlos Silva",
  "placaVeiculo": "ABC-1234",
  "contatoMotorista": "+5511998877665",
  "codigoRetirada": "1234",
  "codigoEntrega": "5678",
  "urlRastreamento": "https://m.uber.com/ul/?action=trackDelivery&delivery_id=abc123xyz",
  "dataHoraSolicitacao": "2026-01-14T10:30:00-03:00",
  "tempoEstimadoRetiradaMinutos": 15,
  "mensagem": "Entrega solicitada com sucesso! Motorista: Carlos Silva"
}
```

---

### 5. Teste de Erro - Credenciais Inválidas

#### Cenário: Client ID ou Secret incorretos

```bash
# Configurar credenciais erradas
UBER_CLIENT_ID=invalid_client_id
UBER_CLIENT_SECRET=invalid_secret
UBER_API_ENABLED=true

# Restart
docker-compose restart backend

# Tentar cotar frete
curl -X POST http://localhost:8080/entregas/simular-frete ...
```

#### Response
```json
{
  "sucesso": false,
  "erro": "Erro ao simular frete: Falha na autenticação Uber: 401 Unauthorized"
}
```

#### Logs
```
ERROR c.w.m.s.UberFlashService : Erro HTTP ao autenticar na Uber: 401 - Invalid client credentials
ERROR c.w.m.s.UberFlashService : Falha na autenticação Uber: 401 Unauthorized
```

---

### 6. Teste de Erro - Endereço Inválido

#### Cenário: CEP ou endereço que a Uber não encontra

```bash
curl -X POST http://localhost:8080/entregas/simular-frete \
  -H "Content-Type: application/json" \
  -d '{
    "cepOrigem": "00000000",
    "enderecoOrigemCompleto": "Endereço Inexistente, 999",
    "cepDestino": "11111111",
    "enderecoDestinoCompleto": "Rua Falsa, 123",
    "pesoTotalKg": 1.0
  }'
```

#### Response (Fallback para MOCK)
```json
{
  "sucesso": true,
  "tipoVeiculo": "UBER_MOTO",
  "valorCorridaUber": 15.20,
  "taxaWinmarket": 1.52,
  "valorFreteTotal": 16.72,
  "distanciaKm": 10.5,
  "tempoEstimadoMinutos": 46,
  "mensagem": "Entrega expressa em até 46 minutos (MOCK)"
}
```

#### Logs
```
WARN  c.w.m.s.UberFlashService : Endereço não encontrado pela Uber, usando simulação mock
ERROR c.w.m.s.UberFlashService : Erro HTTP ao cotar frete na Uber: 400 - Address not found
```

---

### 7. Teste de Cache de Token

#### Fazer múltiplas requisições e verificar logs

```bash
# Requisição 1
curl -X POST http://localhost:8080/entregas/simular-frete ... 

# Requisição 2 (imediata)
curl -X POST http://localhost:8080/entregas/simular-frete ...

# Requisição 3 (imediata)
curl -X POST http://localhost:8080/entregas/simular-frete ...
```

#### Logs esperados
```
# Requisição 1
INFO  - Obtendo novo access token da Uber via OAuth 2.0
INFO  - Access token obtido com sucesso. Expira em 2592000 segundos
INFO  - Realizando cotação real via API Uber Direct

# Requisição 2
DEBUG - Usando access token em cache
INFO  - Realizando cotação real via API Uber Direct

# Requisição 3
DEBUG - Usando access token em cache
INFO  - Realizando cotação real via API Uber Direct
```

**✅ Cache funcionando:** Token é reutilizado nas requisições 2 e 3

---

### 8. Teste de Cancelamento

#### Request
```bash
TOKEN="seu_bearer_token"
ENTREGA_ID="uuid-da-entrega"

curl -X DELETE "http://localhost:8080/entregas/${ENTREGA_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

#### Response (204 No Content)

#### Logs (Modo MOCK)
```
INFO  - Cancelando entrega Uber Direct: UBER-MOCK-ABC12345
INFO  - Modo MOCK ativo - cancelamento simulado
DEBUG - Mock: Entrega UBER-MOCK-ABC12345 cancelada com sucesso
```

#### Logs (API Real)
```
INFO  - Cancelando entrega Uber Direct: delivery_xyz789
INFO  - Cancelando entrega real via API Uber Direct: delivery_xyz789
INFO  - Entrega delivery_xyz789 cancelada com sucesso na Uber
```

---

### 9. Teste de Performance

#### Medir tempo de resposta

```bash
# Modo MOCK
time curl -X POST http://localhost:8080/entregas/simular-frete ...
# Esperado: ~50-200ms

# API Real (primeira chamada - com autenticação)
time curl -X POST http://localhost:8080/entregas/simular-frete ...
# Esperado: ~1-3 segundos

# API Real (segunda chamada - cache)
time curl -X POST http://localhost:8080/entregas/simular-frete ...
# Esperado: ~500-1500ms
```

---

### 10. Teste de Primeira Compra (Frete Grátis)

#### Verificar se é primeira compra
```bash
USER_ID="uuid-do-usuario"

curl -X GET "http://localhost:8080/api/v1/pedidos/usuario/${USER_ID}/primeira-compra"
```

#### Response
```json
{
  "ehPrimeiraCompra": true,
  "totalPedidos": 0,
  "freteGratis": true,
  "mensagem": "Parabéns! Você tem FRETE GRÁTIS na sua primeira compra!"
}
```

#### Fluxo Completo
1. Cliente simula frete → sistema calcula R$ 20,35
2. Sistema verifica: `ehPrimeiraCompra = true`
3. Frontend exibe: **FRETE GRÁTIS** 🎉
4. Cliente paga: **R$ 0,00** (frete)
5. Pedido criado com `freteGratisPromocao = true`
6. Lojista solicita entrega → Win paga R$ 18,50 à Uber

---

## Checklist de Validação Completa

### Antes de Ativar em Produção

- [ ] ✅ Código compila sem erros
- [ ] ✅ Testes em modo MOCK funcionam
- [ ] ⏳ Credenciais Uber configuradas (sandbox)
- [ ] ⏳ Testes com API real (sandbox)
- [ ] ⏳ Cotação retorna valores corretos
- [ ] ⏳ Solicitação cria entrega na Uber
- [ ] ⏳ Cancelamento funciona
- [ ] ⏳ Cache de token opera corretamente
- [ ] ⏳ Erros são tratados adequadamente
- [ ] ⏳ Logs estão claros e informativos
- [ ] ⏳ Taxa Win (10%) calculada corretamente
- [ ] ⏳ Frete grátis primeira compra validado
- [ ] ⏳ Dados salvos no banco corretamente
- [ ] ⏳ Webhooks testados (se aplicável)
- [ ] ⏳ Performance aceitável (<3s cotação)

### Deploy Produção

- [ ] Credenciais produção configuradas
- [ ] `UBER_API_BASE_URL=https://api.uber.com`
- [ ] Deploy em staging
- [ ] Testes de ponta a ponta
- [ ] Monitoramento configurado
- [ ] Alertas de erro ativos
- [ ] Acompanhamento primeiras 24h

---

## Troubleshooting Rápido

### Problema: "Credenciais Uber não configuradas"
**Solução:** Preencha `UBER_CLIENT_ID` e `UBER_CLIENT_SECRET` no `.env`

### Problema: "401 Unauthorized"
**Solução:** Verifique credenciais no dashboard Uber, confirme ambiente (sandbox/prod)

### Problema: "400 Address not found"
**Solução:** Sistema usa fallback MOCK automaticamente, verifique endereços

### Problema: Token expira rapidamente
**Solução:** Normal. Cache renova 5min antes da expiração (30 dias de validade)

### Problema: Performance lenta
**Solução:** Verifique rede, considere cache de cotações frequentes

---

**Última atualização:** 14 de janeiro de 2026
