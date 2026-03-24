# 🔄 Diagrama de Fluxo - Uber Delivery Frontend

## Fluxo de Frete (Cotação)

```
┌──────────────┐
│   Usuario    │
│  Preenche    │
│  Endereço    │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Checkout.tsx         │
│ useEffect            │
│ (calcula frete)      │
└──────┬───────────────┘
       │
       ├─→ Estratégia 1: CEP Temporário
       │   ├─→ Busca endereço temporário do localStorage
       │   ├─→ Valida coordenadas (lat/lon)
       │   └─→ Calcula frete INICIAL
       │
       └─→ Estratégia 2: Endereço Completo
           ├─→ Cria/atualiza endereço no backend
           ├─→ Chama shippingApi.calcularFrete()
           │
           ▼
       ┌────────────────────────────────┐
       │ Backend API                    │
       │ /v1/fretes/calcular            │
       └────┬──────────────────────────┘
            │
            │ Payload:
            │ - lojistaId
            │ - enderecoEntregaId
            │ - pesoTotalKg
            │
            ▼
       ┌────────────────────────────────┐
       │ Backend                        │
       │ 1. Geocodifica endereço        │
       │ 2. Busca endereço lojista      │
       │ 3. Chama Uber Direct API       │
       │ 4. Calcula taxa Win (10%)      │
       └────┬──────────────────────────┘
            │
            │ Response:
            │ {
            │   quoteId: "uuid",
            │   valorCorridaUber: 25.00,
            │   taxaWin: 2.50,
            │   valorFreteTotal: 27.50,
            │   tempoEstimadoMinutos: 45,
            │   distanciaKm: 12.3,
            │   modoProducao: true
            │ }
            │
            ▼
       ┌────────────────────────────────┐
       │ Frontend                       │
       │ Atualiza estado                │
       │ simulacaoFrete                 │
       └────┬──────────────────────────┘
            │
            ▼
       ┌────────────────────────────────┐
       │ FreteCalculador.tsx            │
       │ Exibe resultado                │
       │ - Valor total                  │
       │ - Tempo + Distância            │
       │ - quoteId salvo                │
       └────────────────────────────────┘
```

---

## Fluxo de Entrega (Criação)

```
┌──────────────┐
│  Lojista     │
│  Clica em    │
│  "Pronto     │
│  Retirada"   │
└──────┬───────┘
       │
       ▼
┌────────────────────────────────┐
│ ConfirmarEntrega.tsx           │
│ Dialog Abrir                   │
│ 1. Exibe dados do pedido       │
│ 2. Campo para PIN codes        │
└────┬──────────────────────────┘
     │
     ├─→ Opção 1: Lojista digita PINs
     │
     └─→ Opção 2: Sistema gera PINs
         └─→ useUberDelivery.gerarPinCode() x2
            └─→ Backend API /v1/uber/deliveries/generate-pin
               └─→ Gera 2 PINs aleatórios
                  └─→ Retorna para input
       │
       ▼
┌────────────────────────────────┐
│ Lojista confirma e clica       │
│ "Confirmar Entrega"            │
│ Button ativado se PINs preench.│
└────┬──────────────────────────┘
     │
     │ Chamada: useUberDelivery.criarEntrega(
     │   quoteId,
     │   pedidoId,
     │   nomeCliente,
     │   telefoneCliente,
     │   enderecoLojista,
     │   latLojista,
     │   lonLojista,
     │   enderecoCliente,
     │   latCliente,
     │   lonCliente,
     │   pinColeta,
     │   pinEntrega
     │ )
     │
     ▼
┌────────────────────────────────┐
│ Backend API                    │
│ POST /v1/uber/deliveries       │
│                                │
│ Payload:                       │
│ {                              │
│   quote_id: quoteId,           │
│   order_reference_id: pedidoId,│
│   pickup_address: {...},       │
│   dropoff_address: {...},      │
│   dropoff_name,                │
│   dropoff_phone_number,        │
│   pickup_pin_code,             │
│   delivery_pin_code            │
│ }                              │
└────┬──────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ Uber Direct API                │
│ POST /deliveries               │
│                                │
│ Cria delivery na Uber          │
└────┬──────────────────────────┘
     │
     │ Response:
     │ {
     │   id: "delivery-uuid",
     │   status: "SEARCHING_FOR_COURIER",
     │   tracking_url: "https://...",
     │   pin_coleta,
     │   pin_entrega
     │ }
     │
     ▼
┌────────────────────────────────┐
│ Frontend                       │
│ setDelivery(resultado)         │
│ Exibe: Entrega Confirmada!     │
│  - Delivery ID                 │
│  - Status                      │
│  - Tracking URL               │
│  - PIN codes                   │
└────────────────────────────────┘
```

