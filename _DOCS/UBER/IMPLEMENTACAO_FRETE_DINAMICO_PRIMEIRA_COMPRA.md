# Implementação de Frete Dinâmico com Uber Flash e Frete Grátis na Primeira Compra

## 📋 Sumário Executivo

Foi implementado um sistema completo de cálculo dinâmico de frete integrado com Uber Flash, incluindo a funcionalidade de **frete grátis na primeira compra**, onde o próprio sistema WIN Marketplace paga a corrida para o cliente.

---

## ✅ O QUE FOI IMPLEMENTADO

### 1. **API de Frete (Frontend)**
📁 Arquivo: `win-frontend/src/lib/api/shippingApi.ts`

**Funcionalidades:**
- ✅ `simularFrete()` - Simula custo via Uber Flash
- ✅ `verificarPrimeiraCompra()` - Verifica se é primeira compra do usuário
- ✅ `calcularPesoTotal()` - Calcula peso estimado dos itens
- ✅ `formatarEnderecoCompleto()` - Formata endereço para API

### 2. **Backend - Verificação de Primeira Compra**
📁 Arquivo: `backend/src/main/java/com/win/marketplace/controller/PedidoController.java`

**Endpoint Criado:**
```
GET /api/v1/pedidos/usuario/{usuarioId}/primeira-compra
```

**Resposta:**
```json
{
  "ehPrimeiraCompra": true,
  "totalPedidos": 0,
  "freteGratis": true,
  "mensagem": "Parabéns! Você tem FRETE GRÁTIS na sua primeira compra!"
}
```

### 3. **Carrinho (Cart.tsx)**
✅ Exibe **estimativa** de frete
✅ Detecta primeira compra automaticamente
✅ Mostra badge especial "1ª compra 🎉" quando aplicável
✅ Mensagem destacada de frete grátis

### 4. **Checkout (Checkout.tsx)**
✅ Calcula **valor real** do frete via Uber Flash
✅ Mostra tempo estimado de entrega
✅ Exibe distância da entrega
✅ Indica "O sistema paga a entrega para você!" na primeira compra
✅ Loading spinner durante cálculo

---

## 🎯 COMO FUNCIONA

### Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO ADICIONA PRODUTOS AO CARRINHO                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. CART.TSX                                                     │
│    ✓ Verifica se é primeira compra via API                     │
│    ✓ Mostra frete GRÁTIS se for primeira compra               │
│    ✓ Caso contrário, mostra estimativa R$ 15,00                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. USUÁRIO VAI PARA CHECKOUT                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. CHECKOUT.TSX                                                 │
│    ✓ Verifica primeira compra novamente                        │
│    ✓ Usuário preenche endereço                                 │
│    ✓ Sistema calcula frete REAL via Uber Flash                 │
│    ✓ Se primeira compra: Frete = R$ 0 (sistema paga)           │
│    ✓ Se não: Frete = valor calculado (ex: R$ 18,50)            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. PEDIDO É CRIADO                                              │
│    ✓ Valor do frete salvo no pedido                            │
│    ✓ Se primeira compra: campo "freteGratisPromocao" = true    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. LOJISTA PREPARA PEDIDO                                       │
│    ✓ Clica "Solicitar Motorista"                               │
│    ✓ Sistema chama Uber Flash API                              │
│    ✓ WIN paga R$ X,XX (valor real da corrida)                  │
│    ✓ Cliente já pagou R$ 0 (primeira compra) ou valor integral │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💰 LÓGICA FINANCEIRA - FRETE GRÁTIS NA PRIMEIRA COMPRA

### Cenário 1: Primeira Compra (Frete Grátis)

**Exemplo:**
- Produtos: R$ 50,00
- Frete calculado (Uber): R$ 18,50
- **Cliente paga:** R$ 50,00 (sem frete)
- **Sistema WIN paga:** R$ 18,50 para Uber
- **Custo WIN:** R$ 18,50 (investimento em marketing)

### Cenário 2: Compras Seguintes (Frete Normal)

**Exemplo:**
- Produtos: R$ 50,00
- Frete calculado (Uber): R$ 18,50
- Taxa WIN (10%): R$ 1,85
- **Cliente paga:** R$ 50,00 + R$ 20,35 = **R$ 70,35**
- **Sistema WIN paga:** R$ 18,50 para Uber
- **Lucro WIN no frete:** R$ 1,85

