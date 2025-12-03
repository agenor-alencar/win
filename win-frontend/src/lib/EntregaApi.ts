import { api } from "./Api";

const API_BASE_URL = "/v1";

// Interfaces
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
  clienteNome: string;
  clienteTelefone: string;
  lojistaFantasia: string;
  enderecoEntrega: string;
  status: string;
  statusDescricao: string;
  tipoVeiculo: string;
  valorFreteCliente: number;
  tempoEstimado: string;
  distanciaEstimada: string;
  dataHoraSolicitacao?: string;
  dataHoraRetirada?: string;
  dataHoraEntrega?: string;
  urlRastreamento?: string;
  codigoRetirada?: string;
  codigoEntrega?: string;
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

class EntregaApiService {
  /**
   * Busca estatísticas consolidadas de entregas
   */
  async getStats(): Promise<EntregaStats> {
    try {
      const response = await api.get(`${API_BASE_URL}/admin/entregas/stats`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar estatísticas de entregas:", error);
      return {
        totalEntregas: 0,
        aguardandoPreparacao: 0,
        aguardandoMotorista: 0,
        motoristaACaminhoRetirada: 0,
        emTransito: 0,
        entregues: 0,
        canceladas: 0,
        falhasSolicitacao: 0,
        problemasAtivos: 0,
      };
    }
  }

  /**
   * Lista todas as entregas
   */
  async listAll(): Promise<EntregaListItem[]> {
    try {
      const response = await api.get(`${API_BASE_URL}/admin/entregas/list`);
      return response.data || [];
    } catch (error) {
      console.error("Erro ao listar entregas:", error);
      return [];
    }
  }

  /**
   * Lista entregas por status
   */
  async listByStatus(status: StatusEntrega): Promise<EntregaListItem[]> {
    try {
      const response = await api.get(
        `${API_BASE_URL}/admin/entregas/list/status/${status}`
      );
      return response.data || [];
    } catch (error) {
      console.error(`Erro ao listar entregas com status ${status}:`, error);
      return [];
    }
  }

  /**
   * Lista entregas com problemas
   */
  async listProblems(): Promise<EntregaListItem[]> {
    try {
      const response = await api.get(
        `${API_BASE_URL}/admin/entregas/list/problemas`
      );
      return response.data || [];
    } catch (error) {
      console.error("Erro ao listar entregas com problemas:", error);
      return [];
    }
  }

  /**
   * Cancela uma entrega
   */
  async cancel(entregaId: string): Promise<void> {
    try {
      await api.delete(`${API_BASE_URL}/entregas/${entregaId}`);
    } catch (error) {
      console.error(`Erro ao cancelar entrega ${entregaId}:`, error);
      throw error;
    }
  }

  /**
   * Traduz status para português legível
   */
  translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      AGUARDANDO_PREPARACAO: "Atribuído",
      AGUARDANDO_MOTORISTA: "Coletado",
      MOTORISTA_A_CAMINHO_RETIRADA: "Motorista a Caminho",
      EM_TRANSITO: "Em rota",
      ENTREGUE: "Entregue",
      CANCELADA: "Cancelado",
      FALHA_SOLICITACAO: "Problema",
    };
    return statusMap[status] || status;
  }

  /**
   * Obtém cor do status para exibição
   */
  getStatusColor(status: string): string {
    switch (status) {
      case "ENTREGUE":
        return "green";
      case "EM_TRANSITO":
        return "blue";
      case "MOTORISTA_A_CAMINHO_RETIRADA":
      case "AGUARDANDO_MOTORISTA":
        return "yellow";
      case "AGUARDANDO_PREPARACAO":
        return "purple";
      case "FALHA_SOLICITACAO":
        return "red";
      case "CANCELADA":
        return "gray";
      default:
        return "gray";
    }
  }
}

export const entregaApi = new EntregaApiService();
