import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DataTable, Column, Action } from "../../components/admin/DataTable";
import { AdminModal } from "../../components/admin/AdminModal";
import {
  ClipboardDocumentListIcon,
  EyeIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { orderApi, type OrderFormatted } from "@/lib/admin";
import { useNotification } from "@/contexts/NotificationContext";

const AdminOrders: React.FC = () => {
  const { success, error } = useNotification();
  const [selectedOrder, setSelectedOrder] = useState<OrderFormatted | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [orders, setOrders] = useState<OrderFormatted[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    emAndamento: 0,
    entregues: 0,
    cancelados: 0,
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const [formattedOrders, orderStats] = await Promise.all([
        orderApi.getFormattedOrders(),
        orderApi.getStats(),
      ]);

      setOrders(formattedOrders);
      setStats(orderStats);
    } catch (error: any) {
      console.error("Erro ao carregar pedidos:", error);
      error(error.message || "Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      PENDENTE: "Pendente",
      AGUARDANDO_PAGAMENTO: "Aguardando Pagamento",
      CONFIRMADO: "Confirmado",
      EM_PREPARACAO: "Em Preparação",
      EM_TRANSITO: "Em Trânsito",
      ENTREGUE: "Entregue",
      CANCELADO: "Cancelado",
    };
    return statusMap[status] || status;
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      success("Status do pedido atualizado com sucesso");
      loadOrders();
      setSelectedOrder(null);
      setShowOrderModal(false);
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      error(error.message || "Erro ao atualizar status do pedido");
    }
  };

  const handleCancelOrder = async (orderId: string, motivo: string) => {
    try {
      await orderApi.cancelOrder(orderId, motivo);
      success("Pedido cancelado com sucesso");
      loadOrders();
      setSelectedOrder(null);
      setShowOrderModal(false);
    } catch (error: any) {
      console.error("Erro ao cancelar pedido:", error);
      error(error.message || "Erro ao cancelar pedido");
    }
  };

  const columns: Column[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "date", label: "Data", sortable: true },
    { key: "customer", label: "Cliente", sortable: true },
    { key: "store", label: "Loja", sortable: true },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (total) => `R$ ${total}`,
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
                  : status === "Cancelado"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
          }`}
        >
          {status}
        </span>
      ),
    },
    { key: "paymentMethod", label: "Pagamento", sortable: true },
    {
      key: "deliveryTime",
      label: "Entrega",
      render: (deliveryTime) => deliveryTime || "N/A",
    },
  ];

  const filteredOrders = orders.filter((order) => {
    // Filtro de status
    if (filterStatus !== "all" && order.status !== filterStatus) return false;
    
    // Filtro de período
    if (filterPeriod !== "all") {
      const orderDate = order.fullOrder?.criadoEm ? new Date(order.fullOrder.criadoEm) : null;
      if (!orderDate) return false;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (filterPeriod === "today") {
        const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
        if (orderDay.getTime() !== today.getTime()) return false;
      } else if (filterPeriod === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (orderDate < weekAgo) return false;
      } else if (filterPeriod === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (orderDate < monthAgo) return false;
      }
    }
    
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Gestão de Pedidos
            </h1>
            <p className="text-gray-600">
              Monitore e gerencie todos os pedidos do marketplace
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={loadOrders}
              disabled={loading}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Atualizando...' : 'Atualizar'}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <ClipboardDocumentListIcon className="w-6 h-6 text-gray-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-semibold text-[#111827]">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-xl font-semibold text-[#111827]">{stats.emAndamento}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ArrowPathIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-xl font-semibold text-[#111827]">{stats.pendentes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckIcon className="w-6 h-6 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Entregues</p>
                <p className="text-xl font-semibold text-[#111827]">{stats.entregues}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XMarkIcon className="w-6 h-6 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Cancelados</p>
                <p className="text-xl font-semibold text-[#111827]">{stats.cancelados}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="Pendente">Pendente</option>
                <option value="Aguardando Pagamento">Aguardando Pagamento</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Em Preparação">Em Preparação</option>
                <option value="Em Trânsito">Em Trânsito</option>
                <option value="Entregue">Entregue</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter-period" className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                id="filter-period"
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
              >
                <option value="all">Todos os Períodos</option>
                <option value="today">Hoje</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mês</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <DataTable
          columns={columns}
          data={filteredOrders}
          itemsPerPage={10}
          onRowDoubleClick={(order) => {
            setSelectedOrder(order);
            setShowOrderModal(true);
          }}
        />

        {/* Order Details Modal */}
        <AdminModal
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          title={`Pedido #${selectedOrder?.numeroPedido || selectedOrder?.id}`}
          size="xl"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              {selectedOrder?.status !== "Cancelado" &&
                selectedOrder?.status !== "Entregue" && (
                  <button
                    onClick={() => {
                      const motivo = prompt("Motivo do cancelamento:");
                      if (motivo && selectedOrder) {
                        handleCancelOrder(selectedOrder.fullOrder?.id || selectedOrder.id, motivo);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancelar Pedido
                  </button>
                )}
            </div>
          }
        >
          {selectedOrder && selectedOrder.fullOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Informações do Pedido
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Número:</span>
                      <span className="ml-2 font-medium">
                        #{selectedOrder.numeroPedido}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Data:</span>
                      <span className="ml-2 font-medium">
                        {selectedOrder.date}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          selectedOrder.status === "Entregue"
                            ? "bg-green-100 text-green-800"
                            : selectedOrder.status === "Em Trânsito"
                              ? "bg-blue-100 text-blue-800"
                              : selectedOrder.status === "Em Preparação"
                                ? "bg-yellow-100 text-yellow-800"
                                : selectedOrder.status === "Cancelado"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedOrder.status}
                      </span>
                    </div>
                    {selectedOrder.fullOrder.codigoEntrega && (
                      <div>
                        <span className="text-gray-600">Código de Entrega:</span>
                        <span className="ml-2 font-medium font-mono">
                          {selectedOrder.fullOrder.codigoEntrega}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Cliente
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Nome:</span>
                      <span className="ml-2 font-medium">
                        {selectedOrder.customer}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Loja:</span>
                      <span className="ml-2 font-medium">
                        {selectedOrder.store}
                      </span>
                    </div>
                    {selectedOrder.fullOrder.motoristaNome && (
                      <div>
                        <span className="text-gray-600">Motorista:</span>
                        <span className="ml-2 font-medium">
                          {selectedOrder.fullOrder.motoristaNome}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Itens do Pedido ({selectedOrder.fullOrder.itens?.length || 0})
                </h4>
                {selectedOrder.fullOrder.itens && selectedOrder.fullOrder.itens.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {selectedOrder.fullOrder.itens.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="flex-1">
                          <h5 className="font-medium text-[#111827]">
                            {item.produtoNome || "Produto"}
                          </h5>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <span>Quantidade: {item.quantidade || 1}</span>
                            <span className="mx-2">•</span>
                            <span>Preço unit.: R$ {item.precoUnitario?.toFixed(2) || "0.00"}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-[#111827]">
                            R$ {((item.quantidade || 1) * (item.precoUnitario || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Nenhum item no pedido</p>
                )}
              </div>

              {/* Financial Summary */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Resumo Financeiro
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">R$ {selectedOrder.fullOrder.subtotal?.toFixed(2) || "0.00"}</span>
                  </div>
                  {selectedOrder.fullOrder.desconto > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto:</span>
                      <span className="font-medium">- R$ {selectedOrder.fullOrder.desconto?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frete:</span>
                    <span className="font-medium">R$ {selectedOrder.fullOrder.frete?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300 font-semibold text-base">
                    <span>Total:</span>
                    <span className="text-[#3DBEAB]">R$ {selectedOrder.fullOrder.total?.toFixed(2)}</span>
                  </div>
                  {selectedOrder.fullOrder.pagamento && (
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Método de Pagamento:</span>
                      <span className="font-medium">{selectedOrder.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Info */}
              {selectedOrder.fullOrder.enderecoEntrega && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Endereço de Entrega
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm">
                    <p className="text-gray-700">
                      {selectedOrder.fullOrder.enderecoEntrega.logradouro}, {selectedOrder.fullOrder.enderecoEntrega.numero}
                      {selectedOrder.fullOrder.enderecoEntrega.complemento && ` - ${selectedOrder.fullOrder.enderecoEntrega.complemento}`}
                    </p>
                    <p className="text-gray-700">
                      {selectedOrder.fullOrder.enderecoEntrega.bairro}
                    </p>
                    <p className="text-gray-700">
                      {selectedOrder.fullOrder.enderecoEntrega.cidade} - {selectedOrder.fullOrder.enderecoEntrega.estado}
                    </p>
                    <p className="text-gray-700">
                      CEP: {selectedOrder.fullOrder.enderecoEntrega.cep}
                    </p>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Datas Importantes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 block">Criado em:</span>
                    <span className="font-medium">{selectedOrder.date}</span>
                  </div>
                  {selectedOrder.fullOrder.confirmadoEm && (
                    <div>
                      <span className="text-gray-600 block">Confirmado em:</span>
                      <span className="font-medium">
                        {new Date(selectedOrder.fullOrder.confirmadoEm).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {selectedOrder.fullOrder.entregueEm && (
                    <div>
                      <span className="text-gray-600 block">Entregue em:</span>
                      <span className="font-medium">
                        {new Date(selectedOrder.fullOrder.entregueEm).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </AdminModal>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
