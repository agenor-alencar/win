import { api } from '../Api';

// ========================================
// Interfaces
// ========================================

export interface LojistaResponse {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  cnpj: string;
  nomeFantasia: string;
  razaoSocial: string;
  descricao: string;
  telefone: string;
  email: string;
  site: string;
  inscricaoEstadual: string;
  logoUrl: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  status: string;
  statusAprovacao: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

// ========================================
// Service Class
// ========================================

class LojistaApi {
  /**
   * Busca dados completos de um lojista por ID
   * @param lojistaId UUID do lojista
   * @returns Dados completos do lojista (incluindo endereço)
   */
  async buscarPorId(lojistaId: string): Promise<LojistaResponse> {
    try {
      const response = await api.get(`/v1/lojistas/${lojistaId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar lojista:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar dados do lojista');
    }
  }

  /**
   * Formata o endereço completo do lojista para geocodificação
   */
  formatarEnderecoCompleto(lojista: LojistaResponse): string {
    const partes = [
      lojista.logradouro,
      lojista.numero,
      lojista.complemento,
      lojista.bairro,
      lojista.cidade,
      lojista.uf
    ].filter(Boolean); // Remove valores vazios/null
    
    return partes.join(', ');
  }

  /**
   * Lista todos os lojistas ativos
   */
  async listarAtivos(): Promise<LojistaResponse[]> {
    try {
      const response = await api.get('/v1/lojistas/ativos');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar lojistas:', error);
      throw new Error(error.response?.data?.message || 'Erro ao listar lojistas');
    }
  }
}

export const lojistaApi = new LojistaApi();
