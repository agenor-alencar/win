import { api } from '@/lib/Api';

export interface ErpType {
  value: string;
  label: string;
  defaultApiUrl: string;
  requiresApiKey: string;
}

export interface ErpConfig {
  id: string;
  erpType: string;
  erpName: string;
  apiUrl: string;
  apiKeyConfigured: boolean;
  syncFrequencyMinutes: number;
  syncEnabled: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  ativo: boolean;
}

export interface ErpConfigRequest {
  erpType: string;
  apiUrl?: string;
  apiKey?: string;
  syncFrequencyMinutes?: number;
  syncEnabled?: boolean;
}

export interface ErpProduct {
  sku: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  codigoBarras?: string;
  pesoGramas?: number;
  imagemUrl?: string;
  marca?: string;
  categoria?: string;
  ativo: boolean;
}

export interface VincularProdutoErpRequest {
  produtoId: string;
  erpSku: string;
  importarDados?: boolean;
}

export class ErpApi {
  private baseUrl = '/v1/lojista/erp';
  private produtosBaseUrl = '/v1/lojista/produtos/erp';

  /**
   * Lista tipos de ERP disponíveis
   */
  async listarTiposErp(): Promise<ErpType[]> {
    const response = await api.get<ErpType[]>(`${this.baseUrl}/tipos`);
    return response.data;
  }

  /**
   * Configura ou atualiza integração ERP
   */
  async configurarErp(lojistaId: string, config: ErpConfigRequest): Promise<ErpConfig> {
    const response = await api.post<ErpConfig>(
      `${this.baseUrl}/configurar?lojistaId=${lojistaId}`,
      config
    );
    return response.data;
  }

  /**
   * Busca configuração ERP do lojista
   */
  async buscarConfiguracao(lojistaId: string): Promise<ErpConfig | null> {
    try {
      const response = await api.get<ErpConfig>(
        `${this.baseUrl}/config?lojistaId=${lojistaId}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 204) {
        return null; // Sem configuração
      }
      throw error;
    }
  }

  /**
   * Desvincula ERP do lojista
   */
  async desvincularErp(lojistaId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/desvincular?lojistaId=${lojistaId}`);
  }

  /**
   * Busca produto no ERP por SKU (preview)
   */
  async buscarProdutoNoErp(lojistaId: string, erpSku: string): Promise<ErpProduct | null> {
    try {
      const response = await api.get<ErpProduct>(
        `${this.produtosBaseUrl}/buscar?lojistaId=${lojistaId}&erpSku=${erpSku}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Produto não encontrado no ERP
      }
      throw error;
    }
  }

  /**
   * Vincula produto existente ao ERP
   */
  async vincularProduto(
    lojistaId: string,
    request: VincularProdutoErpRequest
  ): Promise<any> {
    const response = await api.post(
      `${this.produtosBaseUrl}/vincular?lojistaId=${lojistaId}`,
      request
    );
    return response.data;
  }

  /**
   * Desvincula produto do ERP
   */
  async desvincularProduto(produtoId: string): Promise<void> {
    await api.delete(`${this.produtosBaseUrl}/desvincular/${produtoId}`);
  }

  /**
   * Sincroniza estoque de um produto manualmente
   */
  async sincronizarEstoque(produtoId: string): Promise<void> {
    await api.post(`${this.produtosBaseUrl}/sincronizar/${produtoId}`);
  }
}

export const erpApi = new ErpApi();
