import { api } from "./Api";

const API_BASE_URL = "/v1";

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

class DashboardApiService {
  /**
   * Busca estatísticas gerais do dashboard usando o novo endpoint consolidado
   */
  async getStats(): Promise<DashboardStats> {
    try {
      // Tentar buscar do novo endpoint consolidado
      const response = await api.get(`${API_BASE_URL}/admin/dashboard/stats`);
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
      console.error("Erro ao buscar estatísticas do endpoint consolidado, tentando fallback:", error);
      
      // Fallback: buscar dados de endpoints individuais (compatibilidade)
      try {
        const usuariosResponse = await api.get(`${API_BASE_URL}/usuario/list/all`);
        const totalUsuarios = usuariosResponse.data?.length || 0;

        const lojistasResponse = await api.get(`${API_BASE_URL}/lojistas`);
        const lojistas = lojistasResponse.data || [];
        const totalLojas = lojistas.length;
        const totalLojasAtivas = lojistas.filter((l: any) => l.ativo).length;

        const pedidosResponse = await api.get(`${API_BASE_URL}/pedidos`);
        const pedidos = pedidosResponse.data || [];
        const totalPedidos = pedidos.length;

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const pedidosHoje = pedidos.filter((pedido: any) => {
          const dataPedido = new Date(pedido.criadoEm);
          dataPedido.setHours(0, 0, 0, 0);
          return dataPedido.getTime() === hoje.getTime();
        }).length;

        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();
        const pedidosMesAtual = pedidos.filter((pedido: any) => {
          const dataPedido = new Date(pedido.criadoEm);
          return (
            dataPedido.getMonth() === mesAtual &&
            dataPedido.getFullYear() === anoAtual &&
            pedido.status !== 'CANCELADO'
          );
        });
        const receitaMesAtual = pedidosMesAtual.reduce(
          (total: number, pedido: any) => total + (pedido.valorTotal || 0),
          0
        );

        const receitaTotal = pedidos
          .filter((pedido: any) => pedido.status !== 'CANCELADO')
          .reduce((total: number, pedido: any) => total + (pedido.valorTotal || 0), 0);

        const ticketMedio = totalPedidos > 0 ? receitaTotal / totalPedidos : 0;
        const taxaConversao = totalUsuarios > 0 ? (totalPedidos / totalUsuarios) * 100 : 0;

        return {
          totalUsuarios,
          totalLojas,
          totalLojasAtivas,
          totalPedidos,
          pedidosHoje,
          receitaHoje: 0, // Não calculável sem dados detalhados
          pedidosMesAtual: pedidosMesAtual.length,
          receitaMesAtual,
          receitaTotal,
          variacaoPedidosHoje: 0,
          variacaoReceitaHoje: 0,
          variacaoPedidosMes: 0,
          variacaoReceitaMes: 0,
          totalProdutos: 0,
          totalProdutosAtivos: 0,
          ticketMedio,
          taxaConversao,
        };
      } catch (fallbackError) {
        console.error("Erro no fallback ao buscar estatísticas:", fallbackError);
        // Retornar valores zerados em caso de erro completo
        return {
          totalUsuarios: 0,
          totalLojas: 0,
          totalLojasAtivas: 0,
          totalPedidos: 0,
          pedidosHoje: 0,
          receitaHoje: 0,
          pedidosMesAtual: 0,
          receitaMesAtual: 0,
          receitaTotal: 0,
          variacaoPedidosHoje: 0,
          variacaoReceitaHoje: 0,
          variacaoPedidosMes: 0,
          variacaoReceitaMes: 0,
          totalProdutos: 0,
          totalProdutosAtivos: 0,
          ticketMedio: 0,
          taxaConversao: 0,
        };
      }
    }
  }

