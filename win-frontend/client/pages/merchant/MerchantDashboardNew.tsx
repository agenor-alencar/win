import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  Eye,
  Calendar,
  Users,
  ShoppingBag,
  AlertCircle,
  RotateCcw,
  ArrowUpRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import MerchantNavbar from "../../components/MerchantNavbar";

// Mock data
const salesData = [
  { day: "Seg", vendas: 12, receita: 1200 },
  { day: "Ter", vendas: 18, receita: 1890 },
  { day: "Qua", vendas: 23, receita: 2300 },
  { day: "Qui", vendas: 16, receita: 1650 },
  { day: "Sex", vendas: 28, receita: 2800 },
  { day: "Sab", vendas: 32, receita: 3200 },
  { day: "Dom", vendas: 25, receita: 2500 },
];

const recentOrders = [
  {
    id: "#12345",
    customer: "João Silva",
    product: "Parafuso Phillips 3x20mm",
    amount: 125.9,
    status: "pending",
    date: "2024-01-15",
  },
  {
    id: "#12346",
    customer: "Maria Santos",
    product: "Fechadura Digital",
    amount: 459.9,
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: "#12347",
    customer: "Carlos Lima",
    product: "Broca 10mm",
    amount: 89.5,
    status: "processing",
    date: "2024-01-14",
  },
  {
    id: "#12348",
    customer: "Ana Costa",
    product: "Tinta Látex 18L",
    amount: 189.9,
    status: "completed",
    date: "2024-01-14",
  },
];

const topProducts = [
  {
    name: "Parafuso Phillips 3x20mm",
    sales: 156,
    revenue: 1250.4,
    stock: 850,
  },
  {
    name: "Fechadura Digital Smart",
    sales: 89,
    revenue: 4590.0,
    stock: 23,
  },
  {
    name: "Broca Aço Rápido 10mm",
    sales: 134,
    revenue: 890.5,
    stock: 156,
  },
  {
    name: "Tinta Látex Premium 18L",
    sales: 67,
    revenue: 2340.3,
    stock: 45,
  },
];

const lowStockProducts = [
  { name: "Fechadura Digital Smart", stock: 3, minStock: 10 },
  { name: "Furadeira Impact Pro", stock: 5, minStock: 15 },
  { name: "Parafuso Inox 4x30mm", stock: 12, minStock: 50 },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Concluído
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="h-3 w-3 mr-1" />
          Pendente
        </Badge>
      );
    case "processing":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Package className="h-3 w-3 mr-1" />
          Processando
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelado
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function MerchantDashboardNew() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  return (
    <div className="min-h-screen bg-gray-50">
      <MerchantNavbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Olá, João! 👋
              </h1>
              <p className="text-gray-600">
                Bem-vindo ao painel da sua loja "Ferragens Premium"
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/merchant/products/new">
                <Button className="bg-[#3DBEAB] hover:bg-[#3DBEAB]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </Button>
              </Link>
              <Link to="/merchant/profile">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Loja
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Vendas Hoje
                  </p>
                  <p className="text-2xl font-bold text-gray-900">32</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+12%</span>
                    <span className="text-sm text-gray-500 ml-2">vs ontem</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Receita Hoje
                  </p>
                  <p className="text-2xl font-bold text-gray-900">R$ 3.250</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+8.2%</span>
                    <span className="text-sm text-gray-500 ml-2">vs ontem</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Produtos Ativos
                  </p>
                  <p className="text-2xl font-bold text-gray-900">248</p>
                  <div className="flex items-center mt-2">
                    <Plus className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-600">3 novos</span>
                    <span className="text-sm text-gray-500 ml-2">
                      esta semana
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avaliação Média
                  </p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                  <div className="flex items-center mt-2">
                    <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                    <span className="text-sm text-yellow-600">
                      156 avaliações
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vendas da Semana</CardTitle>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Esta Semana
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      name === "vendas" ? value : `R$ ${value}`,
                      name === "vendas" ? "Vendas" : "Receita",
                    ]}
                  />
                  <Bar dataKey="vendas" fill="#3DBEAB" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Receita da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`R$ ${value}`, "Receita"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="receita"
                    stroke="#2D9CDB"
                    strokeWidth={3}
                    dot={{ fill: "#2D9CDB", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pedidos Recentes</CardTitle>
                <Link to="/merchant/orders">
                  <Button variant="outline" size="sm">
                    Ver Todos
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {order.product}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-green-600">
                        R$ {order.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Produtos Mais Vendidos</CardTitle>
                <Link to="/merchant/products">
                  <Button variant="outline" size="sm">
                    Ver Todos
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.sales} vendas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        R$ {product.revenue.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Estoque: {product.stock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-orange-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                Produtos com Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-600">
                        Estoque mínimo: {product.minStock}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">
                        {product.stock} unidades
                      </p>
                      <Button size="sm" variant="outline" className="mt-1">
                        Repor
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/merchant/products/new">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Plus className="h-6 w-6" />
                    <span>Novo Produto</span>
                  </Button>
                </Link>
                <Link to="/merchant/orders">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <ShoppingBag className="h-6 w-6" />
                    <span>Ver Pedidos</span>
                  </Button>
                </Link>
                <Link to="/merchant/returns">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <RotateCcw className="h-6 w-6" />
                    <span>Devoluções</span>
                  </Button>
                </Link>
                <Link to="/merchant/financial">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <DollarSign className="h-6 w-6" />
                    <span>Financeiro</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
