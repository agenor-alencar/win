# ✅ Checklist de Implementação - Uber Direct Delivery

## 📋 Pré-Requisitos

- [ ] Conta ativa na Uber Partners
- [ ] Credenciais Uber Direct API obtidas:
  - [ ] `UBER_CUSTOMER_ID`
  - [ ] `UBER_CLIENT_ID`
  - [ ] `UBER_CLIENT_SECRET`
  - [ ] `UBER_WEBHOOK_SECRET` (para validação HMAC)
- [ ] Chave Google Maps API:
  - [ ] `GOOGLE_MAPS_API_KEY` (com Geocoding API habilitada)
- [ ] PostgreSQL 16+ rodando
- [ ] Java 21 + Maven 3.8+
- [ ] Node.js 18+ + npm/yarn

---

## 🔧 Backend - Configuração

### Dependências (pom.xml)

- [ ] `com.google.maps:google-maps-services:2.2.0` adicionado
- [ ] `org.springframework.boot:spring-boot-starter-webflux` (já incluído)
- [ ] `org.springframework.boot:spring-boot-starter-data-jpa` (já incluído)
- [ ] `org.postgresql:postgresql` (já incluído)

### Arquivo: `application.yml`

- [ ] Seção `app.google.maps.api-key` configurada
- [ ] Seção `app.uber.direct.*` configurada com credenciais
- [ ] Seção `scheduler.*` configurada (initial-delay, fixed-delay)
- [ ] Variáveis de ambiente definidas:

```bash
# .env ou configuração do servidor
GOOGLE_MAPS_API_KEY=xxxxx
UBER_CUSTOMER_ID=xxxxx
UBER_CLIENT_ID=xxxxx
UBER_CLIENT_SECRET=xxxxx
UBER_WEBHOOK_SECRET=xxxxx
```

### Database - Schema

- [ ] Tabela `uber_oauth_tokens` criada:

```sql
CREATE TABLE uber_oauth_tokens (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR(255) UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  scope VARCHAR(255),
  expira_em TIMESTAMP NOT NULL,
  ativo BOOLEAN DEFAULT true,
  total_usos INTEGER DEFAULT 0,
  ultimo_uso TIMESTAMP,
  motivo_desativacao VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_uber_customer_id ON uber_oauth_tokens(customer_id);
CREATE INDEX idx_uber_ativo ON uber_oauth_tokens(ativo);
CREATE INDEX idx_uber_expira_em ON uber_oauth_tokens(expira_em);
```

- [ ] Coluna `delivery_id` adicionada à tabela `entrega`:

```sql
ALTER TABLE entrega ADD COLUMN delivery_id VARCHAR(255);
ALTER TABLE entrega ADD COLUMN tracking_url TEXT;
ALTER TABLE entrega ADD COLUMN pin_coleta VARCHAR(10);
ALTER TABLE entrega ADD COLUMN pin_entrega VARCHAR(10);
ALTER TABLE entrega ADD COLUMN quote_id VARCHAR(255);
ALTER TABLE entrega ADD COLUMN status_uber VARCHAR(50);
```

### Arquivos Java Criados

- [ ] `src/main/java/*/uber/dto/GeocodingRequestDTO.java`
- [ ] `src/main/java/*/uber/dto/GeocodingResponseDTO.java`
- [ ] `src/main/java/*/uber/dto/UberOAuthTokenRequestDTO.java`
- [ ] `src/main/java/*/uber/dto/UberOAuthTokenResponseDTO.java`
- [ ] `src/main/java/*/uber/dto/UberQuoteRequestDTO.java`
- [ ] `src/main/java/*/uber/dto/UberQuoteResponseDTO.java`
- [ ] `src/main/java/*/uber/dto/UberDeliveryRequestDTO.java`
- [ ] `src/main/java/*/uber/dto/UberDeliveryResponseDTO.java`
- [ ] `src/main/java/*/uber/entity/UberOAuthToken.java`
- [ ] `src/main/java/*/uber/repository/UberOAuthTokenRepository.java`
- [ ] `src/main/java/*/uber/service/GeocodingService.java` (verificar existência)
- [ ] `src/main/java/*/uber/service/UberAuthService.java`
- [ ] `src/main/java/*/uber/service/UberQuoteService.java`
- [ ] `src/main/java/*/uber/service/UberDeliveryService.java`
- [ ] `src/main/java/*/uber/controller/GeocodingController.java`
- [ ] `src/main/java/*/uber/controller/UberAuthController.java`
- [ ] `src/main/java/*/uber/controller/UberQuoteController.java`
- [ ] `src/main/java/*/uber/controller/UberDeliveryController.java`
- [ ] `src/main/java/*/uber/controller/UberWebhookController.java` (atualizado)
- [ ] `src/main/java/*/config/UberSchedulerConfig.java`

