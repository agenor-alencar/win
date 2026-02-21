import { api } from '../Api';

export interface OrderItem {
  id: string;
  produtoId: string;
  produtoNome: string;
  produtoImagem: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Order {
  id: string;
  numeroPedido: string;
  criadoEm: string;
  status: 'PENDENTE' | 'PROCESSANDO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';
  total: number;
  itens: OrderItem[];
  endereco?: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
}

class OrdersApi {
  /**
   * Busca todos os pedidos do usuário autenticado
   */
  async getMyOrders(userId: string): Promise<Order[]> {
    const response = await api.get(`/v1/pedidos/usuario/${userId}`);
    return response.data;
  }

  /**
   * Busca detalhes de um pedido específico
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await api.get(`/v1/pedidos/${orderId}`);
    return response.data;
  }

  /**
   * Cancela um pedido
   */
  async cancelOrder(orderId: string): Promise<void> {
    await api.patch(`/v1/pedidos/${orderId}/cancelar`);
  }
}

export const ordersApi = new OrdersApi();
