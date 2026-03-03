import { AdminApi, api } from "./AdminApi";

export interface Order {
  id: string;
  numeroPedido: string;
  usuarioId: string;
  usuarioNome: string;
  lojistaId: string;
  lojistaNome: string;
  motoristaId?: string;
  motoristaNome?: string;
  status: string;
  subtotal: number;
  desconto: number;
  frete: number;
  total: number;
  enderecoEntrega?: any;
  pagamento?: any;
  notaFiscal?: any;
  codigoEntrega?: string;
  criadoEm: string;
  confirmadoEm?: string;
  entregueEm?: string;
  itens?: any[];
}

export interface OrderFormatted {
  id: string;
  numeroPedido: string;
  date: string;
  customer: string;
  store: string;
  total: string;
  status: string;
  paymentMethod: string;
  deliveryTime: string;
  originalStatus: string;
  fullOrder?: Order;
}

export interface OrderStats {
  total: number;
  pendentes: number;
  emAndamento: number;
  entregues: number;
  cancelados: number;
}

class OrderApiService extends AdminApi {
  /**
   * Traduz status do pedido
   */
  private translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      PENDENTE: "Pendente",
      AGUARDANDO_PAGAMENTO: "Aguardando Pagamento",
      CONFIRMADO: "Confirmado",
      EM_PREPARACAO: "Em Preparação",
      EM_TRANSITO: "Em Trânsito",
      ENTREGUE: "Entregue",
      CANCELADO: "Cancelado",
    };
    return statusMap[status] || status;
  }

  /**
   * Lista todos os pedidos (Apenas ADMIN)
   */
  async getAllOrders(): Promise<Order[]> {
    try {
      const response = await api.get<Order[]>(`${this.baseUrl}/pedidos`);
      return response.data;
    } catch (error) {
      this.handleError(error, "Erro ao buscar pedidos");
    }
  }

  /**
   * Lista pedidos formatados para a tabela
   */
  async getFormattedOrders(): Promise<OrderFormatted[]> {
    try {
      const orders = await this.getAllOrders();
      
      return orders.map((pedido) => {
        // Nome da loja
        const lojaNome = pedido.lojistaNome || "Loja";

        // Calcular tempo estimado de entrega
        const deliveryTime = this.calculateDeliveryTime(pedido);

        // Método de pagamento
        const paymentMethod = this.getPaymentMethod(pedido.pagamento);

        return {
          id: pedido.numeroPedido || pedido.id,
          numeroPedido: pedido.numeroPedido,
          date: this.formatDateTime(pedido.criadoEm),
          customer: pedido.usuarioNome,
          store: lojaNome,
          total: this.formatCurrency(pedido.total),
          status: this.translateStatus(pedido.status),
          paymentMethod,
          deliveryTime,
          originalStatus: pedido.status,
          fullOrder: pedido,
        };
      });
    } catch (error) {
      this.handleError(error, "Erro ao buscar pedidos formatados");
    }
  }

  /**
   * Calcula tempo de entrega estimado ou real
   */
  private calculateDeliveryTime(pedido: Order): string {
    if (pedido.entregueEm && pedido.criadoEm) {
      const inicio = new Date(pedido.criadoEm);
      const fim = new Date(pedido.entregueEm);
      const diffMinutes = Math.floor((fim.getTime() - inicio.getTime()) / 60000);
      return `${diffMinutes} min`;
    }

    if (pedido.status === "ENTREGUE") {
      return "Entregue";
    }

    if (["PENDENTE", "AGUARDANDO_PAGAMENTO", "CONFIRMADO"].includes(pedido.status)) {
      return "Estimado 30-45 min";
    }

    if (["EM_PREPARACAO", "EM_TRANSITO"].includes(pedido.status)) {
      return "Em andamento";
    }

    if (pedido.status === "CANCELADO") {
      return "Cancelado";
    }

    return "-";
  }

  /**
   * Extrai método de pagamento
   */
  private getPaymentMethod(pagamento: any): string {
    if (!pagamento) return "-";
    
    const metodosMap: { [key: string]: string } = {
      CREDIT_CARD: "Cartão de Crédito",
      DEBIT_CARD: "Cartão de Débito",
      PIX: "PIX",
      BANK_SLIP: "Boleto",
    };

    return metodosMap[pagamento.metodoPagamento] || pagamento.metodoPagamento || "-";
  }

  /**
   * Busca estatísticas de pedidos
   */
  async getStats(): Promise<OrderStats> {
    try {
      const orders = await this.getFormattedOrders();
      
      return {
        total: orders.length,
        pendentes: orders.filter((o) => 
          ["PENDENTE", "AGUARDANDO_PAGAMENTO"].includes(o.originalStatus)
        ).length,
        emAndamento: orders.filter((o) => 
          ["CONFIRMADO", "EM_PREPARACAO", "EM_TRANSITO"].includes(o.originalStatus)
        ).length,
        entregues: orders.filter((o) => 
          o.originalStatus === "ENTREGUE"
        ).length,
        cancelados: orders.filter((o) => 
          o.originalStatus === "CANCELADO"
        ).length,
      };
    } catch (error) {
      this.handleError(error, "Erro ao buscar estatísticas de pedidos");
    }
  }

  /**
   * Busca pedido por ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await api.get<Order>(`${this.baseUrl}/pedidos/${orderId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, "Erro ao buscar pedido");
    }
  }

  /**
   * Cancela um pedido (ação administrativa)
   */
  async cancelOrder(orderId: string, motivo: string): Promise<void> {
    try {
      await api.put(`${this.baseUrl}/admin/pedidos/${orderId}/cancel`, {
        motivo,
      });
    } catch (error) {
      this.handleError(error, "Erro ao cancelar pedido");
    }
  }

  /**
   * Atualiza status do pedido (ação administrativa)
   */
  async updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
    try {
      await api.put(`${this.baseUrl}/admin/pedidos/${orderId}/status`, { 
        status: newStatus 
      });
    } catch (error) {
      this.handleError(error, "Erro ao atualizar status do pedido");
    }
  }
}

export const orderApi = new OrderApiService();
