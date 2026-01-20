import { api } from '../Api';

// ========================================
// Interfaces - Uber Direct API (NOVO)
// ========================================

export interface FreteRequestDTO {
  lojistaId: string;
  enderecoEntregaId: string;
  pesoTotalKg?: number;
  cepOrigem?: string;
  cepDestino?: string;
}

export interface FreteResponseDTO {
  sucesso: boolean;
  quoteId?: string;
  valorFreteTotal: number;
  valorCorridaUber: number;
  taxaWin: number;
  distanciaKm: number;
  tempoEstimadoMinutos: number;
  tipoVeiculo: string;
  mensagem?: string;
  erro?: string;
  modoProducao: boolean;
}

// ========================================
// Interfaces - Legado (compatibilidade)
// ========================================

export interface SimulacaoFreteRequest {
  lojistaId: string;
  cepOrigem: string;
  enderecoOrigemCompleto: string;
  cepDestino: string;
  enderecoDestinoCompleto: string;
  pesoTotalKg: number;
  tipoVeiculo?: 'MOTO' | 'CARRO';
}

export interface SimulacaoFreteResponse {
  tipoVeiculo: 'MOTO' | 'CARRO';
  valorCorridaUber: number;
  taxaWinmarket: number;
  valorFreteTotal: number;
  tempoEstimadoMinutos: number;
  distanciaKm: number;
  mensagem: string;
  sucesso: boolean;
  erro?: string;
}

export interface VerificarPrimeiraCompraResponse {
  ehPrimeiraCompra: boolean;
  totalPedidos: number;
  freteGratis: boolean;
  mensagem: string;
}

// ========================================
// Service Class
// ========================================

class ShippingApi {
  /**
   * 🚀 NOVO: Calcula frete dinâmico via Uber Direct API com geocoding
   * @param request Dados para cálculo (lojistaId + enderecoEntregaId + peso)
   * @returns Cotação real da Uber com valores exatos
   */
  async calcularFrete(request: FreteRequestDTO): Promise<FreteResponseDTO> {
    try {
      const response = await api.post('/v1/fretes/calcular', request);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao calcular frete:', error);
      throw new Error(error.response?.data?.message || 'Erro ao calcular frete');
    }
  }

  /**
   * 📍 Estimativa rápida de frete por CEP (UX otimizada).
   * Não requer autenticação nem endereço completo.
   * @param cepDestino CEP do cliente (8 dígitos)
   * @param lojistaId ID do lojista
   * @param pesoKg Peso estimado (padrão: 1.0)
   * @returns Estimativa de frete
   */
  async estimarFretePorCep(cepDestino: string, lojistaId: string, pesoKg: number = 1.0): Promise<FreteResponseDTO> {
    try {
      const response = await api.get('/v1/fretes/estimar', {
        params: {
          cepDestino: cepDestino.replace(/\D/g, ''),
          lojistaId,
          pesoKg
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao estimar frete:', error);
      throw new Error(error.response?.data?.message || 'Erro ao estimar frete');
    }
  }

  /**
   * 📦 LEGADO: Simula frete via endpoint antigo (estimativa, sem Uber Direct)
   * Mantido para compatibilidade. Prefira usar calcularFrete().
   */
  async simularFrete(request: SimulacaoFreteRequest): Promise<SimulacaoFreteResponse> {
    try {
      const response = await api.post('/v1/entregas/simular-frete', request);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao simular frete:', error);
      throw new Error(error.response?.data?.message || 'Erro ao simular frete');
    }
  }

  /**
   * Verifica se é a primeira compra do usuário (para frete grátis)
   * @param userId ID do usuário
   * @returns Informações sobre primeira compra
   */
  async verificarPrimeiraCompra(userId: string): Promise<VerificarPrimeiraCompraResponse> {
    try {
      const response = await api.get(`/v1/pedidos/usuario/${userId}/primeira-compra`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao verificar primeira compra:', error);
      // Em caso de erro, assume que não é primeira compra
      return {
        ehPrimeiraCompra: false,
        totalPedidos: 0,
        freteGratis: false,
        mensagem: 'Erro ao verificar histórico de compras'
      };
    }
  }

  /**
   * Calcula o peso total dos itens do carrinho
   * Por enquanto usa estimativa: 0.5kg por item
   * TODO: Adicionar peso real nos produtos
   */
  calcularPesoTotal(items: any[]): number {
    // Estimativa: 0.5kg por item (pode ser ajustado)
    const pesoEstimadoPorItem = 0.5;
    const pesoTotal = items.reduce((total, item) => {
      return total + (item.quantity * pesoEstimadoPorItem);
    }, 0);
    
    // Mínimo de 1kg para simulação
    return Math.max(pesoTotal, 1);
  }

  /**
   * Formata endereço completo para a API
   */
  formatarEnderecoCompleto(endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
  }): string {
    const partes = [
      endereco.logradouro,
      endereco.numero,
      endereco.complemento,
      endereco.bairro,
      endereco.cidade,
      endereco.uf
    ].filter(Boolean);
    
    return partes.join(', ');
  }
}

export const shippingApi = new ShippingApi();
