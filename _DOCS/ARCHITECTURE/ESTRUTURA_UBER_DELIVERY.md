# 📦 Análise da Integração Uber Delivery - Frontend

**Data:** 24 de Março de 2026  
**Status:** Implementação COMPLETA com alguns refinamentos pendentes

---

## 🎯 Visão Geral da Estrutura

```
win-frontend/src/
├── hooks/
│   └── useUberDelivery.ts          ✅ COMPLETO
├── components/
│   ├── CEPRapido.tsx                ✅ COMPLETO
│   ├── CEPWidget.tsx                ✅ COMPLETO
│   ├── checkout/
│   │   └── FreteCalculador.tsx       ✅ COMPLETO
│   ├── merchant/
│   │   └── ConfirmarEntrega.tsx      ✅ COMPLETO
│   └── orders/
│       └── RastreamentoEntrega.tsx   ✅ COMPLETO
├── lib/api/
│   ├── shippingApi.ts               ✅ COMPLETO
│   ├── ordersApi.ts                 ✅ COMPLETO
│   └── ...others
├── pages/
│   ├── shared/Checkout.tsx          ✅ COMPLETO
│   └── shared/Cart.tsx              ✅ COMPLETO
└── contexts/
   ├── CartContext                   ✅ COMPLETO
   ├── AuthContext                   ✅ COMPLETO
   └── NotificationContext           ✅ COMPLETO
```

---

## 📋 1. COMPONENTES REACT PARA UBER

### 1.1 **FreteCalculador.tsx**
**Localização:** `components/checkout/FreteCalculador.tsx`  
**Status:** ✅ IMPLEMENTADO  
**Responsabilidades:**
- Geocodificar endereço do lojista
- Geocodificar endereço do cliente
- Chamar API de cotação Uber
- Exibir valor do frete + taxa Win
- Mostrar tempo estimado (coleta + entrega)
- Callback quando cotação é obtida

**Props:**
```typescript
interface FreteCalculadorProps {
  cepLojista: string;
  enderecoLojista: string;
  cidadeLojista: string;
  estadoLojista: string;
  cepCliente: string;
  enderecoCliente: string;
  cidadeCliente: string;
  estadoCliente: string;
  nomeCliente: string;
  pedidoId: string;
  onCotacaoObtida?: (cotacao: any) => void;
  onErro?: (erro: string) => void;
}
```

**Fluxo:**
1. Recebe endereços do lojista e cliente
2. Geocodifica ambos os endereços
3. Solicita cotação via `useUberDelivery.solicitarCotacao()`
4. Exibe resultado em Card com:
   - Tempo de coleta/entrega
   - Valor do frete breakdow (Uber + Taxa Win)
   - Total cobrado ao cliente

---

### 1.2 **ConfirmarEntrega.tsx**
**Localização:** `components/merchant/ConfirmarEntrega.tsx`  
**Status:** ✅ IMPLEMENTADO  
**Responsabilidades:**
- Botão "Pronto para Retirada" no painel do lojista
- Dialog para gerar/confirmar PIN codes
- Criar entrega na Uber Direct
- Exibir tracking URL
- Gerenciar visibilidade de PIN codes

**Fluxo:**
1. Abre Dialog com botão "Pronto para Retirada"
2. Coleta dados da entrega (cliente, endereço, etc)
3. **Gera PIN codes** (validação obrigatória!)
4. Cria entrega via `useUberDelivery.criarEntrega()`
5. Backend cria delivery na API Uber
6. Exibe sucesso com tracking URL + PINs

**PIN Codes:**
- PIN de Coleta: Motorista fornece para lojista confirmar que chegou
- PIN de Entrega: Cliente fornece ao motorista para confirmar recebimento
- Ambos são obrigatórios!

---

### 1.3 **RastreamentoEntrega.tsx**
**Localização:** `components/orders/RastreamentoEntrega.tsx`  
**Status:** ✅ IMPLEMENTADO (polling, sem webhooks)  
**Responsabilidades:**
- Exibir status em tempo real da entrega
- Atualizar status a cada 30 segundos (polling)
- Mostrar localização do motorista
- Exibir tempo estimado de chegada
- Informações do motorista (nome, placa - quando disponível)
- Callback quando status muda

