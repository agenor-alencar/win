/**
 * Componente para rastrear entrega em tempo real
 * Exibe localização do motorista, tempo estimado e status
 * 
 * Responsabilidades:
 * - WebSocket em tempo real (eventos instantâneos da Uber)
 * - Fallback para polling se WebSocket falhar
 * - Exibir localização do motorista (mapa)
 * - Mostrar tempo estimado
 * - Exibir informações do motorista (nome, placa)
 * - Validação de PIN codes (Proof of Delivery)
 * 
 * Eventos WebSocket ouvidos:
 * - /topic/entrega/{deliveryId}/status → Mudança de status
 * - /topic/entrega/{deliveryId}/courier → Atualização de localização do motorista
 * - /topic/entrega/{deliveryId}/action → Ação requerida (validação de PIN)
 * - /topic/entrega/{deliveryId}/alert → Alertas importantes
 */

import React, { useEffect, useState, useCallback } from "react";
import { useUberDelivery } from "@/hooks/useUberDelivery";
import { useWebSocketDelivery, DeliveryStatusUpdate } from "@/hooks/useWebSocketDelivery";
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

  // Handlers de eventos WebSocket
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

  const handleActionRequired = useCallback((update: DeliveryStatusUpdate) => {
    console.log("⚠️ Ação requerida:", update.acao);
    if (update.acao === "VALIDAR_PIN_COLETA" || update.acao === "VALIDAR_PIN_ENTREGA") {
      onPinRequerido?.(update.pinCode || "", update.acao);
    }
  }, [onPinRequerido]);

  const handleAlert = useCallback((update: DeliveryStatusUpdate) => {
    console.log("🔔 Alerta recebido:", update.mensagem);
    setAlertas((prev) => [update, ...prev].slice(0, 3)); // Guardar últimos 3 alertas
  }, []);

  const { consultarStatusEntrega, loading, error: uberError } = useUberDelivery();
  const { isConnected, error: wsError } = useWebSocketDelivery(deliveryId || null, {
    onStatusChange: handleStatusChange,
    onCourierUpdate: handleCourierUpdate,
    onActionRequired: handleActionRequired,
    onAlert: handleAlert,
    enabled: !!deliveryId,
  });

  // Buscar status inicial e fazer polling como fallback
  useEffect(() => {
    const buscarStatus = async () => {
      try {
        const statusAtual = await consultarStatusEntrega(deliveryId);
        setStatus(statusAtual);
        setUltimoStatus(statusAtual.status);

        if (onStatusMudou) {
          onStatusMudou(statusAtual.status);
        }
      } catch (err) {
        console.error("Erro ao buscar status:", err);
      }
    };

    // Buscar imediatamente
    buscarStatus();

    // Se WebSocket não está conectado, usar polling a cada 30 segundos
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
        <AlertDescription>
          {uberError || wsError}
        </AlertDescription>
      </Alert>
    );
  }

  if (!status) {
    return null;
  }

  const statusInfo = statusMap[status.status] || statusMap.SEARCHING_FOR_COURIER;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Rastreamento da Entrega</span>
          <div className="flex items-center gap-3">
            {/* Indicador de conectividade WebSocket */}
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

            {/* Badge de status */}
            <Badge className={`${statusMap[status.status]?.cor || 'bg-gray-500'} text-white`}>
              {statusMap[status.status]?.label || status.status}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alertas reciados via WebSocket */}
        {alertas.length > 0 && (
          <Alert className="border-yellow-300 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Alerta</AlertTitle>
            <AlertDescription className="text-yellow-700">
              {alertas[0].mensagem}
            </AlertDescription>
          </Alert>
        )}
        {/* Barra de Progresso */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso</span>
            <span>{statusInfo.progresso}%</span>
          </div>
          <Progress value={statusInfo.progresso} className="h-2" />
        </div>

        {/* Timeline de Status */}
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div
              className={`rounded-full h-4 w-4 mt-0.5 ${
                statusInfo.progresso >= 20
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            ></div>
            <div>
              <p className="font-medium">Motorista Procurado</p>
              <p className="text-xs text-gray-600">
                Sistema busca o motorista mais próximo
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`rounded-full h-4 w-4 mt-0.5 ${
                statusInfo.progresso >= 40
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            ></div>
            <div>
              <p className="font-medium">Motorista Aceitou</p>
              <p className="text-xs text-gray-600">
                Motorista confirmou que irá pegar seu pedido
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`rounded-full h-4 w-4 mt-0.5 ${
                statusInfo.progresso >= 60
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            ></div>
            <div>
              <p className="font-medium">Pedido Coletado</p>
              <p className="text-xs text-gray-600">
                Motorista pegou seu pedido na loja
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`rounded-full h-4 w-4 mt-0.5 ${
                statusInfo.progresso >= 100
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            ></div>
            <div>
              <p className="font-medium">Pedido Entregue</p>
              <p className="text-xs text-gray-600">
                Você receberá seu pedido
              </p>
            </div>
          </div>
        </div>

        {/* Informações do Motorista (se disponível) */}
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

        {/* Tempo Estimado */}
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

        {/* Link de Rastreamento Externo */}
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

        {/* Status Completado */}
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
  );
};
