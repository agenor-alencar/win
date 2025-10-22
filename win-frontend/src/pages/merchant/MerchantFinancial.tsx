import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Eye,
  CreditCard,
  Banknote,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { MerchantLayout } from "@/components/MerchantLayout";
import { api } from "@/lib/Api";
import { useNotification } from "@/contexts/NotificationContext";

// TypeScript interfaces
interface Order {
  id: string;
  numeroPedido: string;
  usuarioId: string;
  usuarioNome: string;
  status: string;
  subtotal: number;
  desconto: number;
  frete: number;
  total: number;
  criadoEm: string;
  confirmadoEm: string | null;
  entregueEm: string | null;
  itens: OrderItem[];
  pagamento?: {
    metodoPagamento: string;
    statusPagamento: string;
  };
}

interface OrderItem {
  id: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  produto: {
    nome: string;
  };
}

interface Lojista {
  id: string;
  usuarioId: string;
  nomeFantasia: string;
}

interface MonthlyData {
  month: string;
  receita: number;
  vendas: number;
}

interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  fee: number;
  net: number;
  date: string;
  status: string;
}

const expenseData = [
  { category: "Produtos", value: 15000, color: "#3DBEAB" },
  { category: "Frete", value: 3200, color: "#2D9CDB" },
  { category: "Comissões WIN", value: 2100, color: "#8B5CF6" },
  { category: "Marketing", value: 1800, color: "#F59E0B" },
  { category: "Outros", value: 900, color: "#EF4444" },
];

