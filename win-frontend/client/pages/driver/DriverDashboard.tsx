import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  Package,
  User,
  Store,
  Navigation,
  Filter,
  Search,
  CheckCircle,
  Star,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";

// Mock data
const availableOrders = [
  {
    id: "WIN001",
    store: {
      name: "Ferragens Silva",
      address: "Rua das Flores, 123 - Centro",
      distance: 1.2,
    },
    customer: {
      name: "Maria Silva",
      address: "Av. Paulista, 456 - Bela Vista",
      distance: 3.5,
    },
    items: [
      { name: "Parafuso Phillips 3x20mm", quantity: 2 },
      { name: "Porca M8", quantity: 5 },
    ],
    totalDistance: 4.7,
    deliveryFee: 8.5,
    estimatedTime: "25 min",
    priority: "normal",
    createdAt: "há 5 min",
  },
  {
    id: "WIN002",
    store: {
      name: "Elétrica Central",
      address: "Rua Comercial, 789 - Vila Nova",
      distance: 0.8,
    },
    customer: {
      name: "João Santos",
      address: "Rua das Palmeiras, 321 - Jardim",
      distance: 2.1,
    },
    items: [{ name: "Cabo Flexível 2,5mm", quantity: 1 }],
    totalDistance: 2.9,
    deliveryFee: 12.0,
    estimatedTime: "18 min",
    priority: "express",
    createdAt: "há 2 min",
  },
  {
    id: "WIN003",
    store: {
      name: "Ferramentas Pro",
      address: "Av. Industrial, 555 - Industrial",
      distance: 2.5,
    },
    customer: {
      name: "Ana Costa",
      address: "Rua Verde, 888 - Centro",
      distance: 1.8,
    },
    items: [
      { name: "Furadeira 650W", quantity: 1 },
      { name: "Broca 6mm", quantity: 3 },
    ],
    totalDistance: 4.3,
    deliveryFee: 15.0,
    estimatedTime: "30 min",
    priority: "normal",
    createdAt: "há 8 min",
  },
];

const driverStats = {
  todayEarnings: 45.5,
  todayDeliveries: 6,
  rating: 4.8,
  totalDeliveries: 124,
};

