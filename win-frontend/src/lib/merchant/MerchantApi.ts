import { api } from "../Api";

// ===========================
// INTERFACES E TIPOS
// ===========================

export interface Lojista {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  email: string;
  telefone: string;
  descricao?: string;
  ativo: boolean;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
  endereco?: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  criadoEm: string;
}

export interface LojistaEstatisticas {
  vendasHoje: number;
  vendasOntem: number;
  receitaHoje: number;
  receitaOntem: number;
  totalPedidosPendentes: number;
  totalProdutosAtivos: number;
  totalProdutosInativos: number;
  percentualVariacaoVendas: number;
  percentualVariacaoReceita: number;
}

export interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  ativo: boolean;
  categoria: {
    id: string;
    nome: string;
  };
  lojista: {
    id: string;
    nomeFantasia: string;
  };
  imagens: Array<{
    id: string;
    url: string;
    principal: boolean;
  }>;
}

export interface Order {
  id: string;
  numeroPedido: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
  };
  status: string;
  subtotal: number;
  desconto: number;
  frete: number;
  total: number;
  enderecoEntrega?: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  itens: Array<{
    id: string;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
  }>;
  codigoEntrega?: string;
  criadoEm: string;
  confirmadoEm?: string;
  entregueEm?: string;
}

export interface Devolucao {
  id: string;
  pedido: {
    id: string;
    numeroPedido: string;
  };
  usuario: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
  };
  itemPedido: {
    id: string;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
  };
  motivo: string;
  descricao: string;
  status: "PENDENTE" | "APROVADA" | "RECUSADA" | "CONCLUIDA";
  valorReembolso?: number;
  taxaRetirada?: number;
  dataSolicitacao: string;
  dataAprovacao?: string;
  dataRecusa?: string;
  dataConclusao?: string;
  imagensComprovacao?: string[];
  observacaoLojista?: string;
}

export interface SalesData {
  day: string;
  vendas: number;
  receita: number;
}

export interface TopProduct {
  nome: string;
  vendas: number;
  receita: number;
  estoque: number;
}

export interface DashboardData {
  lojista: Lojista;
  estatisticas: LojistaEstatisticas;
  produtos: Product[];
  pedidos: Order[];
  salesData: SalesData[];
  topProducts: TopProduct[];
}

// ===========================
// CLASSE DE API
// ===========================

class MerchantApiService {
  private readonly baseUrl = "/v1";

