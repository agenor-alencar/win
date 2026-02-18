import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DataTable, Column } from "../../components/admin/DataTable";
import { AdminModal } from "../../components/admin/AdminModal";
import {
  PlusIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  LinkIcon,
  TrashIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { recipientApi, type Lojista, type DadosBancarios } from "@/lib/RecipientApi";
import { useNotification } from "@/contexts/NotificationContext";

const AdminRecipients: React.FC = () => {
  const { success, error } = useNotification();
  const [selectedLojista, setSelectedLojista] = useState<Lojista | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [lojistas, setLojistas] = useState<Lojista[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    configurados: 0,
    pendentes: 0,
    percentualConfigurado: 0,
  });

  // Form states for create recipient
  const [createForm, setCreateForm] = useState({
    nome: "",
    documento: "",
    email: "",
    tipo: "individual" as "individual" | "company",
    bankCode: "",
    agencia: "",
    agenciaDv: "",
    conta: "",
    contaDv: "",
    accountType: "conta_corrente" as "conta_corrente" | "conta_poupanca",
    holderName: "",
    holderDocument: "",
  });

  // Form states for link recipient
  const [linkForm, setLinkForm] = useState({
    recipientId: "",
  });

  // Details state
  const [recipientDetails, setRecipientDetails] = useState<any>(null);

  useEffect(() => {
    loadLojistas();
  }, []);

  const loadLojistas = async () => {
    try {
      setLoading(true);
      const [lojistasData, statsData] = await Promise.all([
        recipientApi.listarLojistas(),
        recipientApi.getStats(),
      ]);

      setLojistas(lojistasData);
      setStats(statsData);
    } catch (err: any) {
      console.error("Erro ao carregar lojistas:", err);
      error(err.message || "Erro ao carregar lojistas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecipient = async () => {
    if (!selectedLojista) return;

    try {
      const dadosBancarios: DadosBancarios = {
        bank_code: createForm.bankCode,
        agencia: createForm.agencia,
        agencia_dv: createForm.agenciaDv,
        conta: createForm.conta,
        conta_dv: createForm.contaDv,
        type: createForm.accountType,
        holder_name: createForm.holderName,
        holder_document: createForm.holderDocument,
      };

      const response = await recipientApi.criarRecipient({
        nome: createForm.nome,
        documento: createForm.documento,
        email: createForm.email,
        tipo: createForm.tipo,
        dadosBancarios,
      });

      // Auto-vincular o recipient criado ao lojista
      await recipientApi.vincularRecipient({
        lojistaId: selectedLojista.id,
        recipientId: response.id,
      });

      success(`Recipient criado e vinculado com sucesso: ${response.id}`);
      setShowCreateModal(false);
      resetCreateForm();
      loadLojistas();
    } catch (err: any) {
      console.error("Erro ao criar recipient:", err);
      error(err.message || "Erro ao criar recipient");
    }
  };

  const handleLinkRecipient = async () => {
    if (!selectedLojista || !linkForm.recipientId) return;

    try {
      await recipientApi.vincularRecipient({
        lojistaId: selectedLojista.id,
        recipientId: linkForm.recipientId,
      });

      success("Recipient vinculado com sucesso");
      setShowLinkModal(false);
      setLinkForm({ recipientId: "" });
      loadLojistas();
    } catch (err: any) {
      console.error("Erro ao vincular recipient:", err);
      error(err.message || "Erro ao vincular recipient");
    }
  };

  const handleViewDetails = async (lojista: Lojista) => {
    if (!lojista.recipientId) {
      error("Este lojista não possui recipient configurado");
      return;
    }

    try {
      const details = await recipientApi.buscarRecipient(lojista.recipientId);
      setRecipientDetails(details);
      setSelectedLojista(lojista);
      setShowDetailsModal(true);
    } catch (err: any) {
      console.error("Erro ao buscar detalhes:", err);
      error(err.message || "Erro ao buscar detalhes do recipient");
    }
  };

  const handleRemoveRecipient = async (lojista: Lojista) => {
    if (!confirm(`Tem certeza que deseja remover o recipient de ${lojista.nomeFantasia}?`)) {
      return;
    }

    try {
      await recipientApi.removerRecipient(lojista.id);
      success("Recipient removido com sucesso");
      loadLojistas();
    } catch (err: any) {
      console.error("Erro ao remover recipient:", err);
      error(err.message || "Erro ao remover recipient");
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      nome: "",
      documento: "",
      email: "",
      tipo: "individual",
      bankCode: "",
      agencia: "",
      agenciaDv: "",
      conta: "",
      contaDv: "",
      accountType: "conta_corrente",
      holderName: "",
      holderDocument: "",
    });
  };

  const columns: Column[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "nomeFantasia", label: "Nome Fantasia", sortable: true },
    { key: "cnpj", label: "CNPJ", sortable: true },
    { key: "email", label: "E-mail", sortable: true },
    {
      key: "temRecipient",
      label: "Status Recipient",
      render: (value, row: Lojista) => (
        <div className="flex items-center space-x-2">
          {value ? (
            <>
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Configurado
              </span>
            </>
          ) : (
            <>
              <XCircleIcon className="w-5 h-5 text-yellow-500" />
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                Pendente
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      key: "recipientId",
      label: "Recipient ID",
      render: (value) => (
        <span className="text-xs font-mono text-gray-600">
          {value ? value.substring(0, 20) + "..." : "-"}
        </span>
      ),
    },
    {
      key: "ativo",
      label: "Status Loja",
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            value
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Ativa" : "Inativa"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      render: (_, row: Lojista) => (
        <div className="flex items-center justify-end space-x-2">
          {row.temRecipient ? (
            <>
              <button
                onClick={() => handleViewDetails(row)}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Ver Detalhes"
              >
                <EyeIcon className="w-4 h-4" />
                <span>Detalhes</span>
              </button>
              <button
                onClick={() => handleRemoveRecipient(row)}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remover Recipient"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Remover</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setSelectedLojista(row);
                  setCreateForm({
                    ...createForm,
                    nome: row.nomeFantasia,
                    documento: row.cnpj.replace(/[^\d]/g, ""),
                    email: row.email || "",
                  });
                  setShowCreateModal(true);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Criar Recipient"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Criar</span>
              </button>
              <button
                onClick={() => {
                  setSelectedLojista(row);
                  setShowLinkModal(true);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Vincular Recipient Existente"
              >
                <LinkIcon className="w-4 h-4" />
                <span>Vincular</span>
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Gestão de Recipients
            </h1>
            <p className="text-gray-600">
              Configure recipients Pagar.me para split de pagamentos
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadLojistas}
              disabled={loading}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Atualizando..." : "Atualizar"}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BanknotesIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Lojistas</p>
                <p className="text-xl font-semibold text-[#111827]">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Configurados</p>
                <p className="text-xl font-semibold text-[#111827]">{stats.configurados}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-xl font-semibold text-[#111827]">{stats.pendentes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ArrowPathIcon className="w-6 h-6 text-purple-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Taxa Config.</p>
                <p className="text-xl font-semibold text-[#111827]">
                  {stats.percentualConfigurado.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lojistas Table */}
        <DataTable
          columns={columns}
          data={lojistas}
          itemsPerPage={10}
        />

        {/* Create Recipient Modal */}
        <AdminModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedLojista(null);
            resetCreateForm();
          }}
          title="Criar Recipient"
          size="xl"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedLojista(null);
                  resetCreateForm();
                }}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateRecipient}
                className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                Criar e Vincular
              </button>
            </div>
          }
        >
          <div className="space-y-6">
            {selectedLojista && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  Criando recipient para:{" "}
                  <span className="font-semibold">{selectedLojista.nomeFantasia}</span>
                </p>
              </div>
            )}

            {/* Basic Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Informações Básicas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome/Razão Social
                  </label>
                  <input
                    type="text"
                    value={createForm.nome}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, nome: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome completo ou razão social"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF/CNPJ
                  </label>
                  <input
                    type="text"
                    value={createForm.documento}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, documento: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Apenas números"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label htmlFor="recipient-tipo" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    id="recipient-tipo"
                    value={createForm.tipo}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        tipo: e.target.value as "individual" | "company",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="individual">Pessoa Física</option>
                    <option value="company">Pessoa Jurídica</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Dados Bancários
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código do Banco
                  </label>
                  <input
                    type="text"
                    value={createForm.bankCode}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, bankCode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 001 (Banco do Brasil)"
                  />
                </div>
                <div>
                  <label htmlFor="recipient-account-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Conta
                  </label>
                  <select
                    id="recipient-account-type"
                    value={createForm.accountType}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        accountType: e.target.value as "conta_corrente" | "conta_poupanca",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="conta_corrente">Conta Corrente</option>
                    <option value="conta_poupanca">Conta Poupança</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agência
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={createForm.agencia}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, agencia: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0000"
                    />
                    <input
                      type="text"
                      value={createForm.agenciaDv}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, agenciaDv: e.target.value })
                      }
                      className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="DV"
                      maxLength={1}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conta
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={createForm.conta}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, conta: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="00000000"
                    />
                    <input
                      type="text"
                      value={createForm.contaDv}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, contaDv: e.target.value })
                      }
                      className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="DV"
                      maxLength={2}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Titular
                  </label>
                  <input
                    type="text"
                    value={createForm.holderName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, holderName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome completo do titular"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF/CNPJ do Titular
                  </label>
                  <input
                    type="text"
                    value={createForm.holderDocument}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, holderDocument: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Apenas números"
                  />
                </div>
              </div>
            </div>
          </div>
        </AdminModal>

        {/* Link Recipient Modal */}
        <AdminModal
          isOpen={showLinkModal}
          onClose={() => {
            setShowLinkModal(false);
            setSelectedLojista(null);
            setLinkForm({ recipientId: "" });
          }}
          title="Vincular Recipient Existente"
          size="md"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setSelectedLojista(null);
                  setLinkForm({ recipientId: "" });
                }}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLinkRecipient}
                className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                Vincular
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            {selectedLojista && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  Vinculando recipient para:{" "}
                  <span className="font-semibold">{selectedLojista.nomeFantasia}</span>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient ID
              </label>
              <input
                type="text"
                value={linkForm.recipientId}
                onChange={(e) =>
                  setLinkForm({ ...linkForm, recipientId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="re_xxxxxxxxxx"
              />
              <p className="mt-2 text-xs text-gray-500">
                Digite o ID do recipient criado no painel do Pagar.me
              </p>
            </div>
          </div>
        </AdminModal>

        {/* Details Modal */}
        <AdminModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedLojista(null);
            setRecipientDetails(null);
          }}
          title="Detalhes do Recipient"
          size="lg"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedLojista(null);
                  setRecipientDetails(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          }
        >
          {recipientDetails && selectedLojista && (
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Lojista:</span>{" "}
                  {selectedLojista.nomeFantasia}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Informações do Recipient
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">ID:</span>
                      <p className="font-mono text-xs break-all">
                        {recipientDetails.id || selectedLojista.recipientId}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Nome:</span>
                      <p className="font-medium">{recipientDetails.name || "-"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          recipientDetails.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {recipientDetails.status || "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Dados Adicionais
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Documento:</span>
                      <p className="font-mono text-xs">
                        {recipientDetails.document || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">E-mail:</span>
                      <p className="font-medium">{recipientDetails.email || "-"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tipo:</span>
                      <p className="font-medium">
                        {recipientDetails.type === "individual"
                          ? "Pessoa Física"
                          : "Pessoa Jurídica"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {recipientDetails.default_bank_account && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Conta Bancária
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Banco:</span>
                        <p className="font-medium">
                          {recipientDetails.default_bank_account.bank_name || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Agência:</span>
                        <p className="font-mono">
                          {recipientDetails.default_bank_account.branch_number || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Conta:</span>
                        <p className="font-mono">
                          {recipientDetails.default_bank_account.account_number || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tipo:</span>
                        <p className="font-medium">
                          {recipientDetails.default_bank_account.type === "conta_corrente"
                            ? "Corrente"
                            : "Poupança"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </AdminModal>
      </div>
    </AdminLayout>
  );
};

export default AdminRecipients;
