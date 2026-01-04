import { api } from '../Api';

export interface Return {
  id: string;
  pedidoId: string;
  numeroPedido: string;
  produto: {
    id: string;
    nome: string;
    imagem: string;
  };
  motivo: string;
  descricao?: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'CONCLUIDA';
  dataSolicitacao: string;
  valorReembolso: number;
}

export interface CreateReturnRequest {
  pedidoId: string;
  produtoId: string;
  motivo: string;
  descricao?: string;
}

class ReturnsApi {
  /**
   * Busca todas as devoluções do usuário autenticado
   */
  async getMyReturns(): Promise<Return[]> {
    const response = await api.get('/v1/devolucoes/minhas');
    return response.data;
  }

  /**
   * Cria uma nova solicitação de devolução
   */
  async createReturn(data: CreateReturnRequest): Promise<Return> {
    const response = await api.post('/v1/devolucoes', data);
    return response.data;
  }

  /**
   * Busca detalhes de uma devolução
   */
  async getReturnById(id: string): Promise<Return> {
    const response = await api.get(`/v1/devolucoes/${id}`);
    return response.data;
  }

  /**
   * Cancela uma solicitação de devolução
   */
  async cancelReturn(id: string): Promise<void> {
    await api.patch(`/v1/devolucoes/${id}/cancelar`);
  }
}

export const returnsApi = new ReturnsApi();
