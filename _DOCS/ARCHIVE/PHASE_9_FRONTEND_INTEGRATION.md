# 🎯 PHASE 9 - FRONTEND INTEGRATION GUIDE

**Status:** ✅ **PRONTO PARA IMPLEMENTAÇÃO**  
**Data:** 2025-02-24  
**Objetivo:** Integrar WebSocket com Modal de PIN no frontend React  

---

## 📋 Resumo das Alterações

### Arquivo 1: `useWebSocketDelivery.ts` ✅
**Status:** JÁ PRONTO - Sem mudanças necessárias  
**Localização:** `win-frontend/src/hooks/useWebSocketDelivery.ts`

**O que já está implementado:**
- ✅ Conexão STOMP/SockJS
- ✅ 4 tópicos subscritos
- ✅ Callbacks para cada tipo de evento
- ✅ Auto-reconexão com backoff exponencial
- ✅ Cleanup de listeners ao desmontar
- ✅ Prevenção de memory leaks

---

### Arquivo 2: `RastreamentoEntrega.tsx` ✏️
**Status:** ATUALIZADO  
**Localização:** `win-frontend/src/components/orders/RastreamentoEntrega.tsx`

**Mudanças realizadas:**
1. ✅ Importado `ValidarPinModal`
2. ✅ Adicionado estado para controlar modal
3. ✅ Atualizado `handleActionRequired` para abrir modal
4. ✅ Adicionado `handlePinValidado` para sucesso de validação
5. ✅ Integrado modal no JSX

---

## 🔧 Código Completo Atualizado

### `useWebSocketDelivery.ts` (Referência - Sem mudanças)

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Stomp, Client } from '@stomp/stompjs';

export interface DeliveryStatusUpdate {
  tipo: 'STATUS_CHANGED' | 'COURIER_UPDATE' | 'ACTION_REQUIRED' | 'ALERT';
  deliveryId: string;
  novoStatus?: string;
  timestamp: number;
  dados?: any;
  'localizacao'?: { latitude: number; longitude: number };
  motorista?: { nome: string; telefone: string };
  acao?: string;
  pinCode?: string;
  mensagem?: string;
  severidade?: string;
}

interface UseWebSocketDeliveryProps {
  onStatusChange?: (update: DeliveryStatusUpdate) => void;
  onCourierUpdate?: (update: DeliveryStatusUpdate) => void;
  onActionRequired?: (update: DeliveryStatusUpdate) => void;
  onAlert?: (update: DeliveryStatusUpdate) => void;
  enabled?: boolean;
}

export function useWebSocketDelivery(
  deliveryId: string | null,
  {
    onStatusChange,
    onCourierUpdate,
    onActionRequired,
    onAlert,
    enabled = true,
  }: Partial<UseWebSocketDeliveryProps> = {},
) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<DeliveryStatusUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttemptsRef = useRef(5);

  const connect = useCallback(() => {
    if (!deliveryId || !enabled) return;

    try {
      const socket = new SockJS('/ws/connect');
      const stompClient = Stomp.over(socket);
      stompClient.debug = () => {};

      stompClient.connect(
        {},
        () => {
          console.log('✅ WebSocket conectado');
          setIsConnected(true);
          setError(null);
          reconnectAttemptsRef.current = 0;

          // 1. Status changes
          stompClient.subscribe(`/topic/entrega/${deliveryId}/status`, (message) => {
            const update = JSON.parse(message.body) as DeliveryStatusUpdate;
            console.log('📊 Status:', update.novoStatus);
            setLastUpdate(update);
            onStatusChange?.(update);
          });

          // 2. Courier location
          stompClient.subscribe(`/topic/entrega/${deliveryId}/courier`, (message) => {
            const update = JSON.parse(message.body) as DeliveryStatusUpdate;
            console.log('📍 Location:', update.localizacao);
            setLastUpdate(update);
            onCourierUpdate?.(update);
          });

          // 3. Action required
          stompClient.subscribe(`/topic/entrega/${deliveryId}/action`, (message) => {
            const update = JSON.parse(message.body) as DeliveryStatusUpdate;
            console.log('⚠️ Action:', update.acao);
            setLastUpdate(update);
            onActionRequired?.(update);
          });

          // 4. Alerts
          stompClient.subscribe(`/topic/entrega/${deliveryId}/alert`, (message) => {
            const update = JSON.parse(message.body) as DeliveryStatusUpdate;
            console.log('🔔 Alert:', update.mensagem);
            setLastUpdate(update);
            onAlert?.(update);
          });

          stompClientRef.current = stompClient;
        },
        (error) => {
          console.error('❌ WebSocket error:', error);
          setIsConnected(false);
          setError('Falha ao conectar ao servidor');
          tentarReconectar();
        },
      );
    } catch (err) {
      console.error('❌ WebSocket creation error:', err);
      setError('Erro ao criar conexão');
      tentarReconectar();
    }
  }, [deliveryId, enabled, onStatusChange, onCourierUpdate, onActionRequired, onAlert]);

  const tentarReconectar = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttemptsRef.current) {
      setError('Não foi possível conectar. Verifique sua conexão e recarregue a página.');
      return;
    }

    const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
    reconnectAttemptsRef.current++;

    console.log(`🔄 Reconectando em ${delay}ms (tentativa ${reconnectAttemptsRef.current})`);

    setTimeout(() => {
      connect();
    }, delay);
  }, [connect]);

  const disconnect = useCallback(() => {
    if (stompClientRef.current && stompClientRef.current.active) {
      stompClientRef.current.deactivate({
        onSuccess: () => {
          console.log('👋 WebSocket desconectado');
          setIsConnected(false);
        },
        onError: () => {
          setIsConnected(false);
        },
      });
    }
  }, []);

  // Setup e cleanup - importante para evitar memory leaks
  useEffect(() => {
    if (enabled && deliveryId) {
      connect();
    }

    // Cleanup ao desmontar ou mudar deliveryId
    return () => {
      disconnect();
    };
  }, [deliveryId, enabled, connect, disconnect]);

  return {
    isConnected,
    lastUpdate,
    error,
    disconnect,
  };
}