---

## 🔧 IMPLEMENTAÇÕES NECESSÁRIAS NO BACKEND

### 1. **Adicionar Campo no Modelo Pedido**

```java
@Entity
public class Pedido {
    // ... campos existentes ...
    
    @Column(name = "frete_gratis_primeira_compra")
    private Boolean freteGratisPrimeiraCompra = false;
    
    @Column(name = "valor_frete_real_uber", precision = 10, scale = 2)
    private BigDecimal valorFreteRealUber; // Valor que WIN paga para Uber
    
    @Column(name = "valor_frete_cobrado_cliente", precision = 10, scale = 2)
    private BigDecimal valorFreteCobradoCliente; // Valor que cliente pagou
}
```

### 2. **Migration SQL**

```sql
-- Migration: Add freight control fields
ALTER TABLE pedidos 
ADD COLUMN frete_gratis_primeira_compra BOOLEAN DEFAULT FALSE,
ADD COLUMN valor_frete_real_uber NUMERIC(10,2),
ADD COLUMN valor_frete_cobrado_cliente NUMERIC(10,2);

-- Update existing orders
UPDATE pedidos 
SET valor_frete_cobrado_cliente = frete,
    valor_frete_real_uber = frete
WHERE frete IS NOT NULL;
```

### 3. **Lógica no PedidoService**

```java
public PedidoResponseDTO criarPedido(PedidoCreateRequestDTO requestDTO) {
    // ... código existente ...
    
    // Verificar se é primeira compra
    long totalPedidos = pedidoRepository.countByUsuarioId(requestDTO.usuarioId());
    boolean ehPrimeiraCompra = totalPedidos == 0;
    
    pedido.setFreteGratisPrimeiraCompra(ehPrimeiraCompra);
    
    if (ehPrimeiraCompra) {
        // Cliente não paga frete
        pedido.setValorFreteCobradoCliente(BigDecimal.ZERO);
        // Mas WIN vai pagar o valor real para Uber
        pedido.setValorFreteRealUber(requestDTO.frete());
        // Ajustar total do pedido (sem frete)
        pedido.setFrete(BigDecimal.ZERO);
    } else {
        // Cliente paga frete normalmente
        pedido.setValorFreteCobradoCliente(requestDTO.frete());
        pedido.setValorFreteRealUber(calcularValorRealUber(requestDTO.frete()));
    }
    
    // ... continua ...
}

private BigDecimal calcularValorRealUber(BigDecimal valorCobradoCliente) {
    // Remove a taxa de 10% para obter valor real da corrida
    return valorCobradoCliente.divide(BigDecimal.valueOf(1.10), 2, RoundingMode.HALF_UP);
}
```

### 4. **Atualizar EntregaService**

```java
public SolicitacaoCorridaUberResponseDTO solicitarCorridaUber(UUID pedidoId) {
    var entrega = entregaRepository.findByPedidoId(pedidoId)
            .orElseThrow(() -> new BusinessException("Entrega não encontrada"));
    
    var pedido = entrega.getPedido();
    
    // Usar o valor REAL que será pago para Uber, não o valor cobrado do cliente
    BigDecimal valorParaUber = pedido.getValorFreteRealUber() != null 
        ? pedido.getValorFreteRealUber() 
        : entrega.getValorCorridaUber();
    
    // ... continua com solicitação ...
}
```

---

## 📊 SUGESTÕES PROFISSIONAIS

### 1. **Gestão Financeira**

#### a) Dashboard de Custos de Frete Grátis
```typescript
interface DashboardFreteGratis {
  totalPedidosPrimeiraCompra: number;
  valorTotalInvestido: number;  // Quanto WIN pagou em fretes grátis
  valorMedioFrete: number;
  taxaConversao: number;  // % de primeiras compras que viraram segundas
  roi: number;  // Retorno sobre investimento
}
```

#### b) Limite de Investimento
- Definir orçamento mensal para frete grátis
- Pausar promoção automaticamente ao atingir limite
- Alertas quando atingir 80% do orçamento

