# Sistema de Integração Multi-ERP - Win Marketplace

## 📋 Visão Geral

Sistema completo de integração com múltiplos ERPs implementado seguindo o padrão **Factory + Strategy** para injeção dinâmica de dependências. Permite que cada lojista configure seu próprio ERP (NavSoft, Tiny, API customizada ou manual) com sincronização automática de estoque em tempo quase real.

### ✨ Funcionalidades Principais

- ✅ **Importação completa de produtos** do ERP (nome, descrição, preço, estoque, código de barras, peso, **imagens**)
- ✅ **Sincronização automática de estoque** em tempo real (configurável por lojista)
- ✅ **Múltiplos ERPs suportados** (NavSoft, Tiny, API Customizada, Manual)
- ✅ **Multi-tenancy** - cada lojista tem seu próprio ERP
- ✅ **Segurança** - credenciais criptografadas com AES-256
- ✅ **Tolerância a falhas** - erro em um lojista não afeta outros

---

### 1. **Modelo de Dados (Multi-Tenancy)**

#### `LojistaErpConfig` (Tabela: `lojista_erp_config`)
Armazena configurações de ERP por lojista:
- `erp_type`: Enum (NAVSOFT, TINY, CUSTOM_API, MANUAL)
- `api_url`: URL da API do ERP
- `api_key_encrypted`: API Key criptografada com AES-256
- `sync_frequency_minutes`: Frequência de sincronização (padrão: 5 min)
- `sync_enabled`: Sincronização automática ativa
- `last_sync_at`, `last_sync_status`, `last_sync_error`: Status da última sincronização

#### `Produto` (Adicionado campo)
- `erp_sku`: SKU do produto no ERP para vinculação e sincronização

### 2. **Camada de Integração ERP**

#### Interface `ErpApiClient`
Contrato comum para todos os ERPs:
```java
Optional<ErpProductDTO> getErpProduct(String sku);
List<ErpStockUpdateDTO> getStockUpdates(List<String> skus);
boolean testConnection();
```

#### Implementações:
1. **`NavSoftApiClient`**: Integração com NavSoft ERP
   - Rate limiting: 100ms entre requisições
   - Autenticação via X-API-Key header
   
2. **`TinyApiClient`**: Integração com Tiny ERP
   - Suporta consulta em lote
   - Autenticação via token na URL

3. **`ManualErpClient`**: Fallback para produtos sem ERP

#### `ErpClientFactory` (Injeção Dinâmica)
Factory que cria instâncias corretas do cliente ERP baseado na configuração:
```java
ErpApiClient createClient(LojistaErpConfig config)
```
- Descriptografa credenciais dinamicamente
- Aplica configurações específicas por lojista

### 3. **Camada de Serviços**

#### `EncryptionService`
- Criptografia AES-256 para API Keys
- Secret configurável via `app.encryption.secret`

#### `LojistaErpConfigService`
- Configuração/atualização de ERP
- Teste de conexão antes de salvar
- Gerenciamento de status de sincronização

#### `ProdutoErpService`
- Busca produto no ERP (preview)
- Vinculação de produto ao ERP
- Importação de dados (nome, descrição, preço, estoque)
- Sincronização manual de estoque

### 4. **Sincronização Automática**

#### `MultiErpStockScheduler`
**Scheduler crítico** que executa a cada 1 minuto:

**Fluxo:**
1. Busca todas configurações ERP ativas
2. Filtra lojistas prontos para sincronizar (baseado em `sync_frequency_minutes`)
3. **Execução paralela** via `@Async`:
   - Thread pool: 5-20 threads
   - Prefix: `erp-sync-`
4. Para cada lojista:
   - Busca produtos vinculados (`erp_sku IS NOT NULL`)
   - Cria cliente ERP via Factory
   - Consulta estoques em lote
   - Atualiza produtos localmente
   - Desativa produtos inativos no ERP
5. Registra status de cada sincronização

**Características:**
- ✅ Não bloqueia - execução assíncrona
- ✅ Isolamento - erro em um lojista não afeta outros
- ✅ Rate limiting - respei

ta limites de cada API
- ✅ Frequência configurável por lojista

### 5. **Controllers (API REST)**

#### `LojistaErpController` (`/api/v1/lojista/erp`)
- `GET /tipos` - Lista tipos de ERP disponíveis
- `POST /configurar` - Configura/atualiza ERP
- `GET /config` - Busca configuração atual
- `DELETE /desvincular` - Remove integração
- `PUT /toggle-sync` - Liga/desliga sincronização

#### `ProdutoErpController` (`/api/v1/lojista/produtos/erp`)
- `GET /buscar` - Preview de produto do ERP
- `POST /vincular` - Vincula produto ao ERP
- `DELETE /desvincular/{id}` - Desvincula produto
- `POST /sincronizar/{id}` - Sincronização manual

## 🔐 Segurança

