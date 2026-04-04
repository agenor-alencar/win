# 🚀 Guia de Configuração - Uber Direct API (Sandbox)

**Data**: 20/01/2026  
**Ambiente**: Sandbox (Testes)  
**Status**: ✅ Pronto para configuração

---

## 📋 Pré-requisitos

Você já tem:
- ✅ Conta Uber Developer
- ✅ Credenciais Sandbox (Client ID + Client Secret)
- ✅ Sistema de geolocalização implantado
- ✅ Endpoints implementados (`/api/v1/fretes/calcular`, `/api/v1/webhooks/uber-direct`)

---

## ⚙️ Passo 1: Configurar Credenciais no VPS

### 1.1 Editar `.env` ou `docker-compose.yml`

Opção A - Criar arquivo `.env` (recomendado):

```bash
cd /root/win

# Criar .env se não existir
nano .env
```

Adicione as credenciais:

```bash
# ===================================================================
# UBER DIRECT API - SANDBOX
# ===================================================================
UBER_CLIENT_ID=seu_client_id_sandbox_aqui
UBER_CLIENT_SECRET=seu_client_secret_sandbox_aqui
UBER_API_BASE_URL=https://api.uber.com
UBER_API_ENABLED=true

# Webhook Secret (para validação HMAC)
# Gere com: openssl rand -hex 32
UBER_WEBHOOK_SECRET=sua_secret_key_hmac_aqui
```

**Opção B** - Editar diretamente docker-compose.yml:

```bash
nano docker-compose.yml
```

Adicione no serviço `backend`:

```yaml
backend:
  environment:
    # ... outras variáveis ...
    
    # Uber Direct API
    UBER_CLIENT_ID: ${UBER_CLIENT_ID}
    UBER_CLIENT_SECRET: ${UBER_CLIENT_SECRET}
    UBER_API_BASE_URL: https://api.uber.com
    UBER_API_ENABLED: true
    UBER_WEBHOOK_SECRET: ${UBER_WEBHOOK_SECRET}
```

### 1.2 Aplicar Configurações

```bash
# Reiniciar backend para carregar novas variáveis
docker compose restart backend

# Verificar logs
docker compose logs -f backend | grep -i "uber"
```

Se configurado corretamente, você verá:
```
INFO  - Uber Direct API habilitada: true
INFO  - Uber API Base URL: https://api.uber.com
```

---

## 🌐 Passo 2: Configurar Webhook na Uber

### 2.1 Obter URL Pública do Webhook

Seu webhook está em:
```
https://seu-dominio.com.br/api/v1/webhooks/uber-direct
```

Ou se usando IP:
```
http://137.184.87.106:8080/api/v1/webhooks/uber-direct
```

⚠️ **Importante**: Uber exige HTTPS em produção (mas aceita HTTP em sandbox).

### 2.2 Registrar Webhook no Uber Developer Portal

1. Acesse: https://developer.uber.com/dashboard/
2. Vá em **Products → Deliveries API**
3. Clique em **Webhooks**
4. Clique em **Add Webhook**
5. Preencha:
   - **Webhook URL**: `https://seu-dominio.com.br/api/v1/webhooks/uber-direct`
   - **Event Types**: Selecione todos:
     - ✅ `deliveries.courier_assigned`
     - ✅ `deliveries.courier_approaching_pickup`
     - ✅ `deliveries.courier_at_pickup`
     - ✅ `deliveries.courier_approaching_dropoff`
     - ✅ `deliveries.courier_at_dropoff`
     - ✅ `deliveries.delivered`
     - ✅ `deliveries.canceled`
     - ✅ `deliveries.delivery_status_updated`
   - **Signing Secret**: Copie o valor gerado pela Uber
6. Clique em **Save**

### 2.3 Atualizar Secret no Servidor

Volte ao servidor e atualize o `.env`:

```bash
nano .env

# Adicione o secret fornecido pela Uber
UBER_WEBHOOK_SECRET=secret_copiado_do_portal_uber
```

Reinicie o backend:
```bash
docker compose restart backend
```

---

## 🧪 Passo 3: Testar a Integração

### 3.1 Teste 1: Cálculo de Frete

```bash
# Obter IDs necessários (lojista + endereço)
# Você pode fazer isso pelo frontend ou via API

# Testar cálculo de frete
curl -X POST http://localhost:8080/api/v1/fretes/calcular \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "lojistaId": "uuid-do-lojista-aqui",
    "enderecoEntregaId": "uuid-do-endereco-aqui",
    "pesoTotalKg": 2.5
  }'
```

