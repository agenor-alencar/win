import { api } from '../Api';

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  dataCadastro: string;
  ultimoAcesso?: string;
  ativo: boolean;
  perfis: string[];
}

export interface UpdateProfileRequest {
  nome?: string;
  telefone?: string;
  cpf?: string;
}

export interface PasswordUpdateRequest {
  senhaAtual: string;
  novaSenha: string;
  confirmacaoSenha: string;
}

class UserApi {
  /**
   * Busca o perfil do usuário autenticado
   */
  async getCurrentUser(): Promise<UserProfile> {
    const response = await api.get('/v1/auth/me');
    return response.data;
  }

  /**
   * Atualiza os dados do perfil do usuário
   */
  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await api.put(`/v1/usuario/update/${userId}`, data);
    return response.data;
  }

  /**
   * Atualiza a senha do usuário
   */
  async updatePassword(userId: string, data: PasswordUpdateRequest): Promise<void> {
    await api.patch(`/v1/usuario/senha/${userId}`, {
      novaSenha: data.novaSenha
    });
  }
}

export const userApi = new UserApi();