export default function DriverDashboard() {
  const [filterDistance, setFilterDistance] = useState("all");
  const [filterValue, setFilterValue] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const { success, info } = useNotification();

  const handleAcceptOrder = (orderId: string, deliveryFee: number) => {
    success(
      "Entrega aceita!",
      `Vá até a loja para retirar o pedido ${orderId}`,
    );
    setTimeout(() => {
      window.location.href = `/driver/delivery/${orderId}`;
    }, 2000);
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    if (!isOnline) {
      success("Status Online!", "Você está recebendo pedidos");
    } else {
      info("Status Offline", "Você não receberá novos pedidos");
    }
  };

  const filteredOrders = availableOrders.filter((order) => {
    const matchesDistance =
      filterDistance === "all" ||
      (filterDistance === "near" && order.totalDistance <= 3) ||
      (filterDistance === "medium" &&
        order.totalDistance > 3 &&
        order.totalDistance <= 6) ||
      (filterDistance === "far" && order.totalDistance > 6);

    const matchesValue =
      filterValue === "all" ||
      (filterValue === "low" && order.deliveryFee <= 10) ||
      (filterValue === "medium" &&
        order.deliveryFee > 10 &&
        order.deliveryFee <= 20) ||
      (filterValue === "high" && order.deliveryFee > 20);

    const matchesSearch =
      order.store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDistance && matchesValue && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "express":
        return { bg: "#FEF2F2", text: "#EF4444", label: "Expressa" };
      case "normal":
        return { bg: "#F0FDF4", text: "#10B981", label: "Normal" };
      default:
        return { bg: "#F8F9FA", text: "#666666", label: "Normal" };
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#F8FFFE",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <header
        className="border-b px-4 py-4"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E1F5FE" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className="p-3 rounded-full mr-3"
              style={{
                background: "linear-gradient(135deg, #3DBEAB 0%, #2D9CDB 100%)",
              }}
            >
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#333333",
                }}
              >
                WIN Motorista
              </h1>
              <p style={{ fontSize: "12px", color: "#666666" }}>
                {isOnline ? "Online - Recebendo pedidos" : "Offline"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={toggleOnlineStatus}
              className={`h-10 px-4 font-medium ${
                isOnline
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-400 hover:bg-gray-500"
              }`}
              style={{ borderRadius: "12px", fontSize: "14px" }}
            >
              {isOnline ? "Online" : "Offline"}
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" style={{ color: "#666666" }} />
              <Badge
                className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                style={{
                  backgroundColor: "#EF4444",
                  color: "#FFFFFF",
                  fontSize: "9px",
                }}
              >
                2
              </Badge>
            </Button>

            <Link to="/driver/profile">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" style={{ color: "#666666" }} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card style={{ borderRadius: "12px", border: "1px solid #E1F5FE" }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Hoje - Ganhos
                  </p>
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#10B981",
                    }}
                  >
                    R$ {driverStats.todayEarnings.toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <DollarSign className="h-6 w-6" style={{ color: "#10B981" }} />
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: "12px", border: "1px solid #E1F5FE" }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Entregas Hoje
                  </p>
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#2D9CDB",
                    }}
                  >
                    {driverStats.todayDeliveries}
                  </p>
                </div>
                <Package className="h-6 w-6" style={{ color: "#2D9CDB" }} />
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: "12px", border: "1px solid #E1F5FE" }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Avaliação
                  </p>
                  <div className="flex items-center">
                    <p
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#F59E0B",
                      }}
                    >
                      {driverStats.rating}
                    </p>
                    <Star
                      className="h-4 w-4 ml-1"
                      style={{ color: "#F59E0B" }}
                    />
                  </div>
                </div>
                <Star className="h-6 w-6" style={{ color: "#F59E0B" }} />
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: "12px", border: "1px solid #E1F5FE" }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Total Entregas
                  </p>
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#3DBEAB",
                    }}
                  >
                    {driverStats.totalDeliveries}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6" style={{ color: "#3DBEAB" }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card
          className="mb-6"
          style={{ borderRadius: "12px", border: "1px solid #E1F5FE" }}
        >
          <CardHeader className="pb-4">
            <CardTitle style={{ fontSize: "18px", color: "#333333" }}>
              <Filter className="h-5 w-5 mr-2 inline" />
              Filtrar Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 h-4 w-4"
                  style={{ color: "#666666" }}
                />
                <Input
                  placeholder="Buscar por loja ou cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                  style={{ borderRadius: "12px", fontSize: "14px" }}
                />
              </div>

              <Select value={filterDistance} onValueChange={setFilterDistance}>
                <SelectTrigger
                  className="h-10"
                  style={{ borderRadius: "12px" }}
                >
                  <SelectValue placeholder="Distância" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as distâncias</SelectItem>
                  <SelectItem value="near">Perto (até 3km)</SelectItem>
                  <SelectItem value="medium">Média (3-6km)</SelectItem>
                  <SelectItem value="far">Longe (6km+)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger
                  className="h-10"
                  style={{ borderRadius: "12px" }}
                >
                  <SelectValue placeholder="Valor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os valores</SelectItem>
                  <SelectItem value="low">Até R$ 10</SelectItem>
                  <SelectItem value="medium">R$ 10 - R$ 20</SelectItem>
                  <SelectItem value="high">Acima de R$ 20</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="h-10"
                style={{ borderRadius: "12px" }}
                onClick={() => {
                  setFilterDistance("all");
                  setFilterValue("all");
                  setSearchQuery("");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#333333",
              }}
            >
              Pedidos Disponíveis
            </h2>
            <Badge
              style={{
                backgroundColor: "#F0FDF4",
                color: "#10B981",
                fontSize: "12px",
              }}
            >
              {filteredOrders.length} disponíveis
            </Badge>
          </div>

          {filteredOrders.length === 0 ? (
            <Card style={{ borderRadius: "12px", border: "1px solid #E1F5FE" }}>
              <CardContent className="p-8 text-center">
                <Package
                  className="h-12 w-12 mx-auto mb-4"
                  style={{ color: "#E5E7EB" }}
                />
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#333333",
                    marginBottom: "8px",
                  }}
                >
                  Nenhum pedido disponível
                </h3>
                <p style={{ fontSize: "14px", color: "#666666" }}>
                  {isOnline
                    ? "Não há pedidos que correspondam aos seus filtros no momento."
                    : "Você está offline. Ative o status online para receber pedidos."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const priorityInfo = getPriorityColor(order.priority);

                return (
                  <Card
                    key={order.id}
                    className="hover:shadow-lg transition-shadow"
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #E1F5FE",
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "#F0F9FF" }}
                          >
                            <Package
                              className="h-6 w-6"
                              style={{ color: "#2D9CDB" }}
                            />
                          </div>
                          <div>
                            <h3
                              style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#333333",
                              }}
                            >
                              Pedido #{order.id}
                            </h3>
                            <p style={{ fontSize: "12px", color: "#666666" }}>
                              {order.createdAt} •{" "}
                              {order.items.reduce(
                                (sum, item) => sum + item.quantity,
                                0,
                              )}{" "}
                              itens
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Badge
                            style={{
                              backgroundColor: priorityInfo.bg,
                              color: priorityInfo.text,
                              fontSize: "10px",
                            }}
                          >
                            {priorityInfo.label}
                          </Badge>
                          <div className="text-right">
                            <p
                              style={{
                                fontSize: "18px",
                                fontWeight: "700",
                                color: "#10B981",
                              }}
                            >
                              R${" "}
                              {order.deliveryFee.toFixed(2).replace(".", ",")}
                            </p>
                            <p style={{ fontSize: "10px", color: "#666666" }}>
                              {order.estimatedTime}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Route Info */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-3">
                          <Store
                            className="h-4 w-4 flex-shrink-0"
                            style={{ color: "#F59E0B" }}
                          />
                          <div className="flex-1">
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#333333",
                              }}
                            >
                              {order.store.name}
                            </p>
                            <p style={{ fontSize: "12px", color: "#666666" }}>
                              {order.store.address} • {order.store.distance} km
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Navigation
                            className="h-4 w-4 flex-shrink-0"
                            style={{ color: "#666666" }}
                          />
                          <div
                            className="flex-1 h-px"
                            style={{ backgroundColor: "#E5E7EB" }}
                          />
                          <span style={{ fontSize: "12px", color: "#666666" }}>
                            {order.totalDistance} km total
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <MapPin
                            className="h-4 w-4 flex-shrink-0"
                            style={{ color: "#10B981" }}
                          />
                          <div className="flex-1">
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#333333",
                              }}
                            >
                              {order.customer.name}
                            </p>
                            <p style={{ fontSize: "12px", color: "#666666" }}>
                              {order.customer.address} •{" "}
                              {order.customer.distance} km
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mb-4">
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#666666",
                            marginBottom: "8px",
                          }}
                        >
                          Itens do pedido:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="px-2 py-1 rounded"
                              style={{ backgroundColor: "#F8F9FA" }}
                            >
                              <span
                                style={{ fontSize: "11px", color: "#333333" }}
                              >
                                {item.quantity}x {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action */}
                      <Button
                        onClick={() =>
                          handleAcceptOrder(order.id, order.deliveryFee)
                        }
                        className="w-full h-12 text-white font-medium"
                        style={{
                          background:
                            "linear-gradient(135deg, #3DBEAB 0%, #2D9CDB 100%)",
                          borderRadius: "12px",
                          fontSize: "16px",
                        }}
                      >
                        Aceitar Entrega - R${" "}
                        {order.deliveryFee.toFixed(2).replace(".", ",")}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50"
        style={{ borderColor: "#E1F5FE" }}
      >
        <div className="grid grid-cols-4 h-16">
          <Link
            to="/driver/dashboard"
            className="flex flex-col items-center justify-center"
            style={{ color: "#3DBEAB" }}
          >
            <Truck className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Pedidos</span>
          </Link>
          <Link
            to="/driver/active"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <Navigation className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Ativa</span>
          </Link>
          <Link
            to="/driver/history"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <Clock className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>
              Histórico
            </span>
          </Link>
          <Link
            to="/driver/profile"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <User className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
