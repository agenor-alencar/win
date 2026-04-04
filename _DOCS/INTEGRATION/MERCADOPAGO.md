# 💳 Integração Mercado Pago - WIN Marketplace

Guia completo para configurar e usar pagamentos com Mercado Pago no sistema.

---

## 🚀 Início Rápido (5 minutos)

### 1. Criar Conta e Obter Access Token

1. **Criar/Login**: https://www.mercadopago.com.br/developers
2. **Suas aplicações** → **Criar aplicação**
3. **Tipo**: Pagamentos online e presenciais
4. **Copiar Access Token**:
   - **Teste (Sandbox)**: Começa com `TEST-`
   - **Produção**: Começa com `APP_USR-`

### 2. Configurar no Projeto

```bash
# Adicionar no .env
MERCADOPAGO_ACCESS_TOKEN=TEST-123456789-XXXXX-XXXXX-XXXXX-XXXXXXXXXXX

# Reiniciar backend
docker-compose restart backend
```

### 3. Testar

```bash
# Verificar logs
docker logs win-marketplace-backend --tail 20

# Deve aparecer: ✅ Mercado Pago configurado com sucesso!
```

---

## 📋 O Que Foi Implementado

### ✅ Dependências Adicionadas

**`pom.xml`**:
```xml
<!-- Mercado Pago SDK -->
<dependency>
    <groupId>com.mercadopago</groupId>
    <artifactId>sdk-java</artifactId>
    <version>2.5.0</version>
</dependency>

<!-- Redis Session (Opcional - para múltiplas instâncias) -->
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>
```

### ✅ Configuração

**`MercadoPagoConfiguration.java`**:
- Inicializa SDK automaticamente no startup
- Valida se Access Token está configurado
- Logs informativos

**`application.yml`**:
```yaml
mercadopago:
  access-token: ${MERCADOPAGO_ACCESS_TOKEN:}
```

### ✅ Serviço de Pagamento

**`PagamentoService.java`** (ATUALIZADO):
- ✨ `criarPreferenciaMercadoPago()` - Criar checkout simples
- ✨ `criarPreferenciaPedido()` - Criar checkout de pedido completo
- ✨ Validação automática de configuração
- ✨ URLs de retorno configuráveis

---

## 🔌 Como Usar na API

### Endpoint: Criar Preferência de Pagamento

**URL**: `POST /api/v1/pagamentos/mercadopago/preferencia`

**Request Body**:
```json
{
  "pedidoId": "123e4567-e89b-12d3-a456-426614174000",
  "titulo": "Notebook Dell Inspiron 15",
  "quantidade": 1,
  "valorUnitario": 3500.00
}
```

**Response**:
```json
{
  "checkoutUrl": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=123456789-abcd-1234-abcd-123456789012",
  "preferenceId": "123456789-abcd-1234-abcd-123456789012"
}
```

### Endpoint: Criar Checkout de Pedido Completo

**URL**: `POST /api/v1/pagamentos/mercadopago/pedido/{pedidoId}`

**Response**:
```json
{
  "checkoutUrl": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
  "pedidoId": "123e4567-e89b-12d3-a456-426614174000",
  "total": 7250.00
}
```

---

## 💻 Exemplo de Integração no Frontend

### React/TypeScript

```typescript
// Criar checkout
const criarCheckout = async (pedidoId: string) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/pagamentos/mercadopago/pedido/${pedidoId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    
    // Redirecionar para checkout do Mercado Pago
    window.location.href = data.checkoutUrl;
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
  }
};

// Receber retorno do pagamento
// Página: /pagamento/sucesso?pedidoId=xxx
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

function PagamentoSucesso() {
  const query = useQuery();
  const pedidoId = query.get('pedidoId');
  
  useEffect(() => {
    // Atualizar status do pedido
    atualizarPedido(pedidoId);
  }, [pedidoId]);

  return <div>Pagamento aprovado! Pedido: {pedidoId}</div>;
}
```

---

## 🔄 Fluxo de Pagamento

