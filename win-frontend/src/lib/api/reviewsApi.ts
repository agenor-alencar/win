import { api } from '../Api';

export interface Review {
  id: string;
  produtoId: string;
  produto: {
    id: string;
    nome: string;
    imagem: string;
  };
  pedidoId: string;
  avaliacao: number;
  comentario: string;
  dataCriacao: string;
}

export interface CreateReviewRequest {
  produtoId: string;
  pedidoId: string;
  avaliacao: number;
  comentario: string;
}

class ReviewsApi {
  /**
   * Busca todas as avaliações do usuário autenticado
   */
  async getMyReviews(): Promise<Review[]> {
    const response = await api.get('/v1/avaliacoes/minhas');
    return response.data;
  }

  /**
   * Cria uma nova avaliação
   */
  async createReview(data: CreateReviewRequest): Promise<Review> {
    const response = await api.post('/v1/avaliacoes', data);
    return response.data;
  }

  /**
   * Atualiza uma avaliação existente
   */
  async updateReview(id: string, data: Partial<CreateReviewRequest>): Promise<Review> {
    const response = await api.put(`/v1/avaliacoes/${id}`, data);
    return response.data;
  }

  /**
   * Remove uma avaliação
   */
  async deleteReview(id: string): Promise<void> {
    await api.delete(`/v1/avaliacoes/${id}`);
  }
}

export const reviewsApi = new ReviewsApi();
