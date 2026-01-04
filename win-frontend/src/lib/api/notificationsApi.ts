import { api } from '../Api';

export interface Notification {
  id: string;
  tipo: 'PEDIDO' | 'ENTREGA' | 'PROMOCAO' | 'AVALIACAO' | 'SISTEMA';
  titulo: string;
  mensagem: string;
  dataCriacao: string;
  lida: boolean;
  link?: string;
}

class NotificationsApi {
  /**
   * Busca todas as notificações do usuário autenticado
   */
  async getMyNotifications(): Promise<Notification[]> {
    const response = await api.get('/v1/notificacoes/minhas');
    return response.data;
  }

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(id: string): Promise<void> {
    await api.patch(`/v1/notificacoes/${id}/marcar-lida`);
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(): Promise<void> {
    await api.patch('/v1/notificacoes/marcar-todas-lidas');
  }

  /**
   * Busca o número de notificações não lidas
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/v1/notificacoes/nao-lidas/count');
    return response.data;
  }

  /**
   * Remove uma notificação
   */
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/v1/notificacoes/${id}`);
  }
}

export const notificationsApi = new NotificationsApi();
