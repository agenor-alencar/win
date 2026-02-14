import { api } from '../Api';

export interface Address {
  id: string;
  rotulo: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  padrao: boolean;
}

export interface CreateAddressRequest {
  rotulo: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  padrao?: boolean;
}

class AddressesApi {
  /**
   * Busca todos os endereços do usuário
   */
  async getMyAddresses(userId: string): Promise<Address[]> {
    const response = await api.get(`/v1/enderecos/usuario/${userId}`);
    return response.data;
  }

  /**
   * Cria um novo endereço
   */
  async createAddress(userId: string, data: CreateAddressRequest): Promise<Address> {
    const response = await api.post(`/v1/enderecos/usuario/${userId}`, data);
    return response.data;
  }

  /**
   * Atualiza um endereço existente
   */
  async updateAddress(id: string, data: Partial<CreateAddressRequest>): Promise<Address> {
    const response = await api.put(`/v1/enderecos/${id}`, data);
    return response.data;
  }

  /**
   * Remove um endereço
   */
  async deleteAddress(id: string): Promise<void> {
    await api.delete(`/v1/enderecos/${id}`);
  }

  /**
   * Define um endereço como padrão
   */
  async setDefaultAddress(id: string): Promise<void> {
    await api.patch(`/v1/enderecos/${id}/padrao`);
  }

  /**
   * Busca endereço por CEP (via ViaCEP) - NÃO IMPLEMENTADO NO BACKEND
   * Use diretamente a API ViaCEP: https://viacep.com.br/ws/{cep}/json/
   */
  // async getAddressByCep(cep: string): Promise<Partial<Address>> {
  //   const response = await api.get(`/v1/enderecos/cep/${cep}`);
  //   return response.data;
  // }
}

export const addressesApi = new AddressesApi();