---

## Fluxo de Rastreamento (Polling)

```
┌──────────────────────────────┐
│ RastreamentoEntrega.tsx      │
│ Componente Montado           │
│ (useEffect)                  │
└────┬─────────────────────────┘
     │
     │ 1. Buscar status IMEDIATAMENTE
     │ 2. Iniciar polling a cada 30s
     │
     ▼
┌────────────────────────────────┐
│ useUberDelivery.                │
│ consultarStatusEntrega(         │
│   deliveryId                   │
│ )                              │
└────┬──────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ Backend API                    │
│ GET /v1/uber/deliveries/{id}   │
│ /status                        │
└────┬──────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ Uber Direct API                │
│ GET /deliveries/{id}           │
└────┬──────────────────────────┘
     │
     │ Response:
     │ {
     │   status: "ACCEPTED",
     │   tracking_url: "...",
     │   courier_name: "João",
     │   courier_latitude: -23.550,
     │   courier_longitude: -46.630,
     │   estimated_arrival: 1847  (segundos)
     │ }
     │
     ▼
┌────────────────────────────────┐
│ Frontend: Atualizar Estado     │
│ 1. Comparar status anterior    │
│ 2. Se mudou: chamar callback   │
│    onStatusMudou(status)       │
│ 3. Atualizar visual:           │
│    - Barra de progresso        │
│    - Info motorista            │
│    - Tempo estimado            │
│ 4. Agendar próximo polling     │
│    em 30segundos               │
└────────────────────────────────┘
     │
     │ [Status muda para DELIVERED]
     │
     ▼
┌────────────────────────────────┐
│ Limpar polling                 │
│ (useEffect cleanup)            │
│ Mostrar: "Entregue!"           │
└────────────────────────────────┘
```

---

## Fluxo Checkout Completo

```
START
  │
  ▼
┌─────────────────────────────────┐
│ 1. Carrinho com itens           │
│    Usuário clica checkout       │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 2. Checkout.tsx carrega         │
│    Verifica modo reprocessamento│
│    ou novo pedido               │
└────┬────────────────────────────┘
     │
     ▼─────────────────────────────┐
     │                             │
NOVO PEDIDO                 REPROCESSAR PEDIDO
  │                              │
  ├─→ Verifica primeira compra ◄─┤
  │   (gratuito se sim)          │
  │                              │
  ▼                              ▼
┌─────────────────────────────────┐
│ 3. Preenche/valida endereço     │
│    Dois caminhos:              │
│    A) CEP rápido               │
│    B) Endereço completo        │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 4. Sistema calcula frete        │
│    shippingApi.calcularFrete()  │
│    Com quoteId gerado           │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 5. Seleciona pagamento          │
│    PIX / Cartão / Boleto        │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 6. Valida dados e submete       │
│    handleSubmit()               │
└────┬────────────────────────────┘
     │
     ├─→ NOVO: Cria pedido
     │  api.post("/v1/pedidos")
     │  Recebe: pedidoId
     │
     └─→ REPROCESSAR: Usa pedidoId existente
     │
     ▼
┌─────────────────────────────────┐
│ 7. Processa pagamento           │
│    Método PIX:                  │
│    api.post(                    │
│      /v1/pagamentos/pagarme/    │
│      pix/{pedidoId}             │
│    )                            │
│                                 │
│    Recebe: {                    │
│      billing: {                 │
│        checkoutUrl,             │
│        billingId                │
│      }                           │
│    }                            │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 8. Limpa carrinho (apenas novo) │
│    clearCart()                  │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 9. Redireciona para pagamento   │
│    /pagamento/pix/{pedidoId}    │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 10. Usuário paga (PIX QR Code)  │
│     [Webhook confirma]          │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 11. Backend marca PAGO          │
│     Notifica lojista            │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 12. Lojista recebe ordem        │
│     Prepara e clica             │
│     "Pronto para Retirada"      │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 13. Sistema cria delivery       │
│     (vide fluxo "Entrega")      │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 14. Cliente rastreia entrega    │
│     (vide fluxo "Rastreamento") │
└────┬────────────────────────────┘
     │
     ▼
END (Entrega completada)
```

