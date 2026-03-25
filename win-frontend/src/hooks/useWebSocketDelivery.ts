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

/**
 * Hook customizado para WebSocket em tempo real do rastreamento de entrega
 * 
 * Funcionalidades:
 * - Conecta ao servidor WebSocket para receber atualizações de entrega
 * - Escuta múltiplos eventos (status, localização motorista, alertas, ações)
 * - Auto-reconexão com retry exponencial
 * - Cleanup automático ao desmontar componente
 * - Callbacks para cada tipo de evento
 * 
 * Exemplo:
 * ```tsx
 * const { isConnected, lastUpdate } = useWebSocketDelivery(deliveryId, {
 *   onStatusChange: (update) => {
 *     console.log('Novo status:', update.novoStatus);
 *   },
 *   onCourierUpdate: (update) => {
 *     console.log('Localização:', update.localizacao);
 *   },
 *   onActionRequired: (update) => {
 *     if (update.acao === 'VALIDAR_PIN_COLETA') {
 *       // Mostrar modal para validação de PIN
 *     }
 *   }
 * });
 * ```
 * 
 * @param deliveryId ID da entrega (corrida na Uber)
 * @param callbacks Funções de callback para diferentes eventos
 * @param enabled Se deve conectar ao WebSocket (default: true)
 * @returns { isConnected, lastUpdate, disconnect, error }
 */
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

  // Conectar ao WebSocket
  const connect = useCallback(() => {
    if (!deliveryId || !enabled) return;

    try {
      // Usar SockJS como fallback para browsers antigos
      const socket = new SockJS('/ws/connect');
      const stompClient = Stomp.over(socket);

      // Desabilitar logs verbosos
      stompClient.debug = () => {};

      stompClient.connect(
        {},
        () => {
          console.log('✅ WebSocket conectado');
          setIsConnected(true);
          setError(null);
          reconnectAttemptsRef.current = 0;

          // 1. Escutar mudanças de status
          stompClient.subscribe(`/topic/entrega/${deliveryId}/status`, (message) => {
            const update = JSON.parse(message.body) as DeliveryStatusUpdate;
            console.log('📊 Atualização de status:', update);
            setLastUpdate(update);
            onStatusChange?.(update);
          });

          // 2. Escutar atualizações de localização do motorista
          stompClient.subscribe(`/topic/entrega/${deliveryId}/courier`, (message) => {
            const update = JSON.parse(message.body) as DeliveryStatusUpdate;
            console.log('📍 Localização do motorista:', update.localizacao);
            setLastUpdate(update);
            onCourierUpdate?.(update);
          });

          // 3. Escutar ações requeridas (PIN codes, confirmações)
          stompClient.subscribe(`/topic/entrega/${deliveryId}/action`, (message) => {
            const update = JSON.parse(message.body) as DeliveryStatusUpdate;
            console.log('⚠️ Ação requerida:', update.acao);
            setLastUpdate(update);
            onActionRequired?.(update);
          });

          // 4. Escutar alertas
          stompClient.subscribe(`/topic/entrega/${deliveryId}/alert`, (message) => {
            const update = JSON.parse(message.body) as DeliveryStatusUpdate;
            console.log('🔔 Alerta:', update.mensagem);
            setLastUpdate(update);
            onAlert?.(update);
          });

          stompClientRef.current = stompClient;
        },
        (error) => {
          console.error('❌ Erro de conexão WebSocket:', error);
          setIsConnected(false);
          setError('Falha ao conectar ao servidor');
          tentarReconectar();
        },
      );
    } catch (err) {
      console.error('❌ Erro ao criar WebSocket:', err);
      setError('Erro ao criar conexão');
      tentarReconectar();
    }
  }, [deliveryId, enabled, onStatusChange, onCourierUpdate, onActionRequired, onAlert]);

  // Tentar reconectar com backoff exponencial
  const tentarReconectar = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttemptsRef.current) {
      setError(
        'Não foi possível conectar. Verifique sua conexão e recarregue a página.',
      );
      return;
    }

    const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
    reconnectAttemptsRef.current++;

    console.log(
      `🔄 Tentando reconectar em ${delay}ms (tentativa ${reconnectAttemptsRef.current})...`,
    );

    setTimeout(() => {
      connect();
    }, delay);
  }, [connect]);

  // Desconectar
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

  // Setup e cleanup
  useEffect(() => {
    if (enabled && deliveryId) {
      connect();
    }

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