```java
@Service
public class FreteGratisService {
    
    public boolean podeConcederFreteGratis(UUID usuarioId) {
        // Verifica se é primeira compra
        if (pedidoRepository.countByUsuarioId(usuarioId) > 0) {
            return false;
        }
        
        // Verifica orçamento mensal
        BigDecimal gastoMesAtual = calcularGastoFreteGratisMesAtual();
        BigDecimal limiteMe nsal = configuracaoService.getLimiteFreteGratisMensal();
        
        if (gastoMesAtual.compareTo(limiteMensal) >= 0) {
            log.warn("Limite de frete grátis atingido para o mês");
            return false;
        }
        
        return true;
    }
}
```

### 2. **Análise de Retenção**

```sql
-- Query para análise de retenção
WITH primeira_compra AS (
    SELECT usuario_id, MIN(criado_em) as primeira_data
    FROM pedidos
    WHERE frete_gratis_primeira_compra = true
    GROUP BY usuario_id
),
segunda_compra AS (
    SELECT p.usuario_id, COUNT(*) as total_subsequentes
    FROM pedidos p
    JOIN primeira_compra pc ON p.usuario_id = pc.usuario_id
    WHERE p.criado_em > pc.primeira_data
    GROUP BY p.usuario_id
)
SELECT 
    COUNT(DISTINCT pc.usuario_id) as total_primeira_compra,
    COUNT(DISTINCT sc.usuario_id) as fizeram_segunda_compra,
    ROUND(COUNT(DISTINCT sc.usuario_id) * 100.0 / COUNT(DISTINCT pc.usuario_id), 2) as taxa_retencao
FROM primeira_compra pc
LEFT JOIN segunda_compra sc ON pc.usuario_id = sc.usuario_id;
```

### 3. **Regras de Negócio Avançadas**

#### Opção A: Frete Grátis com Valor Mínimo
```typescript
const VALOR_MINIMO_FRETE_GRATIS = 30.00;

if (isPrimeiraCompra && subtotal >= VALOR_MINIMO_FRETE_GRATIS) {
  freteGratis = true;
} else if (isPrimeiraCompra) {
  // Mostrar mensagem: "Adicione mais R$ X para ter frete grátis!"
  valorFaltante = VALOR_MINIMO_FRETE_GRATIS - subtotal;
}
```

#### Opção B: Limite de Valor de Frete Grátis
```typescript
const LIMITE_FRETE_GRATIS = 20.00;

if (isPrimeiraCompra) {
  if (freteCalculado <= LIMITE_FRETE_GRATIS) {
    freteGratis = true;
  } else {
    // Cliente paga a diferença
    freteCobrado = freteCalculado - LIMITE_FRETE_GRATIS;
    // Mensagem: "Frete com desconto de R$ 20! Você paga apenas R$ X"
  }
}
```

#### Opção C: Frete Grátis por Região
```typescript
const REGIOES_FRETE_GRATIS = ['SP', 'RJ', 'MG'];

if (isPrimeiraCompra && REGIOES_FRETE_GRATIS.includes(endereco.uf)) {
  freteGratis = true;
}
```

### 4. **Prevenção de Fraudes**

```java
@Service
public class AntiFraudeFreteService {
    
    public boolean validarPrimeiraCompra(UUID usuarioId, String cpf, String email) {
        // 1. Verificar se CPF já tem pedidos
        if (pedidoRepository.existsByCpf(cpf)) {
            log.warn("CPF {} já possui pedidos", cpf);
            return false;
        }
        
        // 2. Verificar se email já tem pedidos
        if (pedidoRepository.existsByEmail(email)) {
            log.warn("Email {} já possui pedidos", email);
            return false;
        }
        
        // 3. Verificar endereço suspeito (muitos pedidos no mesmo endereço)
        // ... implementar lógica
        
        return true;
    }
}
```

### 5. **Notificações e Comunicação**

#### Email de Boas-Vindas
```
Assunto: 🎉 Parabéns pela sua primeira compra!

Olá [Nome],

Ficamos muito felizes com sua primeira compra no WIN Marketplace!

Como presente de boas-vindas, o FRETE FOI POR NOSSA CONTA! 🎁

Detalhes do pedido:
- Produtos: R$ 50,00
- Frete: R$ 0,00 (cortesia WIN)
- Total: R$ 50,00

Seu pedido chegará em aproximadamente 45 minutos via Uber Flash.

Nas próximas compras, você continuará tendo entregas rápidas com os melhores preços!

Aproveite! 🚀
Equipe WIN Marketplace
```

