import { AdminApi, api } from "./AdminApi";

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  ativo: boolean;
  criadoEm: string;
  perfis: string[];
}

export interface UserFormatted {
  id: string;
  name: string;
  email: string;
  type: "Cliente" | "Lojista" | "Motorista" | "Admin";
  status: "Ativo" | "Bloqueado";
  createdAt: string;
  phone: string;
  cpf: string;
  perfis: string[];
  ativo: boolean;
  // Propriedades opcionais específicas por tipo
  lastLogin?: string;
  addresses?: Array<{ street: string; city: string; state: string }>;
  orders?: number;
  store?: string;
  cnpj?: string;
  vehicle?: string;
  deliveries?: number;
}

export interface UserStats {
  clientes: number;
  lojistas: number;
  motoristas: number;
  bloqueados: number;
}

class UserApiService extends AdminApi {
  /**
   * Lista todos os usuários
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get<User[]>(`${this.baseUrl}/usuario/list/all`);
      return response.data;
    } catch (error) {
      this.handleError(error, "Erro ao buscar usuários");
    }
  }

  /**
   * Lista usuários formatados para a tabela
   */
  async getFormattedUsers(): Promise<UserFormatted[]> {
    try {
      const users = await this.getAllUsers();
      
      return users.map((user) => {
        let type: UserFormatted["type"] = "Cliente";
        if (user.perfis.includes("ADMIN")) type = "Admin";
        else if (user.perfis.includes("LOJISTA")) type = "Lojista";
        else if (user.perfis.includes("MOTORISTA")) type = "Motorista";

        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          type,
          status: user.ativo ? "Ativo" : "Bloqueado",
          createdAt: this.formatDate(user.criadoEm),
          phone: user.telefone || "-",
          cpf: user.cpf || "-",
          perfis: user.perfis,
          ativo: user.ativo,
        };
      });
    } catch (error) {
      this.handleError(error, "Erro ao buscar usuários formatados");
    }
  }

  /**
   * Busca estatísticas de usuários - PROCESSADO NO BACKEND
   */
  async getStats(): Promise<UserStats> {
    try {
      const response = await api.get<UserStats>(`${this.baseUrl}/admin/usuarios/stats`);
      return response.data;
    } catch (error) {
      this.handleError(error, "Erro ao buscar estatísticas de usuários");
    }
  }

  /**
   * Ativa um usuário
   */
  async activateUser(userId: string): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/usuario/ativar/${userId}`);
    } catch (error) {
      this.handleError(error, "Erro ao ativar usuário");
    }
  }

  /**
   * Desativa um usuário
   */
  async deactivateUser(userId: string): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/usuario/desativar/${userId}`);
    } catch (error) {
      this.handleError(error, "Erro ao desativar usuário");
    }
  }

  /**
   * Alterna status do usuário
   */
  async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      await api.put(
        `${this.baseUrl}/admin/usuarios/${userId}/toggle-status`,
        null,
        { params: { ativar: !isActive } }
      );
    } catch (error) {
      this.handleError(error, "Erro ao alterar status do usuário");
    }
  }

  /**
   * Reseta senha de um usuário (retorna senha temporária)
   */
  async resetPassword(userId: string): Promise<{ senhaTemporaria: string; mensagem: string }> {
    try {
      const response = await api.put<{ senhaTemporaria: string; mensagem: string }>(
        `${this.baseUrl}/admin/usuarios/${userId}/reset-password`
      );
      return response.data;
    } catch (error) {
      this.handleError(error, "Erro ao resetar senha");
    }
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await api.get<User>(`${this.baseUrl}/usuario/${userId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, "Erro ao buscar usuário");
    }
  }
}

export const userApi = new UserApiService();
