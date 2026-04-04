# ✅ Checklist de Integração e Guia de Manutenção

---

## 📋 CHECKLIST DE VERIFICAÇÃO (PRÉ-PRODUÇÃO)

### ✅ Funcionalidades Implementadas

#### Frete Dinâmico
- [x] Geocodificação de endereços
- [x] Cotação com API Uber
- [x] Cálculo de taxa Win (10%)
- [x] Armazenamento de quoteId
- [x] Estimativa rápida por CEP
- [x] Verificação de primeira compra
- [x] Cache de fretes calculados

#### Entrega (Uber Direct)
- [x] Geração de PIN codes
- [x] Criação de delivery
- [x] Rastreamento em tempo real (polling)
- [x] Display de tracking URL
- [x] Informações do motorista
- [x] Status em múltiplos estágios

#### Checkout
- [x] Formulário de endereço
- [x] Integração com PIX (Pagar.me)
- [x] Integração com Cartão (Mercado Pago)
- [x] Integração com Boleto
- [x] Modo reprocessamento (pedido existente)
- [x] Validação de dados
- [x] Cálculo de totais

#### Frontend UX
- [x] Componentes reutilizáveis
- [x] Indicadores de loading
- [x] Mensagens de erro
- [x] Notificações de sucesso
- [x] Responsividade mobile
- [x] Acessibilidade básica

---

### ⚠️ Itens para Verificação Antes de Deploy

#### Segurança
- [ ] **CPF mascarado** em exibição de dados
- [ ] **PIN codes** nunca logados em console
- [ ] **quoteId** válido apenas para 1 pedido
- [ ] **HTTPS** em produção (comunicação API)
- [ ] **CORS** configurado corretamente
- [ ] **Validação** de entrada em todos os formulários
- [ ] **Sanitização** de dados antes de enviar à API

#### Performance
- [ ] **Lazy loading** de componentes pesados
- [ ] **Memoização** de componentes (React.memo)
- [ ] **Debounce** em buscas de endereço
- [ ] **Cache** de cotações por CEP
- [ ] **Compressão** de imagens
- [ ] **Bundle size** otimizado

#### Testes
- [ ] **Testes unitários** do hook useUberDelivery
- [ ] **Testes** dos componentes principais
- [ ] **Testes E2E** do fluxo de checkout
- [ ] **Testes** de tratamento de erros
- [ ] **Testes** de casos extremos (sem conexão, timeout)

#### Compatibilidade
- [ ] **Testes** em Chrome, Firefox, Safari, Edge
- [ ] **Testes** em mobile (iOS, Android)
- [ ] **Testes** em navegadores antigos (IE11 se necessário)
- [ ] **Testes** de acessibilidade (WCAG 2.1 AA)

#### Documentação
- [ ] **README** atualizado com instruções
- [ ] **JSDoc** em funções públicas
- [ ] **Tipos TypeScript** definidos
- [ ] **API docs** atualizada

#### Monitoramento
- [ ] **Error tracking** configurado (Sentry/similar)
- [ ] **Analytics** para eventos principais
- [ ] **Logs** estruturados
- [ ] **Alertas** para falhas críticas

---

## 🐛 TROUBLESHOOTING COMUM

### Problema: Frete não calcula

**Causa Provável:** Endereço sem coordenadas

```typescript
// Verificar em Checkout.tsx
if (!endTemp || !endTemp.latitude || !endTemp.longitude) {
  console.warn('⚠️ Endereço sem coordenadas');
  // Limpar e solicitar endereço completo
}
```

**Solução:**
```typescript
// 1. Verificar se endereço foi geocodificado no backend
const response = await api.get(`/v1/enderecos/${id}`);
console.log('Latitude:', response.data.latitude);
console.log('Longitude:', response.data.longitude);

// 2. Se vazio, chamar endpoint de geocoding
const geocoded = await api.post('/v1/geocoding/endereco', {
  cep: '01234567',
  endereco: 'Rua X, 123, São Paulo, SP'
});
```