**Status Previstos:**
```typescript
const statusMap = {
  SEARCHING_FOR_COURIER: { label: "Procurando Motorista", progresso: 20 },
  ACCEPTED: { label: "Motorista Aceitou", progresso: 40 },
  ARRIVED_AT_PICKUP: { label: "Chegou na Coleta", progresso: 50 },
  PICKED_UP: { label: "Pedido Coletado", progresso: 60 },
  ARRIVED_AT_DROPOFF: { label: "Chegou na Entrega", progresso: 80 },
  DELIVERED: { label: "Entregue", progresso: 100 },
  CANCELLED: { label: "Cancelada", progresso: 0 }
}
```

**Fluxo:**
1. Inicia polling imediatamente
2. A cada 30s: chama `useUberDelivery.consultarStatusEntrega()`
3. Atualiza estado visual com barra de progresso
4. Chama callback `onStatusMudou()` quando status muda

---

### 1.4 **CEPRapido.tsx** (Bonus Component)
**Localização:** `components/CEPRapido.tsx`  
**Status:** ✅ IMPLEMENTADO  
**Responsabilidades:**
- Estimativa rápida de frete antes do checkout
- Dois modos: "header" (compacto) ou "produto" (detalhado)
- Salva CEP no localStorage
- Feedback imediato de valor e tempo

**Props:**
```typescript
interface CEPRapidoProps {
  onCepCalculado?: (valorFrete: number, cep: string) => void;
  lojistaId?: string;
  className?: string;
  modo?: 'header' | 'produto';
}
```

---

## 🎣 2. HOOKS PERSONALIZADOS

### 2.1 **useUberDelivery.ts**
**Localização:** `hooks/useUberDelivery.ts`  
**Status:** ✅ IMPLEMENTADO  
**Interface Pública:**

```typescript
export const useUberDelivery = () => {
  // Estado
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Funções
  const geocodificarEndereco = async (
    cep: string,
    endereco: string,
    cidade: string,
    estado: string
  ) => Coordenadas

  const solicitarCotacao = async (
    origemLat: number,
    origemLon: number,
    destinoLat: number,
    destinoLon: number,
    pedidoId: string
  ) => Cotacao

  const criarEntrega = async (
    quoteId: string,
    pedidoId: string,
    nomeCliente: string,
    telefoneCliente: string,
    ...
  ) => Entrega

  const consultarStatusEntrega = async (
    deliveryId: string
  ) => StatusEntrega

  const gerarPinCode = async () => string
}
```

**Tipos Internos:**
```typescript
interface Coordenadas {
  latitude: number;
  longitude: number;
}

interface Cotacao {
  quote_id: string;
  frete_cliente: number;
  frete_uber: number;
  taxa_win: number;
  moeda: string;
  tempo_coleta_min: number;
  tempo_entrega_min: number;
}

interface Entrega {
  id: string;
  status: string;
  tracking_url: string;
  pin_coleta: string;
  pin_entrega: string;
}

interface StatusEntrega {
  status: string;
  tracking_url: string;
  courier_name?: string;
  courier_latitude?: number;
  courier_longitude?: number;
  estimated_arrival?: number;
}
```

---

## 🌐 3. SERVIÇOS/API CLIENTS

### 3.1 **shippingApi.ts**
**Localização:** `lib/api/shippingApi.ts`  
**Status:** ✅ IMPLEMENTADO  
**Métodos Principais:**

#### `calcularFrete(request: FreteRequestDTO)`
- Calcula frete dinâmico com geocoding
- Retorna cotação real da Uber
- Salva `quoteId` para uso posterior