### Compilação e Testes

- [ ] `mvn clean compile` sem erros
- [ ] `mvn test` (se houver testes)
- [ ] `mvn clean package` gera WAR/JAR

---

## ⚛️ Frontend - Configuração

### Arquivos TypeScript/React Criados

- [ ] `src/hooks/useUberDelivery.ts` - Hook de integração
- [ ] `src/components/checkout/FreteCalculador.tsx` - Componente checkout
- [ ] `src/components/merchant/ConfirmarEntrega.tsx` - Componente lojista
- [ ] `src/components/orders/RastreamentoEntrega.tsx` - Componente rastreamento

### Integração em Páginas Existentes

#### Checkout do Cliente

- [ ] Arquivo: `src/pages/Checkout.tsx` (ou similar)
- [ ] Importado: `FreteCalculador` component
- [ ] Adicionado parâmetro: `quote_id` ao estado do carrinho
- [ ] Adicionado parâmetro: `frete_total` ao payload do pedido
- [ ] Adicionado parâmetro: `metodo_entrega: "UBER_DIRECT"` ao payload

#### Painel do Lojista - Detalhes do Pedido

- [ ] Arquivo: `src/pages/merchant/OrderDetails.tsx` (ou similar)
- [ ] Importado: `ConfirmarEntrega` component
- [ ] Adicionada verificação: `if (pedido.status === "PRONTO" || "PREPARANDO")`
- [ ] Adicionada verificação: `if (!pedido.delivery_id)` para mostrar botão
- [ ] Implementado callback: `handleEntregaConfirmada` para atualizar status

#### Página de Rastreamento - Cliente

- [ ] Arquivo: `src/pages/OrderStatus.tsx` (ou similar)
- [ ] Importado: `RastreamentoEntrega` component
- [ ] Adicionada verificação: `if (pedido.delivery_id)`
- [ ] Passados props: `deliveryId`, `trackingUrl`
- [ ] Adicionado callback opcional: `onStatusMudou`

### Compilação Frontend

- [ ] `npm install` (se houver novos pacotes - shadcn/ui já deve estar)
- [ ] `npm run build` sem erros
- [ ] `npm run dev` (verificar no browser)

---

## 📡 API Endpoints - Testes Manuais

### 1. Geocoding

```bash
# Teste CEP
curl -X GET http://localhost:8080/api/v1/geocoding/cep/01311-100 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Teste endereço completo
curl -X GET http://localhost:8080/api/v1/geocoding/endereco \
  -G -d "cep=01311-100" \
  -d "endereco=Avenida Paulista 1000, São Paulo, SP" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Uber OAuth

```bash
# Obter token
curl -X POST http://localhost:8080/api/v1/uber/auth/token \
  -H "Authorization: Bearer YOUR_TOKEN"

# Validar configuração
curl -X POST http://localhost:8080/api/v1/uber/auth/config/validar \
  -H "Authorization: Bearer YOUR_TOKEN"

# Obter estatísticas
curl -X GET http://localhost:8080/api/v1/uber/auth/tokens/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Quote (Cotação)

```bash
# Request quote
curl -X POST http://localhost:8080/api/v1/uber/quotes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "localizacao_origem": {
      "latitude": -23.561,
      "longitude": -46.656
    },
    "localizacao_destino": {
      "latitude": -23.550,
      "longitude": -46.633
    },
    "pedido_id": "12345"
  }'
```

### 4. Create Delivery

```bash
# Criar entrega
curl -X POST http://localhost:8080/api/v1/uber/deliveries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "quote_id": "QUOTE_ID_OBTIDO_ACIMA",
    "pin_coleta": "1234",
    "pin_entrega": "5678"
  }'

# Gerar PIN aleatório
curl -X POST http://localhost:8080/api/v1/uber/deliveries/generate-pin \
  -H "Authorization: Bearer YOUR_TOKEN"

# Consultar status
curl -X GET http://localhost:8080/api/v1/uber/deliveries/DELIVERY_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Webhooks

```bash
# Verificar saúde do webhook
curl -X GET http://localhost:8080/api/v1/webhooks/uber/health