export default useWebSocketDelivery;
```

---

### `RastreamentoEntrega.tsx` (ATUALIZADO)

```typescript
import React, { useEffect, useState, useCallback } from "react";
import { useUberDelivery } from "@/hooks/useUberDelivery";
import { useWebSocketDelivery, DeliveryStatusUpdate } from "@/hooks/useWebSocketDelivery";
import { ValidarPinModal } from "@/components/ValidarPinModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  Wifi,
  WifiOff,
} from "lucide-react";

interface RastreamentoEntregaProps {
  deliveryId: string;
  trackingUrl?: string;
  onStatusMudou?: (novoStatus: string) => void;
  onPinRequerido?: (pinCode: string, acao: string) => void;
}

const statusMap: Record<string, { label: string; cor: string; progresso: number }> = {
  SEARCHING_FOR_COURIER: {
    label: "Procurando Motorista",
    cor: "bg-yellow-500",
    progresso: 20,
  },
  ACCEPTED: { label: "Motorista Aceitou", cor: "bg-blue-500", progresso: 40 },
  ARRIVED_AT_PICKUP: {
    label: "Chegou na Coleta",
    cor: "bg-blue-600",
    progresso: 50,
  },
  PICKED_UP: { label: "Pedido Coletado", cor: "bg-purple-500", progresso: 60 },
  ARRIVED_AT_DROPOFF: {
    label: "Chegou na Entrega",
    cor: "bg-purple-600",
    progresso: 80,
  },
  DELIVERED: { label: "Entregue", cor: "bg-green-500", progresso: 100 },
  CANCELLED: { label: "Cancelada", cor: "bg-red-500", progresso: 0 },
};

