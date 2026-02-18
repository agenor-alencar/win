import { api } from "./Api";

export interface Lojista {
  id: string;
  nomeFantasia: string;
  cnpj: string;
  email: string | null;
  recipientId: string | null;
  temRecipient: boolean;
  ativo: boolean;
}

export interface DadosBancarios {
  bank_code: string;
  agencia: string;
  agencia_dv: string;
  conta: string;
  conta_dv: string;
  type: "conta_corrente" | "conta_poupanca";
  holder_name: string;
  holder_document: string;
}

export interface CriarRecipientRequest {
  nome: string;
  documento: string;
  email: string;
  tipo: "individual" | "company";
  dadosBancarios: DadosBancarios;
}

export interface VincularRecipientRequest {
  lojistaId: string;
  recipientId: string;
}

export interface RecipientResponse {
  id: string;
  status: string;
  name: string;
}

export interface VincularRecipientResponse {
  success: boolean;
  message: string;
  lojista: string;
  recipientId: string;
}

/**
 * API para gerenciar recipients (recebedores) do Pagar.me
 */
export const recipientApi = {
  /**
   * Lista todos os lojistas e seus recipients
   */
  async listarLojistas(): Promise<Lojista[]> {
    const response = await api.get("/v1/admin/recipients/lojistas");
    return response.data;
  },

  /**
   * Cria um recipient no Pagar.me
   */
  async criarRecipient(
    data: CriarRecipientRequest
  ): Promise<RecipientResponse> {
    const response = await api.post("/v1/admin/recipients/criar", data);
    return response.data;
  },

  /**
   * Vincula um recipient existente a um lojista
   */
  async vincularRecipient(
    data: VincularRecipientRequest
  ): Promise<VincularRecipientResponse> {
    const response = await api.post("/v1/admin/recipients/vincular", data);
    return response.data;
  },

  /**
   * Busca dados de um recipient no Pagar.me
   */
  async buscarRecipient(recipientId: string): Promise<any> {
    const response = await api.get(`/v1/admin/recipients/${recipientId}`);
    return response.data;
  },

  /**
   * Remove o vínculo de recipient de um lojista
   */
  async removerRecipient(lojistaId: string): Promise<any> {
    const response = await api.delete(`/v1/admin/recipients/lojista/${lojistaId}`);
    return response.data;
  },

  /**
   * Calcula estatísticas de recipients
   */
  async getStats(): Promise<{
    total: number;
    configurados: number;
    pendentes: number;
    percentualConfigurado: number;
  }> {
    const lojistas = await this.listarLojistas();
    const total = lojistas.length;
    const configurados = lojistas.filter((l) => l.temRecipient).length;
    const pendentes = total - configurados;
    const percentualConfigurado = total > 0 ? (configurados / total) * 100 : 0;

    return {
      total,
      configurados,
      pendentes,
      percentualConfigurado,
    };
  },
};
