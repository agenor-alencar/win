import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Package,
  RotateCcw,
  Clock,
  CheckCircle,
  Truck,
  Camera,
  CreditCard,
  AlertCircle,
  FileText,
  MapPin,
} from "lucide-react";
import Header from "../../components/Header";
import { useNotification } from "../../contexts/NotificationContext";

// Mock data
const returnableOrders = [
  {
    id: "WIN001",
    date: "2024-01-10",
    items: [
      {
        id: 1,
        name: "Parafuso Phillips 3x20mm - Pacote com 100 unidades",
        price: 12.5,
        quantity: 2,
        image: "/placeholder.svg",
        store: "Ferragens Silva",
        returnable: true,
        returnDeadline: "2024-01-17",
      },
    ],
    total: 25.0,
    canReturn: true,
  },
  {
    id: "WIN002",
    date: "2024-01-08",
    items: [
      {
        id: 2,
        name: "Furadeira de Impacto 650W",
        price: 189.9,
        quantity: 1,
        image: "/placeholder.svg",
        store: "Ferramentas Pro",
        returnable: true,
        returnDeadline: "2024-01-15",
      },
    ],
    total: 189.9,
    canReturn: false, // Prazo expirado
  },
];

const activeReturns = [
  {
    id: "DEV001",
    orderId: "WIN003",
    item: {
      name: "Martelo de Unha 500g",
      image: "/placeholder.svg",
      store: "Ferragens Silva",
    },
    reason: "Produto com defeito",
    status: "em_analise",
    requestDate: "2024-01-14",
    photos: ["/placeholder.svg"],
    expectedResponse: "2024-01-16",
  },
  {
    id: "DEV002",
    orderId: "WIN004",
    item: {
      name: "Chave de Fenda 6mm",
      image: "/placeholder.svg",
      store: "Ferragens Silva",
    },
    reason: "Arrependimento da compra",
    status: "aprovado",
    requestDate: "2024-01-12",
    approvedDate: "2024-01-13",
    deliveryFee: 8.5,
    photos: ["/placeholder.svg"],
  },
];

