import { api } from '../Api';

export interface PaymentMethod {
  id: string;
  tipo: 'CREDITO' | 'DEBITO' | 'PIX';
  numeroCartao: string;
  nomeTitular: string;
  dataValidade: string;
  bandeira: string;
  padrao: boolean;
}

export interface CreatePaymentMethodRequest {
  tipo: 'CREDITO' | 'DEBITO' | 'PIX';
  numeroCartao: string;
  nomeTitular: string;
  dataValidade: string;
  cvv: string;
  bandeira?: string;
  padrao?: boolean;
}

class PaymentMethodsApi {
  /**
   * Busca todos os métodos de pagamento do usuário autenticado
   */
  async getMyPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await api.get('/v1/metodos-pagamento/meus');
    return response.data;
  }

  /**
   * Adiciona um novo método de pagamento
   */
  async createPaymentMethod(data: CreatePaymentMethodRequest): Promise<PaymentMethod> {
    const response = await api.post('/v1/metodos-pagamento', data);
    return response.data;
  }

  /**
   * Remove um método de pagamento
   */
  async deletePaymentMethod(id: string): Promise<void> {
    await api.delete(`/v1/metodos-pagamento/${id}`);
  }

  /**
   * Define um método de pagamento como padrão
   */
  async setDefaultPaymentMethod(id: string): Promise<void> {
    await api.patch(`/v1/metodos-pagamento/${id}/padrao`);
  }
}

export const paymentMethodsApi = new PaymentMethodsApi();