---

### Problema: QuoteId inválido na criação de delivery

**Causa Provável:** Quote expirou ou foi usado 2x

**Uber Quote TTL:** ~15 minutos

**Solução:**
```typescript
// Em ConfirmarEntrega.tsx
// 1. Validar que quoteId ainda é válido
try {
  const response = await api.get(`/v1/uber/quotes/${quoteId}/status`);
  if (response.data.expirou) {
    // Regenerar quote
    const novaQuote = await solicitarCotacao(...);
    setQuoteId(novaQuote.quote_id);
  }
} catch (err) {
  // Quote inválido
  showError('Quote expirou', 'Calcule o frete novamente');
}
```

---

### Problema: Status de entrega não atualiza

**Causa Provável:** Polling parado ou intervalo muito grande

**Solução:**
```typescript
// Em RastreamentoEntrega.tsx
// Aumentar frequência de polling em testes
useEffect(() => {
  const intervalo = setInterval(buscarStatus, 5000); // 5s em dev
  return () => clearInterval(intervalo);
}, []);

// Verificar se o delivery existe na Uber
// GET /deliveries/{id} retorna 404?
```

---

### Problema: PIN codes não aparecem

**Causa Provável:** Geração falhou silenciosamente

**Solução:**
```typescript
// Em ConfirmarEntrega.tsx
const handleGerarPins = async () => {
  try {
    console.log('Gerando PINs...');
    const pin1 = await gerarPinCode();
    console.log('PIN 1:', pin1); // Debug
    const pin2 = await gerarPinCode();
    console.log('PIN 2:', pin2); // Debug
    
    if (!pin1 || !pin2) {
      throw new Error('API retornou PIN vazio');
    }
    
    setPinColeta(pin1);
    setPinEntrega(pin2);
  } catch (err) {
    console.error('Erro detalhado:', err);
    showError('Erro ao gerar PIN', err.message);
  }
};
```

---

## 🔧 COMO ESTENDER O CÓDIGO

### Adicionar Novo Método de Pagamento

**Passo 1:** Criar novo serviço em `lib/api/paymentMethodsApi.ts`
```typescript
export const processarPix = async (pedidoId: string, dadosPix: DadosPix) => {
  return api.post(`/v1/pagamentos/pagarme/pix/${pedidoId}`, dadosPix);
};
```

**Passo 2:** Adicionar tipo para dados
```typescript
export interface DadosPix {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
}
```

**Passo 3:** Integrar em Checkout.tsx
```typescript
if (paymentMethod === "novo_metodo") {
  const resultado = await novoMetodoApi.processar(...);
  navigate(`/pagamento/novo/${pedidoId}`, { state: { resultado } });
}
```

---

### Adicionar Campo Customizado de Nota de Entrega

**Passo 1:** Estender interface em hook
```typescript
// useUberDelivery.ts
const notasEntrega = "Deixar no portão se não atender";

const criarEntrega = useCallback(
  async (
    ...params,
    notasEntrega?: string  // NOVO
  ) => {
    // ...
    const payload = {
      // ...
      dropoff_notes: notasEntrega || "",
      // ...
    };
  }
);
```

**Passo 2:** Adicionar campo no componente
```typescript
// ConfirmarEntrega.tsx
const [notasEntrega, setNotasEntrega] = useState('');

// Em JSX
<textarea
  value={notasEntrega}
  onChange={(e) => setNotasEntrega(e.target.value)}
  placeholder="Ex: Deixar no portão, apto 502"
  maxLength={200}
/>

// Na chamada
const resultado = await criarEntrega(
  ...,
  notasEntrega  // NOVO
);
```

---

### Implementar Webhooks no Frontend

**Propósito:** Substituir polling por eventos em tempo real

**Passo 1:** Criar WebSocketContext
```typescript
// contexts/WebSocketContext.tsx
import { createContext, useContext, useEffect, useRef } from 'react';

interface WebSocketContextType {
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
  emit: (event: string, data: any) => void;
}

export const useWebSocket = () => useContext(WebSocketContext);
```

