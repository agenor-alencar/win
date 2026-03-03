import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DataTable, Column, Action } from "../../components/admin/DataTable";
import { AdminModal } from "../../components/admin/AdminModal";
import { StoreForm } from "../../components/admin/forms/StoreForm";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { storeApi, type StoreFormatted } from "@/lib/admin";
import { useNotification } from "@/contexts/NotificationContext";

const AdminStores: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [selectedStore, setSelectedStore] = useState<StoreFormatted | null>(null);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCreateStoreModal, setShowCreateStoreModal] = useState(false);
  const [stores, setStores] = useState<StoreFormatted[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ativas: 0,
    pendentes: 0,
    suspensas: 0,
  });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      const [formattedStores, storeStats] = await Promise.all([
        storeApi.getFormattedStores(),
        storeApi.getStats(),
      ]);

      setStores(formattedStores);
      setStats(storeStats);
    } catch (error: any) {
      console.error("Erro ao carregar lojas:", error);
      error(error.message || "Erro ao carregar lojas");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStoreStatus = async (store: StoreFormatted) => {
    try {
      await storeApi.toggleStoreStatus(store.id, store.ativo);
      success(
        `Loja ${store.ativo ? "suspensa" : "ativada"} com sucesso`
      );
      loadStores();
    } catch (error: any) {
      console.error("Erro ao alterar status da loja:", error);
      error(error.message || "Erro ao alterar status da loja");
    }
  };

  const handleCreateStore = (storeData: any) => {
    console.log("Creating store:", storeData);
    // TODO: Implementar criação de loja
    setShowCreateStoreModal(false);
  };

  const columns: Column[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Nome Fantasia", sortable: true },
    { key: "cnpj", label: "CNPJ", sortable: true },
    { key: "owner", label: "Proprietário", sortable: true },
    { key: "category", label: "Categoria", sortable: true },
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
                : status === "Suspenso"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
          }`}
        >
          {status}
        </span>
      ),
    },
    { key: "products", label: "Produtos", sortable: true },
    { key: "createdAt", label: "Cadastro", sortable: true },
  ];

  const dayNames = {
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sábado",
    sunday: "Domingo",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Gestão de Lojas
            </h1>
            <p className="text-gray-600">
              Gerencie lojas, aprovações e documentos
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={loadStores}
              disabled={loading}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Atualizando...' : 'Atualizar'}</span>
            </button>
            <button
              onClick={() => setShowCreateStoreModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Nova Loja</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckIcon className="w-6 h-6 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Ativas</p>
                <p className="text-xl font-semibold text-[#111827]">{stats.ativas}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-xl font-semibold text-[#111827]">{stats.pendentes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XMarkIcon className="w-6 h-6 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Suspensas</p>
                <p className="text-xl font-semibold text-[#111827]">{stats.suspensas}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <EyeIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-semibold text-[#111827]">{stats.ativas + stats.pendentes + stats.suspensas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stores Table */}
        <DataTable
          columns={columns}
          data={stores}
          itemsPerPage={10}
          onRowDoubleClick={(store) => navigate(`/admin/stores/${store.id}`)}
        />

        {/* Store Details Modal */}
        <AdminModal
          isOpen={showStoreModal}
          onClose={() => {
            setShowStoreModal(false);
            setSelectedStore(null);
          }}
          title="Detalhes da Loja"
          size="xl"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => setShowStoreModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow">
                Aprovar Loja
              </button>
            </div>
          }
        >
          {selectedStore && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Informações Básicas
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Nome da Loja:</span>
                      <p className="font-medium">{selectedStore.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Proprietário:</span>
                      <p className="font-medium">{selectedStore.owner}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">CNPJ:</span>
                      <p className="font-medium">{selectedStore.cnpj}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Categoria:</span>
                      <p className="font-medium">{selectedStore.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          selectedStore.status === "Ativo"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedStore.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Contato & Localização
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Telefone:</span>
                      <p className="font-medium">{selectedStore.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">E-mail:</span>
                      <p className="font-medium">{selectedStore.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Endereço:</span>
                      <p className="font-medium">{selectedStore.address}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Descrição:</span>
                      <p className="font-medium">{selectedStore.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance - Simplified */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Estatísticas
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-lg font-semibold text-[#111827]">
                      {selectedStore.products}
                    </p>
                    <p className="text-xs text-gray-600">Produtos</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-lg font-semibold text-[#111827]">
                      {selectedStore.rating} ★
                    </p>
                    <p className="text-xs text-gray-600">Avaliação</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AdminModal>

        {/* Schedule Modal - Simplified */}
        <AdminModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedStore(null);
          }}
          title="Horários de Funcionamento"
          size="lg"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          }
        >
          {selectedStore && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Funcionalidade de edição de horários será implementada em breve.
              </p>
            </div>
          )}
        </AdminModal>

        {/* Store Creation Form */}
        <StoreForm
          isOpen={showCreateStoreModal}
          onClose={() => setShowCreateStoreModal(false)}
          onSubmit={handleCreateStore}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminStores;