export default function Returns() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [showNewReturn, setShowNewReturn] = useState(false);
  const { success, error: notifyError } = useNotification();

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "em_analise":
        return {
          label: "Em Análise",
          color: "#F59E0B",
          bg: "#FFF7ED",
          icon: Clock,
        };
      case "aprovado":
        return {
          label: "Aprovado",
          color: "#10B981",
          bg: "#F0FDF4",
          icon: CheckCircle,
        };
      case "retirada_agendada":
        return {
          label: "Retirada Agendada",
          color: "#2D9CDB",
          bg: "#F0F9FF",
          icon: Truck,
        };
      case "entregue_loja":
        return {
          label: "Entregue à Loja",
          color: "#8B5CF6",
          bg: "#F5F3FF",
          icon: Package,
        };
      case "concluido":
        return {
          label: "Concluído",
          color: "#10B981",
          bg: "#F0FDF4",
          icon: CheckCircle,
        };
      case "recusado":
        return {
          label: "Recusado",
          color: "#EF4444",
          bg: "#FEF2F2",
          icon: AlertCircle,
        };
      default:
        return {
          label: "Desconhecido",
          color: "#666666",
          bg: "#F8F9FA",
          icon: Package,
        };
    }
  };

  const handleSubmitReturn = () => {
    if (!selectedItem || !returnReason || !returnDescription) {
      notifyError(
        "Campos obrigatórios",
        "Preencha todos os campos necessários",
      );
      return;
    }

    success(
      "Devolução solicitada!",
      "Sua solicitação foi enviada para análise da loja",
    );
    setShowNewReturn(false);
    setSelectedOrder(null);
    setSelectedItem(null);
    setReturnReason("");
    setReturnDescription("");
    setPhotos([]);
  };

  const requestDriver = (returnId: string, fee: number) => {
    success(
      "Motorista solicitado!",
      `Taxa de R$ ${fee.toFixed(2).replace(".", ",")} será cobrada`,
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showCategories={false} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <RotateCcw className="h-8 w-8 mr-3 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Devoluções e Trocas
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie suas solicitações de devolução
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowNewReturn(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Nova Devolução
          </Button>
        </div>

        {/* Policy Card */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Política de Devolução
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Produtos com defeito ou arrependimento podem ser
                    devolvidos em até 7 dias
                  </li>
                  <li>
                    • Produtos devem estar lacrados e na embalagem original
                  </li>
                  <li>• Devolução sujeita à aprovação da loja vendedora</li>
                  <li>
                    • Cliente paga o frete de volta, exceto em casos de defeito
                    de fábrica
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Returns */}
        {activeReturns.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Devoluções em Andamento</h2>
            <div className="space-y-4">
              {activeReturns.map((returnRequest) => {
                const statusInfo = getStatusInfo(returnRequest.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={returnRequest.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={returnRequest.item.image}
                            alt={returnRequest.item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-semibold">
                              {returnRequest.item.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {returnRequest.item.store}
                            </p>
                            <p className="text-sm text-gray-500">
                              Pedido #{returnRequest.orderId}
                            </p>
                          </div>
                        </div>

                        <Badge
                          style={{
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.color,
                          }}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Motivo da Devolução
                          </p>
                          <p className="text-sm text-gray-600">
                            {returnRequest.reason}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Data da Solicitação
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              returnRequest.requestDate,
                            ).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      {returnRequest.status === "em_analise" && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                            <p className="text-sm text-yellow-800">
                              Aguardando análise da loja. Resposta esperada até{" "}
                              {new Date(
                                returnRequest.expectedResponse,
                              ).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      )}

                      {returnRequest.status === "aprovado" && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                              <div>
                                <p className="text-sm font-medium text-green-800">
                                  Devolução Aprovada
                                </p>
                                <p className="text-sm text-green-700">
                                  Taxa de entrega: R${" "}
                                  {returnRequest.deliveryFee
                                    ?.toFixed(2)
                                    .replace(".", ",")}
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() =>
                                requestDriver(
                                  returnRequest.id,
                                  returnRequest.deliveryFee,
                                )
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              Solicitar Motorista
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Returnable Orders */}
        <div>
          <h2 className="text-xl font-bold mb-4">
            Pedidos Elegíveis para Devolução
          </h2>

          {returnableOrders.filter((order) => order.canReturn).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum produto elegível
                </h3>
                <p className="text-gray-600">
                  Você não possui produtos elegíveis para devolução no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {returnableOrders
                .filter((order) => order.canReturn)
                .map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Pedido #{order.id}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600"
                        >
                          Elegível para devolução
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium text-sm">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {item.store} • Qtd: {item.quantity}
                                </p>
                                <p className="text-xs text-red-600">
                                  Devolução até{" "}
                                  {new Date(
                                    item.returnDeadline,
                                  ).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setSelectedItem(item);
                                setShowNewReturn(true);
                              }}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Devolver
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* New Return Dialog */}
      <Dialog open={showNewReturn} onOpenChange={setShowNewReturn}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <RotateCcw className="h-5 w-5 mr-2" />
              Solicitar Devolução
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {selectedItem ? (
              <>
                {/* Selected Product */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Produto Selecionado</h3>
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium">{selectedItem.name}</p>
                      <p className="text-sm text-gray-600">
                        {selectedItem.store}
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        R$ {selectedItem.price.toFixed(2).replace(".", ",")} •
                        Qtd: {selectedItem.quantity}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Return Reason */}
                <div>
                  <Label className="text-base font-semibold">
                    Motivo da Devolução *
                  </Label>
                  <Select value={returnReason} onValueChange={setReturnReason}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione o motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defeito">
                        Produto com defeito
                      </SelectItem>
                      <SelectItem value="diferente">
                        Produto diferente do anunciado
                      </SelectItem>
                      <SelectItem value="arrependimento">
                        Arrependimento da compra
                      </SelectItem>
                      <SelectItem value="nao_funcionou">
                        Produto não funcionou
                      </SelectItem>
                      <SelectItem value="entrega_errada">
                        Entrega errada
                      </SelectItem>
                      <SelectItem value="outro">Outro motivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <Label className="text-base font-semibold">
                    Descrição do Problema *
                  </Label>
                  <Textarea
                    placeholder="Descreva detalhadamente o problema com o produto..."
                    value={returnDescription}
                    onChange={(e) => setReturnDescription(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <Label className="text-base font-semibold">
                    Fotos do Produto (Recomendado)
                  </Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">
                      Clique para adicionar fotos do produto
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG até 5MB cada (máximo 5 fotos)
                    </p>
                  </div>
                </div>

                {/* Important Note */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-yellow-800 mb-1">
                        Importante:
                      </p>
                      <ul className="text-yellow-700 space-y-1">
                        <li>• O produto deve estar na embalagem original</li>
                        <li>
                          • A loja tem até 48h para analisar sua solicitação
                        </li>
                        <li>
                          • Se aprovada, você poderá solicitar um motorista
                        </li>
                        <li>
                          • O frete de volta será por sua conta (exceto defeitos
                          de fábrica)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewReturn(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmitReturn}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Solicitar Devolução
                  </Button>
                </div>
              </>
            ) : (
              /* Select Product */
              <div>
                <h3 className="font-semibold mb-4">
                  Selecione o produto para devolver
                </h3>
                <div className="space-y-3">
                  {returnableOrders
                    .filter((order) => order.canReturn)
                    .flatMap((order) => order.items)
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.store}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Selecionar
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