# Resposta esperada: 200 OK
```

---

## 🔒 Segurança

### Variáveis de Ambiente

- [ ] Nunca commitar credenciais no Git
- [ ] `.env` adicionado ao `.gitignore`
- [ ] Credenciais armazenadas em variáveis de ambiente do servidor
- [ ] Webhook secret usado apenas para HMAC (nunca exposto no frontend)

### Validação de Entrada

- [ ] PIN codes validados (4-6 dígitos numéricos)
- [ ] CEP validado (11 dígitos com hífen ou 8 dígitos)
- [ ] Coordenadas validadas (latitude -90 a 90, longitude -180 a 180)
- [ ] Quote ID validado antes de usar em Create Delivery

### Rate Limiting

- [ ] Nominatim: máximo 1 req/s (implementado)
- [ ] Google Maps: verificar quota configurada no console
- [ ] Uber API: respeitar rate limits da documentação

---

## 📧 Notificações (Opcional mas Recomendado)

- [ ] Email enviado ao cliente quando delivery_id criado:
  - [ ] Contém tracking URL
  - [ ] Contém PIN de entrega
  - [ ] Contém tempo estimado
- [ ] Email enviado ao lojista quando entrega confirmada:
  - [ ] Contém delivery_id
  - [ ] Contém PIN de coleta
  - [ ] Contém nome do motorista
- [ ] SMS enviado ao motorista:
  - [ ] PIN de coleta
  - [ ] Endereço de coleta
  - [ ] Endereço de entrega

---

## 📊 Monitoramento

### Logs

- [ ] Ativar logs DEBUG para `UberAuthService`
- [ ] Ativar logs DEBUG para `UberDeliveryService`
- [ ] Ativar logs DEBUG para webhook controller
- [ ] Centralizar logs (CloudWatch, ELK, Sentry, etc.)

### Métricas

- [ ] Monitorar tempo de resposta dos endpoints
- [ ] Contar número de tokens ativos
- [ ] Contar número de entregas por status
- [ ] Taxas de erro para cada serviço (geocoding, quote, delivery)

### Alertas

- [ ] Token expirando em breve
- [ ] Taxa de erro acima de 5%
- [ ] Webhook não respondendo
- [ ] Fila de tarefas scheduler atrasada

---

## 🚀 Deploy

### Staging (Antes de Produção)

- [ ] Testar com credenciais Sandbox da Uber
- [ ] Testar com Google Maps API em modo sandbox
- [ ] Executar testes de carga (100 coincorrentes)
- [ ] Validar com dados reais de clientes
- [ ] Testar webhook com simulador

### Produção

- [ ] Usar credenciais Pro da Uber
- [ ] Usar chave Google Maps com restrições de IP
- [ ] Migração de banco de dados realizada
- [ ] Backup antes do deploy
- [ ] Rollback plan definido
- [ ] Monitoramento ativado
- [ ] Equipe support treinada
- [ ] Documentação de troubleshooting atualizada

---

## 📚 Documentação

- [ ] README atualizado com instruções de setup
- [ ] API documentation (Swagger/OpenAPI) atualizada
- [ ] Diagrama de fluxo de dados criado
- [ ] Guia de troubleshooting escrito
- [ ] Runbook de operações criado

---

## ✅ Validação Final

Antes de declarar pronto para produção:

- [ ] Checkout completo: cliente vê frete + confirma pedido
- [ ] Lojista recebe pedido + clica "Pronto para Retirada"
- [ ] Modal de PIN aparece + pode gerar/inserir manual
- [ ] Entrega criada na Uber API + delivery_id retornado
- [ ] Cliente acessa página de pedido + vê rastreamento
- [ ] Rastreamento atualiza em tempo real (polling 30s)
- [ ] Webhook recebe eventos da Uber
- [ ] Status atualiza após webhook
- [ ] Token expira + renova automaticamente
- [ ] Sem erros 5xx nas logs
- [ ] Performance aceitável (<500ms por API call)

---

## 🐛 Troubleshooting Comum

### "Invalid Quote ID"
- [ ] Verificar que quote_id foi copiado corretamente
- [ ] Verificar que time between quote request e delivery creation < 15 min
- [ ] Validar no backend: `service.validarQuoteId(quoteId)`

### "PIN Code Validation Failed"
- [ ] Verificar formato: exatamente 4-6 dígitos
- [ ] Verificar: não contém letras ou caracteres especiais
- [ ] Verificar: foi preenchido ANTES de clicar confirmar

### "Token Expired"
- [ ] Verificar logs: "Token refresh triggered"
- [ ] Confirmar que token refresh working
- [ ] Validar schedular task rodando
- [ ] Checar variável SCHEDULER_FIXED_DELAY

### "Webhook Not Received"
- [ ] Configurar webhook secret no painel Uber Partners
- [ ] Verificar que health check retorna 200 OK
- [ ] Testar HMAC validation: `curl -X POST /webhooks/uber` com signature correta
- [ ] Verificar firewall permite entrada Uber IPs
- [ ] Conferir que URL público está configurado no painel

---

## 📞 Contatos Úteis

- **Uber Direct API Docs**: https://developer.uber.com/docs/deliveries
- **Google Maps Docs**: https://developers.google.com/maps
- **SQL Schema**: Ver `database/migrations/`
- **Team Contacts**: [Adicionar contatos conforme necessário]

---

**Status**: ⏳ Pendente de Revisão e Deployment

**Data de Criação**: [Inserir data]
**Última Atualização**: [Inserir data]
