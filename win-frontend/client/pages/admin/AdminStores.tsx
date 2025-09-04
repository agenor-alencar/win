import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DataTable, Column, Action } from "../../components/admin/DataTable";
import { AdminModal } from "../../components/admin/AdminModal";
import { StoreForm } from "../../components/admin/forms/StoreForm";
import {
  PlusIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const AdminStores: React.FC = () => {
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCreateStoreModal, setShowCreateStoreModal] = useState(false);

  const handleCreateStore = (storeData: any) => {
    console.log("Creating store:", storeData);
    // Here you would typically send the data to your backend
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

  const stores = [
    {
      id: "2001",
      name: "TechStore Pro",
      cnpj: "12.345.678/0001-90",
      owner: "Roberto Lima",
      category: "Eletrônicos",
      rating: "4.8",
      status: "Ativo",
      products: 156,
      createdAt: "15/01/2024",
      phone: "(11) 99999-9999",
      email: "contato@techstore.com",
      address: "Rua da Tecnologia, 123 - São Paulo, SP",
      description: "Loja especializada em eletrônicos e gadgets",
      documents: ["CNPJ", "Alvará", "Contrato Social"],
      schedule: {
        monday: { open: "08:00", close: "18:00", closed: false },
        tuesday: { open: "08:00", close: "18:00", closed: false },
        wednesday: { open: "08:00", close: "18:00", closed: false },
        thursday: { open: "08:00", close: "18:00", closed: false },
        friday: { open: "08:00", close: "18:00", closed: false },
        saturday: { open: "09:00", close: "17:00", closed: false },
        sunday: { open: "", close: "", closed: true },
      },
      sales: { month: 45, total: 450 },
      revenue: { month: 89340, total: 450200 },
    },
    {
      id: "2002",
      name: "Moda Feminina",
      cnpj: "98.765.432/0001-10",
      owner: "Lucia Ferreira",
      category: "Roupas",
      rating: "4.5",
      status: "Pendente",
      products: 89,
      createdAt: "20/02/2024",
      phone: "(11) 88888-8888",
      email: "lucia@modafeminina.com",
      address: "Av. Fashion, 456 - São Paulo, SP",
      description: "Roupas femininas da moda",
      documents: ["CNPJ", "Pendente Alvará"],
      schedule: {
        monday: { open: "09:00", close: "19:00", closed: false },
        tuesday: { open: "09:00", close: "19:00", closed: false },
        wednesday: { open: "09:00", close: "19:00", closed: false },
        thursday: { open: "09:00", close: "19:00", closed: false },
        friday: { open: "09:00", close: "19:00", closed: false },
        saturday: { open: "10:00", close: "18:00", closed: false },
        sunday: { open: "", close: "", closed: true },
      },
      sales: { month: 23, total: 78 },
      revenue: { month: 12560, total: 45600 },
    },
    {
      id: "2003",
      name: "Casa Moderna",
      cnpj: "45.678.901/0001-23",
      owner: "Felipe Santos",
      category: "Casa & Jardim",
      rating: "4.7",
      status: "Ativo",
      products: 234,
      createdAt: "10/03/2024",
      phone: "(11) 77777-7777",
      email: "felipe@casamoderna.com",
      address: "Rua do Lar, 789 - São Paulo, SP",
      description: "Produtos para casa e decoração",
      documents: ["CNPJ", "Alvará", "Contrato Social"],
      schedule: {
        monday: { open: "08:30", close: "17:30", closed: false },
        tuesday: { open: "08:30", close: "17:30", closed: false },
        wednesday: { open: "08:30", close: "17:30", closed: false },
        thursday: { open: "08:30", close: "17:30", closed: false },
        friday: { open: "08:30", close: "17:30", closed: false },
        saturday: { open: "09:00", close: "16:00", closed: false },
        sunday: { open: "", close: "", closed: true },
      },
      sales: { month: 67, total: 289 },
      revenue: { month: 34560, total: 189400 },
    },
  ];

  const actions: Action[] = [
    {
      label: "Ver Detalhes",
      onClick: (store) => {
        setSelectedStore(store);
        setShowStoreModal(true);
      },
      color: "primary",
    },
    {
      label: "Horários",
      onClick: (store) => {
        setSelectedStore(store);
        setShowScheduleModal(true);
      },
      color: "secondary",
    },
    {
      label: "Aprovar",
      onClick: (store) => {
        console.log("Approve store:", store.id);
      },
      color: "primary",
    },
    {
      label: "Suspender",
      onClick: (store) => {
        console.log("Suspend store:", store.id);
      },
      color: "danger",
    },
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
            <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowPathIcon className="w-4 h-4" />
              <span>Atualizar</span>
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
                <p className="text-xl font-semibold text-[#111827]">1,205</p>
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
                <p className="text-xl font-semibold text-[#111827]">47</p>
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
                <p className="text-xl font-semibold text-[#111827]">12</p>
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
                <p className="text-xl font-semibold text-[#111827]">1,264</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stores Table */}
        <DataTable
          columns={columns}
          data={stores}
          actions={actions}
          itemsPerPage={10}
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
                            : selectedStore.status === "Pendente"
                              ? "bg-yellow-100 text-yellow-800"
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

              {/* Performance */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Performance
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-lg font-semibold text-[#111827]">
                      {selectedStore.products}
                    </p>
                    <p className="text-xs text-gray-600">Produtos</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-lg font-semibold text-[#111827]">
                      {selectedStore.sales.month}
                    </p>
                    <p className="text-xs text-gray-600">Vendas/Mês</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-lg font-semibold text-[#111827]">
                      R$ {selectedStore.revenue.month.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">Receita/Mês</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-lg font-semibold text-[#111827]">
                      {selectedStore.rating} ★
                    </p>
                    <p className="text-xs text-gray-600">Avaliação</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Documentos
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStore.documents.map((doc: string, index: number) => (
                    <span
                      key={index}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        doc.includes("Pendente")
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </AdminModal>

        {/* Schedule Modal */}
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
              <button className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow">
                Salvar Alterações
              </button>
            </div>
          }
        >
          {selectedStore && (
            <div className="space-y-4">
              {Object.entries(selectedStore.schedule).map(([day, schedule]) => (
                <div
                  key={day}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-[#111827]">
                    {dayNames[day as keyof typeof dayNames]}
                  </span>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!(schedule as any).closed}
                        className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                        onChange={() => {}}
                      />
                      <span className="text-sm text-gray-600">Aberto</span>
                    </label>
                    {!(schedule as any).closed && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={(schedule as any).open}
                          className="px-2 py-1 border border-gray-200 rounded text-sm"
                          onChange={() => {}}
                        />
                        <span className="text-gray-400">às</span>
                        <input
                          type="time"
                          value={(schedule as any).close}
                          className="px-2 py-1 border border-gray-200 rounded text-sm"
                          onChange={() => {}}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
