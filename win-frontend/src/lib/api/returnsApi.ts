import { api } from '../Api';

export type DevolucaoStatus =
  | 'PENDENTE'
  | 'APROVADO'
  | 'APROVADO_SEM_COLETA'
  | 'RECUSADO'
  | 'EM_TRANSITO'
  | 'AGUARDANDO_ENTREGA_BALCAO'
  | 'RECEBIDO'
  | 'REEMBOLSADO'
  | 'CANCELADO';

export type MotivoDevolucao =
  | 'PRODUTO_DEFEITUOSO'
  | 'ERRO_MEDIDA_CLIENTE'
  | 'PRODUTO_DIFERENTE'
  | 'PRODUTO_DANIFICADO'
  | 'OUTRO';

export interface DevolucaoResponse {
  id: string;
  numeroDevolucao: string;
  pedidoId: string;
  numeroPedido?: string;
  itemPedidoId: string;
  produtoId?: string;
  produtoNome?: string;
  usuarioId: string;
  usuarioNome?: string;
  usuarioEmail?: string;
  lojistaId: string;
  lojistaNome?: string;
  motivoDevolucao: MotivoDevolucao;
  descricao?: string;
  quantidadeDevolvida: number;
  valorDevolucao: number;
  status: DevolucaoStatus;
  justificativaLojista?: string;
  dataAprovacao?: string;
  dataRecusa?: string;
  dataReembolso?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface CreateDevolucaoRequest {
  pedidoId: string;
  itemPedidoId: string;
  motivoDevolucao: MotivoDevolucao;
  descricao: string;
  quantidadeDevolvida: number;
  valorDevolucao: number;
}

class ReturnsApi {
  /**
   * Busca todas as devoluções do usuário autenticado
   */
  async getMyReturns(): Promise<DevolucaoResponse[]> {
    const response = await api.get('/v1/devolucoes/minhas');
    return response.data;
  }

  /**
   * Cria uma nova solicitação de devolução
   */
  async createReturn(data: CreateDevolucaoRequest): Promise<DevolucaoResponse> {
    const response = await api.post('/v1/devolucoes', data);
    return response.data;
  }

  /**
   * Busca detalhes de uma devolução
   */
  async getReturnById(id: string): Promise<DevolucaoResponse> {
    const response = await api.get(`/v1/devolucoes/${id}`);
    return response.data;
  }

  /**
   * Lista devolucoes pendentes de entrega no balcao para o lojista
   */
  async getPendingReturnsForMerchant(lojistaId: string): Promise<DevolucaoResponse[]> {
    const response = await api.get(`/v1/devolucoes/lojista/${lojistaId}/pendentes`);
    return response.data;
  }

  /**
   * Confirma recebimento e libera estorno pendente
   */
  async confirmReceipt(devolucaoId: string): Promise<DevolucaoResponse> {
    const response = await api.patch(`/v1/devolucoes/${devolucaoId}/confirmar-recebimento`);
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
