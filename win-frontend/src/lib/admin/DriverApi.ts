import { AdminApi, api } from "./AdminApi";

export interface Driver {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  usuarioTelefone?: string;
  usuarioCpf?: string;
  cnh: string;
  categoriaCnh: string;
  tipoVeiculo: string;
  placaVeiculo: string;
  modeloVeiculo: string;
  corVeiculo?: string;
  disponivel: boolean;
  ativo: boolean;
  dataCriacao: string;
}

export interface DriverFormatted {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cnh: string;
  vehicle: string;
  status: "Aprovado" | "Pendente" | "Recusado";
  rating: string;
  deliveries: number;
  createdAt: string;
  address: string;
  documents: {
    cnh: {
      number: string;
      validity: string;
      category: string;
      status: string;
      image?: string;
    };
    vehicle: {
      plate: string;
      model: string;
      year?: string;
      color?: string;
      status: string;
    };
  };
  performance: {
    monthDeliveries: number;
    monthEarnings: number;
    averageTime: string;
    completionRate: number;
    rating: number;
    totalDeliveries: number;
  };
  disponivel: boolean;
  ativo: boolean;
}

export interface DriverStats {
  total: number;
  aprovados: number;
  pendentes: number;
  recusados: number;
  ativos: number;
  disponiveis: number;
}

class DriverApiService extends AdminApi {
  /**
   * Lista todos os motoristas
   */
  async getAllDrivers(): Promise<Driver[]> {
    try {
      const response = await api.get<Driver[]>(`${this.baseUrl}/motorista/list/all`);
      return response.data;
    } catch (error) {
      this.handleError(error, "Erro ao buscar motoristas");
    }
  }

  /**
   * Lista motoristas formatados para a tabela
   */
  async getFormattedDrivers(): Promise<DriverFormatted[]> {
    try {
      const drivers = await this.getAllDrivers();
      
      // Buscar estatísticas de entregas para cada motorista
      // TODO: Implementar endpoint de entregas por motorista no backend
      
      return drivers.map((motorista) => {
        // Status baseado em ativo e disponível
        let status: DriverFormatted["status"] = "Aprovado";
        if (!motorista.ativo) status = "Recusado";
        // TODO: Adicionar lógica de pendente quando houver fluxo de aprovação

        return {
          id: motorista.id,
          name: motorista.usuarioNome,
          email: motorista.usuarioEmail,
          phone: motorista.usuarioTelefone || "-",
          cpf: motorista.usuarioCpf || "-",
          cnh: motorista.cnh,
          vehicle: `${motorista.modeloVeiculo} - ${motorista.placaVeiculo}`,
          status,
          rating: "0.0", // TODO: Implementar sistema de avaliações
          deliveries: 0, // TODO: Buscar do endpoint de entregas
          createdAt: this.formatDate(motorista.dataCriacao),
          address: "-", // Buscar do usuário se necessário
          documents: {
            cnh: {
              number: motorista.cnh,
              validity: "-", // TODO: Adicionar campo no backend
              category: motorista.categoriaCnh,
              status: motorista.ativo ? "Aprovado" : "Recusado",
            },
            vehicle: {
              plate: motorista.placaVeiculo,
              model: motorista.modeloVeiculo,
              year: "-", // TODO: Adicionar campo no backend
              color: motorista.corVeiculo || "-",
              status: motorista.ativo ? "Aprovado" : "Recusado",
            },
          },
          performance: {
            monthDeliveries: 0, // TODO: Calcular do endpoint de entregas
            monthEarnings: 0, // TODO: Calcular do endpoint financeiro
            averageTime: "-", // TODO: Calcular do endpoint de entregas
            completionRate: 0, // TODO: Calcular do endpoint de entregas
            rating: 0, // TODO: Implementar sistema de avaliações
            totalDeliveries: 0, // TODO: Buscar do endpoint de entregas
          },
          disponivel: motorista.disponivel,
          ativo: motorista.ativo,
        };
      });
    } catch (error) {
      this.handleError(error, "Erro ao buscar motoristas formatados");
    }
  }

  /**
   * Busca estatísticas de motoristas
   */
  async getStats(): Promise<DriverStats> {
    try {
      const drivers = await this.getFormattedDrivers();
      
      return {
        total: drivers.length,
        aprovados: drivers.filter((d) => d.status === "Aprovado").length,
        pendentes: drivers.filter((d) => d.status === "Pendente").length,
        recusados: drivers.filter((d) => d.status === "Recusado").length,
        ativos: drivers.filter((d) => d.ativo).length,
        disponiveis: drivers.filter((d) => d.disponivel).length,
      };
    } catch (error) {
      this.handleError(error, "Erro ao buscar estatísticas de motoristas");
    }
  }

  /**
   * Busca motorista por ID
   */
  async getDriverById(driverId: string): Promise<Driver> {
    try {
      const response = await api.get<Driver>(`${this.baseUrl}/motorista/list/id/${driverId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, "Erro ao buscar motorista");
    }
  }

  /**
   * Alterna disponibilidade do motorista
   */
  async toggleAvailability(driverId: string, disponivel: boolean): Promise<void> {
    try {
      await api.patch(
        `${this.baseUrl}/motorista/disponibilidade/${driverId}`,
        null,
        { params: { disponivel } }
      );
    } catch (error) {
      this.handleError(error, "Erro ao alterar disponibilidade");
    }
  }

  /**
   * Desativa um motorista
   */
  async deactivateDriver(driverId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/motorista/delete/${driverId}`);
    } catch (error) {
      this.handleError(error, "Erro ao desativar motorista");
    }
  }

  /**
   * Alterna status do motorista (ativar/desativar) via Admin
   */
  async toggleDriverStatus(driverId: string, ativar: boolean): Promise<void> {
    try {
      if (ativar) {
        // Não há endpoint específico para ativar, seria necessário implementar
        // Por enquanto, usar o endpoint de disponibilidade como workaround
        await this.toggleAvailability(driverId, true);
      } else {
        await this.deactivateDriver(driverId);
      }
    } catch (error) {
      this.handleError(error, "Erro ao alterar status do motorista");
    }
  }
}

export const driverApi = new DriverApiService();
