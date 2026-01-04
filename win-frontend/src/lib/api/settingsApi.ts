import { api } from '../Api';

export interface UserSettings {
  notificacoes: {
    email: boolean;
    push: boolean;
    sms: boolean;
    atualizacoesPedido: boolean;
    promocoes: boolean;
    newsletter: boolean;
  };
  privacidade: {
    perfilPublico: boolean;
    mostrarEmail: boolean;
    mostrarTelefone: boolean;
  };
  preferencias: {
    idioma: string;
    moeda: string;
    tema: string;
  };
}

class SettingsApi {
  /**
   * Busca as configurações do usuário autenticado
   */
  async getMySettings(): Promise<UserSettings> {
    const response = await api.get('/v1/configuracoes/minhas');
    return response.data;
  }

  /**
   * Atualiza as configurações do usuário
   */
  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await api.put('/v1/configuracoes', settings);
    return response.data;
  }
}

export const settingsApi = new SettingsApi();
