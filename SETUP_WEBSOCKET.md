# 📡 WebSocket Real-time Tracking - Guia de Setup

## Dependências Necessárias (Frontend)

O frontend precisa de bibliotecas WebSocket para comunicação em tempo real. Adicione ao `package.json`:

```bash
npm install sockjs-client @stomp/stompjs
npm install --save-dev @types/sockjs-client @types/stompjs
```

Ou com Yarn:

```bash
yarn add sockjs-client @stomp/stompjs
yarn add --dev @types/sockjs-client @types/stompjs
```

## Backend Dependências

O backend já tem o Spring WebSocket incluído no Spring Boot. Verifique se tem no `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

Se não tiver, adicione!

## Configuração de Ambiente

Adicione ao `.env` do frontend (se usar variáveis de ambiente):

```env
VITE_WS_URL=ws://localhost:8080/ws/connect
VITE_API_BASE_URL=http://localhost:8080/api
```

## Componentes & Hooks Implementados

### 1. Backend Services

- **WebSocketConfig.java** - Configuração WebSocket com STOMP
- **WebSocketNotificationService.java** - Serviço de notificação para clientes
- **UberWebhookService.java** - Integração de eventos Uber no WebSocket

### 2. Frontend Hooks

- **useWebSocketDelivery.ts** - Hook para conexão WebSocket e escuta de eventos

### 3. Frontend Components

- **RastreamentoEntrega.tsx** - Componente atualizado com suporte WebSocket

## Fluxo de Dados (Tempo Real)

```
Uber API 
  ↓
UberWebhookController (recebe evento)
  ↓
UberWebhookService (processa evento)
  ↓
WebSocketNotificationService (envia para clientes)
  ↓
RastreamentoEntrega (React) recebe via WebSocket
  ↓
UI atualiza em tempo real ✨
```

## Topics WebSocket Disponíveis

```
/topic/entrega/{deliveryId}/status       → Mudança de status
/topic/entrega/{deliveryId}/courier      → Atualização de localização
/topic/entrega/{deliveryId}/action       → Ação requerida (validação PIN)
/topic/entrega/{deliveryId}/alert        → Alertas importantes
```

## Exemplo de Uso no Componente

```tsx
const { isConnected, lastUpdate } = useWebSocketDelivery(deliveryId, {
  onStatusChange: (update) => {
    console.log('Novo status:', update.novoStatus);
    // Atualizar UI
  },
  onCourierUpdate: (update) => {
    console.log('Localização:', update.localizacao);
    // Atualizar mapa
  },
  onActionRequired: (update) => {
    if (update.acao === 'VALIDAR_PIN_COLETA') {
      // Mostrar modal de validação
    }
  },
});

return (
  <div>
    {isConnected ? (
      <span className="text-green-600">🟢 Conectado</span>
    ) : (
      <span className="text-yellow-600">🟡 Reconectando...</span>
    )}
  </div>
);
```

## CORS & Segurança

Para permitir conexões WebSocket do frontend, o backend está configurado com:

```java
.setAllowedOrigins("*")  // TODO: Remover "*" em produção!
```

**⚠️ Em Produção:**

```java
.setAllowedOrigins("https://seu-dominio.com")
```

## Troubleshooting

**Conexão WebSocket não funciona:**

1. Verifique se o backend está rodando em `http://localhost:8080`
2. Teste a URL: `http://localhost:8080/ws/connect/info` (deve retornar 200)
3. Verifique se o SockJS endpoint está respondendo
4. Procure por erros no console do navegador (DevTools → Console)

**Mensagens não chegam:**

1. Verifique se o delivery_id está correto
2. Procure por logs no backend: `tail -f logs/app.log | grep WebSocket`
3. Teste o webhook manualmente com curl:

```bash
curl -X POST http://localhost:8080/api/v1/webhooks/uber \
  -H "Content-Type: application/json" \
  -H "X-Uber-Signature: test" \
  -d '{"deliveryId":"123","status":"SEARCHING_FOR_COURIER"}'
```

**Reconexão contínua (loop):**

1. Verifique a configuração CORS do backend
2. Aumente o `maxReconnectAttempts` no hook se necessário
3. Teste com Dev Tools → Network para ver erros de conexão

## Próximos Passos

Após WebSocket funcionar, implementar:

1. **Mapa em tempo real** - Mostrar localização do motorista com Google Maps
2. **Notificações Push** - Alertar cliente quando motorista chegar
3. **Tracking via QR Code** - Link de rastreamento para cliente compartilhar
4. **PIN Code Validation** - UI para validar PIN de coleta/entrega

---

**✅ WebSocket deve estar 100% funcional após seguir este guia!**
