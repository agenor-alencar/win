import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  Store,
  Package,
  Settings,
  ShoppingBag,
  User,
  MapPin,
  Phone,
  Calendar,
  FileText,
} from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";

// Mock data
const returnRequests = [
  {
    id: "DEV001",
    orderId: "WIN001",
    customer: {
      name: "Maria Silva",
      phone: "(11) 99999-1234",
      address: "Rua das Flores, 123 - Centro",
    },
    item: {
      name: "Parafuso Phillips 3x20mm - Pacote com 100 unidades",
      price: 12.5,
      quantity: 2,
      image: "/placeholder.svg",
      sku: "PAR-001",
    },
    reason: "Produto com defeito",
    description:
      "Os parafusos vieram enferrujados e alguns estão tortos. Não é possível utilizar.",
    status: "pendente",
    requestDate: "2024-01-15 14:30",
    photos: ["/placeholder.svg", "/placeholder.svg"],
    timeRemaining: "36h 24min",
  },
  {
    id: "DEV002",
    orderId: "WIN002",
    customer: {
      name: "João Santos",
      phone: "(11) 99999-5678",
      address: "Av. Principal, 456 - Vila Nova",
    },
    item: {
      name: "Furadeira de Impacto 650W",
      price: 189.9,
      quantity: 1,
      image: "/placeholder.svg",
      sku: "FUR-002",
    },
    reason: "Arrependimento da compra",
    description: "Comprei por impulso, mas não preciso mais do produto.",
    status: "aprovado",
    requestDate: "2024-01-14 10:15",
    approvedDate: "2024-01-14 16:20",
    photos: ["/placeholder.svg"],
    deliveryFee: 12.5,
  },
  {
    id: "DEV003",
    orderId: "WIN003",
    customer: {
      name: "Ana Costa",
      phone: "(11) 99999-9012",
      address: "Rua do Comércio, 789 - Centro",
    },
    item: {
      name: "Chave de Fenda 6mm",
      price: 18.9,
      quantity: 1,
      image: "/placeholder.svg",
      sku: "CHA-003",
    },
    reason: "Produto diferente do anunciado",
    description:
      "A chave veio com tamanho diferente do especificado no anúncio.",
    status: "recusado",
    requestDate: "2024-01-13 09:45",
    rejectedDate: "2024-01-13 15:30",
    rejectionReason:
      "Produto está dentro das especificações corretas conforme descrição.",
    photos: ["/placeholder.svg"],
  },
  {
    id: "DEV004",
    orderId: "WIN004",
    customer: {
      name: "Pedro Lima",
      phone: "(11) 99999-3456",
      address: "Rua Nova, 321 - Jardim",
    },
    item: {
      name: "Martelo de Unha 500g",
      price: 25.0,
      quantity: 1,
      image: "/placeholder.svg",
      sku: "MAR-004",
    },
    reason: "Produto com defeito",
    description: "O cabo do martelo está solto e perigoso para uso.",
    status: "concluido",
    requestDate: "2024-01-10 11:20",
    approvedDate: "2024-01-10 14:15",
    completedDate: "2024-01-12 16:45",
    resolution: "Produto trocado",
    photos: ["/placeholder.svg"],
  },
];

