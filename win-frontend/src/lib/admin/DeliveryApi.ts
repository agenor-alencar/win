import { AdminApi, api } from "./AdminApi";

export interface EntregaStats {
  totalEntregas: number;
  aguardandoPreparacao: number;
  aguardandoMotorista: number;
  motoristaACaminhoRetirada: number;
  emTransito: number;
  entregues: number;
  canceladas: number;
  falhasSolicitacao: number;
  problemasAtivos: number;
}

export interface EntregaListItem {
  id: string;
  pedidoId: string;
  numeroPedido: string;
  nomeMotorista?: string;
  placaVeiculo?: string;
  contatoMotorista?: string;
  veiculoMotorista?: string;
  nomeCliente: string;
  contatoCliente: string;
  nomeLojista: string;
  enderecoColeta: string;
  enderecoEntrega: string;
  status: string;
  statusDescricao: string;
  tipoVeiculo?: string;
  valorFreteCliente?: number;
  tempoEstimadoMin?: number;
  distanciaEstimadaKm?: number;
  dataHoraSolicitacao?: string;
  dataHoraColeta?: string;
  dataHoraConclusao?: string;
  urlRastreamento?: string;
  codigoConfirmacao?: string;
  codigoRetirada?: string;
  observacoes?: string;
}

export type StatusEntrega =
  | "AGUARDANDO_PREPARACAO"
  | "AGUARDANDO_MOTORISTA"
  | "MOTORISTA_A_CAMINHO_RETIRADA"
  | "EM_TRANSITO"
  | "ENTREGUE"
  | "CANCELADA"
  | "FALHA_SOLICITACAO";

class DeliveryApiService extends AdminApi {
  /**
   * Busca estatísticas consolidadas de entregas
   */
  async getStats(): Promise<EntregaStats> {
    try {
      const response = await api.get(`${this.baseUrl}/admin/entregas/stats`);
      return response.data;
    } catch (error) {
      this.handleError(error, "Erro ao buscar estatísticas de entregas");
    }
  }

  /**
   * Lista todas as entregas
   */
  async listAll(): Promise<EntregaListItem[]> {
    try {
      const response = await api.get(`${this.baseUrl}/admin/entregas/list`);
      return response.data || [];
    } catch (error) {
      this.handleError(error, "Erro ao listar entregas");
    }
  }

  /**
   * Lista entregas por status
   */
  async listByStatus(status: StatusEntrega): Promise<EntregaListItem[]> {
    try {
      const response = await api.get(
        `${this.baseUrl}/admin/entregas/list/status/${status}`
      );
      return response.data || [];
    } catch (error) {
      this.handleError(error, `Erro ao listar entregas com status ${status}`);
    }
  }

  /**
   * Lista entregas com problemas
   */
  async listProblems(): Promise<EntregaListItem[]> {
    try {
      const response = await api.get(
        `${this.baseUrl}/admin/entregas/list/problemas`
      );
      return response.data || [];
    } catch (error) {
      this.handleError(error, "Erro ao listar entregas com problemas");
    }
  }

  /**
   * Cancela uma entrega
   */
  async cancel(entregaId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/entregas/${entregaId}`);
    } catch (error) {
      this.handleError(error, `Erro ao cancelar entrega ${entregaId}`);
    }
  }

  /**
   * Traduz status para português legível
   */
  translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      AGUARDANDO_PREPARACAO: "Aguardando Preparação",
      AGUARDANDO_MOTORISTA: "Aguardando Motorista",
      MOTORISTA_A_CAMINHO_RETIRADA: "Motorista a Caminho",
      EM_TRANSITO: "Em Trânsito",
      ENTREGUE: "Entregue",
      CANCELADA: "Cancelada",
      FALHA_SOLICITACAO: "Falha na Solicitação",
    };
    return statusMap[status] || status;
  }

  /**
   * Obtém classe CSS do status para exibição
   */
  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      ENTREGUE: "bg-green-100 text-green-800",
      EM_TRANSITO: "bg-blue-100 text-blue-800",
      MOTORISTA_A_CAMINHO_RETIRADA: "bg-yellow-100 text-yellow-800",
      AGUARDANDO_MOTORISTA: "bg-yellow-100 text-yellow-800",
      AGUARDANDO_PREPARACAO: "bg-purple-100 text-purple-800",
      FALHA_SOLICITACAO: "bg-red-100 text-red-800",
      CANCELADA: "bg-gray-100 text-gray-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  }
}

export const deliveryApi = new DeliveryApiService();