```
1. Cliente finaliza pedido
   ↓
2. Frontend chama API: POST /api/v1/pagamentos/mercadopago/pedido/{id}
   ↓
3. Backend cria preferência no Mercado Pago
   ↓
4. Backend retorna URL de checkout
   ↓
5. Frontend redireciona para Mercado Pago
   ↓
6. Cliente paga no Mercado Pago
   ↓
7. Mercado Pago redireciona para:
   - Sucesso: /pagamento/sucesso?pedidoId=xxx
   - Falha: /pagamento/falha?pedidoId=xxx
   - Pendente: /pagamento/pendente?pedidoId=xxx
   ↓
8. Backend recebe webhook (futuro) e atualiza status
```

---

## 🧪 Testes

### Modo Sandbox (Teste)

**Access Token**: `TEST-123456789-XXXXX-...`

**Cartões de Teste**:

| Cartão | Número | CVV | Validade | Resultado |
|--------|--------|-----|----------|-----------|
| Visa | 4509 9535 6623 3704 | 123 | 11/25 | ✅ Aprovado |
| Mastercard | 5031 4332 1540 6351 | 123 | 11/25 | ✅ Aprovado |
| Visa | 4074 8564 3531 3365 | 123 | 11/25 | ❌ Recusado (fundos insuficientes) |

**Documentos de Teste**:
- CPF: 12345678909

### Teste via cURL

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@winmarketplace.com","senha":"Admin123!"}' \
  | jq -r '.token')

# 2. Criar preferência
curl -X POST http://localhost:8080/api/v1/pagamentos/mercadopago/preferencia \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pedidoId": "123e4567-e89b-12d3-a456-426614174000",
    "titulo": "Teste Pagamento",
    "quantidade": 1,
    "valorUnitario": 100.00
  }'

# Response: { "checkoutUrl": "https://..." }
```

---

## ⚙️ Configurações Avançadas

### URLs de Retorno Personalizadas

**`application.yml`**:
```yaml
app:
  frontend:
    url: https://seudominio.com.br
```

### Redis para Sessões Distribuídas

**Apenas necessário para múltiplas instâncias do backend**

```env
SESSION_STORE_TYPE=redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=sua-senha
```

**`docker-compose.yml`**:
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --requirepass sua-senha
```

---

## 🔐 Segurança

### ✅ Boas Práticas

- ✅ **Access Token no .env** (nunca no código)
- ✅ **Validação de webhook** (implementar assinatura)
- ✅ **HTTPS em produção**
- ✅ **Sandbox para testes**
- ✅ **Logs de transações**

### ❌ Nunca Faça

- ❌ Commitar Access Token no git
- ❌ Usar token de produção em desenvolvimento
- ❌ Expor token no frontend
- ❌ Processar pagamento sem validação

---

## 🐛 Troubleshooting

### Erro: "Mercado Pago não configurado"

**Causa**: `MERCADOPAGO_ACCESS_TOKEN` não definido

**Solução**:
```bash
# Adicionar no .env
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx...

# Reiniciar
docker-compose restart backend
```

---

### Erro: "Invalid access_token"

**Causa**: Token inválido ou expirado

**Solução**:
1. Gerar novo token no painel do Mercado Pago
2. Atualizar `.env`
3. Reiniciar backend

---

### Erro: "Amount exceeds limits"

**Causa**: Valor fora dos limites (R$ 0.01 - R$ 10.000)

**Solução**: Ajustar valores do pedido

---

## 📚 Documentação Relacionada

- **Oficial**: https://www.mercadopago.com.br/developers/pt/docs
- **SDK Java**: https://github.com/mercadopago/sdk-java
- **API Reference**: https://www.mercadopago.com.br/developers/pt/reference

---

## 🔄 Próximos Passos (Futuro)

- [ ] Implementar webhook para atualização automática de status
- [ ] Adicionar split de pagamento (marketplace)
- [ ] Implementar PIX
- [ ] Adicionar boleto bancário
- [ ] Dashboard de transações
- [ ] Relatórios de vendas

---

**✅ Mercado Pago integrado e funcionando!**

**Data**: 23 de outubro de 2025  
**Versão**: 1.0.0
