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
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  DollarSign,
  Package,
  MapPin,
  Store,
  User,
  Truck,
  Navigation,
  TrendingUp,
  Download,
} from "lucide-react";

// Mock data
const deliveryHistory = [
  {
    id: "WIN001",
    date: "2024-01-15",
    time: "14:30",
    store: "Ferragens Silva",
    customer: "Maria Silva",
    status: "delivered",
    earnings: 8.5,
    distance: 4.7,
    duration: "25 min",
    rating: 5,
    items: 3,
  },
  {
    id: "WIN002",
    date: "2024-01-15",
    time: "13:15",
    store: "Elétrica Central",
    customer: "João Santos",
    status: "delivered",
    earnings: 12.0,
    distance: 2.9,
    duration: "18 min",
    rating: 4,
    items: 1,
  },
  {
    id: "WIN003",
    date: "2024-01-15",
    time: "11:45",
    store: "Ferramentas Pro",
    customer: "Ana Costa",
    status: "cancelled",
    earnings: 0,
    distance: 4.3,
    duration: "0 min",
    rating: null,
    items: 2,
  },
  {
    id: "WIN004",
    date: "2024-01-14",
    time: "16:20",
    store: "Casa Verde",
    customer: "Pedro Lima",
    status: "delivered",
    earnings: 15.0,
    distance: 6.2,
    duration: "35 min",
    rating: 5,
    items: 5,
  },
  {
    id: "WIN005",
    date: "2024-01-14",
    time: "15:10",
    store: "Materiais Norte",
    customer: "Carlos Silva",
    status: "delivered",
    earnings: 9.5,
    distance: 3.1,
    duration: "22 min",
    rating: 4,
    items: 2,
  },
];

const weeklyStats = {
  totalEarnings: 145.25,
  totalDeliveries: 18,
  averageRating: 4.7,
  totalDistance: 89.3,
  totalHours: 8.5,
};

