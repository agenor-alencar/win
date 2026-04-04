# 🚀 GUIA DE INTEGRAÇÃO - Componentes Uber Delivery

Este documento descreve como integrar os 4 novos componentes React nos seus layouts existentes.

## Componentes Criados

1. **useUberDelivery.ts** - Hook custom para API
2. **FreteCalculador.tsx** - Exibir frete no checkout
3. **ConfirmarEntrega.tsx** - Botão "Pronto para Retirada" (Lojista)
4. **RastreamentoEntrega.tsx** - Rastrear entrega em tempo real (Cliente)

---

## STEP 1: INTEGRAÇÃO NO CHECKOUT (Página de Checkout do Cliente)

**Arquivo**: `win-frontend/src/pages/Checkout.tsx` ou `win-frontend/src/components/checkout/Checkout.tsx`

### Antes (Exemplo do que você tem):

```tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Checkout: React.FC = () => {
  const [endereco, setEndereco] = useState("");
  const [cep, setCep] = useState("");
  const navigate = useNavigate();

  const handleConfirmar = async () => {
    // Criar pedido
  };

  return (
    <div>
      <h1>Checkout</h1>
      <input value={cep} onChange={(e) => setCep(e.target.value)} />
      <input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
      <button onClick={handleConfirmar}>Confirmar</button>
    </div>
  );
};
```

### Depois (Com FreteCalculador integrado):

```tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FreteCalculador } from "@/components/checkout/FreteCalculador"; // 👈 NOVO

export const Checkout: React.FC = () => {
  const [endereco, setEndereco] = useState("");
  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  
  // 📍 NOVO: Armazenar quote_id para usar quando confirmar pedido
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [freteTotal, setFreteTotal] = useState<number>(0);

  const navigate = useNavigate();

  // Dados da loja (você precisa buscar do seu contexto/estado)
  const enderecoLoja = {
    cep: "01311-100",
    endereco: "Avenida Paulista, 1000",
    cidade: "São Paulo",
    estado: "SP",
  };

  const handleCotacaoObtida = (cotacao: {
    quote_id: string;
    valor_uber: number;
    taxa_win: number;
    frete_cliente: number;
    tempo_estimado: number;
  }) => {
    setQuoteId(cotacao.quote_id);
    setFreteTotal(cotacao.frete_cliente);
    console.log("Cotação obtida:", cotacao);
  };

  const handleConfirmar = async () => {
    if (!quoteId) {
      alert("Por favor, aguarde o cálculo do frete");
      return;
    }

    const pedido = {
      items: [],
      endereco_entrega: endereco,
      cep_entrega: cep,
      cidade_entrega: cidade,
      estado_entrega: estado,
      // 👇 NOVOS CAMPOS (Uber Delivery)
      quote_id: quoteId,
      frete_total: freteTotal,
      metodo_entrega: "UBER_DIRECT",
    };

    try {
      const resposta = await api.post("/pedidos", pedido);
      navigate(`/pedido/${resposta.data.id}`);
    } catch (erro) {
      console.error("Erro ao criar pedido:", erro);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <Card className="p-4">
        <h2 className="font-semibold mb-4">Endereço de Entrega</h2>
        <input placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} />
        <input placeholder="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
        <input placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
        <input placeholder="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} />
      </Card>

      {/* 📍 NOVO: Componente FreteCalculador */}
      <FreteCalculador
        cepMerchant={enderecoLoja.cep}
        enderecoMerchant={enderecoLoja.endereco}
        cidadeMerchant={enderecoLoja.cidade}
        estadoMerchant={enderecoLoja.estado}
        cepCliente={cep}
        enderecoCliente={endereco}
        cidadeCliente={cidade}
        estadoCliente={estado}
        pedidoId="temp"
        onCotacaoObtida={handleCotacaoObtida}
        onErro={(e) => console.error(e)}
      />

      <Button onClick={handleConfirmar} className="w-full" size="lg">
        Confirmar Pedido
      </Button>
    </div>
  );
};
```

---

## STEP 2: INTEGRAÇÃO NO PAINEL DO LOJISTA

**Arquivo**: `win-frontend/src/pages/merchant/OrderDetails.tsx` ou `win-frontend/src/components/merchant/OrderDetails.tsx`

Este componente exibe os detalhes de um pedido. Quando o status for "PREPARANDO" ou "PRONTO", o lojista vê:
- Botão "Pronto para Retirada"
- Modal com campos de PIN
- Após confirmar: delivery_id + tracking URL

