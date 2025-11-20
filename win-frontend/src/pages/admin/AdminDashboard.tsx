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
import { api } from "@/lib/Api";
import { useNotification } from "@/contexts/NotificationContext";

const AdminDashboard: React.FC = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalOrders: 0,
    monthRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentStores, setRecentStores] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar usuários
      const usersResponse = await api.get("/api/v1/usuario/list/all");
      const totalUsers = usersResponse.data.length;

      // Buscar lojistas
      const storesResponse = await api.get("/api/v1/lojistas");
      const totalStores = storesResponse.data.length;
      
      // Pegar as 4 lojas mais recentes
      const recentStoresData = storesResponse.data
        .slice(-4)
        .reverse()
        .map((store: any) => ({
          name: store.nomeFantasia,
          category: "Geral", // Categoria padrão por enquanto
          owner: store.usuarioNome,
          rating: "4.5",
          status: store.ativo ? "Ativo" : "Inativo",
        }));
      setRecentStores(recentStoresData);

      // Por enquanto, usar valores simulados para pedidos e receita
      // TODO: Implementar quando endpoints de relatórios estiverem prontos
      const totalOrders = 0;
      const monthRevenue = 0;

      setDashboardData({
        totalUsers,
        totalStores,
        totalOrders,
        monthRevenue,
      });

      setRecentOrders([]); // Por enquanto vazio
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

  // KPIs com dados reais
  const kpiData = [
    {
      title: "Total Usuários",
      value: dashboardData.totalUsers.toString(),
      change: { value: 12, type: "increase" as const, period: "este mês" },
      icon: UsersIcon,
      color: "green" as const,
      link: "/admin/users",
    },
    {
      title: "Total Lojas",
      value: dashboardData.totalStores.toString(),
      change: { value: 8, type: "increase" as const, period: "este mês" },
      icon: BuildingStorefrontIcon,
      color: "blue" as const,
      link: "/admin/stores",
    },
    {
      title: "Pedidos Hoje",
      value: dashboardData.totalOrders.toString(),
      change: { value: 0, type: "increase" as const, period: "vs ontem" },
      icon: ShoppingCartIcon,
      color: "purple" as const,
      link: "/admin/orders",
    },
    {
      title: "Receita Mês",
      value: `R$ ${dashboardData.monthRevenue.toLocaleString("pt-BR")}`,
      change: {
        value: 0,
        type: "increase" as const,
        period: "vs mês anterior",
      },
      icon: BanknotesIcon,
      color: "orange" as const,
      link: "/admin/finances",
    },
  ];

  // Mock data for charts
  const salesData = [
    { name: "Jan", vendas: 65, receita: 28000 },
    { name: "Fev", vendas: 59, receita: 32000 },
    { name: "Mar", vendas: 80, receita: 45000 },
    { name: "Abr", vendas: 81, receita: 52000 },
    { name: "Mai", vendas: 56, receita: 38000 },
    { name: "Jun", vendas: 55, receita: 42000 },
    { name: "Jul", vendas: 89, receita: 89342 },
  ];

  const revenueData = [
    { name: "Jan", receita: 28000 },
    { name: "Fev", receita: 32000 },
    { name: "Mar", receita: 45000 },
    { name: "Abr", receita: 52000 },
    { name: "Mai", receita: 38000 },
    { name: "Jun", receita: 42000 },
    { name: "Jul", receita: 89342 },
  ];

  const categoryData = [
    { name: "Eletrônicos", value: 35, color: "#3DBEAB" },
    { name: "Roupas", value: 25, color: "#2D9CDB" },
    { name: "Casa", value: 20, color: "#8B5CF6" },
    { name: "Esportes", value: 12, color: "#F59E0B" },
    { name: "Outros", value: 8, color: "#EF4444" },
  ];

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
          <SalesChart data={salesData} />
          <RevenueChart data={revenueData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CategoryChart data={categoryData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-[#111827] mb-4">
              Métricas Rápidas
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taxa de conversão</span>
                <span className="font-medium text-[#111827]">3.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ticket médio</span>
                <span className="font-medium text-[#111827]">R$ 256,80</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Devoluções</span>
                <span className="font-medium text-[#111827]">2.1%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avaliação média</span>
                <span className="font-medium text-[#111827]">4.7 ★</span>
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
            <DataTable
              columns={storeColumns}
              data={recentStores}
              searchable={false}
              itemsPerPage={5}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#111827] mb-4">
              Estatísticas Rápidas
            </h3>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full flex items-center justify-center">
              <p className="text-gray-500">Últimos pedidos em desenvolvimento</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