**DTO:**
```typescript
export interface FreteRequestDTO {
  lojistaId: string;
  enderecoEntregaId: string;
  pesoTotalKg?: number;
  cepOrigem?: string;
  cepDestino?: string;
}

export interface FreteResponseDTO {
  sucesso: boolean;
  quoteId?: string;
  valorFreteTotal: number;
  valorCorridaUber: number;
  taxaWin: number;
  distanciaKm: number;
  tempoEstimadoMinutos: number;
  tipoVeiculo: string;
  mensagem?: string;
  erro?: string;
  modoProducao: boolean;
}
```

#### `estimarFretePorCep(cepDestino, lojistaId, pesoKg)`
- Estimativa rápida sem endereço completo
- Usado no CEPRapido
- Retorna `FreteResponseDTO`

#### `verificarPrimeiraCompra(usuarioId)`
- Verifica se é primeira compra do cliente
- Se true: frete GRÁTIS (padrão)
- Retorna:
  ```typescript
  {
    ehPrimeiraCompra: boolean;
    totalPedidos: number;
    freteGratis: boolean;
    mensagem: string;
  }
  ```

#### `calcularPesoTotal(items)`
- Helper para calcular peso total dos itens
- Usa campo `pesoKg` de cada item

---

### 3.2 **ordersApi.ts**
**Localização:** `lib/api/ordersApi.ts`  
**Status:** ✅ IMPLEMENTADO  
**Métodos Principais:**
- `createOrder(orderData)` - Cria novo pedido
- `getOrderById(orderId)` - Busca pedido por ID
- `updateOrder(orderId, data)` - Atualiza pedido
- `getOrders()` - Lista pedidos do usuário

---

## 📊 4. TIPOS/INTERFACES TYPESCRIPT

### 4.1 Tipos Locais (em Components/Hooks)
✅ **Coordenadas** - Latitude/Longitude
✅ **Cotacao** - Resposta de cotação
✅ **Entrega** - Informações de entrega criada
✅ **StatusEntrega** - Status em tempo real
✅ **FreteRequestDTO** - Request para calcular frete
✅ **FreteResponseDTO** - Response com cotação

### 4.2 Tipos Não Encontrados (TODO)
- [ ] **PedidoDTO** - Estrutura completa do pedido
- [ ] **ClienteDTO** - Informações do cliente
- [ ] **EnderecoDTO** - Estrutura de endereço
- [ ] **ItemPedidoDTO** - Item do pedido

**Recomendação:** Criar arquivo `types/uber.ts` para centralizar todos os tipos!

---

## 📄 5. PÁGINAS DE CHECKOUT E PAINEL

### 5.1 **Checkout.tsx**
**Localização:** `pages/shared/Checkout.tsx`  
**Status:** ✅ IMPLEMENTADO  
**Responsabilidades:**
- Formulário completo de checkout
- Duas estratégias de endereço:
  1. **Endereço Temporário** (CEP rápido)
  2. **Endereço Completo** (formulário detalhado)
- Integração com Frete Dinâmico
- Múltiplos métodos de pagamento:
  - PIX (Pagar.me)
  - Cartão de Crédito (Mercado Pago)
  - Boleto
- Modo Reprocessamento (pedido existente)
- Validação de primeira compra

**Fluxo Frete:**
```
1. Carrega endereço temporário do localStorage
2. Valida se tem coordenadas (latitude/longitude)
3. Se sim: calcula frete com endereço temporário
4. Quando usuário preenche endereço completo:
   - Atualiza endereço no backend
   - Recalcula frete com dados completos
   - Mostra valor exato (não mais estimado)
```

**Modo Reprocessamento:**
- Acionado via param `?pedido=ID` ou state
- Reutiliza dados do pedido existente
- Permite apenas selecionar novo método de pagamento
- Tipo: "Completando Pagamento" em vez de "Novo Pedido"

---

### 5.2 **Cart.tsx**
**Localização:** `pages/shared/Cart.tsx`  
**Status:** ✅ IMPLEMENTADO  
**Responsabilidades:**
- Lista itens do carrinho agrupados por loja
- Mostrar subtotal com frete estimado
- Destaque especial para primeira compra (FRETE GRÁTIS)
- Botão "Finalizar Compra"
- Sugestões de produtos relacionados