  /**
   * Busca pedidos recentes (últimos 5)
   */
  async getRecentOrders(): Promise<RecentOrder[]> {
    try {
      const response = await api.get(`${API_BASE_URL}/pedidos`);
      const pedidos = response.data || [];

      // Ordenar por data de criação (mais recente primeiro) e pegar os 5 primeiros
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
          status: this.translateStatus(pedido.status),
          dataCriacao: pedido.criadoEm,
        }));
    } catch (error) {
      console.error("Erro ao buscar pedidos recentes:", error);
      return [];
    }
  }

  /**
   * Busca lojas recentes (últimas 5)
   */
  async getRecentStores(): Promise<RecentStore[]> {
    try {
      const response = await api.get(`${API_BASE_URL}/lojistas`);
      const lojistas = response.data || [];

      // Ordenar por data de criação (mais recente primeiro) e pegar os 5 primeiros
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
      console.error("Erro ao buscar lojas recentes:", error);
      return [];
    }
  }

  /**
   * Busca dados para gráficos (últimos 7 meses)
   */
  async getChartData(): Promise<ChartData> {
    try {
      const pedidosResponse = await api.get(`${API_BASE_URL}/pedidos`);
      const pedidos = pedidosResponse.data || [];

      // Preparar dados dos últimos 7 meses
      const meses = this.getLast7Months();
      
      // Agrupar vendas por mês
      const vendasPorMes = meses.map((mes) => {
        const pedidosDoMes = pedidos.filter((pedido: any) => {
          const dataPedido = new Date(pedido.criadoEm);
          return (
            dataPedido.getMonth() === mes.numero &&
            dataPedido.getFullYear() === mes.ano &&
            pedido.status !== 'CANCELADO'
          );
        });
        return {
          mes: mes.nome,
          quantidade: pedidosDoMes.length,
        };
      });

      // Agrupar receitas por mês
      const receitasPorMes = meses.map((mes) => {
        const pedidosDoMes = pedidos.filter((pedido: any) => {
          const dataPedido = new Date(pedido.criadoEm);
          return (
            dataPedido.getMonth() === mes.numero &&
            dataPedido.getFullYear() === mes.ano &&
            pedido.status !== 'CANCELADO'
          );
        });
        const receita = pedidosDoMes.reduce(
          (total: number, pedido: any) => total + (pedido.valorTotal || 0),
          0
        );
        return {
          mes: mes.nome,
          valor: receita,
        };
      });

      // Buscar produtos e agrupar por categoria
      const produtosResponse = await api.get(`${API_BASE_URL}/produtos`);
      const produtos = produtosResponse.data?.content || produtosResponse.data || [];
      
      const categoriasPorProduto: { [key: string]: number } = {};
      produtos.forEach((produto: any) => {
        const categoriaNome = produto.categoriaNome || "Sem Categoria";
        categoriasPorProduto[categoriaNome] = (categoriasPorProduto[categoriaNome] || 0) + 1;
      });

      const categorias = Object.entries(categoriasPorProduto).map(([nome, quantidade]) => ({
        nome,
        quantidade: quantidade as number,
      }));

      return {
        vendas: vendasPorMes,
        receitas: receitasPorMes,
        categorias,
      };
    } catch (error) {
      console.error("Erro ao buscar dados de gráficos:", error);
      return {
        vendas: [],
        receitas: [],
        categorias: [],
      };
    }
  }

  /**
   * Traduz status do pedido para português
   */
  private translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      PENDENTE: "Pendente",
      CONFIRMADO: "Confirmado",
      PREPARANDO: "Preparando",
      PRONTO: "Pronto",
      EM_TRANSITO: "Em entrega",
      ENTREGUE: "Entregue",
      CANCELADO: "Cancelado",
    };
    return statusMap[status] || status;
  }

  /**
   * Retorna os últimos 7 meses em ordem
   */
  private getLast7Months() {
    const mesesNomes = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];
    
    const resultado = [];
    const hoje = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      resultado.push({
        nome: mesesNomes[data.getMonth()],
        numero: data.getMonth(),
        ano: data.getFullYear(),
      });
    }
    
    return resultado;
  }
}

export const dashboardApi = new DashboardApiService();