**Resposta esperada** (sucesso):
```json
{
  "sucesso": true,
  "quoteId": "quote_abc123xyz",
  "valorFreteTotal": 17.90,
  "valorCorridaUber": 16.27,
  "taxaWin": 1.63,
  "distanciaKm": 5.2,
  "tempoEstimadoMinutos": 25,
  "tipoVeiculo": "MOTO_PEQUENO",
  "mensagem": "Entrega expressa em até 25 minutos",
  "modoPropducao": true
}
```

### 3.2 Teste 2: Criar Pedido com Entrega Uber

Fluxo completo:

1. **Calcular frete** (endpoint acima)
2. **Criar pedido** com valor do frete:
   ```bash
   curl -X POST http://localhost:8080/api/v1/pedidos \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "usuarioId": "uuid-usuario",
       "enderecoEntrega": { ... },
       "frete": 17.90,
       "itens": [ ... ]
     }'
   ```

3. **Confirmar pedido** (cria entrega Uber automaticamente):
   ```bash
   curl -X PATCH http://localhost:8080/api/v1/pedidos/{pedidoId}/confirmar \
     -H "Authorization: Bearer SEU_TOKEN_JWT"
   ```

4. **Verificar logs**:
   ```bash
   docker compose logs -f backend | grep -i "uber\|entrega"
   ```

Você deve ver:
```
INFO - 🚚 Solicitando entrega Uber Direct para pedido: PED123456
INFO - 📍 Geocodificação usando cache: origem lat=-23.5505, lon=-46.6333
INFO - 📍 Geocodificação usando cache: destino lat=-23.5631, lon=-46.6544
INFO - 🚗 Corrida Uber criada - Delivery ID: del_abc123xyz
INFO - ✅ Entrega Uber solicitada com sucesso para pedido: PED123456
```

### 3.3 Teste 3: Webhook (Simulado)

Para testar webhook sem precisar da Uber enviar:

```bash
curl -X POST http://localhost:8080/api/v1/webhooks/uber-direct/test \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "deliveries.courier_assigned",
    "event_id": "evt_test_123",
    "event_time": 1642541234,
    "meta": {
      "resource_id": "del_abc123xyz"
    },
    "data": {
      "id": "del_abc123xyz",
      "status": "courier_assigned",
      "courier": {
        "name": "João Silva",
        "phone_number": "+5511999999999",
        "vehicle": {
          "license_plate": "ABC1234"
        }
      }
    }
  }'
```

**Atenção**: Endpoint de teste só funciona em ambiente `dev`. Em produção, retorna 403.

---

## 📊 Passo 4: Monitoramento

### 4.1 Logs em Tempo Real

```bash
# Ver todos os logs relacionados a Uber
docker compose logs -f backend | grep -i "uber\|entrega\|frete"

# Ver apenas erros
docker compose logs -f backend | grep -i "error\|exception"
```

### 4.2 Verificar Entregas no Banco

```bash
# Conectar no banco
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace

# Ver entregas recentes
SELECT 
    id, 
    status_entrega, 
    id_corrida_uber, 
    nome_motorista,
    valor_frete_cliente,
    criado_em 
FROM entregas 
ORDER BY criado_em DESC 
LIMIT 10;

# Ver entregas em andamento
SELECT 
    e.id,
    p.numero_pedido,
    e.status_entrega,
    e.nome_motorista,
    e.placa_veiculo,
    e.criado_em
FROM entregas e
JOIN pedidos p ON e.pedido_id = p.id
WHERE e.status_entrega NOT IN ('ENTREGUE', 'CANCELADO')
ORDER BY e.criado_em DESC;
```

### 4.3 Métricas Importantes

```bash
# Taxa de sucesso de geocodificação
SELECT 
    'Lojistas geocodificados' as tipo,
    COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as com_coords,
    COUNT(*) as total,
    ROUND(100.0 * COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) / COUNT(*), 2) as percentual
FROM lojistas
WHERE ativo = true AND aprovado = true
UNION ALL
SELECT 
    'Endereços geocodificados',
    COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END),
    COUNT(*),
    ROUND(100.0 * COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) / COUNT(*), 2)
FROM enderecos
WHERE ativo = true;

# Entregas por status
SELECT 
    status_entrega,
    COUNT(*) as total,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentual
FROM entregas
GROUP BY status_entrega
ORDER BY total DESC;
```

---

## 🐛 Troubleshooting

### Problema 1: "Credenciais Uber não configuradas"