**Passo 2:** Implementar conexão
```typescript
export const WebSocketProvider = ({ children }) => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Conectar ao servidor WebSocket
    wsRef.current = new WebSocket(
      `${process.env.REACT_APP_WS_URL}/deliveries`
    );

    wsRef.current.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      // Emitir eventos para listeners
      listeners[type]?.forEach(cb => cb(data));
    };

    return () => wsRef.current?.close();
  }, []);

  return (
    <WebSocketContext.Provider value={{ on, off, emit }}>
      {children}
    </WebSocketContext.Provider>
  );
};
```

**Passo 3:** Usar em RastreamentoEntrega
```typescript
export const RastreamentoEntrega = ({ deliveryId }) => {
  const ws = useWebSocket();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Em vez de polling:
    ws.on(`delivery:${deliveryId}:status`, (novoStatus) => {
      setStatus(novoStatus);
    });

    return () => ws.off(`delivery:${deliveryId}:status`, null);
  }, [deliveryId, ws]);

  // Renderizar...
};
```

---

### Adicionar Mapa de Rastreamento

**Passo 1:** Instalar bibliotecas
```bash
npm install @react-google-maps/api
# ou
npm install react-map-gl
```

**Passo 2:** Criar componente
```typescript
// components/maps/RastreamentoMapa.tsx
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

export const RastreamentoMapa = ({ 
  lojista: { lat, lon },
  cliente: { lat, lon },
  motorista: { lat, lon }
}) => {
  return (
    <GoogleMap>
      {/* Marker lojista */}
      <Marker
        position={{ lat: lojista.lat, lng: lojista.lon }}
        label="Lojista"
        icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      />

      {/* Marker cliente */}
      <Marker
        position={{ lat: cliente.lat, lng: cliente.lon }}
        label="Cliente"
        icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
      />

      {/* Marker motorista (animado) */}
      <Marker
        position={{ lat: motorista.lat, lng: motorista.lon }}
        label="Motorista"
        icon="http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
      />

      {/* Polyline de rota */}
      <Polyline
        path={[
          { lat: lojista.lat, lng: lojista.lon },
          { lat: motorista.lat, lng: motorista.lon },
          { lat: cliente.lat, lng: cliente.lon }
        ]}
        options={{
          strokeColor: '#3DBEAB',
          strokeOpacity: 0.7,
          geodesic: true
        }}
      />
    </GoogleMap>
  );
};
```

**Passo 3:** Integrar em RastreamentoEntrega
```typescript
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>
    {/* Info status */}
  </div>
  <div>
    {/* Mapa */}
    <RastreamentoMapa {...coordenadas} />
  </div>
</div>
```

---

### Implementar Cancelamento de Entrega

**Passo 1:** Adicionar método em hook
```typescript
// useUberDelivery.ts
const cancelarEntrega = useCallback(
  async (deliveryId: string, motivo: string = "CUSTOMER_INITIATED") => {
    try {
      setLoading(true);
      const response = await api.post(
        `/v1/uber/deliveries/${deliveryId}/cancel`,
        { motivo }
      );
      // Retorna informações de reembolso
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  },
  []
);

export const useUberDelivery = () => ({
  // ... outros métodos
  cancelarEntrega
});
```

**Passo 2:** Criar componente
```typescript
// components/orders/CancelarEntrega.tsx
export const CancelarEntrega = ({ deliveryId, onCancelado }) => {
  const { cancelarEntrega, loading } = useUberDelivery();
  const [motivo, setMotivo] = useState('');

  const handleCancelar = async () => {
    if (!confirm('Deseja cancelar esta entrega?')) return;

    try {
      const resultado = await cancelarEntrega(deliveryId, motivo);
      success('Entrega cancelada', 'Reembolso será processado em 24h');
      onCancelado?.(resultado);
    } catch (err) {
      error('Erro ao cancelar', err.message);
    }
  };

  return (
    <Dialog>
      <input
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="Motivo do cancelamento (opcional)"
      />
      <Button onClick={handleCancelar} disabled={loading}>
        Cancelar Entrega
      </Button>
    </Dialog>
  );
};
```

