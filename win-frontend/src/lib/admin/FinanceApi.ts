import { AdminApi, api } from "./AdminApi";

export interface FinanceStats {
  receitaTotal: number;
  receitaHoje: number;
  receitaMesAtual: number;
  comissaoWIN: number;
  repassesLojas: number;
  pagamentosMotoristas: number;
  ticketMedio: number;
  taxaComissaoMedia: number;
  totalLojasAtivas: number;
  motoristasAtivos: number;
  tempoMedioRepasse: string;
  variacaoReceitaHoje: number;
  variacaoReceitaMes: number;
}

export interface ReceitaMensal {
  mes: string;
  valor: number;
}

export interface ChartData {
  receitas: ReceitaMensal[];
}

export interface TransacaoFinanceira {
  id: string;
  data: string;
  tipo: "RECEITA" | "COMISSAO" | "REPASSE" | "PAGAMENTO";
  descricao: string;
  origem: string;
  destino: string;
  valor: number;
  status: "CONCLUIDO" | "PENDENTE" | "CANCELADO";
  pedidoId?: string;
  detalhes?: any;
}

class FinanceApiService extends AdminApi {
  /**
   * Busca estatísticas financeiras consolidadas
   */
  async getStats(): Promise<FinanceStats> {
    try {
      const [dashboardStats, chartData, entregaStats, config] = await Promise.all([
        api.get(`${this.baseUrl}/admin/dashboard/stats`),
        api.get(`${this.baseUrl}/admin/dashboard/chart-data`),
        api.get(`${this.baseUrl}/admin/entregas/stats`),
        api.get(`${this.baseUrl}/admin/configuracoes`),
      ]);

      const stats = dashboardStats.data;
      const receitas = chartData.data.receitas || [];
      const configuracao = config.data;

      // Usar taxas configuradas do sistema
      const taxaComissao = configuracao.taxaComissaoWin / 100;
      const taxaRepasse = configuracao.taxaRepasseLojista / 100;

      // Calcular comissão WIN (com base na configuração)
      const comissaoWIN = stats.receitaTotal * taxaComissao;

      // Calcular repasses às lojas (com base na configuração)
      const repassesLojas = stats.receitaTotal * taxaRepasse;

      // Pagamentos a motoristas (baseado nas entregas e config)
      const totalEntregas = entregaStats.data.totalEntregas || 0;
      const pagamentosMotoristas = totalEntregas * configuracao.valorEntregaMotorista;

      // Taxa de comissão média (incluindo taxa de processamento)
      const taxaComissaoMedia = configuracao.taxaComissaoWin + configuracao.taxaProcessamentoPagamento;

      return {
        receitaTotal: stats.receitaTotal || 0,
        receitaHoje: stats.receitaHoje || 0,
        receitaMesAtual: stats.receitaMesAtual || 0,
        comissaoWIN,
        repassesLojas,
        pagamentosMotoristas,
        ticketMedio: stats.ticketMedio || 0,
        taxaComissaoMedia,
        totalLojasAtivas: stats.totalLojasAtivas || 0,
        motoristasAtivos: entregaStats.data.entregues || 0,
        tempoMedioRepasse: `D+${configuracao.diasRepasse}`,
        variacaoReceitaHoje: stats.variacaoReceitaHoje || 0,
        variacaoReceitaMes: stats.variacaoReceitaMes || 0,
      };
    } catch (error) {
      this.handleError(error, "Erro ao buscar estatísticas financeiras");
    }
  }

  /**
   * Busca dados de receita mensal para o gráfico
   */
  async getChartData(): Promise<ChartData> {
    try {
      const response = await api.get(`${this.baseUrl}/admin/dashboard/chart-data`);
      
      return {
        receitas: response.data.receitas.map((r: any) => ({
          mes: r.mes,
          valor: r.valor || 0,
        })),
      };
    } catch (error) {
      this.handleError(error, "Erro ao buscar dados do gráfico");
    }
  }

  /**
   * Lista transações financeiras
   * Nota: Este é um mock até implementar endpoint específico no backend
   */
  async listTransactions(
    period?: string,
    tipo?: string
  ): Promise<TransacaoFinanceira[]> {
    try {
      // Por enquanto, buscar pedidos e transformar em transações
      const response = await api.get(`${this.baseUrl}/pedidos/listar`);
      const pedidos = response.data;

      return pedidos
        .filter((p: any) => p.status !== "CANCELADO")
        .map((pedido: any) => ({
          id: `T${pedido.numeroPedido}`,
          data: new Date(pedido.criadoEm).toLocaleDateString("pt-BR"),
          tipo: "RECEITA" as const,
          descricao: `Venda - Pedido #${pedido.numeroPedido}`,
          origem: pedido.cliente?.nome || "Cliente",
          destino: "WIN Marketplace",
          valor: pedido.total || 0,
          status: pedido.status === "ENTREGUE" ? ("CONCLUIDO" as const) : ("PENDENTE" as const),
          pedidoId: pedido.id,
          detalhes: {
            total: pedido.total,
            subtotal: pedido.subtotal,
            frete: pedido.frete,
            desconto: pedido.desconto,
          },
        }));
    } catch (error) {
      this.handleError(error, "Erro ao listar transações");
    }
  }
}

export const financeApi = new FinanceApiService();