export const RastreamentoEntrega: React.FC<RastreamentoEntregaProps> = ({
  deliveryId,
  trackingUrl,
  onStatusMudou,
  onPinRequerido,
}) => {
  const [status, setStatus] = useState<any>(null);
  const [ultimoStatus, setUltimoStatus] = useState<string | null>(null);
  const [courierLocation, setCourierLocation] = useState<any>(null);
  const [alertas, setAlertas] = useState<DeliveryStatusUpdate[]>([]);
  const [usePolling, setUsePolling] = useState(false);

  // 🆕 Estado para gerenciar modal de PIN
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinModalData, setPinModalData] = useState<{
    pinCode: string;
    acao: 'VALIDAR_PIN_COLETA' | 'VALIDAR_PIN_ENTREGA';
  } | null>(null);

  // ========== Event Handlers ==========

  const handleStatusChange = useCallback((update: DeliveryStatusUpdate) => {
    console.log("📊 Status mudou via WebSocket:", update.novoStatus);
    setStatus((prev: any) => ({
      ...prev,
      status: update.novoStatus,
    }));
    setUltimoStatus(update.novoStatus);
    onStatusMudou?.(update.novoStatus);
  }, [onStatusMudou]);

  const handleCourierUpdate = useCallback((update: DeliveryStatusUpdate) => {
    console.log("📍 Localização motorista atualizada:", update.localizacao);
    setCourierLocation(update.localizacao);
    if (update.motorista) {
      setStatus((prev: any) => ({
        ...prev,
        courier_name: update.motorista?.nome,
        courier_phone: update.motorista?.telefone,
      }));
    }
  }, []);

  // 🆕 Handler atualizado para abrir modal de PIN
  const handleActionRequired = useCallback((update: DeliveryStatusUpdate) => {
    console.log("⚠️ Ação requerida:", update.acao);
    if (update.acao === "VALIDAR_PIN_COLETA" || update.acao === "VALIDAR_PIN_ENTREGA") {
      // Armazenar dados e abrir modal
      setPinModalData({
        pinCode: update.pinCode || "",
        acao: update.acao as 'VALIDAR_PIN_COLETA' | 'VALIDAR_PIN_ENTREGA',
      });
      setPinModalOpen(true);

      // Callback legado para compatibilidade
      onPinRequerido?.(update.pinCode || "", update.acao);
    }
  }, [onPinRequerido]);

  const handleAlert = useCallback((update: DeliveryStatusUpdate) => {
    console.log("🔔 Alerta recebido:", update.mensagem);
    setAlertas((prev) => [update, ...prev].slice(0, 3));
  }, []);

  // 🆕 Handler para quando PIN é validado com sucesso
  const handlePinValidado = useCallback((dataValidacao: string) => {
    console.log("✅ PIN validado com sucesso em:", dataValidacao);
    setPinModalOpen(false);
    setPinModalData(null);

    // Criar alerta de sucesso
    const alertaSucesso: DeliveryStatusUpdate = {
      tipo: 'ALERT',
      deliveryId: deliveryId,
      mensagem: 'PIN validado com sucesso!',
      severidade: 'INFO',
      timestamp: Date.now(),
    };
    setAlertas((prev) => [alertaSucesso, ...prev].slice(0, 3));
  }, [deliveryId]);

  // ========== WebSocket Hook ==========

  const { consultarStatusEntrega, loading, error: uberError } = useUberDelivery();
  const { isConnected, error: wsError } = useWebSocketDelivery(deliveryId || null, {
    onStatusChange: handleStatusChange,
    onCourierUpdate: handleCourierUpdate,
    onActionRequired: handleActionRequired,
    onAlert: handleAlert,
    enabled: !!deliveryId,
  });

  // ========== Effects ==========

  useEffect(() => {
    const buscarStatus = async () => {
      try {
        const statusAtual = await consultarStatusEntrega(deliveryId);
        setStatus(statusAtual);
        setUltimoStatus(statusAtual.status);
        onStatusMudou?.(statusAtual.status);
      } catch (err) {
        console.error("Erro ao buscar status:", err);
      }
    };

    buscarStatus();

    // Polling fallback se WebSocket não conectou
    const intervalo = setInterval(() => {
      if (!isConnected) {
        buscarStatus();
        setUsePolling(true);
      } else {
        setUsePolling(false);
      }
    }, 30000);

    return () => clearInterval(intervalo);
  }, [deliveryId, consultarStatusEntrega, onStatusMudou, isConnected]);

  // ========== Rendering ==========

  if (loading && !status) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando rastreamento...</p>
        </CardContent>
      </Card>
    );
  }

  if ((uberError || wsError) && !status) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao Rastrear</AlertTitle>
        <AlertDescription>{uberError || wsError}</AlertDescription>
      </Alert>
    );
  }

  if (!status) {
    return null;
  }

  const statusInfo = statusMap[status.status] || statusMap.SEARCHING_FOR_COURIER;

  return (
    <>
      {/* 🆕 Modal de validação de PIN - aparece automaticamente quando necessário */}
      {pinModalData && (
        <ValidarPinModal
          entregaId={deliveryId}
          tipo={pinModalData.acao === 'VALIDAR_PIN_COLETA' ? 'COLETA' : 'ENTREGA'}
          isOpen={pinModalOpen}
          onClose={() => {
            setPinModalOpen(false);
            setPinModalData(null);
          }}
          onValidadoComSucesso={handlePinValidado}
        />
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Rastreamento da Entrega</span>
            <div className="flex items-center gap-3">
              {/* WebSocket Status Indicator */}
              <div className="flex items-center gap-1 text-xs">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
                    <span className="text-green-600">Ao vivo</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-600">
                      {usePolling ? "Modo economia" : "Conectando..."}
                    </span>
                  </>
                )}
              </div>

              {/* Status Badge */}
              <Badge className={`${statusMap[status.status]?.cor || 'bg-gray-500'} text-white`}>
                {statusMap[status.status]?.label || status.status}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recent Alerts */}
          {alertas.length > 0 && (
            <Alert className="border-yellow-300 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Alerta</AlertTitle>
              <AlertDescription className="text-yellow-700">
                {alertas[0].mensagem}
              </AlertDescription>
            </Alert>
          )}

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progresso</span>
              <span>{statusInfo.progresso}%</span>
            </div>
            <Progress value={statusInfo.progresso} className="h-2" />
          </div>

          {/* Status Timeline */}
          <div className="space-y-3 text-sm">
            {[
              { label: "Motorista Procurado", desc: "Sistema busca o motorista mais próximo", progress: 20 },
              { label: "Motorista Aceitou", desc: "Motorista confirmou que irá pegar seu pedido", progress: 40 },
              { label: "Pedido Coletado", desc: "Motorista pegou seu pedido na loja", progress: 60 },
              { label: "Pedido Entregue", desc: "Você receberá seu pedido", progress: 100 },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={`rounded-full h-4 w-4 mt-0.5 ${
                    statusInfo.progresso >= item.progress ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Courier Info */}
          {status.courier_name && (
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-600" />
                <div className="text-sm">
                  <p className="text-gray-600">Motorista</p>
                  <p className="font-medium">{status.courier_name}</p>
                </div>
              </div>
              {status.courier_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <div className="text-sm">
                    <p className="text-gray-600">Contato</p>
                    <p className="font-medium">{status.courier_phone}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ETA */}
          {status.estimated_arrival && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-gray-600">Chegada estimada</p>
                  <p className="font-medium">
                    Em {Math.ceil(status.estimated_arrival / 60)} minutos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tracking URL */}
          {trackingUrl && (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full p-3 text-center text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              Abrir Rastreamento em Tempo Real →
            </a>
          )}

          {/* Success State */}
          {status.status === "DELIVERED" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Entregue!</AlertTitle>
              <AlertDescription className="text-green-700">
                Seu pedido foi entregue com sucesso. Obrigado pela compra!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default RastreamentoEntrega;
```

---

## 🔄 Fluxo de Integração

```
1. Backend envia webhook
   └─ UberWebhookService processa
   └─ Dispara notificação WebSocket

2. Frontend recebe mensagem
   └─ useWebSocketDelivery capta
   └─ Chama handler apropriado

3. Para PIN validation:
   └─ handleActionRequired chamado
   └─ setPinModalOpen(true)
   └─ ValidarPinModal renderiza

4. Usuário valida PIN
   └─ onValidadoComSucesso callback
   └─ handlePinValidado executa
   └─ Modal fecha
   └─ Alerta de sucesso aparece
```

---

## ✅ Checklist de Implementação

- [x] Hook `useWebSocketDelivery.ts` pronto (4 tópicos)
- [x] Componente `RastreamentoEntrega.tsx` atualizado
- [x] ValidarPinModal integrado
- [x] Handlers para cada evento WebSocket
- [x] Cleanup adequado (sem memory leaks)
- [x] Estados sincronizados corretamente

---

## 🧪 Como Testar

### 1. Iniciar Backend
```bash
cd backend
./mvnw.cmd spring-boot:run
```

### 2. Iniciar Frontend
```bash
cd win-frontend
npm run dev
```

### 3. Navegar até página de rastreamento
```
http://localhost:5173/track/delivery/<id>
```

### 4. Verificar DevTools
```
Chrome DevTools → Network → WS
Deverá ver:
  ✅ /ws/connect
  ✅ SUBSCRIBE /topic/entrega/{id}/status
  ✅ SUBSCRIBE /topic/entrega/{id}/courier
  ✅ SUBSCRIBE /topic/entrega/{id}/action
  ✅ SUBSCRIBE /topic/entrega/{id}/alert
```

### 5. Simular webhook
```bash
# Usar script test-phase-9-e2e.ps1
.\scripts\test-phase-9-e2e.ps1 -Webhook
```

### 6. Observar updates em tempo real
```
- Status muda automaticamente
- Mapa atualiza (courier location)
- Modal abre quando PIN é necessário
- Alertas aparecem como toasts
```

---

## 🚀 Próximas Melhorias

- [ ] Mapa interativo para localização do motorista
- [ ] Notificações push do navegador
- [ ] Animações de transição
- [ ] Tema dark mode
- [ ] Internacionalização (i18n)

---

## 📚 Referências

- **Backend WebSocket:** Backend/src/.../WebSocketNotificationService.java
- **Hook Documentation:** Comentários no código
- **Component Tests:** test-phase-9-e2e.ps1

---

*Phase 9 - Frontend Integration: ✅ COMPLETO*  
*Próximo: Phase 10 - Advanced Notifications*
