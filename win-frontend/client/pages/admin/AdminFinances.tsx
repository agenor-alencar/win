import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DataTable, Column, Action } from "../../components/admin/DataTable";
import { AdminModal } from "../../components/admin/AdminModal";
import { KPICard } from "../../components/admin/KPICard";
import { RevenueChart } from "../../components/admin/Charts";
import {
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  PlusIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

const AdminFinances: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [filterType, setFilterType] = useState("all");

  // Financial KPIs
  const financialKPIs = [
    {
      title: "Receita Total",
      value: "R$ 1.247.890",
      change: { value: 15, type: "increase" as const, period: "este mês" },
      icon: BanknotesIcon,
      color: "green" as const,
    },
    {
      title: "Comissão WIN",
      value: "R$ 87.352",
      change: { value: 12, type: "increase" as const, period: "este mês" },
      icon: CreditCardIcon,
      color: "blue" as const,
    },
    {
      title: "Repasses Lojas",
      value: "R$ 1.098.234",
      change: { value: 16, type: "increase" as const, period: "este mês" },
      icon: BuildingLibraryIcon,
      color: "purple" as const,
    },
    {
      title: "Pagtos. Motoristas",
      value: "R$ 62.304",
      change: { value: 8, type: "increase" as const, period: "este mês" },
      icon: TruckIcon,
      color: "orange" as const,
    },
  ];

  // Revenue chart data
  const revenueData = [
    { name: "Jan", receita: 950000 },
    { name: "Fev", receita: 1100000 },
    { name: "Mar", receita: 1200000 },
    { name: "Abr", receita: 1150000 },
    { name: "Mai", receita: 1300000 },
    { name: "Jun", receita: 1250000 },
    { name: "Jul", receita: 1247890 },
  ];

  const transactionColumns: Column[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "date", label: "Data", sortable: true },
    {
      key: "type",
      label: "Tipo",
      render: (type) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            type === "Receita"
              ? "bg-green-100 text-green-800"
              : type === "Comissão"
                ? "bg-blue-100 text-blue-800"
                : type === "Repasse"
                  ? "bg-purple-100 text-purple-800"
                  : type === "Pagamento"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-gray-100 text-gray-800"
          }`}
        >
          {type}
        </span>
      ),
    },
    { key: "description", label: "Descrição", sortable: true },
    { key: "origin", label: "Origem", sortable: true },
    { key: "destination", label: "Destino", sortable: true },
    {
      key: "amount",
      label: "Valor",
      sortable: true,
      render: (amount, row) => (
        <span
          className={`font-medium ${
            row.type === "Receita" || row.type === "Comissão"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {row.type === "Receita" || row.type === "Comissão" ? "+" : "-"}R${" "}
          {amount}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            status === "Concluído"
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

  const transactions = [
    {
      id: "T001",
      date: "24/07/2024",
      type: "Receita",
      description: "Venda - Pedido #12847",
      origin: "Cliente João Silva",
      destination: "WIN Marketplace",
      amount: "1,299.90",
      status: "Concluído",
      orderId: "12847",
      commission: "90.99",
      storeShare: "1,168.91",
      paymentMethod: "Cartão de Crédito",
      details: {
        products: [
          { name: "iPhone 14 Pro Max", price: "1,299.90", quantity: 1 },
        ],
        fees: {
          commission: "90.99",
          payment: "32.50",
          total: "123.49",
        },
      },
    },
    {
      id: "T002",
      date: "24/07/2024",
      type: "Repasse",
      description: "Repasse semanal TechStore",
      origin: "WIN Marketplace",
      destination: "TechStore Pro",
      amount: "15,450.80",
      status: "Concluído",
      bankAccount: "Banco do Brasil - Ag: 1234 - CC: 56789-0",
      reference: "Semana 29/2024",
      details: {
        period: "17/07 - 23/07/2024",
        totalSales: "17,890.50",
        commission: "1,252.34",
        fees: "187.36",
        netAmount: "15,450.80",
      },
    },
    {
      id: "T003",
      date: "24/07/2024",
      type: "Pagamento",
      description: "Pagamento entregador",
      origin: "WIN Marketplace",
      destination: "Carlos Silva (Motorista)",
      amount: "127.50",
      status: "Pendente",
      deliveryId: "D12845",
      reference: "Entrega Pedido #12845",
      details: {
        deliveries: 12,
        baseValue: "96.00",
        bonus: "31.50",
        totalAmount: "127.50",
        period: "17/07 - 23/07/2024",
      },
    },
    {
      id: "T004",
      date: "23/07/2024",
      type: "Comissão",
      description: "Comissão WIN - Pedido #12846",
      origin: "Venda Marketplace",
      destination: "WIN Marketplace",
      amount: "6.29",
      status: "Concluído",
      orderId: "12846",
      commissionRate: "7%",
      details: {
        orderValue: "89.90",
        commissionRate: "7%",
        commissionAmount: "6.29",
        store: "Fashion Plus",
      },
    },
  ];

  const transactionActions: Action[] = [
    {
      label: "Ver Detalhes",
      onClick: (transaction) => {
        setSelectedTransaction(transaction);
        setShowTransactionModal(true);
      },
      color: "primary",
    },
    {
      label: "Exportar",
      onClick: (transaction) => {
        console.log("Export transaction:", transaction.id);
      },
      color: "secondary",
    },
    {
      label: "Ajustar",
      onClick: (transaction) => {
        setSelectedTransaction(transaction);
        setShowAdjustmentModal(true);
      },
      color: "secondary",
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterType !== "all" && transaction.type !== filterType) return false;
    // Add date filtering based on filterPeriod
    return true;
  });

  const exportFinancialReport = () => {
    console.log("Exporting financial report...");
    // Implement export functionality
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Gestão Financeira
            </h1>
            <p className="text-gray-600">
              Acompanhe receitas, repasses e transações
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportFinancialReport}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>Exportar</span>
            </button>
            <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowPathIcon className="w-4 h-4" />
              <span>Atualizar</span>
            </button>
            <button
              onClick={() => setShowAdjustmentModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Ajuste Manual</span>
            </button>
          </div>
        </div>

        {/* Financial KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {financialKPIs.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-[#111827] mb-4">
              Resumo Financeiro
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taxa de comissão média</span>
                <span className="font-medium text-[#111827]">7.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ticket médio</span>
                <span className="font-medium text-[#111827]">R$ 256,80</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de lojas ativas</span>
                <span className="font-medium text-[#111827]">1,205</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Motoristas ativos</span>
                <span className="font-medium text-[#111827]">267</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tempo médio repasse</span>
                <span className="font-medium text-[#111827]">D+2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
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
                <option value="quarter">Este Trimestre</option>
                <option value="year">Este Ano</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Transação
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
              >
                <option value="all">Todas</option>
                <option value="Receita">Receitas</option>
                <option value="Comissão">Comissões</option>
                <option value="Repasse">Repasses</option>
                <option value="Pagamento">Pagamentos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div>
          <h3 className="text-lg font-semibold text-[#111827] mb-4">
            Transações Financeiras
          </h3>
          <DataTable
            columns={transactionColumns}
            data={filteredTransactions}
            actions={transactionActions}
            itemsPerPage={10}
          />
        </div>

        {/* Transaction Details Modal */}
        <AdminModal
          isOpen={showTransactionModal}
          onClose={() => {
            setShowTransactionModal(false);
            setSelectedTransaction(null);
          }}
          title="Detalhes da Transação"
          size="lg"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTransactionModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow">
                Exportar Comprovante
              </button>
            </div>
          }
        >
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Informações Básicas
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ID:</span>
                    <p className="font-medium">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Data:</span>
                    <p className="font-medium">{selectedTransaction.date}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tipo:</span>
                    <p className="font-medium">{selectedTransaction.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        selectedTransaction.status === "Concluído"
                          ? "bg-green-100 text-green-800"
                          : selectedTransaction.status === "Pendente"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedTransaction.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Origem:</span>
                    <p className="font-medium">{selectedTransaction.origin}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Destino:</span>
                    <p className="font-medium">
                      {selectedTransaction.destination}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#111827]">
                    {selectedTransaction.type === "Receita" ||
                    selectedTransaction.type === "Comissão"
                      ? "+"
                      : "-"}
                    R$ {selectedTransaction.amount}
                  </p>
                  <p className="text-gray-600">
                    {selectedTransaction.description}
                  </p>
                </div>
              </div>

              {/* Specific Details */}
              {selectedTransaction.details && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Detalhes Específicos
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(selectedTransaction.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Reference Info */}
              {selectedTransaction.reference && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Referência
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedTransaction.reference}
                  </p>
                </div>
              )}
            </div>
          )}
        </AdminModal>

        {/* Manual Adjustment Modal */}
        <AdminModal
          isOpen={showAdjustmentModal}
          onClose={() => {
            setShowAdjustmentModal(false);
            setSelectedTransaction(null);
          }}
          title="Ajuste Manual"
          size="md"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAdjustmentModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow">
                Confirmar Ajuste
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Ajuste
              </label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent">
                <option>Correção de Repasse</option>
                <option>Ajuste de Comissão</option>
                <option>Reembolso</option>
                <option>Taxa Adicional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loja/Motorista
              </label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent">
                <option>TechStore Pro</option>
                <option>Fashion Plus</option>
                <option>Casa Moderna</option>
                <option>Carlos Silva (Motorista)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo do Ajuste
              </label>
              <textarea
                rows={3}
                placeholder="Descreva o motivo do ajuste..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
              />
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Este ajuste será registrado no log de
                auditoria e não poderá ser desfeito.
              </p>
            </div>
          </div>
        </AdminModal>
      </div>
    </AdminLayout>
  );
};

export default AdminFinances;
