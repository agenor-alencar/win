import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DataTable, Column, Action } from "../../components/admin/DataTable";
import { AdminModal } from "../../components/admin/AdminModal";
import { UserForm } from "../../components/admin/forms/UserForm";
import {
  PlusIcon,
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const AdminUsers: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  const handleCreateUser = (userData: any) => {
    console.log("Creating user:", userData);
    // Here you would typically send the data to your backend
    // For now, we'll just log it and close the modal
    setShowCreateUserModal(false);
  };

  const columns: Column[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Nome", sortable: true },
    { key: "email", label: "E-mail", sortable: true },
    {
      key: "type",
      label: "Tipo",
      render: (type) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            type === "Cliente"
              ? "bg-blue-100 text-blue-800"
              : type === "Lojista"
                ? "bg-green-100 text-green-800"
                : type === "Motorista"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-red-100 text-red-800"
          }`}
        >
          {type}
        </span>
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
              : status === "Bloqueado"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {status}
        </span>
      ),
    },
    { key: "createdAt", label: "Cadastro", sortable: true },
    { key: "lastLogin", label: "Último Acesso", sortable: true },
  ];

  const users = [
    {
      id: "1001",
      name: "João Silva",
      email: "joao@email.com",
      type: "Cliente",
      status: "Ativo",
      createdAt: "15/01/2024",
      lastLogin: "23/07/2024",
      phone: "(11) 99999-9999",
      cpf: "123.456.789-00",
      addresses: [
        { street: "Rua das Flores, 123", city: "São Paulo", state: "SP" },
      ],
      orders: 45,
    },
    {
      id: "1002",
      name: "Maria Santos",
      email: "maria@email.com",
      type: "Lojista",
      status: "Ativo",
      createdAt: "10/02/2024",
      lastLogin: "24/07/2024",
      phone: "(11) 88888-8888",
      cpf: "987.654.321-00",
      store: "Fashion Plus",
      cnpj: "12.345.678/0001-90",
    },
    {
      id: "1003",
      name: "Pedro Costa",
      email: "pedro@email.com",
      type: "Motorista",
      status: "Ativo",
      createdAt: "05/03/2024",
      lastLogin: "24/07/2024",
      phone: "(11) 77777-7777",
      cpf: "456.789.123-00",
      vehicle: "Honda CG 160",
      deliveries: 127,
    },
    {
      id: "1004",
      name: "Ana Paula",
      email: "ana@email.com",
      type: "Cliente",
      status: "Bloqueado",
      createdAt: "20/01/2024",
      lastLogin: "15/07/2024",
      phone: "(11) 66666-6666",
      cpf: "789.123.456-00",
      addresses: [
        { street: "Av. Paulista, 1000", city: "São Paulo", state: "SP" },
      ],
      orders: 12,
    },
  ];

  const actions: Action[] = [
    {
      label: "Ver Detalhes",
      onClick: (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
      },
      color: "primary",
    },
    {
      label: "Bloquear/Desbloquear",
      onClick: (user) => {
        console.log("Toggle block user:", user.id);
      },
      color: "danger",
    },
    {
      label: "Resetar Senha",
      onClick: (user) => {
        console.log("Reset password for user:", user.id);
      },
      color: "secondary",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Gestão de Usuários
            </h1>
            <p className="text-gray-600">
              Gerencie clientes, lojistas e motoristas
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowPathIcon className="w-4 h-4" />
              <span>Atualizar</span>
            </button>
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Novo Usuário</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Clientes</p>
                <p className="text-xl font-semibold text-[#111827]">8,492</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Lojistas</p>
                <p className="text-xl font-semibold text-[#111827]">1,429</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <div className="w-6 h-6 bg-purple-500 rounded"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Motoristas</p>
                <p className="text-xl font-semibold text-[#111827]">326</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Bloqueados</p>
                <p className="text-xl font-semibold text-[#111827]">23</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <DataTable
          columns={columns}
          data={users}
          actions={actions}
          itemsPerPage={10}
        />

        {/* User Details Modal */}
        <AdminModal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          title="Detalhes do Usuário"
          size="lg"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow">
                Editar
              </button>
            </div>
          }
        >
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Informações Básicas
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Nome:</span>
                    <p className="font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">E-mail:</span>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Telefone:</span>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">CPF:</span>
                    <p className="font-medium">{selectedUser.cpf}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tipo:</span>
                    <p className="font-medium">{selectedUser.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-medium">{selectedUser.status}</p>
                  </div>
                </div>
              </div>

              {/* Type-specific info */}
              {selectedUser.type === "Cliente" && selectedUser.addresses && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Endereços
                  </h4>
                  <div className="space-y-2">
                    {selectedUser.addresses.map(
                      (address: any, index: number) => (
                        <p key={index} className="text-sm text-gray-600">
                          {address.street}, {address.city} - {address.state}
                        </p>
                      ),
                    )}
                  </div>
                  <div className="mt-3 text-sm">
                    <span className="text-gray-600">Total de pedidos:</span>
                    <span className="ml-2 font-medium">
                      {selectedUser.orders}
                    </span>
                  </div>
                </div>
              )}

              {selectedUser.type === "Lojista" && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Informações da Loja
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Loja:</span>
                      <p className="font-medium">{selectedUser.store}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">CNPJ:</span>
                      <p className="font-medium">{selectedUser.cnpj}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.type === "Motorista" && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Informações do Motorista
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Veículo:</span>
                      <p className="font-medium">{selectedUser.vehicle}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Entregas realizadas:
                      </span>
                      <p className="font-medium">{selectedUser.deliveries}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Atividade
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Cadastro:</span>
                    <p className="font-medium">{selectedUser.createdAt}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Último acesso:</span>
                    <p className="font-medium">{selectedUser.lastLogin}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AdminModal>

        {/* User Creation Form */}
        <UserForm
          isOpen={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          onSubmit={handleCreateUser}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