**Passo 3:** Integrar em página de detalhes do pedido
```typescript
<CancelarEntrega 
  deliveryId={delivery.id} 
  onCancelado={() => navigate('/orders')}
/>
```

---

## 📈 MÉTRICAS E MONITORAMENTO

### Eventos Importantes para Rastrear

```typescript
// analytics.ts
export enum DeliveryEvents {
  // Frete
  FRETE_CALCULADO = 'frete_calculado',
  FRETE_ERRO = 'frete_erro',
  
  // Checkout
  CHECKOUT_INICIADO = 'checkout_iniciado',
  CHECKOUT_COMPLETADO = 'checkout_completado',
  CHECKOUT_PAGAMENTO_FALHOU = 'checkout_pagamento_falhou',
  
  // Entrega
  ENTREGA_CRIADA = 'entrega_criada',
  ENTREGA_Status_MUDOU = 'entrega_status_mudou',
  ENTREGA_COMPLETADA = 'entrega_completada',
  ENTREGA_CANCELADA = 'entrega_cancelada',
  
  // Erros
  UBER_API_ERRO = 'uber_api_erro',
  GEOCODING_ERRO = 'geocoding_erro'
}

// Implementação
export const rastrearEvento = (evento: DeliveryEvents, dados?: any) => {
  if (window.gtag) {
    gtag('event', evento, dados);
  }
  
  if (window.Sentry) {
    Sentry.captureMessage(evento, 'info', { extra: dados });
  }
};

// Uso
rastrearEvento(DeliveryEvents.FRETE_CALCULADO, {
  quoteId: cotacao.quote_id,
  valor: cotacao.frete_cliente,
  tempo: cotacao.tempo_entrega_min
});
```

### Alertas Críticos

```typescript
// Quando enviar alerta para ops
export const alertarOps = (severidade: 'critical' | 'warning', mensagem: string) => {
  if (window.Sentry) {
    Sentry.captureMessage(mensagem, severidade === 'critical' ? 'fatal' : 'warning');
  }

  // Chamar webhook de Slack
  if (severidade === 'critical') {
    api.post('/admin/alerts/slack', {
      mensagem,
      timestamp: new Date(),
      url: window.location.href
    });
  }
};

// Exemplos de situações críticas
alertarOps('critical', 'Uber Direct API indisponível');
alertarOps('critical', 'Taxa de falha de frete > 10%');
alertarOps('warning', 'Latência de API > 2 segundos');
```

---

## 🚀 ROADMAP FUTURO

### Q2 2026
- [ ] Webhooks em tempo real (substituir polling)
- [ ] Mapa de rastreamento integrado
- [ ] Cancelamento de entrega com reembolso
- [ ] Notificações push para cliente

### Q3 2026
- [ ] IA para recomendação de horário de entrega
- [ ] Rastreamento de multiplos motoristas
- [ ] Integração com mais transportadoras
- [ ] Análise de dados de entrega

### Q4 2026
- [ ] Mobile app nativa
- [ ] Histórico completo com análise
- [ ] Sugestões automáticas de melhoria de frete
- [ ] Integração com sistema de avaliações

---

## 📞 SUPORTE E COMPATIBILIDADE

### Versões Suportadas

```json
{
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.0.0",
  "axios": "^1.0.0",
  "react-router-dom": "^6.0.0"
}
```

### Navegadores Suportados

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Android Chrome 90+

### Ambientes

```
Desenvolvimento: localhost:5173
Staging: https://staging.winmarketplace.com
Produção: https://www.winmarketplace.com
```

---

**Última atualização:** 24/03/2026  
**Responsável:** Engineering Team  
**Versão:** 1.0