export default function MerchantReturns() {
  const [selectedTab, setSelectedTab] = useState("pendente");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const { success, error: notifyError } = useNotification();

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pendente":
        return {
          label: "Aguardando Análise",
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
      case "recusado":
        return {
          label: "Recusado",
          color: "#EF4444",
          bg: "#FEF2F2",
          icon: XCircle,
        };
      case "concluido":
        return {
          label: "Concluído",
          color: "#2D9CDB",
          bg: "#F0F9FF",
          icon: CheckCircle,
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

  const handleApprove = (returnId: string) => {
    success(
      "Devolução aprovada!",
      "Cliente será notificado e poderá solicitar retirada",
    );
    // Update return status logic here
  };

  const handleReject = (returnId: string, reason: string) => {
    if (!reason.trim()) {
      notifyError("Motivo obrigatório", "Informe o motivo da recusa");
      return;
    }
    success("Devolução recusada", "Cliente será notificado sobre a decisão");
    setSelectedReturn(null);
    setResponseMessage("");
    // Update return status logic here
  };

  const filteredReturns = returnRequests.filter((returnRequest) => {
    const matchesTab =
      selectedTab === "todos" || returnRequest.status === selectedTab;
    const matchesSearch =
      returnRequest.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnRequest.customer.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      returnRequest.item.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getTabCounts = () => {
    return {
      todos: returnRequests.length,
      pendente: returnRequests.filter((r) => r.status === "pendente").length,
      aprovado: returnRequests.filter((r) => r.status === "aprovado").length,
      recusado: returnRequests.filter((r) => r.status === "recusado").length,
      concluido: returnRequests.filter((r) => r.status === "concluido").length,
    };
  };

  const tabCounts = getTabCounts();

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <header
        className="border-b px-6 py-4"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <RotateCcw className="h-8 w-8 mr-3" style={{ color: "#3DBEAB" }} />
            <div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#333333",
                }}
              >
                Gestão de Devoluções
              </h1>
              <p style={{ fontSize: "12px", color: "#666666" }}>
                Analise e gerencie solicitações de devolução
              </p>
            </div>
          </div>

          <Link to="/merchant/dashboard">
            <Button
              variant="outline"
              style={{ borderRadius: "12px", color: "#666666" }}
            >
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-3 h-5 w-5"
              style={{ color: "#666666" }}
            />
            <Input
              placeholder="Buscar por pedido, cliente ou produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
              style={{ borderRadius: "12px", fontSize: "16px" }}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Aguardando Análise
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#F59E0B",
                    }}
                  >
                    {tabCounts.pendente}
                  </p>
                </div>
                <Clock className="h-8 w-8" style={{ color: "#F59E0B" }} />
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Aprovadas
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#10B981",
                    }}
                  >
                    {tabCounts.aprovado}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8" style={{ color: "#10B981" }} />
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Recusadas
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#EF4444",
                    }}
                  >
                    {tabCounts.recusado}
                  </p>
                </div>
                <XCircle className="h-8 w-8" style={{ color: "#EF4444" }} />
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Concluídas
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#2D9CDB",
                    }}
                  >
                    {tabCounts.concluido}
                  </p>
                </div>
                <Package className="h-8 w-8" style={{ color: "#2D9CDB" }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="mb-6"
        >
          <TabsList
            className="grid w-full grid-cols-5"
            style={{ backgroundColor: "#F8F9FA", borderRadius: "12px" }}
          >
            <TabsTrigger
              value="pendente"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              Pendentes ({tabCounts.pendente})
            </TabsTrigger>
            <TabsTrigger
              value="aprovado"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              Aprovadas ({tabCounts.aprovado})
            </TabsTrigger>
            <TabsTrigger
              value="recusado"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              Recusadas ({tabCounts.recusado})
            </TabsTrigger>
            <TabsTrigger
              value="concluido"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              Concluídas ({tabCounts.concluido})
            </TabsTrigger>
            <TabsTrigger
              value="todos"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              Todas ({tabCounts.todos})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Returns List */}
        <div className="space-y-4">
          {filteredReturns.map((returnRequest) => {
            const statusInfo = getStatusInfo(returnRequest.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card
                key={returnRequest.id}
                style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={returnRequest.item.image}
                        alt={returnRequest.item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#333333",
                          }}
                        >
                          Devolução #{returnRequest.id}
                        </h3>
                        <p style={{ fontSize: "12px", color: "#666666" }}>
                          Pedido #{returnRequest.orderId} •{" "}
                          {returnRequest.requestDate}
                        </p>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#333333",
                          }}
                        >
                          {returnRequest.item.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge
                        style={{
                          backgroundColor: statusInfo.bg,
                          color: statusInfo.color,
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReturn(returnRequest)}
                            style={{ borderRadius: "12px" }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>

                        <DialogContent
                          style={{
                            borderRadius: "12px",
                            maxWidth: "700px",
                            maxHeight: "90vh",
                          }}
                          className="overflow-y-auto"
                        >
                          <DialogHeader>
                            <DialogTitle
                              style={{ fontSize: "20px", color: "#333333" }}
                            >
                              Devolução #{returnRequest.id}
                            </DialogTitle>
                          </DialogHeader>

                          <div className="space-y-6">
                            {/* Product Info */}
                            <div
                              className="p-4 rounded-lg"
                              style={{ backgroundColor: "#F8F9FA" }}
                            >
                              <h4
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "600",
                                  color: "#333333",
                                  marginBottom: "12px",
                                }}
                              >
                                Produto
                              </h4>
                              <div className="flex items-center space-x-3">
                                <img
                                  src={returnRequest.item.image}
                                  alt={returnRequest.item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div>
                                  <p
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "500",
                                      color: "#333333",
                                    }}
                                  >
                                    {returnRequest.item.name}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "12px",
                                      color: "#666666",
                                    }}
                                  >
                                    SKU: {returnRequest.item.sku} • Qtd:{" "}
                                    {returnRequest.item.quantity}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "600",
                                      color: "#3DBEAB",
                                    }}
                                  >
                                    R${" "}
                                    {returnRequest.item.price
                                      .toFixed(2)
                                      .replace(".", ",")}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Customer Info */}
                            <div
                              className="p-4 rounded-lg"
                              style={{ backgroundColor: "#F8F9FA" }}
                            >
                              <h4
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "600",
                                  color: "#333333",
                                  marginBottom: "12px",
                                }}
                              >
                                Dados do Cliente
                              </h4>
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <User
                                    className="h-4 w-4 mr-2"
                                    style={{ color: "#666666" }}
                                  />
                                  <span style={{ fontSize: "14px" }}>
                                    {returnRequest.customer.name}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Phone
                                    className="h-4 w-4 mr-2"
                                    style={{ color: "#666666" }}
                                  />
                                  <span style={{ fontSize: "14px" }}>
                                    {returnRequest.customer.phone}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin
                                    className="h-4 w-4 mr-2"
                                    style={{ color: "#666666" }}
                                  />
                                  <span style={{ fontSize: "14px" }}>
                                    {returnRequest.customer.address}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Return Details */}
                            <div>
                              <h4
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "600",
                                  color: "#333333",
                                  marginBottom: "12px",
                                }}
                              >
                                Detalhes da Devolução
                              </h4>
                              <div className="space-y-3">
                                <div>
                                  <p
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      color: "#666666",
                                    }}
                                  >
                                    Motivo:
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "14px",
                                      color: "#333333",
                                    }}
                                  >
                                    {returnRequest.reason}
                                  </p>
                                </div>
                                <div>
                                  <p
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      color: "#666666",
                                    }}
                                  >
                                    Descrição:
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "14px",
                                      color: "#333333",
                                    }}
                                  >
                                    {returnRequest.description}
                                  </p>
                                </div>

                                {/* Photos */}
                                {returnRequest.photos &&
                                  returnRequest.photos.length > 0 && (
                                    <div>
                                      <p
                                        style={{
                                          fontSize: "12px",
                                          fontWeight: "600",
                                          color: "#666666",
                                          marginBottom: "8px",
                                        }}
                                      >
                                        Fotos anexadas:
                                      </p>
                                      <div className="flex space-x-2">
                                        {returnRequest.photos.map(
                                          (photo, index) => (
                                            <img
                                              key={index}
                                              src={photo}
                                              alt={`Foto ${index + 1}`}
                                              className="w-16 h-16 object-cover rounded-lg border"
                                            />
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>

                            {/* Status-specific content */}
                            {returnRequest.status === "pendente" && (
                              <div>
                                <div
                                  className="p-4 rounded-lg mb-4"
                                  style={{
                                    backgroundColor: "#FFF7ED",
                                    borderColor: "#F59E0B",
                                  }}
                                >
                                  <div className="flex items-center">
                                    <Clock
                                      className="h-5 w-5 mr-2"
                                      style={{ color: "#F59E0B" }}
                                    />
                                    <p
                                      style={{
                                        fontSize: "14px",
                                        color: "#92400E",
                                      }}
                                    >
                                      Tempo restante para análise:{" "}
                                      {returnRequest.timeRemaining}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <p
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "600",
                                      color: "#333333",
                                      marginBottom: "8px",
                                    }}
                                  >
                                    Resposta (opcional):
                                  </p>
                                  <Textarea
                                    placeholder="Adicione uma mensagem para o cliente..."
                                    value={responseMessage}
                                    onChange={(e) =>
                                      setResponseMessage(e.target.value)
                                    }
                                    className="mb-4"
                                    style={{ borderRadius: "12px" }}
                                  />
                                </div>

                                <div className="flex space-x-3">
                                  <Button
                                    onClick={() =>
                                      handleReject(
                                        returnRequest.id,
                                        responseMessage,
                                      )
                                    }
                                    variant="outline"
                                    className="flex-1"
                                    style={{
                                      borderRadius: "12px",
                                      borderColor: "#EF4444",
                                      color: "#EF4444",
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Recusar
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleApprove(returnRequest.id)
                                    }
                                    className="flex-1"
                                    style={{
                                      backgroundColor: "#10B981",
                                      borderRadius: "12px",
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Aprovar
                                  </Button>
                                </div>
                              </div>
                            )}

                            {returnRequest.status === "aprovado" && (
                              <div
                                className="p-4 rounded-lg"
                                style={{ backgroundColor: "#F0FDF4" }}
                              >
                                <div className="flex items-center mb-2">
                                  <CheckCircle
                                    className="h-5 w-5 mr-2"
                                    style={{ color: "#10B981" }}
                                  />
                                  <p
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "600",
                                      color: "#065F46",
                                    }}
                                  >
                                    Devolução Aprovada
                                  </p>
                                </div>
                                <p
                                  style={{ fontSize: "12px", color: "#047857" }}
                                >
                                  Aprovado em: {returnRequest.approvedDate}
                                </p>
                                <p
                                  style={{ fontSize: "12px", color: "#047857" }}
                                >
                                  Taxa de entrega: R${" "}
                                  {returnRequest.deliveryFee
                                    ?.toFixed(2)
                                    .replace(".", ",")}
                                </p>
                              </div>
                            )}

                            {returnRequest.status === "recusado" && (
                              <div
                                className="p-4 rounded-lg"
                                style={{ backgroundColor: "#FEF2F2" }}
                              >
                                <div className="flex items-center mb-2">
                                  <XCircle
                                    className="h-5 w-5 mr-2"
                                    style={{ color: "#EF4444" }}
                                  />
                                  <p
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "600",
                                      color: "#991B1B",
                                    }}
                                  >
                                    Devolução Recusada
                                  </p>
                                </div>
                                <p
                                  style={{ fontSize: "12px", color: "#B91C1C" }}
                                >
                                  Recusado em: {returnRequest.rejectedDate}
                                </p>
                                <p
                                  style={{ fontSize: "12px", color: "#B91C1C" }}
                                >
                                  Motivo: {returnRequest.rejectionReason}
                                </p>
                              </div>
                            )}

                            {returnRequest.status === "concluido" && (
                              <div
                                className="p-4 rounded-lg"
                                style={{ backgroundColor: "#F0F9FF" }}
                              >
                                <div className="flex items-center mb-2">
                                  <CheckCircle
                                    className="h-5 w-5 mr-2"
                                    style={{ color: "#2D9CDB" }}
                                  />
                                  <p
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "600",
                                      color: "#1E3A8A",
                                    }}
                                  >
                                    Devolução Concluída
                                  </p>
                                </div>
                                <p
                                  style={{ fontSize: "12px", color: "#1D4ED8" }}
                                >
                                  Concluído em: {returnRequest.completedDate}
                                </p>
                                <p
                                  style={{ fontSize: "12px", color: "#1D4ED8" }}
                                >
                                  Resolução: {returnRequest.resolution}
                                </p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p style={{ fontSize: "12px", color: "#666666" }}>
                        Cliente
                      </p>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#333333",
                        }}
                      >
                        {returnRequest.customer.name}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: "12px", color: "#666666" }}>
                        Motivo
                      </p>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#333333",
                        }}
                      >
                        {returnRequest.reason}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: "12px", color: "#666666" }}>
                        Valor
                      </p>
                      <p
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#3DBEAB",
                        }}
                      >
                        R${" "}
                        {(
                          returnRequest.item.price * returnRequest.item.quantity
                        )
                          .toFixed(2)
                          .replace(".", ",")}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: "12px", color: "#666666" }}>
                        {returnRequest.status === "pendente"
                          ? "Tempo restante"
                          : "Data da solicitação"}
                      </p>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color:
                            returnRequest.status === "pendente"
                              ? "#F59E0B"
                              : "#333333",
                        }}
                      >
                        {returnRequest.status === "pendente"
                          ? returnRequest.timeRemaining
                          : new Date(
                              returnRequest.requestDate,
                            ).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredReturns.length === 0 && (
          <div className="text-center py-12">
            <RotateCcw
              className="h-16 w-16 mx-auto mb-4"
              style={{ color: "#E5E7EB" }}
            />
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#333333",
                marginBottom: "8px",
              }}
            >
              Nenhuma devolução encontrada
            </h3>
            <p style={{ fontSize: "16px", color: "#666666" }}>
              Não há solicitações de devolução que correspondam aos filtros
              selecionados.
            </p>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50"
        style={{ borderColor: "#E5E7EB" }}
      >
        <div className="grid grid-cols-4 h-16">
          <Link
            to="/merchant/dashboard"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <Store className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>
              Dashboard
            </span>
          </Link>
          <Link
            to="/merchant/orders"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <Package className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Pedidos</span>
          </Link>
          <Link
            to="/merchant/products"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <ShoppingBag className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Produtos</span>
          </Link>
          <Link
            to="/merchant/profile"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <Settings className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
