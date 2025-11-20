import React, { useState, useEffect } from "react";
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
import { api } from "@/lib/Api";
import { useNotification } from "@/contexts/NotificationContext";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  ativo: boolean;
  criadoEm: string;
  perfis: string[];
}

const AdminUsers: React.FC = () => {
  const { showNotification } = useNotification();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clientes: 0,
    lojistas: 0,
    motoristas: 0,
    bloqueados: 0,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/v1/usuario/list/all");
      const usuariosData: Usuario[] = response.data;

      // Transformar dados para o formato da tabela
      const formattedUsers = usuariosData.map((user) => {
        // Determinar tipo principal do usuário
        let type = "Cliente";
        if (user.perfis.includes("ADMIN")) type = "Admin";
        else if (user.perfis.includes("LOJISTA")) type = "Lojista";
        else if (user.perfis.includes("MOTORISTA")) type = "Motorista";

        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          type,
          status: user.ativo ? "Ativo" : "Bloqueado",
          createdAt: new Date(user.criadoEm).toLocaleDateString("pt-BR"),
          lastLogin: "-",
          phone: user.telefone || "-",
          cpf: user.cpf || "-",
          perfis: user.perfis,
          ativo: user.ativo,
        };
      });

      setUsers(formattedUsers);

      // Calcular estatísticas
      const clientes = formattedUsers.filter((u) => u.type === "Cliente").length;
      const lojistas = formattedUsers.filter((u) => u.type === "Lojista").length;
      const motoristas = formattedUsers.filter((u) => u.type === "Motorista").length;
      const bloqueados = formattedUsers.filter((u) => u.status === "Bloqueado").length;

      setStats({ clientes, lojistas, motoristas, bloqueados });
    } catch (error: any) {
      console.error("Erro ao carregar usuários:", error);
      showNotification("Erro ao carregar usuários", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: any) => {
    try {
      const endpoint = user.ativo
        ? `/api/v1/usuario/desativar/${user.id}`
        : `/api/v1/usuario/ativar/${user.id}`;

      await api.patch(endpoint);
      showNotification(
        `Usuário ${user.ativo ? "bloqueado" : "desbloqueado"} com sucesso`,
        "success"
      );
      loadUsers();
    } catch (error: any) {
      console.error("Erro ao alterar status do usuário:", error);
      showNotification("Erro ao alterar status do usuário", "error");
    }
  };

  const handleCreateUser = (userData: any) => {
    console.log("Creating user:", userData);
    // TODO: Implementar criação de usuário
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
      onClick: handleToggleUserStatus,
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
            <button 
              onClick={loadUsers}
              disabled={loading}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Atualizando...' : 'Atualizar'}</span>
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
                <p className="text-xl font-semibold text-[#111827]">{stats.clientes}</p>
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
                <p className="text-xl font-semibold text-[#111827]">{stats.lojistas}</p>
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
                <p className="text-xl font-semibold text-[#111827]">{stats.motoristas}</p>
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
                <p className="text-xl font-semibold text-[#111827]">{stats.bloqueados}</p>
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
