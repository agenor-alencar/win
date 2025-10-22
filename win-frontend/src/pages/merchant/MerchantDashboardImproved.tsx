import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Eye,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import { MerchantLayout } from "../../components/MerchantLayout";
import { api } from "@/lib/Api";
import { useToast } from "@/hooks/use-toast";

// Types
interface KPIData {
  title: string;
  value: string;
  change: number;
  isPositive: boolean;
  icon: React.ElementType;
  link: string;
}

interface Product {
  id: string;
  nome: string;
  estoque: number;
  preco: number;
  ativo: boolean;
}

interface Order {
  id: string;
  numeroPedido: string;
  usuario: {
    nome: string;
  };
  total: number;
  status: string;
  criadoEm: string;
  itens: Array<{
    nomeProduto: string;
    quantidade: number;
  }>;
}

interface Lojista {
  id: string;
  nomeFantasia: string;
  cnpj: string;
  ativo: boolean;
}

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
}

const MerchantDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [lojista, setLojista] = useState<Lojista | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageTicket: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Buscar dados do lojista logado
      const { data: lojistaData } = await api.get<Lojista>("/api/v1/lojistas/me");
      setLojista(lojistaData);

      // 2. Buscar produtos do lojista
      const { data: productsData } = await api.get<Product[]>(
        `/api/v1/produtos/lojista/${lojistaData.id}`
      );
      setProducts(productsData);

      // 3. Buscar pedidos do lojista usando o novo endpoint otimizado
      const { data: ordersData } = await api.get<Order[]>(
        `/api/v1/pedidos/lojista/${lojistaData.id}`
      );
      
      setOrders(ordersData);

      // 4. Calcular estatísticas
      const activeProducts = productsData.filter((p) => p.ativo).length;
      const lowStockProducts = productsData.filter((p) => p.estoque < 10 && p.ativo).length;
      const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0);
      const averageTicket = ordersData.length > 0 ? totalRevenue / ordersData.length : 0;

      setStats({
        totalProducts: productsData.length,
        activeProducts,
        lowStockProducts,
        totalOrders: ordersData.length,
        totalRevenue,
        averageTicket,
      });

      setLoading(false);
    } catch (error: any) {
      console.error("Erro ao buscar dados do dashboard:", error);
      toast({
        title: "Erro ao carregar dados",
        description: error.response?.data?.message || "Não foi possível carregar os dados do dashboard",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const kpiData: KPIData[] = [
    {
      title: "Total de Produtos",
      value: stats.totalProducts.toString(),
      change: stats.activeProducts > 0 ? Math.round((stats.activeProducts / stats.totalProducts) * 100) : 0,
      isPositive: stats.activeProducts > stats.totalProducts / 2,
      icon: Package,
      link: "/merchant/products",
    },
    {
      title: "Vendas Totais",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(stats.totalRevenue),
      change: 0,
      isPositive: true,
      icon: DollarSign,
      link: "/merchant/financial",
    },
    {
      title: "Pedidos",
      value: stats.totalOrders.toString(),
      change: 0,
      isPositive: true,
      icon: ShoppingCart,
      link: "/merchant/orders",
    },
    {
      title: "Ticket Médio",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(stats.averageTicket),
      change: 0,
      isPositive: true,
      icon: TrendingUp,
      link: "/merchant/financial",
    },
  ];

  // Dados para o gráfico de vendas (últimos 7 dias - mock temporário)
  const salesData = [
    { name: "Seg", vendas: 0, receita: 0 },
    { name: "Ter", vendas: 0, receita: 0 },
    { name: "Qua", vendas: 0, receita: 0 },
    { name: "Qui", vendas: 0, receita: 0 },
    { name: "Sex", vendas: 0, receita: 0 },
    { name: "Sáb", vendas: 0, receita: 0 },
    { name: "Dom", vendas: Math.floor(stats.totalOrders / 7), receita: Math.floor(stats.totalRevenue / 7) },
  ];

  // Top 5 produtos mais vendidos
  const topProducts = products
    .filter((p) => p.ativo)
    .sort((a, b) => b.preco * (10 - Math.min(b.estoque, 10)) - a.preco * (10 - Math.min(a.estoque, 10)))
    .slice(0, 5);

  // Produtos com estoque baixo
  const lowStockProducts = products
    .filter((p) => p.estoque < 10 && p.ativo)
    .sort((a, b) => a.estoque - b.estoque)
    .slice(0, 5);

  // Pedidos recentes (últimos 5)
  const recentOrders = orders
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
    .slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getOrderStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDENTE: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
      CONFIRMADO: { label: "Confirmado", className: "bg-blue-100 text-blue-800" },
      PREPARANDO: { label: "Preparando", className: "bg-purple-100 text-purple-800" },
      PRONTO: { label: "Pronto", className: "bg-indigo-100 text-indigo-800" },
      EM_TRANSITO: { label: "Em Trânsito", className: "bg-orange-100 text-orange-800" },
      ENTREGUE: { label: "Entregue", className: "bg-green-100 text-green-800" },
      CANCELADO: { label: "Cancelado", className: "bg-red-100 text-red-800" },
    };

    const statusInfo = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return (
      <Badge className={`${statusInfo.className} hover:${statusInfo.className}`}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="w-8 h-8 animate-spin text-[#3DBEAB]" />
          <span className="ml-3 text-lg">Carregando dashboard...</span>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Bem-vindo ao painel da sua loja {lojista?.nomeFantasia || ""}
            </p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={fetchDashboardData}
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Link key={index} to={kpi.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] rounded-lg">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          kpi.isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {kpi.isPositive ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        <span className="font-medium">{kpi.change}%</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {kpi.value}
                    </h3>
                    <p className="text-sm text-gray-600">{kpi.title}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Vendas da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="vendas"
                    stroke="#3DBEAB"
                    strokeWidth={2}
                    dot={{ fill: "#3DBEAB", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Receita da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar dataKey="receita" fill="#2D9CDB" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Métricas Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Produtos Ativos</span>
                <span className="font-semibold text-gray-900">{stats.activeProducts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estoque Baixo</span>
                <span className="font-semibold text-orange-600">{stats.lowStockProducts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ticket Médio</span>
                <span className="font-semibold text-gray-900">{formatCurrency(stats.averageTicket)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total de Pedidos</span>
                <span className="font-semibold text-gray-900">{stats.totalOrders}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Products & Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Top Produtos
              </CardTitle>
              <Link to="/merchant/products">
                <Button variant="ghost" size="sm">
                  Ver todos
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.length > 0 ? (
                  topProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {product.nome}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Estoque: {product.estoque}</span>
                          <span>•</span>
                          <span>{formatCurrency(product.preco)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={product.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {product.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                        <Link to={`/merchant/products/edit/${product.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">Nenhum produto cadastrado</p>
                )}
              </div>
              <div className="mt-4">
                <Link to="/merchant/products/new">
                  <Button className="w-full bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] hover:shadow-lg">
                    Cadastrar Novo Produto
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Últimos Pedidos
              </CardTitle>
              <Link to="/merchant/orders">
                <Button variant="ghost" size="sm">
                  Ver todos
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {order.numeroPedido}
                          </span>
                          {getOrderStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {order.usuario.nome}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.itens && order.itens.length > 0
                            ? order.itens[0].nomeProduto + (order.itens.length > 1 ? ` +${order.itens.length - 1}` : "")
                            : "Produtos"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(order.total)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.criadoEm).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">Nenhum pedido encontrado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="mt-6 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-2">
                    Alerta de Estoque Baixo
                  </h3>
                  <p className="text-sm text-orange-800 mb-3">
                    Alguns produtos estão com estoque baixo. Atualize o estoque
                    para evitar perder vendas.
                  </p>
                  <Link to="/merchant/products">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-orange-300 text-orange-900 hover:bg-orange-100"
                    >
                      Ver Produtos
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MerchantLayout>
  );
};

export default MerchantDashboard;
