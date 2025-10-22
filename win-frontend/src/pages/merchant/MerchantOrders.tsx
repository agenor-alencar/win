import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Package,
  Clock,
  CheckCircle,
  Truck,
  Eye,
  Calendar,
  Filter,
  Search,
  Store,
  MapPin,
  Phone,
  User,
  Hash,
  Copy,
  Settings,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import { MerchantLayout } from "@/components/MerchantLayout";
import { api } from "@/lib/Api";
import { useToast } from "@/hooks/use-toast";

// Types
interface Order {
  id: string;
  numeroPedido: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
  status: string;
  subtotal: number;
  desconto: number;
  frete: number;
  total: number;
  enderecoEntrega: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  itens: Array<{
    id: string;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
  }>;
  codigoEntrega?: string;
  criadoEm: string;
  confirmadoEm?: string;
  entregueEm?: string;
}

interface Lojista {
  id: string;
  nomeFantasia: string;
  cnpj: string;
  ativo: boolean;
}

export default function MerchantOrders() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [driverCode, setDriverCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lojista, setLojista] = useState<Lojista | null>(null);
  const { success, error: notifyError } = useNotification();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // 1. Buscar dados do lojista logado
      const { data: lojistaData } = await api.get<Lojista>("/api/v1/lojistas/me");
      setLojista(lojistaData);

      // 2. Buscar pedidos do lojista usando o novo endpoint otimizado
      const { data: ordersData } = await api.get<Order[]>(
        `/api/v1/pedidos/lojista/${lojistaData.id}`
      );
      
      setOrders(ordersData);
      setLoading(false);
    } catch (error: any) {
      console.error("Erro ao buscar pedidos:", error);
      toast({
        title: "Erro ao carregar pedidos",
        description: error.response?.data?.message || "Não foi possível carregar os pedidos",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const generateDeliveryCode = async (orderId: string) => {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      // TODO: Criar endpoint no backend para salvar o código de entrega
      // await api.patch(`/api/v1/pedidos/${orderId}/codigo-entrega`, { codigo: code });
      
      success("Código gerado!", `Código de retirada: ${code}`);
      console.log(`Generated code ${code} for order ${orderId}`);
    } catch (error: any) {
      notifyError("Erro", "Não foi possível gerar o código");
    }
  };

  const markAsReady = async (orderId: string) => {
    try {
      await api.patch(`/api/v1/pedidos/${orderId}/pronto`);
      success("Pedido marcado como pronto!", "Aguardando motorista");
      fetchOrders(); // Recarregar pedidos
    } catch (error: any) {
      notifyError("Erro", error.response?.data?.message || "Não foi possível atualizar o pedido");
    }
  };

  const confirmPickup = async (orderId: string, code: string) => {
    if (code.length !== 6) {
      notifyError("Código inválido", "Digite um código de 6 dígitos");
      return;
    }

    try {
      await api.patch(`/api/v1/pedidos/${orderId}/entregar?codigoEntrega=${code}`);
      success("Retirada confirmada!", "Pedido em rota de entrega");
      setDriverCode("");
      fetchOrders(); // Recarregar pedidos
    } catch (error: any) {
      notifyError("Erro", error.response?.data?.message || "Código de entrega inválido");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "pending" &&
        ["PENDENTE", "PREPARANDO"].includes(order.status)) ||
      (selectedTab === "ready" && order.status === "PRONTO") ||
      (selectedTab === "delivered" &&
        ["ENTREGUE", "EM_TRANSITO"].includes(order.status));

    const matchesSearch =
      order.numeroPedido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.usuario.nome.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDENTE":
        return { bg: "#FEF2F2", text: "#EF4444" };
      case "CONFIRMADO":
      case "PREPARANDO":
        return { bg: "#FFF7ED", text: "#F59E0B" };
      case "PRONTO":
        return { bg: "#F0FDF4", text: "#10B981" };
      case "EM_TRANSITO":
      case "ENTREGUE":
        return { bg: "#F0F9FF", text: "#2D9CDB" };
      case "CANCELADO":
        return { bg: "#F3F4F6", text: "#6B7280" };
      default:
        return { bg: "#F8F9FA", text: "#666666" };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDENTE":
        return Clock;
      case "CONFIRMADO":
      case "PREPARANDO":
        return Package;
      case "PRONTO":
        return CheckCircle;
      case "EM_TRANSITO":
      case "ENTREGUE":
        return Truck;
      default:
        return Package;
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDENTE: "Pendente",
      CONFIRMADO: "Confirmado",
      PREPARANDO: "Preparando",
      PRONTO: "Pronto",
      EM_TRANSITO: "Em Trânsito",
      ENTREGUE: "Entregue",
      CANCELADO: "Cancelado",
    };
    return statusMap[status.toUpperCase()] || status;
  };

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="w-8 h-8 animate-spin text-[#3DBEAB]" />
          <span className="ml-3 text-lg">Carregando pedidos...</span>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-[#3DBEAB]" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestão de Pedidos
              </h1>
              <p className="text-sm text-gray-600">
                Gerencie pedidos e entregas da sua loja
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={fetchOrders}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Link to="/merchant/dashboard">
              <Button variant="outline" className="rounded-xl">
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar por pedido ou cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger
              className="w-full md:w-48 h-12 rounded-xl"
              style={{ borderRadius: "12px" }}
            >
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="preparando">Preparando</SelectItem>
              <SelectItem value="pronto">Pronto</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="mb-6"
        >
          <TabsList
            className="grid w-full grid-cols-4"
            style={{ backgroundColor: "#F8F9FA", borderRadius: "12px" }}
          >
            <TabsTrigger
              value="all"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              Todos ({orders.length})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              Pendentes (
              {
                orders.filter((o) =>
                  ["pendente", "preparando"].includes(o.status),
                ).length
              }
              )
            </TabsTrigger>
            <TabsTrigger
              value="ready"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              Prontos ({orders.filter((o) => o.status === "pronto").length})
            </TabsTrigger>
            <TabsTrigger
              value="delivered"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              Entregues (
              {
                orders.filter((o) =>
                  ["entregue", "retirado"].includes(o.status),
                ).length
              }
              )
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            const statusColors = getStatusColor(order.status);

            return (
              <Card
                key={order.id}
                style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="p-3 rounded-full"
                        style={{ backgroundColor: statusColors.bg }}
                      >
                        <StatusIcon
                          className="h-5 w-5"
                          style={{ color: statusColors.text }}
                        />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: "20px",
                            fontWeight: "600",
                            color: "#333333",
                          }}
                        >
                          Pedido #{order.numeroPedido}
                        </h3>
                        <p style={{ fontSize: "12px", color: "#666666" }}>
                          {new Date(order.criadoEm).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge
                        style={{
                          backgroundColor: statusColors.bg,
                          color: statusColors.text,
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </Badge>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            style={{ borderRadius: "12px" }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Detalhes
                          </Button>
                        </DialogTrigger>

                        <DialogContent
                          style={{ borderRadius: "12px", maxWidth: "600px" }}
                        >
                          <DialogHeader>
                            <DialogTitle
                              style={{ fontSize: "20px", color: "#333333" }}
                            >
                              Pedido #{order.id}
                            </DialogTitle>
                          </DialogHeader>

                          <div className="space-y-6">
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
                                    {order.usuario.nome}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Phone
                                    className="h-4 w-4 mr-2"
                                    style={{ color: "#666666" }}
                                  />
                                  <span style={{ fontSize: "14px" }}>
                                    {order.usuario.email}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin
                                    className="h-4 w-4 mr-2"
                                    style={{ color: "#666666" }}
                                  />
                                  <span style={{ fontSize: "14px" }}>
                                    {order.enderecoEntrega.logradouro}, {order.enderecoEntrega.numero} - {order.enderecoEntrega.bairro}, {order.enderecoEntrega.cidade}/{order.enderecoEntrega.uf}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div>
                              <h4
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "600",
                                  color: "#333333",
                                  marginBottom: "12px",
                                }}
                              >
                                Itens do Pedido
                              </h4>
                              <div className="space-y-2">
                                {order.itens.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center p-3 rounded-lg"
                                    style={{ backgroundColor: "#F8F9FA" }}
                                  >
                                    <div>
                                      <p
                                        style={{
                                          fontSize: "14px",
                                          fontWeight: "500",
                                        }}
                                      >
                                        {item.nomeProduto}
                                      </p>
                                      <p
                                        style={{
                                          fontSize: "12px",
                                          color: "#666666",
                                        }}
                                      >
                                        Qtd: {item.quantidade}
                                      </p>
                                    </div>
                                    <p
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: "600",
                                      }}
                                    >
                                      {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      }).format(item.subtotal)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <div
                                className="flex justify-between items-center mt-4 p-3 rounded-lg"
                                style={{ backgroundColor: "#3DBEAB20" }}
                              >
                                <p
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    color: "#333333",
                                  }}
                                >
                                  Total do Pedido
                                </p>
                                <p
                                  style={{
                                    fontSize: "20px",
                                    fontWeight: "700",
                                    color: "#3DBEAB",
                                  }}
                                >
                                  R$ {order.total.toFixed(2).replace(".", ",")}
                                </p>
                              </div>
                            </div>

                            {/* Delivery Code Section */}
                            {order.status === "preparando" && (
                              <div
                                className="p-4 rounded-lg"
                                style={{ backgroundColor: "#E1F5FE" }}
                              >
                                <h4
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    color: "#333333",
                                    marginBottom: "12px",
                                  }}
                                >
                                  Marcar como Pronto
                                </h4>
                                <Button
                                  onClick={() => markAsReady(order.id)}
                                  className="w-full h-12 text-white font-medium"
                                  style={{
                                    backgroundColor: "#3DBEAB",
                                    borderRadius: "12px",
                                  }}
                                >
                                  <CheckCircle className="h-5 w-5 mr-2" />
                                  Pedido Pronto
                                </Button>
                              </div>
                            )}

                            {order.status === "pronto" && (
                              <div
                                className="p-4 rounded-lg"
                                style={{ backgroundColor: "#F0FDF4" }}
                              >
                                <h4
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    color: "#333333",
                                    marginBottom: "12px",
                                  }}
                                >
                                  Código de Retirada
                                </h4>

                                {order.codigoEntrega ? (
                                  <div className="space-y-4">
                                    <div
                                      className="flex items-center justify-center p-6 rounded-lg"
                                      style={{ backgroundColor: "#FFFFFF" }}
                                    >
                                      <div className="text-center">
                                        <Hash
                                          className="h-8 w-8 mx-auto mb-2"
                                          style={{ color: "#10B981" }}
                                        />
                                        <p
                                          style={{
                                            fontSize: "32px",
                                            fontWeight: "700",
                                            color: "#10B981",
                                            fontFamily: "monospace",
                                            letterSpacing: "4px",
                                          }}
                                        >
                                          {order.codigoEntrega}
                                        </p>
                                        <p
                                          style={{
                                            fontSize: "12px",
                                            color: "#666666",
                                            marginTop: "8px",
                                          }}
                                        >
                                          Informe este código ao motorista
                                        </p>
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      <p
                                        style={{
                                          fontSize: "14px",
                                          fontWeight: "600",
                                          color: "#333333",
                                        }}
                                      >
                                        Confirmar Retirada pelo Motorista
                                      </p>
                                      <div className="flex space-x-2">
                                        <Input
                                          placeholder="Código do motorista (6 dígitos)"
                                          value={driverCode}
                                          onChange={(e) =>
                                            setDriverCode(e.target.value)
                                          }
                                          maxLength={6}
                                          style={{
                                            borderRadius: "12px",
                                            fontFamily: "monospace",
                                            letterSpacing: "2px",
                                            textAlign: "center",
                                            fontSize: "18px",
                                          }}
                                        />
                                        <Button
                                          onClick={() =>
                                            confirmPickup(order.id, driverCode)
                                          }
                                          disabled={driverCode.length !== 6}
                                          style={{
                                            backgroundColor: "#2D9CDB",
                                            borderRadius: "12px",
                                          }}
                                        >
                                          Confirmar
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() =>
                                      generateDeliveryCode(order.id)
                                    }
                                    className="w-full h-12 text-white font-medium"
                                    style={{
                                      backgroundColor: "#10B981",
                                      borderRadius: "12px",
                                    }}
                                  >
                                    <Hash className="h-5 w-5 mr-2" />
                                    Gerar Código de Retirada
                                  </Button>
                                )}
                              </div>
                            )}

                            {order.status === "entregue" && (
                              <div
                                className="p-4 rounded-lg text-center"
                                style={{ backgroundColor: "#F0F9FF" }}
                              >
                                <Truck
                                  className="h-12 w-12 mx-auto mb-3"
                                  style={{ color: "#2D9CDB" }}
                                />
                                <h4
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    color: "#333333",
                                    marginBottom: "8px",
                                  }}
                                >
                                  Pedido Entregue
                                </h4>
                                <p
                                  style={{ fontSize: "12px", color: "#666666" }}
                                >
                                  Código utilizado: {order.codigoEntrega}
                                </p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#666666",
                          marginBottom: "4px",
                        }}
                      >
                        Cliente
                      </p>
                      <p
                        style={{
                          fontSize: "16px",
                          fontWeight: "500",
                          color: "#333333",
                        }}
                      >
                        {order.usuario.nome}
                      </p>
                    </div>

                    <div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#666666",
                          marginBottom: "4px",
                        }}
                      >
                        Total
                      </p>
                      <p
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#3DBEAB",
                        }}
                      >
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(order.total)}
                      </p>
                    </div>

                    <div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#666666",
                          marginBottom: "4px",
                        }}
                      >
                        Itens
                      </p>
                      <p
                        style={{
                          fontSize: "16px",
                          fontWeight: "500",
                          color: "#333333",
                        }}
                      >
                        {order.itens.length} produto(s)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package
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
              Nenhum pedido encontrado
            </h3>
            <p style={{ fontSize: "16px", color: "#666666" }}>
              Não há pedidos que correspondam aos filtros selecionados.
            </p>
          </div>
        )}
      </div>
    </MerchantLayout>
  );
}