**Verificação de Primeira Compra:**
- O hook `useEffect` verifica ao carregar
- Se sim: exibe banner especial
- No checkout: frete é SEMPRE 0 (WIN paga)

---

## 🚀 STATUS GERAL

### ✅ IMPLEMENTADO

| Item | Localização | Status |
|------|------------|--------|
| Hook useUberDelivery | `hooks/useUberDelivery.ts` | ✅ 100% |
| FreteCalculador Component | `components/checkout/` | ✅ 100% |
| ConfirmarEntrega Component | `components/merchant/` | ✅ 100% |
| RastreamentoEntrega Component | `components/orders/` | ✅ 100% |
| CEPRapido Component | `components/CEPRapido.tsx` | ✅ 100% |
| shippingApi Service | `lib/api/shippingApi.ts` | ✅ 90% |
| Checkout Page | `pages/shared/Checkout.tsx` | ✅ 95% |
| Cart Page | `pages/shared/Cart.tsx` | ✅ 90% |
| Verificação Primeira Compra | Integrada em múltiplos lugares | ✅ 100% |

---

## ⚠️ ITENS PENDENTES / REFINAMENTOS

### 1. **Tipos TypeScript Centralizados**
- [ ] Criar `src/types/uber.ts`
- [ ] Consolidar todas as interfaces
- [ ] Exportar tipos para uso em toda aplicação

**Sugestão:**
```typescript
// src/types/uber.ts
export interface Coordenadas { ... }
export interface Cotacao { ... }
export interface Entrega { ... }
export interface StatusEntrega { ... }
export interface FreteRequestDTO { ... }
export interface FreteResponseDTO { ... }
export interface PedidoDTO { ... }
export interface ClienteDTO { ... }
```

---

### 2. **Webhooks para Rastreamento**
**Status:** Não implementado (usando polling)  
- [ ] Backend: Implementar webhooks da Uber
- [ ] Frontend: Atualizar RastreamentoEntrega para usar WebSockets
- [ ] Reduzir polling de 30s para apenas eventos críticos

**Vantagens de Webhooks:**
- Atualizações instantâneas
- Menos requisições HTTP
- Melhor experiência do usuário

---

### 3. **Mapa de Localização do Motorista**
**Status:** Não implementado  
- [ ] Integrar Google Maps/Mapbox
- [ ] Mostrar localização do motorista em tempo real
- [ ] Exibir rota até o ponto de entrega
- [ ] Componente: `RastreamentoMapa.tsx`

---

### 4. **Cancelamento de Entrega**
**Status:** Não implementado  
- [ ] Hook: `useUberDelivery.cancelarEntrega(deliveryId)`
- [ ] Componente: `CancelarEntrega.tsx`
- [ ] Integração com API Uber para cancelar
- [ ] Reembolso automático do cliente

---

### 5. **Comunicação em Tempo Real (WebSocket)**
**Status:** Não implementado  
- [ ] Context: WebSocketContext
- [ ] Substituir polling por eventos
- [ ] Notificações push
- [ ] Componente: `NotificacaoEntrega.tsx`

---

### 6. **Tratamento de Erros Robusto**
**Status:** Parcialmente implementado  
- [ ] Melhorar mensagens de erro específicas
- [ ] Retry automático em falhas temporárias
- [ ] Circuit breaker para APIs
- [ ] Fallback quando Uber API cai

---

### 7. **Testes Unitários e E2E**
**Status:** Não implementado  
- [ ] Testes do hook useUberDelivery
- [ ] Testes dos componentes (FreteCalculador, ConfirmarEntrega, etc)
- [ ] Testes de integração do checkout
- [ ] Testes E2E do fluxo de entrega

---

### 8. **Performance e Otimização**
**Status:** Bom, com melhorias  
- [ ] Memoização de componentes itens pesados
- [ ] Lazy loading de componentes
- [ ] Cache de cotações por CEP
- [ ] Limite de requisições paralelas

