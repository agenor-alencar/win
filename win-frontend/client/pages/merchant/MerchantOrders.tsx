import React, { useState } from "react";
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
} from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";

// Mock data
const orders = [
  {
    id: "WIN001",
    customer: {
      name: "Maria Silva",
      phone: "(11) 99999-1234",
      address: "Rua das Flores, 123 - Centro",
    },
    items: [
      { name: "Parafuso Phillips 3x20mm", qty: 2, price: 12.5 },
      { name: "Porca M8", qty: 5, price: 0.75 },
    ],
    total: 28.75,
    status: "pendente",
    createdAt: "2024-01-15 14:30",
    deliveryCode: null,
  },
  {
    id: "WIN002",
    customer: {
      name: "João Santos",
      phone: "(11) 99999-5678",
      address: "Av. Principal, 456 - Vila Nova",
    },
    items: [
      { name: "Furadeira 650W", qty: 1, price: 189.9 },
      { name: "Broca 6mm", qty: 3, price: 5.2 },
    ],
    total: 205.5,
    status: "preparando",
    createdAt: "2024-01-15 13:15",
    deliveryCode: null,
  },
  {
    id: "WIN003",
    customer: {
      name: "Ana Costa",
      phone: "(11) 99999-9012",
      address: "Rua do Comércio, 789 - Centro",
    },
    items: [{ name: "Martelo 500g", qty: 1, price: 25.0 }],
    total: 25.0,
    status: "pronto",
    createdAt: "2024-01-15 12:00",
    deliveryCode: "845672",
  },
  {
    id: "WIN004",
    customer: {
      name: "Pedro Lima",
      phone: "(11) 99999-3456",
      address: "Rua Nova, 321 - Jardim",
    },
    items: [{ name: "Chave de Fenda", qty: 2, price: 18.9 }],
    total: 37.8,
    status: "entregue",
    createdAt: "2024-01-15 10:30",
    deliveryCode: "123456",
  },
];

export default function MerchantOrders() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [driverCode, setDriverCode] = useState("");
  const { success, error: notifyError } = useNotification();

  const generateDeliveryCode = (orderId: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    success("Código gerado!", `Código de retirada: ${code}`);
    // In a real app, this would update the order in the database
    console.log(`Generated code ${code} for order ${orderId}`);
  };

  const markAsReady = (orderId: string) => {
    success("Pedido marcado como pronto!", "Aguardando motorista");
    // Update order status logic here
  };

  const confirmPickup = (orderId: string, code: string) => {
    if (code.length === 6) {
      success("Retirada confirmada!", "Pedido em rota de entrega");
      setDriverCode("");
      // Update order status logic here
    } else {
      notifyError("Código inválido", "Digite um código de 6 dígitos");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "pending" &&
        ["pendente", "preparando"].includes(order.status)) ||
      (selectedTab === "ready" && order.status === "pronto") ||
      (selectedTab === "delivered" &&
        ["entregue", "retirado"].includes(order.status));

    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return { bg: "#FEF2F2", text: "#EF4444" };
      case "preparando":
        return { bg: "#FFF7ED", text: "#F59E0B" };
      case "pronto":
        return { bg: "#F0FDF4", text: "#10B981" };
      case "entregue":
        return { bg: "#F0F9FF", text: "#2D9CDB" };
      default:
        return { bg: "#F8F9FA", text: "#666666" };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return Clock;
      case "preparando":
        return Package;
      case "pronto":
        return CheckCircle;
      case "entregue":
        return Truck;
      default:
        return Package;
    }
  };

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
            <Package className="h-8 w-8 mr-3" style={{ color: "#3DBEAB" }} />
            <div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#333333",
                }}
              >
                Gestão de Pedidos
              </h1>
              <p style={{ fontSize: "12px", color: "#666666" }}>
                Gerencie pedidos e entregas da sua loja
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/merchant/dashboard">
              <Button
                variant="outline"
                style={{ borderRadius: "12px", color: "#666666" }}
              >
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-3 h-5 w-5"
              style={{ color: "#666666" }}
            />
            <Input
              placeholder="Buscar por pedido ou cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
              style={{ borderRadius: "12px", fontSize: "16px" }}
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger
              className="w-full md:w-48 h-12"
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
                          Pedido #{order.id}
                        </h3>
                        <p style={{ fontSize: "12px", color: "#666666" }}>
                          {order.createdAt}
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
                                    {order.customer.name}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Phone
                                    className="h-4 w-4 mr-2"
                                    style={{ color: "#666666" }}
                                  />
                                  <span style={{ fontSize: "14px" }}>
                                    {order.customer.phone}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin
                                    className="h-4 w-4 mr-2"
                                    style={{ color: "#666666" }}
                                  />
                                  <span style={{ fontSize: "14px" }}>
                                    {order.customer.address}
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
                                {order.items.map((item, index) => (
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
                                        {item.name}
                                      </p>
                                      <p
                                        style={{
                                          fontSize: "12px",
                                          color: "#666666",
                                        }}
                                      >
                                        Qtd: {item.qty}
                                      </p>
                                    </div>
                                    <p
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: "600",
                                      }}
                                    >
                                      R${" "}
                                      {(item.price * item.qty)
                                        .toFixed(2)
                                        .replace(".", ",")}
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

                                {order.deliveryCode ? (
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
                                          {order.deliveryCode}
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
                                  Código utilizado: {order.deliveryCode}
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
                        {order.customer.name}
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
                        R$ {order.total.toFixed(2).replace(".", ",")}
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
                        {order.items.length} produto(s)
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
            style={{ color: "#3DBEAB" }}
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