**Causa**: `UBER_CLIENT_ID` ou `UBER_CLIENT_SECRET` vazios.

**Solução**:
```bash
# Verificar variáveis de ambiente
docker exec win-marketplace-backend printenv | grep UBER

# Se vazias, editar .env e reiniciar
nano .env
docker compose restart backend
```

### Problema 2: "Falha na autenticação Uber"

**Causa**: Credenciais inválidas ou expiradas.

**Solução**:
1. Verificar credenciais no [Uber Developer Portal](https://developer.uber.com/dashboard/)
2. Regenerar Client Secret se necessário
3. Atualizar `.env` com novos valores
4. Reiniciar backend

### Problema 3: "Endereço não encontrado pela Uber"

**Causa**: Coordenadas não geocodificadas ou endereço inválido.

**Solução**:
```bash
# Verificar se lojista tem coordenadas
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "
SELECT id, nome_loja, latitude, longitude, cep 
FROM lojistas 
WHERE latitude IS NULL 
AND ativo = true 
AND aprovado = true;
"

# Se houver lojistas sem coords, geocodificar:
# Opção 1: Via admin (recomendado)
# Opção 2: Manualmente via API
curl -X PUT http://localhost:8080/api/v1/lojistas/{id} \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{ ... dados do lojista ... }'
```

### Problema 4: Webhook não recebe eventos

**Verificar**:
1. URL está acessível publicamente:
   ```bash
   curl https://seu-dominio.com.br/api/v1/webhooks/uber-direct
   # Deve retornar 405 Method Not Allowed (POST esperado)
   ```

2. SSL válido (em produção):
   ```bash
   curl -I https://seu-dominio.com.br
   ```

3. Logs do webhook:
   ```bash
   docker compose logs backend | grep "webhook"
   ```

4. Testar webhook manualmente (ver seção 3.3)

### Problema 5: "Erro ao processar cotação"

**Logs típicos**:
```
ERROR - Erro HTTP ao cotar frete na Uber: 400 - Bad Request
```

**Causas comuns**:
- Coordenadas inválidas (fora do Brasil)
- CEP não encontrado
- Endereço incompleto

**Solução**:
```bash
# Verificar geocodificação
docker compose logs backend | grep "Geocodificando"

# Testar geocodificação de um CEP específico
# (criar endpoint admin para isso ou verificar logs)
```

---

## 🎯 Checklist Final

Antes de considerar a integração completa:

- [ ] Credenciais configuradas no `.env`
- [ ] `UBER_API_ENABLED=true`
- [ ] Backend reiniciado após configuração
- [ ] Webhook registrado no Uber Developer Portal
- [ ] Teste de cálculo de frete funcionando
- [ ] Teste de criação de pedido + entrega funcionando
- [ ] Webhook recebendo eventos (ou testado manualmente)
- [ ] Monitoramento configurado (logs + banco)
- [ ] Documentação revisada pela equipe
- [ ] Testes em ambiente Sandbox aprovados

---

## 📚 Documentação Adicional

- [Uber Direct API Docs](https://developer.uber.com/docs/deliveries)
- [OAuth 2.0 Client Credentials](https://developer.uber.com/docs/deliveries/guides/authentication)
- [Webhooks Reference](https://developer.uber.com/docs/deliveries/guides/webhooks)
- [Sandbox Testing](https://developer.uber.com/docs/deliveries/guides/sandbox-testing)

---

## 🚦 Próximos Passos (Pós-Sandbox)

Quando estiver pronto para produção:

1. **Solicitar aprovação Uber**:
   - Review de segurança
   - Verificação de webhook
   - Compliance check

2. **Obter credenciais de produção**:
   - Client ID + Secret de produção
   - Atualizar `.env`:
     ```bash
     UBER_API_BASE_URL=https://api.uber.com
     UBER_CLIENT_ID=prod_client_id
     UBER_CLIENT_SECRET=prod_client_secret
     ```

3. **Configurar SSL**:
   - Webhook DEVE usar HTTPS em produção
   - Certificado válido (Let's Encrypt via Certbot)

4. **Implementar monitoramento avançado**:
   - Alertas para falhas de API
   - Dashboard de métricas
   - Logs estruturados

5. **Testes de carga**:
   - Simular 100+ pedidos simultâneos
   - Verificar rate limits da Uber
   - Otimizar cache de tokens

---

**Dúvidas?** Consulte `_DOCS/STATUS_UBER_DIRECT_API.md` para visão geral do sistema.