---

## Estrutura de Estados (State Management)

```
CartContext
├── items: CartItem[]
├── total: number
├── itemCount: number
└── Actions:
    ├── addItem()
    ├── removeItem()
    ├── updateQuantity()
    └── clearCart()

Checkout Local State
├── address: {
│   cep, logradouro, numero,
│   complemento, bairro, cidade, uf
│ }
├── cardData: { number, name, expiry, cvv, cpf }
├── pixData: { nome, cpf, telefone, email }
├── simulacaoFrete: FreteResponseDTO | null
├── freteCalculado: boolean
├── enderecoId: string
├── isPrimeiraCompra: boolean
├── pedidoId: string | null
├── modoReprocessamento: boolean
└── paymentMethod: "pix" | "credit_card" | "boleto"

useUberDelivery Hook State
├── loading: boolean
├── error: string | null
└── (funções não possuem estado direto)

RastreamentoEntrega Local State
├── status: StatusEntrega | null
├── ultimoStatus: string | null
├── loading: boolean
└── error: string | null
```

---

## Fluxo de Dados (Unidirecional)

```
┌───────────────┐
│  Componente   │
└───────┬───────┘
        │
        │ Props (dados para baixo)
        │ Callbacks (eventos para cima)
        │
        ▼
┌───────────────────────────────────────┐
│  Hooks Customizados                   │
│  - useCart()                          │
│  - useAuth()                          │
│  - useUberDelivery()                  │
│  - useNotification()                  │
└───────┬───────────────────────────────┘
        │
        │ Chamadas de API
        │
        ▼
┌───────────────────────────────────────┐
│  Services (lib/api/*)                 │
│  - shippingApi                        │
│  - ordersApi                          │
│  - paymentMethodsApi                  │
│  - lojistaApi                         │
└───────┬───────────────────────────────┘
        │
        │ HTTP Requests (axios)
        │
        ▼
┌───────────────────────────────────────┐
│  Backend API                          │
│  - /v1/fretes/*                       │
│  - /v1/uber/deliveries                │
│  - /v1/geocoding/*                    │
│  - /v1/pagamentos/*                   │
└───────┬───────────────────────────────┘
        │
        │ HTTP Responses
        │
        ▼
┌───────────────────────────────────────┐
│  External APIs                        │
│  - Uber Direct API                    │
│  - Pagar.me API                       │
│  - Mercado Pago API                   │
│  - Google Geocoding API (opcional)    │
└───────────────────────────────────────┘
```

---

## Mapa de Componentes

```
Layout Principal
├── Header
│   ├── CEPRapido (modo="header")
│   └── Navbar
│
├── Main Content
│   ├── Checkout Page
│   │   ├── Endereço Section
│   │   │   └── Integrado com ceep viacep
│   │   ├── Pagamento Section
│   │   │   ├── PIX Form
│   │   │   ├── Cartão Form
│   │   │   └── Boleto Info
│   │   └── Resumo (sidebar)
│   │       └── Frete + Totais
│   │
│   ├── Cart Page
│   │   ├── Lista de Itens
│   │   ├── CartSuggestions
│   │   └── Resumo (sidebar)
│   │       └── FreteEstimado
│   │
│   ├── Painel Lojista
│   │   ├── Lista de Pedidos
│   │   └── [Pedido Item]
│   │       ├── Detalhes
│   │       └── ConfirmarEntrega Component
│   │           └── Dialog com PIN codes
│   │
│   └── Rastreamento (detalhes pedido)
│       └── RastreamentoEntrega Component
│           ├── Barra de progresso
│           ├── Info do motorista
│           └── Mapa (futuro)
│
└── Footer
```