export default function DriverHistory() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("week");

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "delivered":
        return {
          label: "Entregue",
          color: "#10B981",
          bg: "#F0FDF4",
          icon: CheckCircle,
        };
      case "cancelled":
        return {
          label: "Cancelada",
          color: "#EF4444",
          bg: "#FEF2F2",
          icon: XCircle,
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

  const filteredHistory = deliveryHistory.filter((delivery) => {
    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "delivered" && delivery.status === "delivered") ||
      (selectedTab === "cancelled" && delivery.status === "cancelled");

    const matchesSearch =
      delivery.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const renderStarRating = (rating: number | null) => {
    if (!rating) return <span style={{ color: "#666666" }}>-</span>;

    return (
      <div className="flex items-center">
        <span style={{ color: "#F59E0B", fontWeight: "600" }}>{rating}</span>
        <span style={{ color: "#F59E0B", marginLeft: "2px" }}>★</span>
      </div>
    );
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
            <Clock className="h-8 w-8 mr-3" style={{ color: "#3DBEAB" }} />
            <div>
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#333333",
                }}
              >
                Histórico de Entregas
              </h1>
              <p style={{ fontSize: "12px", color: "#666666" }}>
                Acompanhe suas entregas realizadas
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            style={{ borderRadius: "12px", color: "#666666" }}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </header>

      <div className="p-4 pb-20">
        {/* Weekly Stats */}
        <Card
          className="mb-6"
          style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle style={{ fontSize: "18px", color: "#333333" }}>
                <TrendingUp className="h-5 w-5 mr-2 inline" />
                Resumo da Semana
              </CardTitle>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger
                  className="w-32 h-8"
                  style={{ borderRadius: "12px" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="year">Este ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <p style={{ fontSize: "12px", color: "#666666" }}>Ganhos</p>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#10B981",
                  }}
                >
                  R$ {weeklyStats.totalEarnings.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <div className="text-center">
                <p style={{ fontSize: "12px", color: "#666666" }}>Entregas</p>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#2D9CDB",
                  }}
                >
                  {weeklyStats.totalDeliveries}
                </p>
              </div>
              <div className="text-center">
                <p style={{ fontSize: "12px", color: "#666666" }}>Avaliação</p>
                <div className="flex items-center justify-center">
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#F59E0B",
                    }}
                  >
                    {weeklyStats.averageRating}
                  </p>
                  <span style={{ color: "#F59E0B", marginLeft: "2px" }}>★</span>
                </div>
              </div>
              <div className="text-center">
                <p style={{ fontSize: "12px", color: "#666666" }}>Distância</p>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#3DBEAB",
                  }}
                >
                  {weeklyStats.totalDistance} km
                </p>
              </div>
              <div className="text-center">
                <p style={{ fontSize: "12px", color: "#666666" }}>Horas</p>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#8B5CF6",
                  }}
                >
                  {weeklyStats.totalHours}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-3 h-4 w-4"
              style={{ color: "#666666" }}
            />
            <Input
              placeholder="Buscar por loja, cliente ou pedido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
              style={{ borderRadius: "12px", fontSize: "14px" }}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="mb-6"
        >
          <TabsList
            className="grid w-full grid-cols-3"
            style={{ backgroundColor: "#F8F9FA", borderRadius: "12px" }}
          >
            <TabsTrigger
              value="all"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              Todas ({deliveryHistory.length})
            </TabsTrigger>
            <TabsTrigger
              value="delivered"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              Entregues (
              {deliveryHistory.filter((d) => d.status === "delivered").length})
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              Canceladas (
              {deliveryHistory.filter((d) => d.status === "cancelled").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Delivery History List */}
        <div className="space-y-4">
          {filteredHistory.map((delivery) => {
            const statusInfo = getStatusInfo(delivery.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card
                key={delivery.id}
                style={{ borderRadius: "12px", border: "1px solid #E1F5FE" }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: statusInfo.bg }}
                      >
                        <StatusIcon
                          className="h-5 w-5"
                          style={{ color: statusInfo.color }}
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
                          #{delivery.id}
                        </h3>
                        <p style={{ fontSize: "12px", color: "#666666" }}>
                          {new Date(delivery.date).toLocaleDateString("pt-BR")}{" "}
                          • {delivery.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge
                        style={{
                          backgroundColor: statusInfo.bg,
                          color: statusInfo.color,
                          fontSize: "11px",
                        }}
                      >
                        {statusInfo.label}
                      </Badge>
                      {delivery.status === "delivered" && (
                        <div className="text-right">
                          <p
                            style={{
                              fontSize: "16px",
                              fontWeight: "700",
                              color: "#10B981",
                            }}
                          >
                            R$ {delivery.earnings.toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Store
                          className="h-4 w-4"
                          style={{ color: "#F59E0B" }}
                        />
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#333333",
                          }}
                        >
                          {delivery.store}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin
                          className="h-4 w-4"
                          style={{ color: "#10B981" }}
                        />
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#333333",
                          }}
                        >
                          {delivery.customer}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p style={{ fontSize: "11px", color: "#666666" }}>
                          Distância
                        </p>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#333333",
                          }}
                        >
                          {delivery.distance} km
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: "#666666" }}>
                          Tempo
                        </p>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#333333",
                          }}
                        >
                          {delivery.duration}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: "#666666" }}>
                          Avaliação
                        </p>
                        <div className="flex justify-center">
                          {renderStarRating(delivery.rating)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: "#666666" }}>
                      {delivery.items} item(s)
                    </span>
                    {delivery.status === "cancelled" && (
                      <span style={{ color: "#EF4444" }}>
                        Entrega cancelada
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredHistory.length === 0 && (
          <Card style={{ borderRadius: "12px", border: "1px solid #E1F5FE" }}>
            <CardContent className="p-8 text-center">
              <Clock
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
                Nenhuma entrega encontrada
              </h3>
              <p style={{ fontSize: "14px", color: "#666666" }}>
                Não há entregas que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
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
            style={{ color: "#666666" }}
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
            style={{ color: "#3DBEAB" }}
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