  /**
   * Busca dados do lojista logado
   */
  async getMerchantProfile(): Promise<Lojista> {
    try {
      const response = await api.get<Lojista>(`${this.baseUrl}/lojistas/me`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao buscar dados do lojista");
    }
  }

  /**
   * Busca estatísticas do lojista (dashboard)
   */
  async getMerchantStats(lojistaId: string): Promise<LojistaEstatisticas> {
    try {
      const response = await api.get<LojistaEstatisticas>(
        `${this.baseUrl}/lojistas/${lojistaId}/estatisticas`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao buscar estatísticas");
    }
  }

  /**
   * Busca produtos do lojista
   */
  async getMerchantProducts(lojistaId: string): Promise<Product[]> {
    try {
      const response = await api.get<Product[]>(
        `${this.baseUrl}/produtos/lojista/${lojistaId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao buscar produtos");
    }
  }

  /**
   * Busca pedidos do lojista
   */
  async getMerchantOrders(lojistaId: string): Promise<Order[]> {
    try {
      const response = await api.get<Order[]>(
        `${this.baseUrl}/pedidos/lojista/${lojistaId}/pendentes-preparacao`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao buscar pedidos");
    }
  }

  /**
   * Busca devoluções do lojista
   */
  async getMerchantReturns(lojistaId: string): Promise<Devolucao[]> {
    try {
      const response = await api.get<Devolucao[]>(
        `${this.baseUrl}/devolucoes/lojista/${lojistaId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao buscar devoluções");
    }
  }

  /**
   * Busca devoluções do lojista por status
   */
  async getMerchantReturnsByStatus(
    lojistaId: string,
    status: "PENDENTE" | "APROVADA" | "RECUSADA" | "CONCLUIDA"
  ): Promise<Devolucao[]> {
    try {
      const response = await api.get<Devolucao[]>(
        `${this.baseUrl}/devolucoes/lojista/${lojistaId}/status/${status}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao buscar devoluções por status");
    }
  }

  /**
   * Atualiza status de uma devolução
   */
  async updateReturnStatus(
    devolucaoId: string,
    lojistaId: string,
    data: {
      status: "APROVADA" | "RECUSADA";
      observacao?: string;
      valorReembolso?: number;
      taxaRetirada?: number;
    }
  ): Promise<Devolucao> {
    try {
      const response = await api.patch<Devolucao>(
        `${this.baseUrl}/devolucoes/${devolucaoId}/lojista/${lojistaId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao atualizar status da devolução");
    }
  }

  /**
   * Busca todos os dados do dashboard de uma vez (otimizado)
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      // 1. Buscar lojista logado
      const lojista = await this.getMerchantProfile();

      // 2. Buscar dados em paralelo
      const [estatisticas, produtos, pedidos] = await Promise.all([
        this.getMerchantStats(lojista.id),
        this.getMerchantProducts(lojista.id),
        this.getMerchantOrders(lojista.id),
      ]);

      // 3. Processar dados de vendas por dia (últimos 7 dias)
      const salesData = this.processSalesData(pedidos);

      // 4. Calcular top produtos
      const topProducts = this.calculateTopProducts(pedidos, produtos);

      return {
        lojista,
        estatisticas,
        produtos,
        pedidos,
        salesData,
        topProducts,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao carregar dados do dashboard");
    }
  }

  /**
   * Processa dados de vendas por dia (últimos 7 dias)
   */
  private processSalesData(pedidos: Order[]): SalesData[] {
    const today = new Date();
    const last7Days: SalesData[] = [];
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = pedidos.filter((order) => {
        const orderDate = new Date(order.criadoEm);
        return orderDate >= date && orderDate < nextDate;
      });

      const totalVendas = dayOrders.length;
      const totalReceita = dayOrders.reduce((sum, order) => sum + order.total, 0);

      last7Days.push({
        day: dayNames[date.getDay()],
        vendas: totalVendas,
        receita: Math.round(totalReceita * 100) / 100,
      });
    }

    return last7Days;
  }

  /**
   * Calcula os produtos mais vendidos
   */
  private calculateTopProducts(pedidos: Order[], produtos: Product[]): TopProduct[] {
    const productSales = new Map<string, { vendas: number; receita: number }>();

    // Processar itens dos pedidos
    pedidos.forEach((pedido) => {
      pedido.itens.forEach((item) => {
        const current = productSales.get(item.nomeProduto) || { vendas: 0, receita: 0 };
        productSales.set(item.nomeProduto, {
          vendas: current.vendas + item.quantidade,
          receita: current.receita + item.subtotal,
        });
      });
    });

    // Converter para array e adicionar estoque
    const topProducts: TopProduct[] = [];
    productSales.forEach((sales, nome) => {
      const produto = produtos.find((p) => p.nome === nome);
      topProducts.push({
        nome,
        vendas: sales.vendas,
        receita: Math.round(sales.receita * 100) / 100,
        estoque: produto?.estoque || 0,
      });
    });

    // Ordenar por receita decrescente e pegar top 5
    return topProducts.sort((a, b) => b.receita - a.receita).slice(0, 5);
  }

  /**
   * Formata devolução para exibição na UI
   */
  formatReturn(devolucao: Devolucao): {
    id: string;
    orderId: string;
    customer: {
      name: string;
      phone: string;
      address: string;
    };
    item: {
      name: string;
      price: number;
      quantity: number;
    };
    reason: string;
    description: string;
    status: string;
    requestDate: string;
    approvedDate?: string;
    photos?: string[];
  } {
    return {
      id: devolucao.id,
      orderId: devolucao.pedido.numeroPedido,
      customer: {
        name: devolucao.usuario.nome,
        phone: devolucao.usuario.telefone || "Não informado",
        address: "Endereço não disponível", // TODO: Adicionar endereço no backend
      },
      item: {
        name: devolucao.itemPedido.nomeProduto,
        price: devolucao.itemPedido.precoUnitario,
        quantity: devolucao.itemPedido.quantidade,
      },
      reason: devolucao.motivo,
      description: devolucao.descricao,
      status: devolucao.status.toLowerCase(),
      requestDate: new Date(devolucao.dataSolicitacao).toLocaleString("pt-BR"),
      approvedDate: devolucao.dataAprovacao
        ? new Date(devolucao.dataAprovacao).toLocaleString("pt-BR")
        : undefined,
      photos: devolucao.imagensComprovacao,
    };
  }
}

// Exportar instância singleton
export const merchantApi = new MerchantApiService();