---

## 📈 MÉTRICAS PARA ACOMPANHAR

### KPIs Essenciais

1. **Taxa de Primeira Compra**
   - Quantos novos usuários fazem a primeira compra
   - Meta: > 30% dos cadastros

2. **Custo por Aquisição (CPA)**
   - Valor investido em frete grátis / Novos clientes
   - Meta: < R$ 25,00 por cliente

3. **Taxa de Retenção**
   - % de clientes que fazem 2ª compra
   - Meta: > 40% em 30 dias

4. **Lifetime Value (LTV)**
   - Valor médio gasto por cliente ao longo do tempo
   - Meta: LTV > 3x CPA

5. **ROI do Programa**
   - (Receita de clientes retidos - Custo frete grátis) / Custo frete grátis
   - Meta: ROI > 300% em 6 meses

---

## ⚠️ PONTOS DE ATENÇÃO

### 1. **CEP da Loja**
⚠️ **IMPORTANTE:** Atualmente está usando CEP fictício `'00000000'`

**Solução:**
```typescript
// Adicionar campo no perfil do lojista
interface Lojista {
  id: string;
  cep: string;
  endereco: string;
  // ...
}

// Buscar CEP real na simulação
const lojista = await lojistaApi.buscarPorId(lojistaId);
const simulacao = await shippingApi.simularFrete({
  lojistaId,
  cepOrigem: lojista.cep,  // CEP real da loja
  enderecoOrigemCompleto: lojista.enderecoCompleto,
  // ...
});
```

### 2. **Peso dos Produtos**
⚠️ Atualmente usando estimativa de 0.5kg por item

**Solução:**
```sql
-- Adicionar campo peso nos produtos
ALTER TABLE produtos ADD COLUMN peso_kg NUMERIC(10,3) DEFAULT 0.5;
```

```typescript
calcularPesoTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const peso = item.pesoKg || 0.5; // Fallback para 0.5kg
    return total + (item.quantity * peso);
  }, 0);
}
```

### 3. **Pedidos com Múltiplas Lojas**
⚠️ Sistema atual assume pedido de uma única loja

**Solução:**
- Dividir carrinho por loja
- Calcular frete separado para cada loja
- Na primeira compra: frete grátis apenas no pedido da primeira loja

---

## 🚀 PRÓXIMOS PASSOS

### Curto Prazo (1-2 semanas)
- [ ] Adicionar campos de controle de frete no banco
- [ ] Obter CEP real das lojas
- [ ] Adicionar peso real nos produtos
- [ ] Testar fluxo completo em modo MOCK
- [ ] Criar dashboard de acompanhamento

### Médio Prazo (1 mês)
- [ ] Implementar sistema anti-fraude
- [ ] Configurar limite mensal de investimento
- [ ] Criar relatórios de ROI
- [ ] A/B test: valor mínimo vs frete grátis total

### Longo Prazo (3 meses)
- [ ] Análise de retenção e LTV
- [ ] Otimizar regras baseado em dados
- [ ] Integração real com Uber Flash API
- [ ] Implementar gamificação (badges, níveis)

---

## 💡 RECOMENDAÇÃO FINAL

A implementação atual está **PRONTA PARA TESTES** em ambiente de desenvolvimento. 

**Recomendo:**

1. ✅ **Teste em MOCK primeiro** (2 semanas)
   - Validar toda a experiência do usuário
   - Ajustar mensagens e UI
   - Treinar equipe de suporte

2. ✅ **Soft Launch** (1 mês)
   - Liberar para 10% dos novos usuários
   - Monitorar métricas diariamente
   - Ajustar conforme necessário

3. ✅ **Rollout Completo** (após validação)
   - Liberar para 100% dos usuários
   - Comunicação em redes sociais
   - Email marketing para base existente

---

## 📞 SUPORTE

Para dúvidas sobre a implementação:
- Documentação Uber Flash: [VERIFICACAO_UBER_FLASH.md](../_DOCS/VERIFICACAO_UBER_FLASH.md)
- API de Frete: [win-frontend/src/lib/api/shippingApi.ts](../win-frontend/src/lib/api/shippingApi.ts)

**Sucesso! 🎉**