1. **Criptografia**: API Keys armazenadas com AES-256
2. **Autorização**: Todos endpoints requerem `@PreAuthorize("hasRole('LOJISTA')")`
3. **Isolamento**: Cada lojista acessa apenas seus dados
4. **Validação**: Testes de conexão antes de salvar configuração

## 🗄️ Migrations SQL

### `V2__create_lojista_erp_config.sql`
- Cria tabela `lojista_erp_config`
- Constraints: unique por lojista, tipos válidos, frequência >= 1
- Índices para performance de sincronização

### `V3__add_erp_sku_to_produtos.sql`
- Adiciona coluna `erp_sku` em `produtos`
- Índice para busca rápida por SKU

## 📊 DTOs

### Request:
- `ErpConfigDTO`: Configuração de ERP
- `VincularProdutoErpDTO`: Vinculação produto-ERP

### Response:
- `ErpConfigResponseDTO`: Config sem expor API Key
- `ErpProductDTO`: Dados completos do produto ERP
- `ErpStockUpdateDTO`: Atualização de estoque

## 🚀 Fluxo de Uso (Lojista)

### 1. Configurar ERP
```http
POST /api/v1/lojista/erp/configurar?lojistaId=xxx
{
  "erpType": "NAVSOFT",
  "apiKey": "chave_secreta",
  "syncFrequencyMinutes": 5,
  "syncEnabled": true
}
```

### 2. Criar Produto com ERP

**Opção A - Manual + Vincular depois:**
1. Cria produto normalmente
2. Vincula ao ERP:
```http
POST /api/v1/lojista/produtos/erp/vincular?lojistaId=xxx
{
  "produtoId": "uuid",
  "erpSku": "SKU123",
  "importarDados": true
}
```

**Opção B - Preview + Importar:**
1. Busca no ERP:
```http
GET /api/v1/lojista/produtos/erp/buscar?lojistaId=xxx&erpSku=SKU123
```
2. Cria produto com dados importados

### 3. Sincronização Automática
- Sistema sincroniza a cada 5 minutos (configurável)
- Atualiza estoque automaticamente
- Desativa produtos inativos no ERP

## ⚙️ Configurações

### `application.properties`
```properties
# Criptografia (padrão: Win@Marketplace#2025!Secret)
app.encryption.secret=${ENCRYPTION_SECRET:Win@Marketplace#2025!Secret}

# Thread pool para sincronização ERP
spring.task.execution.pool.core-size=5
spring.task.execution.pool.max-size=20
spring.task.execution.pool.queue-capacity=100
```

## 🔄 Extensibilidade

### Adicionar Novo ERP:

1. **Criar implementação**:
```java
public class NovoErpApiClient implements ErpApiClient {
    // Implementar métodos
}
```

2. **Adicionar enum**:
```java
public enum ErpType {
    NOVO_ERP("Novo ERP", "https://api.novoerp.com"),
    // ...
}
```

3. **Atualizar Factory**:
```java
case NOVO_ERP -> createNovoErpClient(config);
```

## 📈 Performance

- **Sincronização paralela**: Até 20 lojistas simultâneos
- **Batch queries**: Consulta múltiplos SKUs de uma vez (quando API suporta)
- **Rate limiting**: Delay configurável entre requisições
- **Índices otimizados**: Busca rápida por `erp_sku` e configurações ativas

## ✅ Status da Implementação

### Backend (100% Completo)
- ✅ Modelos e enums
- ✅ Interface e implementações ERP (NavSoft, Tiny, Manual)
- ✅ Factory com injeção dinâmica
- ✅ Serviços (Config, Produto, Criptografia)
- ✅ Controllers com segurança
- ✅ Scheduler multi-ERP assíncrono
- ✅ Migrations SQL
- ✅ DTOs completos
- ✅ Compilação bem-sucedida

### Frontend (Próximos Passos)
- ⏳ Página de configuração ERP
- ⏳ Integração em formulário de produtos
- ⏳ Preview de produtos do ERP
- ⏳ Dashboard de sincronização

## 🐛 Troubleshooting

### Produto não sincroniza:
1. Verificar se `sync_enabled = true` na config
2. Verificar `last_sync_error` na tabela
3. Testar conexão manual via endpoint

### Credenciais inválidas:
1. Sistema testa conexão antes de salvar
2. Se falhar, retorna erro 400 com mensagem

### Performance lenta:
1. Ajustar `sync_frequency_minutes` (aumentar)
2. Verificar rate limiting do ERP
3. Aumentar thread pool se necessário

## 📝 Próximas Melhorias

1. **Webhook**: Receber notificações de mudança de estoque
2. **Dashboard**: Visualização de sincronizações
3. **Logs detalhados**: Auditoria de cada sincronização
4. **Retry policy**: Tentar novamente em caso de falha
5. **Métricas**: Prometheus/Grafana para monitoramento