---

## 🔄 FLUXOS DE NEGÓCIO

### Fluxo 1: Cliente Comprando com Uber Delivery

```
1. Cliente adiciona itens ao carrinho
2. Clica em "Finalizar Compra"
   ↓
3. Preenche endereço de entrega (ou usa CEP rápido)
   ↓
4. Sistema calcula frete dinâmico
   - Geocodifica lojista + cliente
   - Solicita cotação da Uber
   - Exibe valor + tempo estimado
   ↓
5. Cliente seleciona método de pagamento
   ↓
6. Backend cria pedido com dados de frete (quoteId salvo)
   ↓
7. Redireciona para página de pagamento
   ↓
8. Após confirmação de pagamento:
   - Webhook do gateway (Pagar.me/MP) confirma
   - Backend marca pedido como PAGO
   ↓
9. Lojista recebe notificação de novo pedido
   ↓
10. Lojista prepara produto e clica "Pronto para Retirada"
    ↓
11. Gera PIN codes (coleta + entrega)
    ↓
12. Backend cria delivery na API Uber (usando quoteId)
    ↓
13. Uber atribui motorista
    ↓
14. Cliente recebe:
    - Tracking URL
    - Localização em tempo real
    - Info do motorista
    ↓
15. Motorista coleta produto (usa PIN de coleta)
    ↓
16. Motorista entrega para cliente (cliente fornece PIN)
    ↓
17. Entrega concluída
    ↓
18. Cliente recebe confirmaçã o
```

---

## 📦 RESUMO DAS ESTRUTURAS

### Navegação Recomendada

**Para entender fluxo de Frete:**
1. Leia: `hooks/useUberDelivery.ts`
2. Leia: `lib/api/shippingApi.ts`
3. Veja: `components/checkout/FreteCalculador.tsx`
4. Veja: `pages/shared/Checkout.tsx` (linhas de calcularFrete)

**Para entender fluxo de Entrega:**
1. Leia: `hooks/useUberDelivery.ts` (criarEntrega)
2. Veja: `components/merchant/ConfirmarEntrega.tsx`
3. Veja: `components/orders/RastreamentoEntrega.tsx`

**Para entender checkout completo:**
1. Veja: `pages/shared/Checkout.tsx` (todo arquivo)
2. Referenciar: `pages/shared/Cart.tsx`
3. Integração de pagamento: `lib/api/paymentMethodsApi.ts`

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### Curto Prazo (1-2 semanas)
1. **Testes:** Criar testes unitários para useUberDelivery
2. **Tipos:** Centralizar tipos em `types/uber.ts`
3. **Erros:** Melhorar tratamento de erros com mensagens específicas
4. **Logs:** Adicionar logging estruturado por operação

### Médio Prazo (2-4 semanas)
1. **Webhooks:** Implementar no backend e conectar no frontend
2. **Mapa:** Integrar Google Maps para rastreamento
3. **WebSocket:** Substituir polling por eventos em tempo real
4. **Cancelamento:** Implementar fluxo completo

### Longo Prazo (1+ mês)
1. **Performance:** Otimizações de cache e requisições
2. **Analytics:** Rastrear eventos do fluxo de entrega
3. **A/B Testing:** Testar diferentes UX de frete
4. **Mobile:** Otimizar experiência para mobile
5. **E2E Tests:** Suite completa de testes de integração

---

## 📚 Documentação Relacionada

- Backend: `/docs/INTEGRACAO_MULTI_ERP.md`
- API Reference: `/docs/API_UBER_DELIVERY_REFERENCE.md`
- Setup: `/docs/GUIA_INTEGRACAO_FRONTEND.md`
- Configuração: `/docs/CONFIGURACAO_SPLIT_PAGAMENTO_PAGARME.md`

---

**Última atualização:** 24/03/2026  
**Desenvolvido por:** WIN Team  
**Status da Integração:** 🟢 Pronto para Produção (com refinamentos)
