import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Store,
  Package,
  DollarSign,
  Star,
  Clock,
  TrendingUp,
  Bell,
  Settings,
  Plus,
  Eye,
  MoreVertical,
  Calendar,
  Users,
  ShoppingBag,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { MerchantLayout } from "@/components/MerchantLayout";

// Mock data
const salesData = [
  { day: "Seg", value: 1200 },
  { day: "Ter", value: 1890 },
  { day: "Qua", value: 2300 },
  { day: "Qui", value: 1650 },
  { day: "Sex", value: 2800 },
  { day: "Sab", value: 3200 },
  { day: "Dom", value: 2100 },
];

const recentOrders = [
  {
    id: "WIN001",
    customer: "Maria Silva",
    total: 89.9,
    time: "há 5 min",
    status: "pendente",
  },
  {
    id: "WIN002",
    customer: "João Santos",
    total: 156.5,
    time: "há 12 min",
    status: "preparando",
  },
  {
    id: "WIN003",
    customer: "Ana Costa",
    total: 67.3,
    time: "há 25 min",
    status: "pronto",
  },
];

const notifications = [
  {
    id: 1,
    type: "order",
    message: "Novo pedido #WIN001 recebido",
    time: "há 2 min",
  },
  {
    id: 2,
    type: "review",
    message: "Nova avaliação 5⭐ de Maria S.",
    time: "há 15 min",
  },
  {
    id: 3,
    type: "stock",
    message: "Produto XYZ com estoque baixo",
    time: "há 1h",
  },
];

export default function MerchantDashboard() {
  const [timeRange, setTimeRange] = useState("week");

  const kpis = [
    {
      title: "Pedidos de Hoje",
      value: "12",
      change: "+3 desde ontem",
      icon: ShoppingBag,
      color: "#3DBEAB",
      bgColor: "#F0FDFA",
    },
    {
      title: "Faturamento do Mês",
      value: "R$ 8.450",
      change: "+15% vs mês anterior",
      icon: DollarSign,
      color: "#2D9CDB",
      bgColor: "#F0F9FF",
    },
    {
      title: "Média de Avaliação",
      value: "4.8",
      change: "+0.2 esta semana",
      icon: Star,
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    },
    {
      title: "Pedidos Pendentes",
      value: "3",
      change: "Aguardando preparo",
      icon: Clock,
      color: "#EF4444",
      bgColor: "#FEF2F2",
    },
  ];

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-[#3DBEAB]" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Ferragens Silva
              </h1>
              <p style={{ fontSize: "12px", color: "#666666" }}>
                Loja ativa • Última atualização há 2 min
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                3
              </Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Configurações</DropdownMenuItem>
                <DropdownMenuItem>Perfil da Loja</DropdownMenuItem>
                <DropdownMenuItem>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <Card
              key={index}
              className="rounded-xl border"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-3 rounded-full"
                    style={{ backgroundColor: kpi.bgColor }}
                  >
                    <kpi.icon
                      className="h-6 w-6"
                      style={{ color: kpi.color }}
                    />
                  </div>
                  <MoreVertical
                    className="h-4 w-4"
                    style={{ color: "#666666" }}
                  />
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#666666",
                      marginBottom: "4px",
                    }}
                  >
                    {kpi.title}
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#333333",
                      marginBottom: "4px",
                    }}
                  >
                    {kpi.value}
                  </p>
                  <p style={{ fontSize: "12px", color: kpi.color }}>
                    {kpi.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Chart */}
          <Card
            className="lg:col-span-2"
            style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle style={{ fontSize: "20px", color: "#333333" }}>
                  Vendas da Semana
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ borderRadius: "12px" }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Esta semana
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Esta semana</DropdownMenuItem>
                    <DropdownMenuItem>Mês passado</DropdownMenuItem>
                    <DropdownMenuItem>Últimos 3 meses</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" style={{ fontSize: "12px" }} />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #E5E7EB",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="#3DBEAB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle style={{ fontSize: "20px", color: "#333333" }}>
                  Pedidos Recentes
                </CardTitle>
                <Link to="/merchant/orders">
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ color: "#2D9CDB" }}
                  >
                    Ver todos
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: "#F8F9FA" }}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#333333",
                        }}
                      >
                        #{order.id}
                      </p>
                      <Badge
                        style={{
                          fontSize: "10px",
                          backgroundColor:
                            order.status === "pendente"
                              ? "#FEF2F2"
                              : order.status === "preparando"
                                ? "#FFF7ED"
                                : "#F0FDF4",
                          color:
                            order.status === "pendente"
                              ? "#EF4444"
                              : order.status === "preparando"
                                ? "#F59E0B"
                                : "#10B981",
                        }}
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#666666",
                        marginBottom: "2px",
                      }}
                    >
                      {order.customer}
                    </p>
                    <div className="flex items-center justify-between">
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#333333",
                        }}
                      >
                        R$ {order.total.toFixed(2).replace(".", ",")}
                      </p>
                      <p style={{ fontSize: "10px", color: "#666666" }}>
                        {order.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Notifications and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardHeader className="pb-4">
              <CardTitle style={{ fontSize: "20px", color: "#333333" }}>
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start space-x-3 p-3 rounded-lg"
                  style={{ backgroundColor: "#F8F9FA" }}
                >
                  <div
                    className="p-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "#E1F5FE" }}
                  >
                    {notification.type === "order" ? (
                      <ShoppingBag
                        className="h-4 w-4"
                        style={{ color: "#2D9CDB" }}
                      />
                    ) : notification.type === "review" ? (
                      <Star className="h-4 w-4" style={{ color: "#F59E0B" }} />
                    ) : (
                      <AlertCircle
                        className="h-4 w-4"
                        style={{ color: "#EF4444" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: "12px", color: "#333333" }}>
                      {notification.message}
                    </p>
                    <p style={{ fontSize: "10px", color: "#666666" }}>
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardHeader className="pb-4">
              <CardTitle style={{ fontSize: "20px", color: "#333333" }}>
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/merchant/products/new">
                <Button
                  className="w-full justify-start h-12 text-white font-medium"
                  style={{
                    backgroundColor: "#3DBEAB",
                    borderRadius: "12px",
                    fontSize: "16px",
                  }}
                >
                  <Plus className="h-5 w-5 mr-3" />
                  Adicionar Produto
                </Button>
              </Link>

              <Link to="/merchant/orders">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12"
                  style={{
                    borderRadius: "12px",
                    fontSize: "16px",
                    borderColor: "#2D9CDB",
                    color: "#2D9CDB",
                  }}
                >
                  <Eye className="h-5 w-5 mr-3" />
                  Ver Pedidos
                </Button>
              </Link>

              <Link to="/merchant/returns">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12"
                  style={{
                    borderRadius: "12px",
                    fontSize: "16px",
                    borderColor: "#F59E0B",
                    color: "#F59E0B",
                  }}
                >
                  <RotateCcw className="h-5 w-5 mr-3" />
                  Gerenciar Devoluções
                </Button>
              </Link>

              <Link to="/merchant/profile">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12"
                  style={{
                    borderRadius: "12px",
                    fontSize: "16px",
                    borderColor: "#E5E7EB",
                    color: "#333333",
                  }}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Configurar Loja
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </MerchantLayout>
  );
}
