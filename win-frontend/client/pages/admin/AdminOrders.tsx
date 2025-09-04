import React, { useState } from "react";
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

const AdminOrders: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("today");

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

  const orders = [
    {
      id: "12847",
      date: "24/07/2024 14:30",
      customer: "João Silva",
      customerPhone: "(11) 99999-9999",
      customerEmail: "joao@email.com",
      store: "TechStore Pro",
      storeId: "2001",
      total: "1,299.90",
      status: "Entregue",
      paymentMethod: "Cartão de Crédito",
      deliveryTime: "45 min",
      deliveryAddress: "Rua das Flores, 123 - São Paulo, SP",
      driver: "Carlos Silva",
      driverId: "3001",
      confirmationCode: "TECH2024",
      items: [
        {
          id: "P001",
          name: "iPhone 14 Pro Max 256GB",
          price: "1,299.90",
          quantity: 1,
          image: "/products/iphone.jpg",
        },
      ],
      payment: {
        method: "Cartão de Crédito",
        card: "****1234",
        installments: 12,
        amount: "1,299.90",
        commission: "90.99",
        storeShare: "1,168.91",
        driverFee: "12.00",
      },
      timeline: [
        { time: "14:30", event: "Pedido realizado", status: "completed" },
        { time: "14:32", event: "Pagamento aprovado", status: "completed" },
        {
          time: "14:35",
          event: "Pedido confirmado pela loja",
          status: "completed",
        },
        { time: "14:50", event: "Pedido em preparação", status: "completed" },
        { time: "15:10", event: "Saiu para entrega", status: "completed" },
        { time: "15:15", event: "Entregue", status: "completed" },
      ],
    },
    {
      id: "12846",
      date: "24/07/2024 13:15",
      customer: "Maria Santos",
      customerPhone: "(11) 88888-8888",
      customerEmail: "maria@email.com",
      store: "Fashion Plus",
      storeId: "2002",
      total: "89.90",
      status: "Em entrega",
      paymentMethod: "PIX",
      deliveryTime: "Estimado 20 min",
      deliveryAddress: "Av. Paulista, 1000 - São Paulo, SP",
      driver: "João Oliveira",
      driverId: "3002",
      confirmationCode: "FASH2024",
      items: [
        {
          id: "P002",
          name: "Vestido Floral Verão 2024",
          price: "89.90",
          quantity: 1,
          image: "/products/dress.jpg",
        },
      ],
      payment: {
        method: "PIX",
        amount: "89.90",
        commission: "6.29",
        storeShare: "78.61",
        driverFee: "8.50",
      },
      timeline: [
        { time: "13:15", event: "Pedido realizado", status: "completed" },
        {
          time: "13:16",
          event: "Pagamento PIX confirmado",
          status: "completed",
        },
        {
          time: "13:18",
          event: "Pedido confirmado pela loja",
          status: "completed",
        },
        { time: "13:35", event: "Pedido em preparação", status: "completed" },
        { time: "14:00", event: "Saiu para entrega", status: "current" },
      ],
    },
    {
      id: "12845",
      date: "24/07/2024 12:45",
      customer: "Pedro Costa",
      customerPhone: "(11) 77777-7777",
      customerEmail: "pedro@email.com",
      store: "Casa Moderna",
      storeId: "2003",
      total: "234.50",
      status: "Cancelado",
      paymentMethod: "Cartão de Débito",
      deliveryTime: "N/A",
      deliveryAddress: "Rua do Lar, 456 - São Paulo, SP",
      driver: null,
      driverId: null,
      confirmationCode: "CASA2024",
      cancellationReason: "Produto em falta no estoque",
      items: [
        {
          id: "P003",
          name: "Sofá 3 Lugares Cinza",
          price: "234.50",
          quantity: 1,
          image: "/products/sofa.jpg",
        },
      ],
      payment: {
        method: "Cartão de Débito",
        card: "****5678",
        amount: "234.50",
        refunded: true,
        refundAmount: "234.50",
      },
      timeline: [
        { time: "12:45", event: "Pedido realizado", status: "completed" },
        { time: "12:46", event: "Pagamento aprovado", status: "completed" },
        { time: "12:50", event: "Cancelado pela loja", status: "cancelled" },
        { time: "12:52", event: "Reembolso processado", status: "completed" },
      ],
    },
    {
      id: "12844",
      date: "24/07/2024 11:20",
      customer: "Ana Paula",
      customerPhone: "(11) 66666-6666",
      customerEmail: "ana@email.com",
      store: "Sport Center",
      storeId: "2004",
      total: "156.80",
      status: "Preparando",
      paymentMethod: "Cartão de Crédito",
      deliveryTime: "Estimado 35 min",
      deliveryAddress: "Av. dos Esportes, 789 - São Paulo, SP",
      driver: null,
      driverId: null,
      confirmationCode: "SPORT2024",
      items: [
        {
          id: "P004",
          name: "Tênis Esportivo Preto",
          price: "156.80",
          quantity: 1,
          image: "/products/sneaker.jpg",
        },
      ],
      payment: {
        method: "Cartão de Crédito",
        card: "****9012",
        installments: 3,
        amount: "156.80",
        commission: "10.98",
        storeShare: "137.32",
        driverFee: "8.50",
      },
      timeline: [
        { time: "11:20", event: "Pedido realizado", status: "completed" },
        { time: "11:21", event: "Pagamento aprovado", status: "completed" },
        {
          time: "11:25",
          event: "Pedido confirmado pela loja",
          status: "completed",
        },
        { time: "11:30", event: "Pedido em preparação", status: "current" },
      ],
    },
  ];

  const actions: Action[] = [
    {
      label: "Ver Detalhes",
      onClick: (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
      },
      color: "primary",
    },
    {
      label: "Cancelar",
      onClick: (order) => {
        console.log("Cancel order:", order.id);
      },
      color: "danger",
    },
    {
      label: "Forçar Status",
      onClick: (order) => {
        console.log("Force status for order:", order.id);
      },
      color: "secondary",
    },
  ];

  const filteredOrders = orders.filter((order) => {
    if (filterStatus !== "all" && order.status !== filterStatus) return false;
    // Add date filtering based on filterPeriod
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
            <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowPathIcon className="w-4 h-4" />
              <span>Atualizar</span>
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
                <p className="text-sm text-gray-600">Total Hoje</p>
                <p className="text-xl font-semibold text-[#111827]">348</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Preparando</p>
                <p className="text-xl font-semibold text-[#111827]">23</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ArrowPathIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Em Entrega</p>
                <p className="text-xl font-semibold text-[#111827]">67</p>
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
                <p className="text-xl font-semibold text-[#111827]">245</p>
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
                <p className="text-xl font-semibold text-[#111827]">13</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="Pendente">Pendente</option>
                <option value="Preparando">Preparando</option>
                <option value="Em entrega">Em entrega</option>
                <option value="Entregue">Entregue</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
              >
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
          actions={actions}
          itemsPerPage={10}
        />

        {/* Order Details Modal */}
        <AdminModal
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          title={`Pedido #${selectedOrder?.id}`}
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
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Cancelar Pedido
                  </button>
                )}
              <button className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow">
                Forçar Entrega
              </button>
            </div>
          }
        >
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Informações do Pedido
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">ID:</span>
                      <span className="ml-2 font-medium">
                        #{selectedOrder.id}
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
                            : selectedOrder.status === "Em entrega"
                              ? "bg-blue-100 text-blue-800"
                              : selectedOrder.status === "Preparando"
                                ? "bg-yellow-100 text-yellow-800"
                                : selectedOrder.status === "Cancelado"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Código Confirmação:</span>
                      <span className="ml-2 font-medium">
                        {selectedOrder.confirmationCode}
                      </span>
                    </div>
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
                      <span className="text-gray-600">Telefone:</span>
                      <span className="ml-2 font-medium">
                        {selectedOrder.customerPhone}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">E-mail:</span>
                      <span className="ml-2 font-medium">
                        {selectedOrder.customerEmail}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Itens do Pedido
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {selectedOrder.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center p-4 border-b border-gray-200 last:border-b-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded border"
                        onError={(e) => {
                          (e.target as any).src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNiAyNkwzOCAzOEgyNlYyNloiIGZpbGw9IiNFNUU3RUIiLz4KPHA+CjxwYXRoIGQ9Ik0zOCAyNkwyNiAzOEgzOFYyNloiIGZpbGw9IiNFNUU3RUIiLz4KPC9zdmc+Cg==";
                        }}
                      />
                      <div className="ml-4 flex-1">
                        <h5 className="font-medium text-[#111827]">
                          {item.name}
                        </h5>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-gray-600">
                            Quantidade: {item.quantity}
                          </span>
                          <span className="font-medium text-[#111827]">
                            R$ {item.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Financial */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Pagamento e Financeiro
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Método:</span>
                      <span className="ml-2 font-medium">
                        {selectedOrder.payment.method}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="ml-2 font-medium">
                        R$ {selectedOrder.payment.amount}
                      </span>
                    </div>
                    {selectedOrder.payment.commission && (
                      <div>
                        <span className="text-gray-600">Comissão WIN:</span>
                        <span className="ml-2 font-medium">
                          R$ {selectedOrder.payment.commission}
                        </span>
                      </div>
                    )}
                    {selectedOrder.payment.storeShare && (
                      <div>
                        <span className="text-gray-600">Repasse Loja:</span>
                        <span className="ml-2 font-medium">
                          R$ {selectedOrder.payment.storeShare}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Informações de Entrega
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Endereço:</span>
                    <span className="ml-2 font-medium">
                      {selectedOrder.deliveryAddress}
                    </span>
                  </div>
                  {selectedOrder.driver && (
                    <div>
                      <span className="text-gray-600">Motorista:</span>
                      <span className="ml-2 font-medium">
                        {selectedOrder.driver}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Tempo de entrega:</span>
                    <span className="ml-2 font-medium">
                      {selectedOrder.deliveryTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Histórico do Pedido
                </h4>
                <div className="space-y-3">
                  {selectedOrder.timeline.map((event: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${
                          event.status === "completed"
                            ? "bg-green-500"
                            : event.status === "current"
                              ? "bg-blue-500"
                              : "bg-red-500"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#111827]">
                            {event.event}
                          </span>
                          <span className="text-xs text-gray-500">
                            {event.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancellation reason if applicable */}
              {selectedOrder.status === "Cancelado" &&
                selectedOrder.cancellationReason && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      Motivo do Cancelamento
                    </h4>
                    <p className="text-sm text-red-600">
                      {selectedOrder.cancellationReason}
                    </p>
                  </div>
                )}
            </div>
          )}
        </AdminModal>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
