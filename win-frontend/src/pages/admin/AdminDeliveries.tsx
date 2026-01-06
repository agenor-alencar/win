import React, { useState, useEffect } from "react";
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
import { useNotification } from "@/contexts/NotificationContext";
import {
  deliveryApi,
  type EntregaStats,
  type EntregaListItem,
} from "@/lib/admin";

const AdminDeliveries: React.FC = () => {
  const { warning, success, error } = useNotification();
  const [selectedDelivery, setSelectedDelivery] =
    useState<EntregaListItem | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EntregaStats | null>(null);
  const [deliveries, setDeliveries] = useState<EntregaListItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas e entregas em paralelo
      const [statsData, deliveriesData] = await Promise.all([
        deliveryApi.getStats(),
        deliveryApi.listAll(),
      ]);

      setStats(statsData);
      setDeliveries(deliveriesData);
    } catch (error: any) {
      console.error("Erro ao carregar dados de entregas:", error);
      error("Erro ao carregar dados de entregas");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelivery = async () => {
    if (!selectedDelivery) return;

    try {
      await deliveryApi.cancel(selectedDelivery.id);
      success("Entrega cancelada com sucesso");
      setShowCancelModal(false);
      setSelectedDelivery(null);
      loadData(); // Recarregar dados
    } catch (error: any) {
      error(
        "Erro ao cancelar entrega. Verifique se a entrega pode ser cancelada."
      );
    }
  };

  const columns: Column[] = [
    { key: "id", label: "ID", sortable: true },
    { 
      key: "numeroPedido", 
      label: "Pedido", 
      sortable: true,
      render: (value) => `#${value}`
    },
    { 
      key: "nomeMotorista", 
      label: "Motorista", 
      sortable: true,
      render: (value) => value || "Aguardando"
    },
    { key: "clienteNome", label: "Cliente", sortable: true },
    { key: "lojistaFantasia", label: "Loja", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (status) => {
        const statusTranslated = deliveryApi.translateStatus(status);
        const color = deliveryApi.getStatusColor(status);
        
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
            {statusTranslated}
          </span>
        );
      },
    },
    {
      key: "tempoEstimado",
      label: "Tempo Est.",
      render: (estimatedTime) => estimatedTime || "N/A",
    },
    {
      key: "distanciaEstimada",
      label: "Distância",
      render: (distance) => distance ? `${distance} km` : "N/A",
    },
  ];

  // Dados vêm da API via estado

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
        if (delivery.contatoMotorista) {
          window.open(`tel:${delivery.contatoMotorista}`);
        } else {
          warning("Motorista ainda não atribuído");
        }
      },
      color: "secondary",
    },
    {
      label: "Cancelar Entrega",
      onClick: (delivery) => {
        setSelectedDelivery(delivery);
        setShowCancelModal(true);
      },
      color: "danger",
    },
  ];

  const filteredDeliveries = deliveries.filter((delivery) => {
    if (filterStatus === "all") return true;
    return delivery.status === filterStatus;
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
            <button 
              onClick={loadData}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
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
                <p className="text-sm text-gray-600">Aguardando Preparação</p>
                <p className="text-xl font-semibold text-[#111827]">
                  {stats?.aguardandoPreparacao || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TruckIcon className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">A Caminho Retirada</p>
                <p className="text-xl font-semibold text-[#111827]">
                  {stats?.motoristaACaminhoRetirada || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPinIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Em Trânsito</p>
                <p className="text-xl font-semibold text-[#111827]">
                  {stats?.emTransito || 0}
                </p>
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
                <p className="text-xl font-semibold text-[#111827]">
                  {stats?.entregues || 0}
                </p>
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
                <p className="text-xl font-semibold text-[#111827]">
                  {stats?.problemasAtivos || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="AGUARDANDO_PREPARACAO">Aguardando Preparação</option>
                <option value="AGUARDANDO_MOTORISTA">Aguardando Motorista</option>
                <option value="MOTORISTA_A_CAMINHO_RETIRADA">Motorista a Caminho</option>
                <option value="EM_TRANSITO">Em Trânsito</option>
                <option value="ENTREGUE">Entregue</option>
                <option value="CANCELADA">Cancelada</option>
                <option value="FALHA_SOLICITACAO">Com Problemas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Actions for Problems */}
        {(stats?.problemasAtivos ?? 0) > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                <span className="text-red-800 font-medium">
                  {stats?.problemasAtivos} entrega(s) com problemas que precisam de atenção
                </span>
              </div>
              <button 
                onClick={() => setFilterStatus("FALHA_SOLICITACAO")}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
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
          title={`Entrega #${selectedDelivery?.numeroPedido || selectedDelivery?.id}`}
          size="xl"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              {selectedDelivery?.contatoMotorista && (
                <button 
                  onClick={() => window.open(`tel:${selectedDelivery.contatoMotorista}`)}
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <PhoneIcon className="w-4 h-4" />
                  <span>Contatar Motorista</span>
                </button>
              )}
              {selectedDelivery?.status !== "ENTREGUE" && selectedDelivery?.status !== "CANCELADA" && (
                <button
                  onClick={() => {
                    setShowDeliveryModal(false);
                    setShowCancelModal(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancelar Entrega
                </button>
              )}
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
                        #{selectedDelivery.numeroPedido || selectedDelivery.pedidoId}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${deliveryApi.getStatusColor(selectedDelivery.status)}`}
                      >
                        {deliveryApi.translateStatus(selectedDelivery.status)}
                      </span>
                    </div>
                    {selectedDelivery.distanciaEstimada && (
                      <div>
                        <span className="text-gray-600">Distância:</span>
                        <span className="ml-2 font-medium">
                          {selectedDelivery.distanciaEstimada} km
                        </span>
                      </div>
                    )}
                    {selectedDelivery.tempoEstimado && (
                      <div>
                        <span className="text-gray-600">Tempo Estimado:</span>
                        <span className="ml-2 font-medium">
                          {selectedDelivery.tempoEstimado}
                        </span>
                      </div>
                    )}
                    {selectedDelivery.valorFreteCliente && (
                      <div>
                        <span className="text-gray-600">Valor do Frete:</span>
                        <span className="ml-2 font-medium">
                          R$ {selectedDelivery.valorFreteCliente.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {selectedDelivery.codigoRetirada && (
                      <div>
                        <span className="text-gray-600">Código de Retirada:</span>
                        <span className="ml-2 font-medium font-mono">
                          {selectedDelivery.codigoRetirada}
                        </span>
                      </div>
                    )}
                    {selectedDelivery.codigoEntrega && (
                      <div>
                        <span className="text-gray-600">Código de Entrega:</span>
                        <span className="ml-2 font-medium font-mono">
                          {selectedDelivery.codigoEntrega}
                        </span>
                      </div>
                    )}
                    {selectedDelivery.urlRastreamento && (
                      <div>
                        <a 
                          href={selectedDelivery.urlRastreamento}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Rastrear Entrega
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Motorista
                  </h4>
                  <div className="space-y-3 text-sm">
                    {selectedDelivery.nomeMotorista ? (
                      <>
                        <div>
                          <span className="text-gray-600">Nome:</span>
                          <span className="ml-2 font-medium">
                            {selectedDelivery.nomeMotorista}
                          </span>
                        </div>
                        {selectedDelivery.contatoMotorista && (
                          <div>
                            <span className="text-gray-600">Telefone:</span>
                            <span className="ml-2 font-medium">
                              {selectedDelivery.contatoMotorista}
                            </span>
                          </div>
                        )}
                        {selectedDelivery.placaVeiculo && (
                          <div>
                            <span className="text-gray-600">Placa:</span>
                            <span className="ml-2 font-medium">
                              {selectedDelivery.placaVeiculo}
                            </span>
                          </div>
                        )}
                        {selectedDelivery.tipoVeiculo && (
                          <div>
                            <span className="text-gray-600">Tipo de Veículo:</span>
                            <span className="ml-2 font-medium">
                              {selectedDelivery.tipoVeiculo}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-500">
                        Aguardando atribuição de motorista
                      </div>
                    )}
                    {selectedDelivery.dataHoraRetirada && (
                      <div>
                        <span className="text-gray-600">Retirada:</span>
                        <span className="ml-2 font-medium">
                          {new Date(selectedDelivery.dataHoraRetirada).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                    {selectedDelivery.dataHoraEntrega && (
                      <div>
                        <span className="text-gray-600">Entrega:</span>
                        <span className="ml-2 font-medium">
                          {new Date(selectedDelivery.dataHoraEntrega).toLocaleString('pt-BR')}
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
                    Loja (Coleta)
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-[#111827]">
                      {selectedDelivery.lojistaFantasia}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Entrega
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-[#111827]">
                      {selectedDelivery.clienteNome}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedDelivery.enderecoEntrega}
                    </p>
                    {selectedDelivery.clienteTelefone && (
                      <p className="text-sm text-gray-500 mt-1">
                        Tel: {selectedDelivery.clienteTelefone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Route Map Placeholder */}
              {selectedDelivery.urlRastreamento ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Rastreamento
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <a 
                      href={selectedDelivery.urlRastreamento}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <MapPinIcon className="w-5 h-5" />
                      <span>Abrir Rastreamento em Tempo Real</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Rota de Entrega
                  </h4>
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Rastreamento disponível após motorista iniciar
                    </p>
                  </div>
                </div>
              )}

              {/* Timeline - Removido pois não temos dados de timeline do backend */}
              
              {/* Problem description if applicable */}
              {selectedDelivery.status === "FALHA_SOLICITACAO" && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    Problema na Entrega
                  </h4>
                  <p className="text-sm text-red-600">
                    Houve uma falha na solicitação da entrega. Entre em contato com o suporte da Uber Flash.
                  </p>
                </div>
              )}
            </div>
          )}
        </AdminModal>

        {/* Cancel Delivery Modal */}
        <AdminModal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedDelivery(null);
          }}
          title="Cancelar Entrega"
          size="md"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button 
                onClick={() => {
                  handleCancelDelivery();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmar Cancelamento
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
                    Esta ação irá cancelar a entrega no sistema da Uber Flash.
                    Esta operação não pode ser desfeita.
                  </p>
                </div>
              </div>
            </div>

            {selectedDelivery && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Detalhes da Entrega
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Pedido:</span>
                    <span className="ml-2 font-medium">
                      #{selectedDelivery.numeroPedido || selectedDelivery.pedidoId}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status Atual:</span>
                    <span className="ml-2 font-medium">
                      {deliveryApi.translateStatus(selectedDelivery.status)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Cliente:</span>
                    <span className="ml-2 font-medium">
                      {selectedDelivery.clienteNome}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AdminModal>
      </div>
    </AdminLayout>
  );
};

export default AdminDeliveries;
