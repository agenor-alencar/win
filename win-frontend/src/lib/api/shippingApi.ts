import { api } from '../Api';

// ========================================
// Interfaces
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
   * Simula o custo de frete via Uber Flash
   * @param request Dados para simulação (origem, destino, peso)
   * @returns Simulação com valores calculados
   */
  async simularFrete(request: SimulacaoFreteRequest): Promise<SimulacaoFreteResponse> {
    try {
      const response = await api.post('/entregas/simular-frete', request);
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
