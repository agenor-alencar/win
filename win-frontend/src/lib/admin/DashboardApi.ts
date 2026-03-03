import { AdminApi, api } from "./AdminApi";

export interface DashboardStats {
  totalUsuarios: number;
  totalLojas: number;
  totalLojasAtivas: number;
  totalPedidos: number;
  pedidosHoje: number;
  receitaHoje: number;
  pedidosMesAtual: number;
  receitaMesAtual: number;
  receitaTotal: number;
  variacaoPedidosHoje: number;
  variacaoReceitaHoje: number;
  variacaoPedidosMes: number;
  variacaoReceitaMes: number;
  totalProdutos: number;
  totalProdutosAtivos: number;
  ticketMedio: number;
  taxaConversao: number;
}

export interface RecentOrder {
  id: string;
  numeroPedido: string;
  clienteNome: string;
  lojistaNome: string;
  valorTotal: number;
  status: string;
  dataCriacao: string;
}

export interface RecentStore {
  id: string;
  nomeFantasia: string;
  usuarioNome: string;
  ativo: boolean;
  dataCriacao: string;
}

export interface ChartData {
  vendas: { mes: string; quantidade: number }[];
  receitas: { mes: string; valor: number }[];
  categorias: { nome: string; quantidade: number }[];
}

class DashboardApiService extends AdminApi {
  /**
   * Busca estatísticas gerais do dashboard (endpoint consolidado)
   */
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await api.get(`${this.baseUrl}/admin/dashboard/stats`);
      const data = response.data;
      
      return {
        totalUsuarios: data.totalUsuarios || 0,
        totalLojas: data.totalLojas || 0,
        totalLojasAtivas: data.totalLojasAtivas || 0,
        totalPedidos: data.totalPedidos || 0,
        pedidosHoje: data.pedidosHoje || 0,
        receitaHoje: data.receitaHoje || 0,
        pedidosMesAtual: data.pedidosMesAtual || 0,
        receitaMesAtual: data.receitaMesAtual || 0,
        receitaTotal: data.receitaTotal || 0,
        variacaoPedidosHoje: data.variacaoPedidosHoje || 0,
        variacaoReceitaHoje: data.variacaoReceitaHoje || 0,
        variacaoPedidosMes: data.variacaoPedidosMes || 0,
        variacaoReceitaMes: data.variacaoReceitaMes || 0,
        totalProdutos: data.totalProdutos || 0,
        totalProdutosAtivos: data.totalProdutosAtivos || 0,
        ticketMedio: data.ticketMedio || 0,
        taxaConversao: data.taxaConversao || 0,
      };
    } catch (error) {
      this.handleError(error, "Erro ao buscar estatísticas do dashboard");
    }
  }

  /**
   * Busca pedidos recentes (últimos 5)
   */
  async getRecentOrders(): Promise<RecentOrder[]> {
    try {
      const response = await api.get(`${this.baseUrl}/pedidos`);
      const pedidos = response.data || [];

      return pedidos
        .sort((a: any, b: any) => {
          return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
        })
        .slice(0, 5)
        .map((pedido: any) => ({
          id: pedido.id,
          numeroPedido: pedido.numeroPedido,
          clienteNome: pedido.usuarioNome || "Cliente",
          lojistaNome: pedido.lojistaNome || "Loja",
          valorTotal: pedido.valorTotal || 0,
          status: this.translateOrderStatus(pedido.status),
          dataCriacao: pedido.criadoEm,
        }));
    } catch (error) {
      this.handleError(error, "Erro ao buscar pedidos recentes");
    }
  }

  /**
   * Busca lojas recentes (últimas 5)
   */
  async getRecentStores(): Promise<RecentStore[]> {
    try {
      const response = await api.get(`${this.baseUrl}/lojistas`);
      const lojistas = response.data || [];

      return lojistas
        .sort((a: any, b: any) => {
          return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
        })
        .slice(0, 5)
        .map((lojista: any) => ({
          id: lojista.id,
          nomeFantasia: lojista.nomeFantasia,
          usuarioNome: lojista.usuarioNome || "Proprietário",
          ativo: lojista.ativo,
          dataCriacao: lojista.criadoEm,
        }));
    } catch (error) {
      this.handleError(error, "Erro ao buscar lojas recentes");
    }
  }

  /**
   * Busca dados para gráficos (últimos 7 meses) - PROCESSADO NO BACKEND
   */
  async getChartData(): Promise<ChartData> {
    try {
      const response = await api.get(`${this.baseUrl}/admin/dashboard/chart-data`);
      const data = response.data;

      return {
        vendas: data.vendas || [],
        receitas: data.receitas || [],
        categorias: data.categorias || [],
      };
    } catch (error) {
      this.handleError(error, "Erro ao buscar dados de gráficos");
    }
  }

  /**
   * Traduz status do pedido para português (padronizado com OrderApi)
   */
  private translateOrderStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      PENDENTE: "Pendente",
      AGUARDANDO_PAGAMENTO: "Aguardando Pagamento",
      CONFIRMADO: "Confirmado",
      EM_PREPARACAO: "Em Preparação",
      PREPARANDO: "Em Preparação", // Alias para EM_PREPARACAO
      PRONTO: "Confirmado", // Alias para CONFIRMADO
      EM_TRANSITO: "Em Trânsito",
      ENTREGUE: "Entregue",
      CANCELADO: "Cancelado",
    };
    return statusMap[status] || status;
  }
}

export const dashboardApi = new DashboardApiService();
