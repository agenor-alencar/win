import { AdminApi, api } from "./AdminApi";

export interface Order {
  id: string;
  clienteNome: string;
  lojistaNome: string;
  total: number;
  status: string;
  criadoEm: string;
}

export interface OrderFormatted {
  id: string;
  date: string;
  customer: string;
  store: string;
  total: string;
  status: string;
  paymentMethod: string;
  deliveryTime: string;
  originalStatus: string;
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
   * Lista todos os pedidos
   */
  async getAllOrders(): Promise<Order[]> {
    try {
      const response = await api.get<Order[]>(`${this.baseUrl}/pedidos/listar`);
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
      
      return orders.map((pedido) => ({
        id: pedido.id,
        date: this.formatDateTime(pedido.criadoEm),
        customer: pedido.clienteNome,
        store: pedido.lojistaNome,
        total: this.formatCurrency(pedido.total),
        status: this.translateStatus(pedido.status),
        paymentMethod: "-",
        deliveryTime: "-",
        originalStatus: pedido.status,
      }));
    } catch (error) {
      this.handleError(error, "Erro ao buscar pedidos formatados");
    }
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