```tsx
import React, { useEffect, useState } from "react";
import { ConfirmarEntrega } from "@/components/merchant/ConfirmarEntrega"; // 👈 NOVO

export const OrderDetails: React.FC = () => {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const [pedido, setPedido] = useState<Pedido | null>(null);

  const handleEntregaConfirmada = async (entrega: {
    delivery_id: string;
    tracking_url: string;
    pin_coleta: string;
    pin_entrega: string;
  }) => {
    await api.patch(`/pedidos/${pedidoId}`, {
      delivery_id: entrega.delivery_id,
      status: "EM_TRANSITO",
    });
    console.log("✅ Entrega confirmada!");
  };

  // ... resto do componente

  return (
    <div>
      {podeMostrarBotaoEntrega && !pedido.delivery_id && (
        <ConfirmarEntrega
          quoteId={pedido.quote_id || ""}
          pedidoId={pedidoId || ""}
          onEntregaConfirmada={handleEntregaConfirmada}
          onErro={(erro) => console.error(erro)}
        />
      )}
    </div>
  );
};
```

---

## STEP 3: INTEGRAÇÃO NA PÁGINA DE RASTREAMENTO

**Arquivo**: `win-frontend/src/pages/OrderStatus.tsx` ou `win-frontend/src/components/orders/OrderStatus.tsx`

```tsx
import { RastreamentoEntrega } from "@/components/orders/RastreamentoEntrega"; // 👈 NOVO

export const OrderStatus: React.FC = () => {
  const { pedidoId } = useParams();
  const [pedido, setPedido] = useState(null);

  return (
    <div>
      {pedido?.delivery_id ? (
        <RastreamentoEntrega
          deliveryId={pedido.delivery_id}
          trackingUrl={pedido.tracking_url}
          onStatusMudou={(novoStatus) => console.log("Status:", novoStatus)}
        />
      ) : (
        <p>Entrega ainda não foi confirmada</p>
      )}
    </div>
  );
};
```

---

## STEP 4: VERIFICAR application.yml (Backend)

Certifique-se que seu `application.yml` tem:

```yaml
app:
  google:
    maps:
      api-key: ${GOOGLE_MAPS_API_KEY:chave-padrao}
  
  uber:
    direct:
      oauth-url: https://auth.uber.com/oauth/v2/token
      api-base-url: https://api.uber.com/v1/customers
      customer-id: ${UBER_CUSTOMER_ID}
      client-id: ${UBER_CLIENT_ID}
      client-secret: ${UBER_CLIENT_SECRET}
      webhook-secret: ${UBER_WEBHOOK_SECRET}

scheduler:
  initial-delay: 60000
  fixed-delay: 43200000
```

---

## STEP 5: FLUXO COMPLETO (Resumo)

### CLIENTE:
1. Vai para Checkout
2. Insere endereço de entrega
3. FreteCalculador calcula automaticamente (60 segundos após endereço completo)
4. Cliente vê: valor_uber + taxa_win + frete_cliente
5. Confirma pedido (quote_id é enviado ao backend)

### BACKEND (POST /pedidos):
1. Recebe quote_id
2. Valida quote_id com Uber
3. Cria Pedido com status = "CONFIRMADO"
4. Retorna pedido_id para cliente

### LOJISTA:
1. Vê novo pedido no painel
2. Prepara o pedido
3. Marca como "PRONTO"
4. Clica "Pronto para Retirada"
5. Insere PIN codes (ou auto-gera)
6. System chama POST /api/v1/uber/deliveries
7. Uber retorna delivery_id + tracking_url

### BACKEND (Webhook):
1. Uber envia eventos de status
2. System atualiza Entrega entity
3. WebSocket notifica cliente em tempo real

### CLIENTE (Rastreamento):
1. Acessa página de pedido
2. RastreamentoEntrega faz polling a cada 30 segundos
3. Vê: barra de progresso + status atual + info do motorista
4. Clica em "Abrir Rastreamento em Tempo Real" para mapa interativo

---

## ✅ Checklist de Implementação

- [ ] React, react-dom, react-router-dom adicionados em `package.json`
- [ ] lucide-react adicionado em `package.json`
- [ ] `npm install` executado
- [ ] FreteCalculador integrado no Checkout
- [ ] ConfirmarEntrega integrado em OrderDetails
- [ ] RastreamentoEntrega integrado em OrderStatus
- [ ] Variáveis de ambiente configuradas (GOOGLE_MAPS_API_KEY, UBER_*)
- [ ] Backend testado com POST /api/v1/uber/deliveries
- [ ] Frontend testado end-to-end
