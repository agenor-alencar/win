import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DataTable, Column, Action } from "../../components/admin/DataTable";
import { AdminModal } from "../../components/admin/AdminModal";
import {
  MapPinIcon,
  TruckIcon,
  ClockIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

const AdminDeliveries: React.FC = () => {
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showForceCompleteModal, setShowForceCompleteModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const columns: Column[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "orderId", label: "Pedido", sortable: true },
    { key: "driver", label: "Motorista", sortable: true },
    { key: "customer", label: "Cliente", sortable: true },
    { key: "pickup", label: "Coleta", sortable: true },
    { key: "destination", label: "Destino" },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            status === "Entregue"
              ? "bg-green-100 text-green-800"
              : status === "Em rota"
                ? "bg-blue-100 text-blue-800"
                : status === "Coletado"
                  ? "bg-yellow-100 text-yellow-800"
                  : status === "Atribuído"
                    ? "bg-purple-100 text-purple-800"
                    : status === "Problema"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      key: "estimatedTime",
      label: "Tempo Est.",
      render: (estimatedTime) => estimatedTime || "N/A",
    },
    {
      key: "distance",
      label: "Distância",
      render: (distance) => `${distance} km`,
    },
  ];

  const deliveries = [
    {
      id: "D12847",
      orderId: "12847",
      driver: "Carlos Silva",
      driverId: "3001",
      driverPhone: "(11) 99999-9999",
      customer: "João Silva",
      customerPhone: "(11) 99999-9999",
      pickup: "TechStore Pro",
      pickupAddress: "Rua da Tecnologia, 123 - São Paulo, SP",
      destination: "Rua das Flores, 123",
      destinationAddress: "Rua das Flores, 123 - São Paulo, SP",
      status: "Entregue",
      estimatedTime: "Concluído",
      distance: "5.2",
      deliveryFee: "12.00",
      totalValue: "1,299.90",
      startTime: "15:00",
      completedTime: "15:15",
      route: [
        { lat: -23.5505, lng: -46.6333, time: "15:00", event: "Saiu da loja" },
        { lat: -23.5515, lng: -46.6343, time: "15:05", event: "Em trânsito" },
        {
          lat: -23.5525,
          lng: -46.6353,
          time: "15:15",
          event: "Entrega concluída",
        },
      ],
      timeline: [
        { time: "14:50", event: "Entrega atribuída", status: "completed" },
        {
          time: "15:00",
          event: "Motorista coletou o pedido",
          status: "completed",
        },
        { time: "15:05", event: "Saiu para entrega", status: "completed" },
        { time: "15:15", event: "Entrega concluída", status: "completed" },
      ],
      confirmationCode: "TECH2024",
    },
    {
      id: "D12846",
      orderId: "12846",
      driver: "João Oliveira",
      driverId: "3002",
      driverPhone: "(11) 88888-8888",
      customer: "Maria Santos",
      customerPhone: "(11) 88888-8888",
      pickup: "Fashion Plus",
      pickupAddress: "Av. Fashion, 456 - São Paulo, SP",
      destination: "Av. Paulista, 1000",
      destinationAddress: "Av. Paulista, 1000 - São Paulo, SP",
      status: "Em rota",
      estimatedTime: "15 min",
      distance: "3.8",
      deliveryFee: "8.50",
      totalValue: "89.90",
      startTime: "14:00",
      completedTime: null,
      route: [
        { lat: -23.5505, lng: -46.6333, time: "14:00", event: "Saiu da loja" },
        { lat: -23.5515, lng: -46.6343, time: "14:10", event: "Em trânsito" },
      ],
      timeline: [
        { time: "13:50", event: "Entrega atribuída", status: "completed" },
        {
          time: "14:00",
          event: "Motorista coletou o pedido",
          status: "completed",
        },
        { time: "14:05", event: "Saiu para entrega", status: "current" },
      ],
      confirmationCode: "FASH2024",
    },
    {
      id: "D12845",
      orderId: "12845",
      driver: "Pedro Santos",
      driverId: "3003",
      driverPhone: "(11) 77777-7777",
      customer: "Pedro Costa",
      customerPhone: "(11) 77777-7777",
      pickup: "Casa Moderna",
      pickupAddress: "Rua do Lar, 789 - São Paulo, SP",
      destination: "Rua do Cliente, 456",
      destinationAddress: "Rua do Cliente, 456 - São Paulo, SP",
      status: "Problema",
      estimatedTime: "N/A",
      distance: "7.1",
      deliveryFee: "15.50",
      totalValue: "234.50",
      startTime: "13:30",
      completedTime: null,
      route: [
        { lat: -23.5505, lng: -46.6333, time: "13:30", event: "Saiu da loja" },
        {
          lat: -23.5515,
          lng: -46.6343,
          time: "13:45",
          event: "Problema reportado",
        },
      ],
      timeline: [
        { time: "13:20", event: "Entrega atribuída", status: "completed" },
        {
          time: "13:30",
          event: "Motorista coletou o pedido",
          status: "completed",
        },
        { time: "13:35", event: "Saiu para entrega", status: "completed" },
        {
          time: "13:45",
          event: "Problema: Endereço não encontrado",
          status: "problem",
        },
      ],
      confirmationCode: "CASA2024",
      problemDescription:
        "Endereço não encontrado, cliente não atende telefone",
    },
    {
      id: "D12844",
      orderId: "12844",
      driver: "Ana Costa",
      driverId: "3004",
      driverPhone: "(11) 66666-6666",
      customer: "Ana Paula",
      customerPhone: "(11) 66666-6666",
      pickup: "Sport Center",
      pickupAddress: "Av. dos Esportes, 321 - São Paulo, SP",
      destination: "Av. dos Esportes, 789",
      destinationAddress: "Av. dos Esportes, 789 - São Paulo, SP",
      status: "Atribuído",
      estimatedTime: "Aguardando",
      distance: "2.3",
      deliveryFee: "8.50",
      totalValue: "156.80",
      startTime: null,
      completedTime: null,
      route: [],
      timeline: [
        { time: "14:30", event: "Entrega atribuída", status: "current" },
      ],
      confirmationCode: "SPORT2024",
    },
  ];

  const actions: Action[] = [
    {
      label: "Ver Detalhes",
      onClick: (delivery) => {
        setSelectedDelivery(delivery);
        setShowDeliveryModal(true);
      },
      color: "primary",
    },
    {
      label: "Contatar Motorista",
      onClick: (delivery) => {
        console.log("Contact driver:", delivery.driverId);
      },
      color: "secondary",
    },
    {
      label: "Forçar Conclusão",
      onClick: (delivery) => {
        setSelectedDelivery(delivery);
        setShowForceCompleteModal(true);
      },
      color: "danger",
    },
  ];

  const filteredDeliveries = deliveries.filter((delivery) => {
    if (filterStatus !== "all" && delivery.status !== filterStatus)
      return false;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Gestão de Entregas
            </h1>
            <p className="text-gray-600">
              Monitore entregas em tempo real e gerencie problemas
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-purple-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Atribuídas</p>
                <p className="text-xl font-semibold text-[#111827]">12</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TruckIcon className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Coletadas</p>
                <p className="text-xl font-semibold text-[#111827]">8</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPinIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Em Rota</p>
                <p className="text-xl font-semibold text-[#111827]">23</p>
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
                <p className="text-xl font-semibold text-[#111827]">156</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Problemas</p>
                <p className="text-xl font-semibold text-[#111827]">3</p>
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
                <option value="Atribuído">Atribuído</option>
                <option value="Coletado">Coletado</option>
                <option value="Em rota">Em rota</option>
                <option value="Entregue">Entregue</option>
                <option value="Problema">Problema</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Actions for Problems */}
        {deliveries.some((d) => d.status === "Problema") && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                <span className="text-red-800 font-medium">
                  Existem entregas com problemas que precisam de atenção
                </span>
              </div>
              <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                Ver Problemas
              </button>
            </div>
          </div>
        )}

        {/* Deliveries Table */}
        <DataTable
          columns={columns}
          data={filteredDeliveries}
          actions={actions}
          itemsPerPage={10}
        />

        {/* Delivery Details Modal */}
        <AdminModal
          isOpen={showDeliveryModal}
          onClose={() => {
            setShowDeliveryModal(false);
            setSelectedDelivery(null);
          }}
          title={`Entrega #${selectedDelivery?.id}`}
          size="xl"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                <PhoneIcon className="w-4 h-4" />
                <span>Contatar Motorista</span>
              </button>
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setShowForceCompleteModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                Forçar Conclusão
              </button>
            </div>
          }
        >
          {selectedDelivery && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Informações da Entrega
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">ID da Entrega:</span>
                      <span className="ml-2 font-medium">
                        {selectedDelivery.id}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pedido:</span>
                      <span className="ml-2 font-medium">
                        #{selectedDelivery.orderId}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          selectedDelivery.status === "Entregue"
                            ? "bg-green-100 text-green-800"
                            : selectedDelivery.status === "Em rota"
                              ? "bg-blue-100 text-blue-800"
                              : selectedDelivery.status === "Coletado"
                                ? "bg-yellow-100 text-yellow-800"
                                : selectedDelivery.status === "Atribuído"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedDelivery.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Distância:</span>
                      <span className="ml-2 font-medium">
                        {selectedDelivery.distance} km
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Taxa de entrega:</span>
                      <span className="ml-2 font-medium">
                        R$ {selectedDelivery.deliveryFee}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Motorista
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Nome:</span>
                      <span className="ml-2 font-medium">
                        {selectedDelivery.driver}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Telefone:</span>
                      <span className="ml-2 font-medium">
                        {selectedDelivery.driverPhone}
                      </span>
                    </div>
                    {selectedDelivery.startTime && (
                      <div>
                        <span className="text-gray-600">Início:</span>
                        <span className="ml-2 font-medium">
                          {selectedDelivery.startTime}
                        </span>
                      </div>
                    )}
                    {selectedDelivery.completedTime && (
                      <div>
                        <span className="text-gray-600">Conclusão:</span>
                        <span className="ml-2 font-medium">
                          {selectedDelivery.completedTime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pickup and Delivery Addresses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Coleta
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-[#111827]">
                      {selectedDelivery.pickup}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedDelivery.pickupAddress}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Entrega
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-[#111827]">
                      {selectedDelivery.customer}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedDelivery.destinationAddress}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Tel: {selectedDelivery.customerPhone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Route Map Placeholder */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Rota de Entrega
                </h4>
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Mapa de rastreamento em tempo real
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Integração com serviços de mapas seria implementada aqui
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Histórico da Entrega
                </h4>
                <div className="space-y-3">
                  {selectedDelivery.timeline.map(
                    (event: any, index: number) => (
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
                    ),
                  )}
                </div>
              </div>

              {/* Problem description if applicable */}
              {selectedDelivery.status === "Problema" &&
                selectedDelivery.problemDescription && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      Descrição do Problema
                    </h4>
                    <p className="text-sm text-red-600">
                      {selectedDelivery.problemDescription}
                    </p>
                  </div>
                )}
            </div>
          )}
        </AdminModal>

        {/* Force Complete Modal */}
        <AdminModal
          isOpen={showForceCompleteModal}
          onClose={() => {
            setShowForceCompleteModal(false);
            setSelectedDelivery(null);
          }}
          title="Forçar Conclusão da Entrega"
          size="md"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => setShowForceCompleteModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Confirmar Conclusão
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    Atenção
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Esta ação irá marcar a entrega como concluída mesmo sem a
                    confirmação automática. Use apenas em casos excepcionais.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da conclusão forçada
              </label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent">
                <option>Problema de sistema</option>
                <option>Cliente confirmou recebimento por telefone</option>
                <option>Entrega deixada com porteiro</option>
                <option>Questão de segurança</option>
                <option>Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações adicionais
              </label>
              <textarea
                rows={3}
                placeholder="Descreva os detalhes da conclusão manual..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
              />
            </div>

            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-600">
                <strong>Importante:</strong> Esta ação será registrada no log de
                auditoria e não poderá ser desfeita.
              </p>
            </div>
          </div>
        </AdminModal>
      </div>
    </AdminLayout>
  );
};

export default AdminDeliveries;
