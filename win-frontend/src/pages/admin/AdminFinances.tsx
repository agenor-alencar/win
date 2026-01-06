import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useNotification } from "../../contexts/NotificationContext";
import { DataTable, Column, Action } from "../../components/admin/DataTable";
import { AdminModal } from "../../components/admin/AdminModal";
import { KPICard } from "../../components/admin/KPICard";
import { RevenueChart } from "../../components/admin/Charts";
import {
  financeApi,
  type FinanceStats,
  type ReceitaMensal,
  type TransacaoFinanceira,
} from "@/lib/admin";
import {
  BanknotesIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  PlusIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

const AdminFinances: React.FC = () => {
  const { addNotification, success, error: showError } = useNotification();
  const [selectedTransaction, setSelectedTransaction] = useState<TransacaoFinanceira | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [financeData, setFinanceData] = useState<FinanceStats | null>(null);
  const [revenueData, setRevenueData] = useState<ReceitaMensal[]>([]);
  const [transactions, setTransactions] = useState<TransacaoFinanceira[]>([]);

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const [stats, chartData, transactionsList] = await Promise.all([
        financeApi.getStats(),
        financeApi.getChartData(),
        financeApi.listTransactions(),
      ]);

      setFinanceData(stats);
      setRevenueData(chartData.receitas.map(r => ({
        name: r.mes,
        receita: r.valor,
      })));
      setTransactions(transactionsList);
    } catch (error: any) {
      console.error("Erro ao carregar dados financeiros:", error);
      showError("Erro ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  };

  // Financial KPIs - usando dados reais
  const financialKPIs = financeData ? [
    {
      title: "Receita Total",
      value: `R$ ${financeData.receitaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: { 
        value: Math.abs(financeData.variacaoReceitaMes), 
        type: financeData.variacaoReceitaMes >= 0 ? "increase" as const : "decrease" as const, 
        period: "este mês" 
      },
      icon: BanknotesIcon,
      color: "green" as const,
    },
    {
      title: "Comissão WIN",
      value: `R$ ${financeData.comissaoWIN.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: { 
        value: Math.abs(financeData.variacaoReceitaMes * 0.07), 
        type: financeData.variacaoReceitaMes >= 0 ? "increase" as const : "decrease" as const, 
        period: "este mês" 
      },
      icon: CreditCardIcon,
      color: "blue" as const,
    },
    {
      title: "Repasses Lojas",
      value: `R$ ${financeData.repassesLojas.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: { 
        value: Math.abs(financeData.variacaoReceitaMes * 0.93), 
        type: financeData.variacaoReceitaMes >= 0 ? "increase" as const : "decrease" as const, 
        period: "este mês" 
      },
      icon: BuildingLibraryIcon,
      color: "purple" as const,
    },
    {
      title: "Pagtos. Motoristas",
      value: `R$ ${financeData.pagamentosMotoristas.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: { value: 8, type: "increase" as const, period: "este mês" },
      icon: TruckIcon,
      color: "orange" as const,
    },
  ] : [];

  // Revenue chart data formatado
  const revenueChartData = revenueData.map(r => ({
    name: r.name,
    receita: r.receita || 0,
  }));

  const transactionColumns: Column[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "data", label: "Data", sortable: true },
    {
      key: "tipo",
      label: "Tipo",
      render: (tipo) => {
        const typeMap: { [key: string]: { label: string; class: string } } = {
          RECEITA: { label: "Receita", class: "bg-green-100 text-green-800" },
          COMISSAO: { label: "Comissão", class: "bg-blue-100 text-blue-800" },
          REPASSE: { label: "Repasse", class: "bg-purple-100 text-purple-800" },
          PAGAMENTO: { label: "Pagamento", class: "bg-orange-100 text-orange-800" },
        };
        const typeInfo = typeMap[tipo] || { label: tipo, class: "bg-gray-100 text-gray-800" };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.class}`}>
            {typeInfo.label}
          </span>
        );
      },
    },
    { key: "descricao", label: "Descrição", sortable: true },
    { key: "origem", label: "Origem", sortable: true },
    { key: "destino", label: "Destino", sortable: true },
    {
      key: "valor",
      label: "Valor",
      sortable: true,
      render: (valor, row) => (
        <span
          className={`font-medium ${
            row.tipo === "RECEITA" || row.tipo === "COMISSAO"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {row.tipo === "RECEITA" || row.tipo === "COMISSAO" ? "+" : "-"}R${" "}
          {typeof valor === 'number' ? valor.toFixed(2) : valor}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status) => {
        const statusMap: { [key: string]: { label: string; class: string } } = {
          CONCLUIDO: { label: "Concluído", class: "bg-green-100 text-green-800" },
          PENDENTE: { label: "Pendente", class: "bg-yellow-100 text-yellow-800" },
          CANCELADO: { label: "Cancelado", class: "bg-red-100 text-red-800" },
        };
        const statusInfo = statusMap[status] || { label: status, class: "bg-gray-100 text-gray-800" };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
            {statusInfo.label}
          </span>
        );
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
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterType !== "all" && transaction.tipo !== filterType) return false;
    // TODO: Add date filtering based on filterPeriod
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
            <button
              onClick={loadFinanceData}
              disabled={loading}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
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
            <RevenueChart data={revenueChartData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-[#111827] mb-4">
              Resumo Financeiro
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taxa de comissão média</span>
                <span className="font-medium text-[#111827]">
                  {financeData?.taxaComissaoMedia.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ticket médio</span>
                <span className="font-medium text-[#111827]">
                  R$ {financeData?.ticketMedio.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de lojas ativas</span>
                <span className="font-medium text-[#111827]">
                  {financeData?.totalLojasAtivas.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Motoristas ativos</span>
                <span className="font-medium text-[#111827]">
                  {financeData?.motoristasAtivos || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tempo médio repasse</span>
                <span className="font-medium text-[#111827]">
                  {financeData?.tempoMedioRepasse || "N/A"}
                </span>
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
                <option value="RECEITA">Receitas</option>
                <option value="COMISSAO">Comissões</option>
                <option value="REPASSE">Repasses</option>
                <option value="PAGAMENTO">Pagamentos</option>
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
                    <p className="font-medium">{selectedTransaction.data}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tipo:</span>
                    <p className="font-medium">
                      {selectedTransaction.tipo === "RECEITA" ? "Receita" :
                       selectedTransaction.tipo === "COMISSAO" ? "Comissão" :
                       selectedTransaction.tipo === "REPASSE" ? "Repasse" :
                       selectedTransaction.tipo === "PAGAMENTO" ? "Pagamento" : selectedTransaction.tipo}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        selectedTransaction.status === "CONCLUIDO"
                          ? "bg-green-100 text-green-800"
                          : selectedTransaction.status === "PENDENTE"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedTransaction.status === "CONCLUIDO" ? "Concluído" :
                       selectedTransaction.status === "PENDENTE" ? "Pendente" :
                       selectedTransaction.status === "CANCELADO" ? "Cancelado" : selectedTransaction.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Origem:</span>
                    <p className="font-medium">{selectedTransaction.origem}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Destino:</span>
                    <p className="font-medium">
                      {selectedTransaction.destino}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#111827]">
                    {selectedTransaction.tipo === "RECEITA" ||
                    selectedTransaction.tipo === "COMISSAO"
                      ? "+"
                      : "-"}
                    R$ {typeof selectedTransaction.valor === 'number' 
                        ? selectedTransaction.valor.toFixed(2) 
                        : selectedTransaction.valor}
                  </p>
                  <p className="text-gray-600">
                    {selectedTransaction.descricao}
                  </p>
                </div>
              </div>

              {/* Specific Details */}
              {selectedTransaction.detalhes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Detalhes da Transação
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {selectedTransaction.detalhes.total && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">R$ {selectedTransaction.detalhes.total.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedTransaction.detalhes.subtotal && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">R$ {selectedTransaction.detalhes.subtotal.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedTransaction.detalhes.frete && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Frete:</span>
                        <span className="font-medium">R$ {selectedTransaction.detalhes.frete.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedTransaction.detalhes.desconto > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Desconto:</span>
                        <span className="font-medium">- R$ {selectedTransaction.detalhes.desconto.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pedido Reference */}
              {selectedTransaction.pedidoId && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Pedido Relacionado
                  </h4>
                  <p className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                    Ver Pedido #{selectedTransaction.pedidoId}
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
              <select aria-label="Tipo de Ajuste" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent">
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
              <select aria-label="Loja ou Motorista" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent">
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