export default function MerchantFinancial() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lojista, setLojista] = useState<Lojista | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { error: showError } = useNotification();

  // Estados para dados calculados
  const [revenueData, setRevenueData] = useState<MonthlyData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [averageTicket, setAverageTicket] = useState(0);
  const [totalFees, setTotalFees] = useState(0);

  useEffect(() => {
    fetchFinancialData();
  }, [selectedPeriod]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      // 1. Buscar lojista logado
      const lojistaResponse = await api.get("/api/v1/lojistas/me");
      const lojistaData: Lojista = lojistaResponse.data;
      setLojista(lojistaData);

      // 2. Buscar pedidos do lojista
      const ordersResponse = await api.get(
        `/api/v1/pedidos/lojista/${lojistaData.id}`
      );
      const ordersData: Order[] = ordersResponse.data;

      // 3. Filtrar pedidos por período
      const filteredOrders = filterOrdersByPeriod(ordersData, selectedPeriod);
      setOrders(filteredOrders);

      // 4. Calcular estatísticas
      calculateFinancialStats(filteredOrders);
      
      // 5. Gerar dados de gráficos
      generateChartData(filteredOrders);
      
      // 6. Gerar transações
      generateTransactions(filteredOrders);

    } catch (err: any) {
      console.error("Erro ao buscar dados financeiros:", err);
      showError(
        "Erro ao carregar dados",
        err.response?.data?.message || "Não foi possível carregar os dados financeiros"
      );
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByPeriod = (orders: Order[], period: string): Order[] => {
    const now = new Date();
    const filterDate = new Date();

    switch (period) {
      case "7d":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        filterDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        filterDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return orders;
    }

    return orders.filter((order) => {
      const orderDate = new Date(order.criadoEm);
      return orderDate >= filterDate;
    });
  };

  const calculateFinancialStats = (orders: Order[]) => {
    // Filtrar apenas pedidos confirmados/entregues para receita
    const completedOrders = orders.filter(
      (o) => o.status === "CONFIRMADO" || o.status === "ENTREGUE"
    );

    const revenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const orderCount = completedOrders.length;
    const avgTicket = orderCount > 0 ? revenue / orderCount : 0;
    
    // Taxa WIN: 5% sobre o subtotal
    const fees = completedOrders.reduce((sum, order) => sum + (order.subtotal * 0.05), 0);

    setTotalRevenue(revenue);
    setTotalOrders(orderCount);
    setAverageTicket(avgTicket);
    setTotalFees(fees);
  };

  const generateChartData = (orders: Order[]) => {
    // Agrupar pedidos por mês
    const monthlyStats: { [key: string]: { receita: number; vendas: number } } = {};

    orders.forEach((order) => {
      if (order.status === "CONFIRMADO" || order.status === "ENTREGUE") {
        const date = new Date(order.criadoEm);
        const monthKey = date.toLocaleDateString("pt-BR", {
          month: "short",
          year: "numeric",
        });

        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = { receita: 0, vendas: 0 };
        }

        monthlyStats[monthKey].receita += order.total;
        monthlyStats[monthKey].vendas += 1;
      }
    });

    // Converter para array e ordenar
    const chartData = Object.entries(monthlyStats)
      .map(([month, data]) => ({
        month,
        receita: data.receita,
        vendas: data.vendas,
      }))
      .sort((a, b) => {
        // Ordenar por data
        return new Date(a.month).getTime() - new Date(b.month).getTime();
      });

    setRevenueData(chartData);
  };

  const generateTransactions = (orders: Order[]) => {
    const txns: Transaction[] = orders
      .filter((o) => o.status === "CONFIRMADO" || o.status === "ENTREGUE")
      .map((order) => {
        const fee = order.subtotal * 0.05; // 5% de taxa WIN
        const net = order.total - fee;

        return {
          id: order.numeroPedido,
          type: "credit",
          description: `Venda - Pedido #${order.numeroPedido}`,
          amount: order.total,
          fee,
          net,
          date: new Date(order.criadoEm).toLocaleDateString("pt-BR"),
          status: "completed",
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20); // Últimas 20 transações

    setTransactions(txns);
  };

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
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Falhou
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <MerchantLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Centro Financeiro
            </h1>
            <p className="text-gray-600">
              Acompanhe receitas, despesas e extratos
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 3 meses</SelectItem>
                <SelectItem value="1y">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 animate-spin text-[#3DBEAB] mx-auto mb-4" />
              <p className="text-gray-600">Carregando dados financeiros...</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Receita Total
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <div className="flex items-center mt-2">
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-gray-500 ml-2">
                          {totalOrders} vendas
                        </span>
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
                    Lucro Líquido
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {(totalRevenue - totalFees).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-500">
                      Após taxas WIN
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Taxas WIN (5%)
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {totalFees.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-500">
                      Sobre subtotal
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Ticket Médio
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {averageTicket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-500">
                      Por pedido
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
            <TabsTrigger value="payouts">Recebimentos</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Receita Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any, name: any) => [
                          name === "receita"
                            ? `R$ ${value.toLocaleString()}`
                            : value,
                          name === "receita" ? "Receita" : "Vendas",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="receita"
                        stroke="#3DBEAB"
                        strokeWidth={3}
                        dot={{ fill: "#3DBEAB", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Expense Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [
                          `R$ ${value.toLocaleString()}`,
                          "Valor",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {expenseData.map((item) => (
                      <div key={item.category} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-gray-600">
                          {item.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Comparativo Mensal - Receita vs Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={revenueData.map((item, index) => ({
                      ...item,
                      despesas:
                        expenseData.reduce(
                          (total, expense) => total + expense.value,
                          0,
                        ) / 6,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `R$ ${value.toLocaleString()}`,
                        name === "receita" ? "Receita" : "Despesas",
                      ]}
                    />
                    <Bar dataKey="receita" fill="#3DBEAB" name="receita" />
                    <Bar dataKey="despesas" fill="#EF4444" name="despesas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Histórico de Transações</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={selectedFilter}
                      onValueChange={setSelectedFilter}
                    >
                      <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="credit">Créditos</SelectItem>
                        <SelectItem value="debit">Débitos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transaction.type === "credit"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          {transaction.type === "credit" ? (
                            <ArrowUpRight className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString(
                              "pt-BR",
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p
                              className={`font-semibold ${
                                transaction.type === "credit"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "credit" ? "+" : ""}R${" "}
                              {Math.abs(transaction.amount).toFixed(2)}
                            </p>
                            {transaction.fee > 0 && (
                              <p className="text-sm text-gray-500">
                                Taxa: R$ {transaction.fee.toFixed(2)}
                              </p>
                            )}
                            <p className="text-sm font-medium text-gray-900">
                              Líquido: R$ {transaction.net.toFixed(2)}
                            </p>
                          </div>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Despesas por Categoria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {expenseData.map((expense) => (
                    <div
                      key={expense.category}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: expense.color }}
                        ></div>
                        <span className="font-medium">{expense.category}</span>
                      </div>
                      <span className="font-semibold">
                        R$ {expense.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Despesa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      placeholder="Ex: Compra de produtos"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Valor</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0,00"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="products">Produtos</SelectItem>
                          <SelectItem value="shipping">Frete</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="others">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full bg-[#3DBEAB] hover:bg-[#3DBEAB]/90">
                    Adicionar Despesa
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Saldo Disponível
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ 2.847,52
                      </p>
                    </div>
                    <Wallet className="h-8 w-8 text-green-600" />
                  </div>
                  <Button className="w-full mt-4 bg-[#3DBEAB] hover:bg-[#3DBEAB]/90">
                    <Banknote className="h-4 w-4 mr-2" />
                    Sacar Valor
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Pendente de Recebimento
                      </p>
                      <p className="text-2xl font-bold text-yellow-600">
                        R$ 1.456,20
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Disponível em 2-3 dias úteis
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Recebido Este Mês
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        R$ 18.420,30
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex items-center mt-4">
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+15.2%</span>
                    <span className="text-sm text-gray-500 ml-2">
                      vs mês anterior
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </>
        )}
      </div>
    </MerchantLayout>
  );
}
