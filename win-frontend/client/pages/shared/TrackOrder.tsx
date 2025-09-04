import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
} from "lucide-react";
import Header from "../../components/Header";

interface TrackingEvent {
  date: string;
  time: string;
  status: string;
  description: string;
  location?: string;
}

const mockTrackingData: TrackingEvent[] = [
  {
    date: "15/01/2024",
    time: "14:30",
    status: "entregue",
    description: "Pedido entregue ao destinatário",
    location: "São Paulo, SP",
  },
  {
    date: "15/01/2024",
    time: "10:15",
    status: "saiu_entrega",
    description: "Saiu para entrega",
    location: "Centro de Distribuição - São Paulo",
  },
  {
    date: "14/01/2024",
    time: "16:45",
    status: "transporte",
    description: "Em transporte para o centro de distribuição",
    location: "São Paulo, SP",
  },
  {
    date: "14/01/2024",
    time: "09:20",
    status: "processando",
    description: "Pedido em preparação",
    location: "Loja do João - Centro",
  },
  {
    date: "13/01/2024",
    time: "18:30",
    status: "confirmado",
    description: "Pedido confirmado e pagamento aprovado",
    location: "Sistema WIN",
  },
];

export default function TrackOrder() {
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingResult, setTrackingResult] = useState<TrackingEvent[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setTrackingResult(mockTrackingData);
      setIsLoading(false);
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "entregue":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "saiu_entrega":
        return <Truck className="h-5 w-5 text-blue-600" />;
      case "transporte":
        return <Package className="h-5 w-5 text-yellow-600" />;
      case "processando":
        return <Clock className="h-5 w-5 text-orange-600" />;
      case "confirmado":
        return <CheckCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "entregue":
        return <Badge className="bg-green-100 text-green-800">Entregue</Badge>;
      case "saiu_entrega":
        return (
          <Badge className="bg-blue-100 text-blue-800">Saiu para Entrega</Badge>
        );
      case "transporte":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Em Transporte</Badge>
        );
      case "processando":
        return (
          <Badge className="bg-orange-100 text-orange-800">Preparando</Badge>
        );
      case "confirmado":
        return <Badge className="bg-gray-100 text-gray-800">Confirmado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rastrear Pedido
          </h1>
          <p className="text-gray-600">
            Digite o código de rastreamento para acompanhar seu pedido
          </p>
        </div>

        {/* Tracking Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Buscar Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tracking">
                  Código de Rastreamento ou Número do Pedido
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="tracking"
                    placeholder="Ex: WIN123456789 ou #12345"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Buscando..." : "Rastrear"}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                O código de rastreamento foi enviado por email ou pode ser
                encontrado em "Meus Pedidos"
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Tracking Results */}
        {trackingResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pedido #12345</CardTitle>
                {getStatusBadge(trackingResult[0].status)}
              </div>
              <div className="text-sm text-gray-500">
                Código: WIN123456789 • Previsão: Hoje até 18h
              </div>
            </CardHeader>
            <CardContent>
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">
                      Destinatário
                    </h4>
                    <p className="text-sm">João Silva</p>
                    <p className="text-sm text-gray-500">
                      Rua das Flores, 123 - Centro
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">
                      Entregador
                    </h4>
                    <p className="text-sm">Carlos Moto</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-3 w-3 mr-1" />
                      (11) 99999-9999
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">
                      Produtos
                    </h4>
                    <p className="text-sm">Parafuso Phillips 3x20mm (2x)</p>
                    <p className="text-sm text-gray-500">Total: R$ 25,90</p>
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">
                  Histórico de Movimentação
                </h4>
                <div className="relative">
                  {trackingResult.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 pb-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-white border-2 border-gray-200 rounded-full">
                          {getStatusIcon(event.status)}
                        </div>
                        {index < trackingResult.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">
                            {event.description}
                          </p>
                          <span className="text-sm text-gray-500">
                            {event.date} às {event.time}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button variant="outline" className="flex-1">
                  Ver Detalhes do Pedido
                </Button>
                <Button variant="outline" className="flex-1">
                  Entrar em Contato
                </Button>
                <Button className="flex-1">
                  Acompanhar no Mapa
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Precisa de Ajuda?</h3>
          <p className="text-gray-600 mb-4">
            Não consegue encontrar seu pedido ou tem alguma dúvida?
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline">Central de Ajuda</Button>
            <Button variant="outline">Chat Online</Button>
            <Button variant="outline">WhatsApp: (11) 3000-0000</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
