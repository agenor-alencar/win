import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { KPICard } from "../../components/admin/KPICard";
import {
  SalesChart,
  RevenueChart,
  CategoryChart,
} from "../../components/admin/Charts";
import { DataTable, Column } from "../../components/admin/DataTable";
import {
  UsersIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useNotification } from "@/contexts/NotificationContext";
import { dashboardApi, type RecentOrder, type RecentStore } from "@/lib/DashboardApi";

const AdminDashboard: React.FC = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalOrders: 0,
    todayOrders: 0,
    monthRevenue: 0,
  });
  const [fullStats, setFullStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentStores, setRecentStores] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas consolidadas do novo endpoint
      const stats = await dashboardApi.getStats();
      setFullStats(stats); // Armazenar estatísticas completas
      setDashboardData({
        totalUsers: stats.totalUsuarios,
        totalStores: stats.totalLojas,
        totalOrders: stats.totalPedidos,
        todayOrders: stats.pedidosHoje,
        monthRevenue: stats.receitaMesAtual,
      });

      // Buscar pedidos recentes
      const orders = await dashboardApi.getRecentOrders();
      const ordersFormatted = orders.map((order: RecentOrder) => ({
        id: order.numeroPedido,
        customer: order.clienteNome,
        store: order.lojistaNome,
        value: order.valorTotal.toFixed(2),
        status: order.status,
      }));
      setRecentOrders(ordersFormatted);

      // Buscar lojas recentes
      const stores = await dashboardApi.getRecentStores();
      const storesFormatted = stores.map((store: RecentStore) => ({
        name: store.nomeFantasia,
        category: "Marketplace", // Categoria padrão
        owner: store.usuarioNome,
        rating: "Novo",
        status: store.ativo ? "Ativo" : "Inativo",
      }));
      setRecentStores(storesFormatted);

      // Buscar dados para gráficos
      const chartData = await dashboardApi.getChartData();
      
      // Formatar dados de vendas
      const salesFormatted = chartData.vendas.map((venda, index) => ({
        name: venda.mes,
        vendas: venda.quantidade,
        receita: chartData.receitas[index]?.valor || 0,
      }));
      setSalesData(salesFormatted);

      // Formatar dados de receita
      const revenueFormatted = chartData.receitas.map((receita) => ({
        name: receita.mes,
        receita: receita.valor,
      }));
      setRevenueData(revenueFormatted);

      // Formatar dados de categorias (top 5)
      const colors = ["#3DBEAB", "#2D9CDB", "#8B5CF6", "#F59E0B", "#EF4444"];
      const categoriesFormatted = chartData.categorias
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5)
        .map((cat, index) => ({
          name: cat.nome,
          value: cat.quantidade,
          color: colors[index % colors.length],
        }));
      setCategoryData(categoriesFormatted);

    } catch (error: any) {
      console.error("Erro ao carregar dashboard:", error);
      showNotification(
        "Erro ao carregar dados do dashboard",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // KPIs com dados reais e variações percentuais
  const kpiData = [
    {
      title: "Total Usuários",
      value: dashboardData.totalUsers.toString(),
      change: { 
        value: fullStats?.variacaoPedidosHoje || 0, 
        type: (fullStats?.variacaoPedidosHoje || 0) >= 0 ? "increase" as const : "decrease" as const, 
        period: "vs ontem" 
      },
      icon: UsersIcon,
      color: "green" as const,
      link: "/admin/users",
    },
    {
      title: "Total Lojas",
      value: dashboardData.totalStores.toString(),
      change: { 
        value: fullStats?.totalLojasAtivas || 0, 
        type: "increase" as const, 
        period: `${fullStats?.totalLojasAtivas || 0} ativas` 
      },
      icon: BuildingStorefrontIcon,
      color: "blue" as const,
      link: "/admin/stores",
    },
    {
      title: "Pedidos Hoje",
      value: dashboardData.todayOrders.toString(),
      change: { 
        value: Math.abs(fullStats?.variacaoPedidosHoje || 0), 
        type: (fullStats?.variacaoPedidosHoje || 0) >= 0 ? "increase" as const : "decrease" as const, 
        period: "vs ontem" 
      },
      icon: ShoppingCartIcon,
      color: "purple" as const,
      link: "/admin/orders",
    },
    {
      title: "Receita Mês",
      value: `R$ ${dashboardData.monthRevenue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: {
        value: Math.abs(fullStats?.variacaoReceitaMes || 0),
        type: (fullStats?.variacaoReceitaMes || 0) >= 0 ? "increase" as const : "decrease" as const,
        period: "vs mês anterior",
      },
      icon: BanknotesIcon,
      color: "orange" as const,
      link: "/admin/finances",
    },
  ];

  // Calcular métricas rápidas baseadas em dados reais
  const ticketMedio = fullStats?.ticketMedio || 0;
  const taxaConversao = fullStats?.taxaConversao || 0;

  // Recent orders columns
  const orderColumns: Column[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "customer", label: "Cliente", sortable: true },
    { key: "store", label: "Loja", sortable: true },
    {
      key: "value",
      label: "Valor",
      sortable: true,
      render: (value) => `R$ ${value}`,
    },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            status === "Entregue"
              ? "bg-green-100 text-green-800"
              : status === "Em entrega"
                ? "bg-blue-100 text-blue-800"
                : status === "Preparando"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
          }`}
        >
          {status}
        </span>
      ),
    },
  ];

  // Recent stores columns
  const storeColumns: Column[] = [
    { key: "name", label: "Nome", sortable: true },
    { key: "category", label: "Categoria", sortable: true },
    { key: "owner", label: "Proprietário", sortable: true },
    {
      key: "rating",
      label: "Avaliação",
      render: (rating) => (
        <div className="flex items-center">
          <span className="text-yellow-400">★</span>
          <span className="ml-1">{rating}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            status === "Ativo"
              ? "bg-green-100 text-green-800"
              : status === "Pendente"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Dashboard</h1>
            <p className="text-gray-600">Visão geral do marketplace WIN</p>
          </div>
          <button 
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <Link
              key={index}
              to={kpi.link}
              className="transition-transform hover:scale-105"
            >
              <KPICard {...kpi} />
            </Link>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart data={salesData.length > 0 ? salesData : [{ name: "Sem dados", vendas: 0, receita: 0 }]} />
          <RevenueChart data={revenueData.length > 0 ? revenueData : [{ name: "Sem dados", receita: 0 }]} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CategoryChart data={categoryData.length > 0 ? categoryData : [{ name: "Sem dados", value: 0, color: "#3DBEAB" }]} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-[#111827] mb-4">
              Métricas Rápidas
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taxa de conversão</span>
                <span className="font-medium text-[#111827]">
                  {taxaConversao.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ticket médio</span>
                <span className="font-medium text-[#111827]">
                  R$ {ticketMedio.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de pedidos</span>
                <span className="font-medium text-[#111827]">{dashboardData.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lojas ativas</span>
                <span className="font-medium text-[#111827]">
                  {fullStats?.totalLojasAtivas || 0} de {dashboardData.totalStores}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Produtos ativos</span>
                <span className="font-medium text-[#111827]">
                  {fullStats?.totalProdutosAtivos || 0} de {fullStats?.totalProdutos || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-[#111827] mb-4">
              Lojas Recentes
            </h3>
            {loading ? (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-64 flex items-center justify-center">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : recentStores.length > 0 ? (
              <DataTable
                columns={storeColumns}
                data={recentStores}
                searchable={false}
                itemsPerPage={5}
              />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-64 flex items-center justify-center">
                <p className="text-gray-500">Nenhuma loja cadastrada ainda</p>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#111827] mb-4">
              Pedidos Recentes
            </h3>
            {loading ? (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-64 flex items-center justify-center">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : recentOrders.length > 0 ? (
              <DataTable
                columns={orderColumns}
                data={recentOrders}
                searchable={false}
                itemsPerPage={5}
              />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-64 flex items-center justify-center">
                <p className="text-gray-500">Nenhum pedido realizado ainda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
