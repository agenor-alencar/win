import { AdminApi, api } from "./AdminApi";

export interface SystemSettings {
  // Financial Model
  taxaComissaoWin: number;
  taxaRepasseLojista: number;
  valorEntregaMotorista: number;
  taxaProcessamentoPagamento: number;
  diasRepasse: number;

  // General
  taxaEntregaPadrao: number;
  freteGratisAcimaDe: number;
  limiteAprovacaoAutomatica: number;
  distanciaMaximaEntregaKm: number;
  timeoutPedidoMinutos: number;

  // Delivery
  tempoPreparacaoMinimo: number;
  tempoPreparacaoMaximo: number;
  raioMaximoEntregaKm: number;
  timeoutBuscaMotoristaMicro: number;
  atribuirMotoristaAutomaticamente: boolean;

  // Notifications
  notificacoesPedidosEmail: boolean;
  notificacoesPedidosSMS: boolean;
  notificacoesPedidosPush: boolean;
  notificacoesEntregasEmail: boolean;
  notificacoesEntregasSMS: boolean;
  notificacoesEntregasPush: boolean;
  notificacoesPromocoes: boolean;
  notificacoesNewsletters: boolean;

  // Security
  requisitarAutenticacaoDuploFator: boolean;
  duracaoSessaoMinutos: number;
  tentativasLoginMaximas: number;
  bloqueioTemporarioMinutos: number;
  requisitarSenhaForte: boolean;

  // Legal
  termosUsoVersao: string;
  politicaPrivacidadeVersao: string;
  politicaCookiesVersao: string;
  requisitarAceiteTermos: boolean;
  lgpdAtivo: boolean;
}

class SettingsApi extends AdminApi {
  /**
   * Busca configurações ativas do sistema
   */
  async getSettings(): Promise<SystemSettings> {
    try {
      const response = await api.get<SystemSettings>(`${this.baseUrl}/admin/configuracoes`);
      return response.data;
    } catch (error) {
      this.handleError(error, "Erro ao carregar configurações");
    }
  }

  /**
   * Atualiza configurações do sistema
   */
  async updateSettings(settings: SystemSettings): Promise<SystemSettings> {
    try {
      const response = await api.put<SystemSettings>(
        `${this.baseUrl}/admin/configuracoes`,
        settings
      );
      return response.data;
    } catch (error) {
      this.handleError(error, "Erro ao salvar configurações");
    }
  }

  /**
   * Restaura configurações padrão
   */
  async restoreDefaults(): Promise<SystemSettings> {
    try {
      const response = await api.post<SystemSettings>(
        `${this.baseUrl}/admin/configuracoes/restaurar-padrao`
      );
      return response.data;
    } catch (error) {
      this.handleError(error, "Erro ao restaurar configurações");
    }
  }
}

export const settingsApi = new SettingsApi();
