import { AdminApi, api } from "./AdminApi";

export interface Store {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  cnpj: string;
  nomeFantasia: string;
  razaoSocial: string;
  descricao?: string;
  telefone?: string;
  email: string;
  ativo: boolean;
  criadoEm: string;
}

export interface StoreFormatted {
  id: string;
  name: string;
  cnpj: string;
  owner: string;
  category: string;
  rating: string;
  status: "Ativo" | "Suspenso";
  products: number;
  createdAt: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  ativo: boolean;
}

export interface StoreStats {
  ativas: number;
  pendentes: number;
  suspensas: number;
}

class StoreApiService extends AdminApi {
  /**
   * Lista todas as lojas
   */
  async getAllStores(): Promise<Store[]> {
    try {
      const response = await api.get<Store[]>(`${this.baseUrl}/lojistas`);
      return response.data;
    } catch (error) {
      this.handleError(error, "Erro ao buscar lojas");
    }
  }

  /**
   * Lista lojas formatadas para a tabela
   */
  async getFormattedStores(): Promise<StoreFormatted[]> {
    try {
      const stores = await this.getAllStores();
      
      return stores.map((loja) => ({
        id: loja.id,
        name: loja.nomeFantasia,
        cnpj: loja.cnpj,
        owner: loja.usuarioNome,
        category: "Geral",
        rating: "4.5",
        status: loja.ativo ? "Ativo" : "Suspenso",
        products: 0, // TODO: Implementar contagem de produtos
        createdAt: this.formatDate(loja.criadoEm),
        phone: loja.telefone || "-",
        email: loja.email || loja.usuarioEmail,
        address: "-",
        description: loja.descricao || "-",
        ativo: loja.ativo,
      }));
    } catch (error) {
      this.handleError(error, "Erro ao buscar lojas formatadas");
    }
  }

  /**
   * Busca estatísticas de lojas
   */
  async getStats(): Promise<StoreStats> {
    try {
      const stores = await this.getFormattedStores();
      
      return {
        ativas: stores.filter((s) => s.status === "Ativo").length,
        suspensas: stores.filter((s) => s.status === "Suspenso").length,
        pendentes: 0, // TODO: Implementar status pendente
      };
    } catch (error) {
      this.handleError(error, "Erro ao buscar estatísticas de lojas");
    }
  }

  /**
   * Ativa uma loja
   */
  async activateStore(storeId: string): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/lojistas/${storeId}/ativar`);
    } catch (error) {
      this.handleError(error, "Erro ao ativar loja");
    }
  }

  /**
   * Desativa uma loja
   */
  async deactivateStore(storeId: string): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/lojistas/${storeId}/desativar`);
    } catch (error) {
      this.handleError(error, "Erro ao desativar loja");
    }
  }

  /**
   * Alterna status da loja (ativar/desativar)
   */
  async toggleStoreStatus(storeId: string, isActive: boolean): Promise<void> {
    try {
      await api.put(
        `${this.baseUrl}/admin/lojistas/${storeId}/toggle-status`,
        null,
        { params: { ativar: !isActive } }
      );
    } catch (error) {
      this.handleError(error, "Erro ao alterar status da loja");
    }
  }

  /**
   * Busca loja por ID
   */
  async getStoreById(storeId: string): Promise<Store> {
    try {
      const response = await api.get<Store>(`${this.baseUrl}/lojistas/${storeId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, "Erro ao buscar loja");
    }
  }
}

export const storeApi = new StoreApiService();
